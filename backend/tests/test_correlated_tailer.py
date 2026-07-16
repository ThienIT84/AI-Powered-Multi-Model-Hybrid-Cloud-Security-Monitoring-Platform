from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from urllib.error import URLError

import pytest

from app.services.store import AlertStore

SCRIPTS_ROOT = Path(__file__).resolve().parents[1] / "scripts"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

import tail_zeek_correlated_to_backend as tailer  # noqa: E402
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

    assert [event["correlation_id"] for event in events] == [
        "zeek:zeek-vm-01:C1:1",
        "zeek:zeek-vm-01:C1:2",
    ]
    assert events[0]["event_id"].startswith("zeek:zeek-vm-01:C1:1:combined:")
    assert events[1]["event_id"].startswith("zeek:zeek-vm-01:C1:2:combined:")
    assert [event["transaction_id"] for event in events] == ["C1:1", "C1:2"]
    assert [event["evidence"]["http"]["uri"] for event in events] == ["/first", "/second"]
    assert all(event["event_type"] == "combined" for event in events)


def test_http_first_then_flow_late_uses_immutable_revision_ids_and_stable_correlation_id() -> None:
    correlator = ZeekTransactionCorrelator(settings())

    assert correlator.ingest_http(http(trans_depth=3, uri="/late"), now=1.0) == []
    [partial] = correlator.expire(now=7.0)
    [combined] = correlator.ingest_flow(flow(), now=8.0)

    assert partial["event_id"] != combined["event_id"]
    assert partial["event_id"].startswith("zeek:zeek-vm-01:C1:3:http_only:")
    assert combined["event_id"].startswith("zeek:zeek-vm-01:C1:3:combined:")
    assert partial["correlation_id"] == combined["correlation_id"] == "zeek:zeek-vm-01:C1:3"
    assert partial["transaction_id"] == combined["transaction_id"] == "C1:3"
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

    assert first_flow_only["event_id"].startswith("zeek:sensor-a:Cshared:flow:flow_only:")
    assert second_http_only["event_id"].startswith("zeek:sensor-b:Cshared:1:http_only:")
    assert first_flow_only["correlation_id"] == "zeek:sensor-a:Cshared:flow"
    assert second_http_only["correlation_id"] == "zeek:sensor-b:Cshared:1"


def test_filter_requires_exact_lab_pair_not_single_included_endpoint() -> None:
    correlator = ZeekTransactionCorrelator(settings())

    victim_to_internet = flow(sensor_src="192.168.1.10", sensor_dst="185.125.190.99")
    kept_reverse = flow(sensor_src="192.168.1.10", sensor_dst="10.10.10.10")

    assert correlator.ingest_flow(victim_to_internet, now=1.0) == []
    assert correlator.expire(now=7.0) == []
    assert correlator.ingest_flow(kept_reverse, now=8.0) == []
    [event] = correlator.expire(now=14.0)
    assert event["event_id"].startswith("zeek:zeek-vm-01:C1:flow:flow_only:")
    assert event["correlation_id"] == "zeek:zeek-vm-01:C1:flow"


def test_filter_keeps_any_flow_with_one_allowed_endpoint_by_default() -> None:
    correlator = ZeekTransactionCorrelator(
        CorrelatorSettings(
            sensor_id="zeek-vm-01",
            allowed_endpoints={"10.10.10.10"},
            correlation_timeout_seconds=5.0,
        )
    )

    assert correlator.ingest_flow(flow(sensor_src="10.10.10.10", sensor_dst="185.125.190.99"), now=1.0) == []
    [event] = correlator.expire(now=7.0)

    assert event["event_id"].startswith("zeek:zeek-vm-01:C1:flow:flow_only:")
    assert event["correlation_id"] == "zeek:zeek-vm-01:C1:flow"


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
    assert emitted[0]["event"]["event_id"].startswith("zeek:zeek-vm-01:C1:1:combined:")
    assert emitted[0]["event"]["correlation_id"] == "zeek:zeek-vm-01:C1:1"


def test_post_event_retries_a_transient_api_failure(monkeypatch) -> None:
    calls = 0

    class Response:
        status = 200

        def __enter__(self):
            return self

        def __exit__(self, *_args) -> None:
            return None

        def read(self) -> bytes:
            return b"{}"

    def fake_urlopen(_request, *, timeout: int):
        nonlocal calls
        assert timeout == 10
        calls += 1
        if calls < 3:
            raise URLError("backend temporarily unavailable")
        return Response()

    monkeypatch.setattr(tailer, "urlopen", fake_urlopen)
    monkeypatch.setattr(tailer.time, "sleep", lambda _seconds: None)

    tailer.post_event("http://127.0.0.1:8000/api/events", {"event_id": "event-1"}, attempts=3, retry_delay=1)

    assert calls == 3


def test_emit_many_retains_failed_events_and_drains_them_after_restart(monkeypatch, capsys, tmp_path: Path) -> None:
    attempted: list[str] = []

    def fake_post_event(_api_url: str, event: dict, **_kwargs) -> int:
        attempted.append(event["event_id"])
        if event["event_id"] == "bad-event":
            raise RuntimeError("temporary API error")
        return 200

    monkeypatch.setattr(tailer, "post_event", fake_post_event)
    events = [
        {"event_id": "bad-event", "event_type": "flow", "evidence": {}},
        {"event_id": "good-event", "event_type": "flow", "evidence": {}},
    ]

    outbox_path = tmp_path / "collector-outbox.sqlite3"
    outbox = tailer.SQLiteEventOutbox(outbox_path)
    try:
        emitted = tailer._emit_many(
            events,
            api_url="http://127.0.0.1:8000/api/events",
            dry_run=False,
            emitted=0,
            max_emitted_events=0,
            tolerate_errors=True,
            post_attempts=3,
            post_retry_delay=0,
            outbox=outbox,
        )
        assert outbox.count() == 2
    finally:
        outbox.close()

    assert attempted == ["bad-event"]
    assert emitted == 0
    assert '"status": "outbox_delivery_deferred"' in capsys.readouterr().err

    monkeypatch.setattr(tailer, "post_event", lambda *_args, **_kwargs: 200)
    restarted_outbox = tailer.SQLiteEventOutbox(outbox_path)
    try:
        result = tailer.drain_outbox(
            restarted_outbox,
            api_url="http://127.0.0.1:8000/api/events",
            post_retry_delay=0,
            max_backoff=0,
            force=True,
        )
        assert result.delivered == 2
        assert restarted_outbox.count() == 0
    finally:
        restarted_outbox.close()


def test_emit_many_logs_flow_only_event_with_null_http_as_posted(monkeypatch, capsys, tmp_path: Path) -> None:
    monkeypatch.setattr(tailer, "post_event", lambda *_args, **_kwargs: 200)
    event = {
        "event_id": "flow-only-event",
        "event_type": "network_flow",
        "correlation_status": "flow_only",
        "transaction_id": "C1:flow",
        "evidence": {"flow": {"uid": "C1"}, "http": None, "suricata": None},
    }

    outbox = tailer.SQLiteEventOutbox(tmp_path / "collector-outbox.sqlite3")
    try:
        emitted = tailer._emit_many(
            [event],
            api_url="http://127.0.0.1:8000/api/events",
            dry_run=False,
            emitted=0,
            max_emitted_events=0,
            tolerate_errors=True,
            outbox=outbox,
        )
        assert outbox.count() == 0
    finally:
        outbox.close()

    output = capsys.readouterr()
    assert emitted == 1
    assert '"status": "posted"' in output.out
    assert output.err == ""


def test_outbox_is_idempotent_for_exact_payload_and_rejects_id_reuse(tmp_path: Path) -> None:
    outbox = tailer.SQLiteEventOutbox(tmp_path / "collector-outbox.sqlite3")
    original = {"event_id": "immutable-event", "event_type": "http", "evidence": {"uri": "/one"}}
    changed = {"event_id": "immutable-event", "event_type": "http", "evidence": {"uri": "/two"}}
    try:
        assert outbox.enqueue(original) is True
        assert outbox.enqueue(dict(original)) is False
        with pytest.raises(tailer.OutboxConflictError, match="different payload"):
            outbox.enqueue(changed)
        [pending] = outbox.pending(limit=10, force=True)
        assert pending.event == original
        outbox.mark_delivered("immutable-event")
        with pytest.raises(tailer.OutboxConflictError, match="previously registered"):
            outbox.enqueue(changed)
        assert outbox.count() == 0
    finally:
        outbox.close()


def test_outbox_rejects_non_finite_json_and_numeric_normalizes_it(tmp_path: Path) -> None:
    outbox = tailer.SQLiteEventOutbox(tmp_path / "collector-outbox.sqlite3")
    try:
        with pytest.raises(tailer.EventSerializationError, match="strict JSON"):
            outbox.enqueue({"event_id": "poison", "risk_score": float("nan")})
        assert outbox.count() == 0
    finally:
        outbox.close()

    assert tailer._numeric("NaN", default=7.0) == 7.0
    assert tailer._numeric("Infinity", default=8.0) == 8.0
    assert tailer._numeric("1.25", default=9.0) == 1.25


def test_canonical_ingest_requires_202_before_outbox_ack(monkeypatch, tmp_path: Path) -> None:
    response_status = 200

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *_args) -> None:
            return None

        @property
        def status(self) -> int:
            return response_status

        def read(self) -> bytes:
            return b"{}"

    monkeypatch.setattr(tailer, "urlopen", lambda *_args, **_kwargs: Response())
    outbox = tailer.SQLiteEventOutbox(tmp_path / "collector-outbox.sqlite3")
    try:
        outbox.enqueue({"event_id": "canonical-event", "event_type": "http", "evidence": {}})
        rejected = tailer.drain_outbox(
            outbox,
            api_url="https://soc.example.com/ingest/zeek",
            post_attempts=1,
            post_retry_delay=0,
            max_backoff=0,
        )
        assert rejected.deferred == 1
        assert outbox.count() == 1

        response_status = 202
        accepted = tailer.drain_outbox(
            outbox,
            api_url="https://soc.example.com/ingest/zeek",
            post_attempts=1,
            post_retry_delay=0,
            max_backoff=0,
            force=True,
        )
        assert accepted.delivered == 1
        assert outbox.count() == 0
    finally:
        outbox.close()


def test_legacy_local_route_accepts_normal_2xx(monkeypatch) -> None:
    class Response:
        status = 204

        def __enter__(self):
            return self

        def __exit__(self, *_args) -> None:
            return None

        def read(self) -> bytes:
            return b""

    monkeypatch.setattr(tailer, "urlopen", lambda *_args, **_kwargs: Response())

    status = tailer.post_event("http://127.0.0.1:8000/api/events", {"event_id": "legacy-event"})

    assert status == 204


def test_post_event_uses_bounded_exponential_backoff(monkeypatch) -> None:
    sleeps: list[float] = []

    monkeypatch.setattr(tailer, "urlopen", lambda *_args, **_kwargs: (_ for _ in ()).throw(URLError("down")))
    monkeypatch.setattr(tailer.time, "sleep", sleeps.append)

    with pytest.raises(RuntimeError, match="after 4 attempt"):
        tailer.post_event(
            "http://127.0.0.1:8000/api/events",
            {"event_id": "retry-event"},
            attempts=4,
            retry_delay=2,
            max_retry_delay=3,
        )

    assert sleeps == [2, 3, 3]


def test_global_outage_backoff_prevents_new_events_from_bypassing_circuit(monkeypatch, tmp_path: Path) -> None:
    post_calls = 0

    def failed_post(*_args, **_kwargs) -> int:
        nonlocal post_calls
        post_calls += 1
        raise RuntimeError("backend unavailable")

    monkeypatch.setattr(tailer, "post_event", failed_post)
    outbox_path = tmp_path / "collector-outbox.sqlite3"
    outbox = tailer.SQLiteEventOutbox(outbox_path)
    try:
        first_batch = [
            {"event_id": f"event-{index}", "event_type": "http", "evidence": {}}
            for index in range(3)
        ]
        assert (
            tailer._emit_many(
                first_batch,
                api_url="https://soc.example.com/ingest/zeek",
                dry_run=False,
                emitted=0,
                max_emitted_events=0,
                post_attempts=1,
                post_retry_delay=0,
                outbox=outbox,
            )
            == 0
        )
        assert post_calls == 1
        assert outbox.delivery_retry_in() > 0
        assert outbox.count() == 3
    finally:
        outbox.close()

    restarted_outbox = tailer.SQLiteEventOutbox(outbox_path)
    try:
        assert restarted_outbox.delivery_retry_in() > 0
        assert (
            tailer._emit_many(
                [{"event_id": "event-new", "event_type": "http", "evidence": {}}],
                api_url="https://soc.example.com/ingest/zeek",
                dry_run=False,
                emitted=0,
                max_emitted_events=0,
                post_attempts=1,
                post_retry_delay=0,
                outbox=restarted_outbox,
            )
            == 0
        )
        assert post_calls == 1
        assert restarted_outbox.count() == 4
    finally:
        restarted_outbox.close()


def test_ssh_tailer_reconnects_after_remote_stream_exits(monkeypatch) -> None:
    starts = 0

    class FakeProcess:
        def __init__(self, return_code: int | None) -> None:
            self.returncode = return_code
            self.terminated = False

        def poll(self) -> int | None:
            return self.returncode

        def terminate(self) -> None:
            self.terminated = True
            self.returncode = 0

        def wait(self, *, timeout: int) -> int:
            assert timeout == 2
            return self.returncode or 0

        def kill(self) -> None:
            self.returncode = -1

    processes: list[FakeProcess] = []

    def fake_start(_zeek_ssh, _conn_log, _http_log, lines, _stop):
        nonlocal starts
        starts += 1
        process = FakeProcess(255 if starts == 1 else None)
        processes.append(process)
        if starts == 2:
            lines.put(("conn", flow(uid="CRECONNECT")))
        return process

    monkeypatch.setattr(tailer, "_start_ssh_multiplex_reader", fake_start)

    tailer.run_ssh_tail(
        "hai2@192.168.171.128",
        conn_log="/opt/zeek/spool/zeek/conn.log",
        http_log="/opt/zeek/spool/zeek/http.log",
        api_url="http://127.0.0.1:8000/api/events",
        settings=CorrelatorSettings(sensor_id="test", correlation_timeout_seconds=0),
        max_emitted_events=1,
        dry_run=True,
        poll_interval=0.001,
        conn_batch_delay=0,
        heartbeat_interval=0,
        ssh_reconnect_delay=0,
    )

    assert starts == 2
    assert processes[1].terminated is True
