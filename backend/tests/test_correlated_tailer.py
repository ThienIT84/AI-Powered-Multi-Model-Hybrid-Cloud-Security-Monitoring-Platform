from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from app.services.store import AlertStore

SCRIPTS_ROOT = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from tail_zeek_correlated_to_backend import CorrelatorSettings, ZeekTransactionCorrelator  # noqa: E402


def flow(uid: str = "C1", *, sensor_src: str = "10.10.10.10", sensor_dst: str = "192.168.1.10") -> dict:
    return {
        "uid": uid,
        "ts": "1.0",
        "source_ip": sensor_src,
        "destination_ip": sensor_dst,
        "src_ip": sensor_src,
        "dst_ip": sensor_dst,
        "dst_port": 80,
        "proto": "tcp",
        "service": "http",
        "ai2a_features": {},
    }


def http(uid: str = "C1", *, trans_depth: int = 1, uri: str = "/one") -> dict:
    return {
        "uid": uid,
        "ts": str(1.0 + (trans_depth / 10)),
        "source_ip": "10.10.10.10",
        "destination_ip": "192.168.1.10",
        "trans_depth": trans_depth,
        "method": "GET",
        "uri": uri,
    }


def settings(sensor_id: str = "zeek-vm-01") -> CorrelatorSettings:
    return CorrelatorSettings(
        sensor_id=sensor_id,
        allowed_endpoints={"10.10.10.10", "192.168.1.10"},
        require_both_endpoints=True,
        correlation_timeout_seconds=5.0,
    )


def test_same_uid_two_http_transactions_emit_two_events_without_overwrite() -> None:
    correlator = ZeekTransactionCorrelator(settings())

    assert correlator.ingest_flow(flow(), now=1.0) == []
    events = [
        *correlator.ingest_http(http(trans_depth=1, uri="/first"), now=1.1),
        *correlator.ingest_http(http(trans_depth=2, uri="/second"), now=1.2),
    ]

    assert [event["event_id"] for event in events] == [
        "zeek:zeek-vm-01:C1:1",
        "zeek:zeek-vm-01:C1:2",
    ]
    assert [event["transaction_id"] for event in events] == ["C1:1", "C1:2"]
    assert [event["evidence"]["http"]["uri"] for event in events] == ["/first", "/second"]
    assert all(event["event_type"] == "combined" for event in events)


def test_http_first_times_out_then_flow_late_updates_same_event_id() -> None:
    correlator = ZeekTransactionCorrelator(settings())

    assert correlator.ingest_http(http(trans_depth=3, uri="/late"), now=1.0) == []
    [partial] = correlator.expire(now=7.0)
    [combined] = correlator.ingest_flow(flow(), now=8.0)

    assert partial["event_id"] == combined["event_id"] == "zeek:zeek-vm-01:C1:3"
    assert partial["correlation_status"] == "http_only"
    assert partial["event_type"] == "http"
    assert combined["correlation_status"] == "combined"
    assert combined["event_type"] == "combined"


def test_same_uid_different_sensor_does_not_correlate() -> None:
    first = ZeekTransactionCorrelator(settings("sensor-a"))
    second = ZeekTransactionCorrelator(settings("sensor-b"))

    assert first.ingest_flow(flow("Cshared"), now=1.0) == []
    assert second.ingest_http(http("Cshared", trans_depth=1), now=1.1) == []
    [first_flow_only] = first.expire(now=7.0)
    [second_http_only] = second.expire(now=7.0)

    assert first_flow_only["event_id"] == "zeek:sensor-a:Cshared:flow"
    assert second_http_only["event_id"] == "zeek:sensor-b:Cshared:1"


def test_filter_requires_exact_lab_pair_not_single_included_endpoint() -> None:
    correlator = ZeekTransactionCorrelator(settings())

    victim_to_internet = flow(sensor_src="192.168.1.10", sensor_dst="185.125.190.99")
    kept_reverse = flow(sensor_src="192.168.1.10", sensor_dst="10.10.10.10")

    assert correlator.ingest_flow(victim_to_internet, now=1.0) == []
    assert correlator.expire(now=7.0) == []
    assert correlator.ingest_flow(kept_reverse, now=8.0) == []
    [event] = correlator.expire(now=14.0)
    assert event["event_id"] == "zeek:zeek-vm-01:C1:flow"


def test_alert_store_upsert_replaces_existing_alert_instead_of_duplicating() -> None:
    store = AlertStore()

    _, created_first = store.upsert({"id": "zeek:demo:C1:1", "attack_type": "Benign"})
    _, created_second = store.upsert({"id": "zeek:demo:C1:1", "attack_type": "SQL Injection"})

    assert created_first is True
    assert created_second is False
    assert len(store.list()) == 1
    assert store.list()[0]["attack_type"] == "SQL Injection"


def test_correlated_tailer_limit_counts_emitted_events_not_raw_rows(tmp_path: Path) -> None:
    conn_log = tmp_path / "conn.log"
    http_log = tmp_path / "http.log"
    conn_log.write_text(
        "#fields\tts\tuid\tid.orig_h\tid.orig_p\tid.resp_h\tid.resp_p\tproto\tservice\n"
        "1.0\tC1\t10.10.10.10\t1234\t192.168.1.10\t80\ttcp\thttp\n",
        encoding="utf-8",
    )
    http_log.write_text(
        "#fields\tts\tuid\tid.orig_h\tid.resp_h\ttrans_depth\tmethod\turi\n"
        "1.1\tC1\t10.10.10.10\t192.168.1.10\t1\tGET\t/one\n"
        "1.2\tC1\t10.10.10.10\t192.168.1.10\t2\tGET\t/two\n",
        encoding="utf-8",
    )
    script = SCRIPTS_ROOT / "tail_zeek_correlated_to_backend.py"

    result = subprocess.run(
        [
            sys.executable,
            str(script),
            "--conn-log",
            str(conn_log),
            "--http-log",
            str(http_log),
            "--from-start",
            "--dry-run",
            "--max-emitted-events",
            "1",
            "--allow-endpoint",
            "10.10.10.10",
            "--allow-endpoint",
            "192.168.1.10",
            "--require-both-endpoints",
        ],
        text=True,
        capture_output=True,
        check=True,
    )

    emitted = [json.loads(line) for line in result.stdout.splitlines() if '"status": "dry_run_event"' in line]
    assert len(emitted) == 1
    assert emitted[0]["event"]["event_id"] == "zeek:zeek-vm-01:C1:1"
