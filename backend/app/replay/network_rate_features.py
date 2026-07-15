from __future__ import annotations

from collections import Counter, defaultdict, deque
from dataclasses import dataclass
from math import isfinite
from typing import Any


DEFAULT_NETWORK_RATE_WINDOW_SECONDS = 10.0
DEFAULT_DOS_SAME_SRC_DST_THRESHOLD = 20
DEFAULT_DDOS_DESTINATION_THRESHOLD = 50
DEFAULT_DDOS_UNIQUE_SOURCES_THRESHOLD = 5


@dataclass(frozen=True)
class _ObservedConnection:
    ts: float
    source_ip: str
    destination_ip: str


class NetworkRateFeatureExtractor:
    """Attach deterministic connection-rate features to live Zeek flows.

    ``enrich_batch`` expects flows sharing a Zeek timestamp. Counting the whole
    batch before evaluating it avoids making the result depend on the arbitrary
    order of conn.log rows that have the same timestamp.
    """

    def __init__(
        self,
        *,
        window_seconds: float = DEFAULT_NETWORK_RATE_WINDOW_SECONDS,
        dos_same_src_dst_threshold: int = DEFAULT_DOS_SAME_SRC_DST_THRESHOLD,
        ddos_destination_threshold: int = DEFAULT_DDOS_DESTINATION_THRESHOLD,
        ddos_unique_sources_threshold: int = DEFAULT_DDOS_UNIQUE_SOURCES_THRESHOLD,
    ) -> None:
        self.window_seconds = max(0.0, float(window_seconds))
        self.dos_same_src_dst_threshold = max(1, int(dos_same_src_dst_threshold))
        self.ddos_destination_threshold = max(1, int(ddos_destination_threshold))
        self.ddos_unique_sources_threshold = max(1, int(ddos_unique_sources_threshold))
        self._observations: deque[_ObservedConnection] = deque()
        self._same_src_dst_counts: Counter[tuple[str, str]] = Counter()
        self._destination_counts: Counter[str] = Counter()
        destination_sources: dict[str, Counter[str]] = defaultdict(Counter)
        self._destination_sources = destination_sources

    def enrich_batch(self, batch: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not batch:
            return []

        batch_ts = _numeric(batch[0].get("ts"))
        if any(_numeric(flow.get("ts")) != batch_ts for flow in batch):
            raise ValueError("NetworkRateFeatureExtractor requires a same-timestamp batch")
        self._purge(batch_ts)

        batch_pairs: Counter[tuple[str, str]] = Counter()
        batch_destinations: Counter[str] = Counter()
        batch_destination_sources: dict[str, set[str]] = defaultdict(set)
        endpoints: list[tuple[str, str]] = []
        for flow in batch:
            source_ip = str(flow.get("src_ip") or flow.get("source_ip") or "")
            destination_ip = str(flow.get("dst_ip") or flow.get("destination_ip") or "")
            endpoints.append((source_ip, destination_ip))
            batch_pairs[(source_ip, destination_ip)] += 1
            batch_destinations[destination_ip] += 1
            batch_destination_sources[destination_ip].add(source_ip)

        enriched: list[dict[str, Any]] = []
        for flow, (source_ip, destination_ip) in zip(batch, endpoints, strict=True):
            same_src_dst_connection_count = int(
                self._same_src_dst_counts[(source_ip, destination_ip)]
                + batch_pairs[(source_ip, destination_ip)]
            )
            destination_connection_count = int(
                self._destination_counts[destination_ip] + batch_destinations[destination_ip]
            )
            historical_sources = set(self._destination_sources[destination_ip])
            unique_source_count = len(historical_sources | batch_destination_sources[destination_ip])

            updated = dict(flow)
            updated["network_rate_features"] = {
                "window_seconds": self.window_seconds,
                "same_src_dst_connection_count": same_src_dst_connection_count,
                "destination_connection_count": destination_connection_count,
                "unique_source_count": unique_source_count,
                "dos_suspected": same_src_dst_connection_count >= self.dos_same_src_dst_threshold,
                "ddos_suspected": (
                    destination_connection_count >= self.ddos_destination_threshold
                    and unique_source_count >= self.ddos_unique_sources_threshold
                ),
            }
            enriched.append(updated)

        for source_ip, destination_ip in endpoints:
            observation = _ObservedConnection(batch_ts, source_ip, destination_ip)
            self._observations.append(observation)
            self._same_src_dst_counts[(source_ip, destination_ip)] += 1
            self._destination_counts[destination_ip] += 1
            self._destination_sources[destination_ip][source_ip] += 1

        return enriched

    def _purge(self, ts: float) -> None:
        while self._observations and ts - self._observations[0].ts > self.window_seconds:
            observation = self._observations.popleft()
            pair = (observation.source_ip, observation.destination_ip)
            self._decrement(self._same_src_dst_counts, pair)
            self._decrement(self._destination_counts, observation.destination_ip)
            source_counts = self._destination_sources[observation.destination_ip]
            self._decrement(source_counts, observation.source_ip)
            if not source_counts:
                self._destination_sources.pop(observation.destination_ip, None)

    @staticmethod
    def _decrement(counter: Counter[Any], key: Any) -> None:
        counter[key] -= 1
        if counter[key] <= 0:
            del counter[key]


def _numeric(value: Any, default: float = 0.0) -> float:
    if value is None or value == "-":
        return default
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed if isfinite(parsed) else default
