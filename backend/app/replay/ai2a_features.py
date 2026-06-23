from __future__ import annotations

from collections import defaultdict, deque
from ipaddress import ip_address, ip_network
from math import isfinite
from typing import Any


FROZEN_AI2A_FEATURES = [
    "dst_port",
    "dst_port_category",
    "src_role",
    "dst_role",
    "direction",
    "proto",
    "service",
    "duration",
    "orig_bytes",
    "resp_bytes",
    "orig_pkts",
    "resp_pkts",
    "orig_ip_bytes",
    "conn_state",
    "history",
    "packet_rate",
    "orig_byte_rate",
    "resp_byte_rate",
    "orig_resp_byte_ratio",
    "orig_resp_pkt_ratio",
    "avg_pkt_size",
    "orig_avg_pkt_size",
    "resp_avg_pkt_size",
    "is_tcp",
    "is_icmp",
    "is_http",
    "is_ssh",
    "is_dns",
    "is_https",
    "is_internal_to_internal",
    "is_internal_to_external",
    "is_success_state",
    "is_failed_like_state",
    "has_rst",
    "has_data",
    "ssh_count_60s_same_src",
    "ssh_count_60s_same_src_dst",
    "ssh_non_success_conn_count_60s_same_src_dst",
    "ssh_success_conn_count_60s_same_src_dst",
    "ssh_unique_dst_count_60s_same_src",
    "ssh_has_prior_same_src_dst",
]

FAILED_LIKE_CONN_STATES = {"S0", "REJ", "RSTO", "RSTR", "RSTOS0", "RSTRH", "SH", "SHR"}


class AI2AFlowFeatureExtractor:
    """Build the frozen AI2A V1 41-feature vector from normalized Zeek conn rows."""

    def __init__(self, *, internal_cidrs: list[str] | None = None, window_seconds: float = 60.0) -> None:
        self.internal_networks = [ip_network(cidr) for cidr in (internal_cidrs or ["192.168.0.0/16"])]
        self.window_seconds = float(window_seconds)

    def enrich_flows(self, flows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        sorted_flows = sorted(flows, key=self._sort_key)
        same_src: dict[Any, deque[dict[str, Any]]] = defaultdict(deque)
        same_src_dst: dict[Any, deque[dict[str, Any]]] = defaultdict(deque)
        ssh_src_dst: dict[Any, deque[dict[str, Any]]] = defaultdict(deque)
        enriched: list[dict[str, Any]] = []

        for batch in _same_timestamp_batches(sorted_flows):
            computed: list[tuple[dict[str, Any], dict[str, Any], dict[str, Any]]] = []
            additions: list[dict[str, Any]] = []
            for flow in batch:
                base = self.base_features(flow)
                ts = _numeric(flow.get("ts"))
                src = str(flow.get("src_ip") or flow.get("source_ip") or "")
                dst = str(flow.get("dst_ip") or flow.get("destination_ip") or "")
                src_key = src
                src_dst_key = (src, dst)

                src_window = same_src[src_key]
                src_dst_window = same_src_dst[src_dst_key]
                ssh_window = ssh_src_dst[src_dst_key]
                for window in (src_window, src_dst_window, ssh_window):
                    _purge(window, ts, self.window_seconds)

                is_ssh = bool(base["is_ssh"])
                base.update(
                    {
                        "ssh_count_60s_same_src": int(sum(item["is_ssh"] for item in src_window)),
                        "ssh_count_60s_same_src_dst": int(len(ssh_window)),
                        "ssh_non_success_conn_count_60s_same_src_dst": int(
                            sum(item["is_ssh"] and not item["is_success"] for item in src_dst_window)
                        ),
                        "ssh_success_conn_count_60s_same_src_dst": int(
                            sum(item["is_ssh"] and item["is_success"] for item in src_dst_window)
                        ),
                        "ssh_unique_dst_count_60s_same_src": int(
                            len({item["dst"] for item in src_window if item["is_ssh"]})
                        ),
                        "ssh_has_prior_same_src_dst": int(is_ssh and bool(ssh_window)),
                    }
                )
                addition = {
                    "ts": ts,
                    "dst": dst,
                    "is_ssh": is_ssh,
                    "is_success": bool(base["is_success_state"]),
                    "src_key": src_key,
                    "src_dst_key": src_dst_key,
                }
                computed.append((flow, base, addition))
                additions.append(addition)

            for addition in additions:
                same_src[addition["src_key"]].append(addition)
                same_src_dst[addition["src_dst_key"]].append(addition)
                if addition["is_ssh"]:
                    ssh_src_dst[addition["src_dst_key"]].append(addition)
            for flow, features, _ in computed:
                updated = dict(flow)
                updated["ai2a_features"] = {name: features[name] for name in FROZEN_AI2A_FEATURES}
                enriched.append(updated)

        return enriched

    def base_features(self, flow: dict[str, Any]) -> dict[str, Any]:
        dst_port = int(_numeric(flow.get("dst_port") or flow.get("destination_port")))
        src_ip = str(flow.get("src_ip") or flow.get("source_ip") or "")
        dst_ip = str(flow.get("dst_ip") or flow.get("destination_ip") or "")
        src_role = self._role(src_ip)
        dst_role = self._role(dst_ip)
        proto = _clean_text(flow.get("proto"), default="unknown")
        service = _clean_text(flow.get("service"), default="unknown")
        conn_state = str(flow.get("conn_state") or "")
        history = str(flow.get("history") or "")
        duration = _numeric(flow.get("duration"))
        orig_bytes = _numeric(flow.get("orig_bytes"))
        resp_bytes = _numeric(flow.get("resp_bytes"))
        orig_pkts = _numeric(flow.get("orig_pkts"))
        resp_pkts = _numeric(flow.get("resp_pkts"))
        orig_ip_bytes = _numeric(flow.get("orig_ip_bytes"))
        total_bytes = orig_bytes + resp_bytes
        total_pkts = orig_pkts + resp_pkts

        is_http = int(service == "http" or dst_port in {80, 8080, 8000})
        is_ssh = int(service == "ssh" or dst_port == 22)
        is_dns = int(service == "dns" or dst_port == 53)
        is_https = int(service in {"ssl", "tls", "https"} or dst_port == 443)

        direction = self._direction(src_role, dst_role)
        return {
            "dst_port": dst_port,
            "dst_port_category": _port_category(dst_port),
            "src_role": src_role,
            "dst_role": dst_role,
            "direction": direction,
            "proto": proto,
            "service": service,
            "duration": duration,
            "orig_bytes": orig_bytes,
            "resp_bytes": resp_bytes,
            "orig_pkts": orig_pkts,
            "resp_pkts": resp_pkts,
            "orig_ip_bytes": orig_ip_bytes,
            "conn_state": conn_state,
            "history": history,
            "packet_rate": _safe_div(total_pkts, duration),
            "orig_byte_rate": _safe_div(orig_bytes, duration),
            "resp_byte_rate": _safe_div(resp_bytes, duration),
            "orig_resp_byte_ratio": _safe_div(orig_bytes, resp_bytes),
            "orig_resp_pkt_ratio": _safe_div(orig_pkts, resp_pkts),
            "avg_pkt_size": _safe_div(total_bytes, total_pkts),
            "orig_avg_pkt_size": _safe_div(orig_bytes, orig_pkts),
            "resp_avg_pkt_size": _safe_div(resp_bytes, resp_pkts),
            "is_tcp": int(proto == "tcp"),
            "is_icmp": int(proto == "icmp"),
            "is_http": is_http,
            "is_ssh": is_ssh,
            "is_dns": is_dns,
            "is_https": is_https,
            "is_internal_to_internal": int(direction == "internal_to_internal"),
            "is_internal_to_external": int(direction == "internal_to_external"),
            "is_success_state": int(conn_state == "SF"),
            "is_failed_like_state": int(conn_state in FAILED_LIKE_CONN_STATES),
            "has_rst": int("R" in history),
            "has_data": int("D" in history or "d" in history),
        }

    def _role(self, value: str) -> str:
        try:
            ip = ip_address(value)
        except ValueError:
            return "external"
        return "internal" if any(ip in network for network in self.internal_networks) else "external"

    @staticmethod
    def _direction(src_role: str, dst_role: str) -> str:
        if src_role == "internal" and dst_role == "internal":
            return "internal_to_internal"
        if src_role == "internal" and dst_role == "external":
            return "internal_to_external"
        if src_role == "external" and dst_role == "internal":
            return "external_to_internal"
        return "external_to_external"

    def _sort_key(self, flow: dict[str, Any]) -> tuple[float, float, str]:
        ts = _numeric(flow.get("ts"))
        duration = _numeric(flow.get("duration"))
        return (ts, ts + duration, str(flow.get("uid") or ""))


def _same_timestamp_batches(flows: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    batches: list[list[dict[str, Any]]] = []
    current_ts: float | None = None
    current: list[dict[str, Any]] = []
    for flow in flows:
        ts = _numeric(flow.get("ts"))
        if current and ts != current_ts:
            batches.append(current)
            current = []
        current_ts = ts
        current.append(flow)
    if current:
        batches.append(current)
    return batches


def _numeric(value: Any, default: float = 0.0) -> float:
    if value is None or value == "-":
        return default
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return parsed if isfinite(parsed) else default


def _safe_div(numerator: float, denominator: float) -> float:
    return float(numerator / denominator) if denominator > 0 else 0.0


def _clean_text(value: Any, *, default: str) -> str:
    text = str(value or "").strip().lower()
    return text if text and text != "-" else default


def _port_category(port: int) -> str:
    if 0 <= port <= 1023:
        return "well_known"
    if port <= 49151:
        return "registered"
    return "dynamic"


def _purge(window: deque[dict[str, Any]], ts: float, window_seconds: float) -> None:
    while window and ts - float(window[0]["ts"]) > window_seconds:
        window.popleft()
