from __future__ import annotations

import sys
import tempfile
from pathlib import Path

from app.replay import NetworkRateFeatureExtractor


SCRIPTS_ROOT = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from tail_zeek_correlated_to_backend import CorrelatorSettings, TimedConnBatchState, _local_log_items  # noqa: E402


def _flow(uid: str, ts: float, source: str, destination: str = "10.10.10.50") -> dict:
    return {
        "uid": uid,
        "ts": str(ts),
        "source_ip": source,
        "destination_ip": destination,
        "src_ip": source,
        "dst_ip": destination,
        "dst_port": 80,
        "proto": "tcp",
        "service": "http",
    }


def test_same_source_destination_dos_threshold_and_window_expiry() -> None:
    extractor = NetworkRateFeatureExtractor()

    first_batch = extractor.enrich_batch(
        [_flow(f"C{index}", 100.0, "192.168.137.145") for index in range(19)]
    )
    [threshold_flow] = extractor.enrich_batch([_flow("C20", 101.0, "192.168.137.145")])
    [expired_flow] = extractor.enrich_batch([_flow("C21", 111.1, "192.168.137.145")])

    assert first_batch[0]["network_rate_features"] == {
        "window_seconds": 10.0,
        "same_src_dst_connection_count": 19,
        "destination_connection_count": 19,
        "unique_source_count": 1,
        "dos_suspected": False,
        "ddos_suspected": False,
    }
    assert threshold_flow["network_rate_features"]["same_src_dst_connection_count"] == 20
    assert threshold_flow["network_rate_features"]["dos_suspected"] is True
    assert expired_flow["network_rate_features"]["same_src_dst_connection_count"] == 1
    assert expired_flow["network_rate_features"]["dos_suspected"] is False


def test_ddos_requires_both_destination_volume_and_unique_sources() -> None:
    extractor = NetworkRateFeatureExtractor()
    sources = [f"198.51.100.{(index % 5) + 1}" for index in range(49)]

    below_threshold = extractor.enrich_batch(
        [_flow(f"D{index}", 200.0, source) for index, source in enumerate(sources)]
    )
    [threshold_flow] = extractor.enrich_batch([_flow("D50", 201.0, "198.51.100.5")])

    assert below_threshold[0]["network_rate_features"]["destination_connection_count"] == 49
    assert below_threshold[0]["network_rate_features"]["unique_source_count"] == 5
    assert below_threshold[0]["network_rate_features"]["ddos_suspected"] is False
    assert threshold_flow["network_rate_features"]["destination_connection_count"] == 50
    assert threshold_flow["network_rate_features"]["unique_source_count"] == 5
    assert threshold_flow["network_rate_features"]["ddos_suspected"] is True


def test_timed_conn_batch_attaches_configured_rate_features_to_live_flow() -> None:
    state = TimedConnBatchState(
        network_rate_window_seconds=5,
        dos_same_src_dst_threshold=2,
        ddos_destination_threshold=3,
        ddos_unique_sources_threshold=2,
    )

    assert state.push(_flow("L1", 300.0, "192.168.137.145"), now=1.0) == []
    assert state.push(_flow("L2", 300.0, "192.168.137.145"), now=1.0) == []
    enriched = state.flush()

    assert len(enriched) == 2
    assert all(flow["network_rate_features"]["window_seconds"] == 5.0 for flow in enriched)
    assert all(flow["network_rate_features"]["same_src_dst_connection_count"] == 2 for flow in enriched)
    assert all(flow["network_rate_features"]["dos_suspected"] is True for flow in enriched)
    assert all("ai2a_features" in flow for flow in enriched)


def test_local_file_path_uses_configured_rate_thresholds() -> None:
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        conn_log = root / "conn.log"
        http_log = root / "http.log"
        conn_log.write_text(
            "#fields\tts\tuid\tid.orig_h\tid.orig_p\tid.resp_h\tid.resp_p\tproto\tservice\n"
            "400.0\tLOCAL1\t192.168.137.145\t50001\t10.10.10.50\t80\ttcp\thttp\n"
            "400.0\tLOCAL2\t192.168.137.145\t50002\t10.10.10.50\t80\ttcp\thttp\n",
            encoding="utf-8",
        )
        http_log.write_text("#fields\tts\tuid\tid.orig_h\tid.resp_h\ttrans_depth\tmethod\turi\n", encoding="utf-8")
        settings = CorrelatorSettings(
            sensor_id="test",
            network_rate_window_seconds=5,
            dos_same_src_dst_threshold=2,
            ddos_destination_threshold=10,
            ddos_unique_sources_threshold=3,
        )

        flows = [row for kind, row in _local_log_items(conn_log, http_log, settings=settings) if kind == "flow"]

    assert len(flows) == 2
    assert all(flow["network_rate_features"]["window_seconds"] == 5.0 for flow in flows)
    assert all(flow["network_rate_features"]["dos_suspected"] is True for flow in flows)
