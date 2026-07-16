from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

import pytest

from app import main
from app.services import rds_alert_store
from app.services.rds_alert_store import FinalAlertUpdate
from app.services.store import AlertStore


class FakeCursor:
    def __init__(self, *, one: dict[str, Any] | None = None, many: list[dict[str, Any]] | None = None) -> None:
        self.one = one
        self.many = many or []
        self.sql = ""
        self.params: dict[str, Any] | None = None

    def __enter__(self) -> FakeCursor:
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def execute(self, sql: str, params: dict[str, Any] | None = None) -> None:
        self.sql = sql
        self.params = params

    def fetchone(self) -> dict[str, Any] | None:
        return self.one

    def fetchall(self) -> list[dict[str, Any]]:
        return self.many


class FakeConnection:
    def __init__(self, cursor: FakeCursor) -> None:
        self._cursor = cursor

    def __enter__(self) -> FakeConnection:
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def cursor(self) -> FakeCursor:
        return self._cursor


def test_latest_cursor_uses_updated_at_and_event_id_high_water_mark(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    updated_at = datetime(2026, 7, 15, 1, 2, 3, tzinfo=timezone.utc)
    cursor = FakeCursor(one={"updated_at": updated_at, "event_id": "evt-z"})
    monkeypatch.setattr(rds_alert_store, "get_conn", lambda: FakeConnection(cursor))

    assert rds_alert_store.get_latest_alert_update_cursor() == (updated_at, "evt-z")
    assert "ORDER BY updated_at DESC, event_id DESC" in cursor.sql
    assert "CURRENT_TIMESTAMP" in cursor.sql


def test_incremental_query_uses_tuple_cursor_and_ascending_total_order(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    first_time = datetime(2026, 7, 15, 1, 2, 3, tzinfo=timezone.utc)
    second_time = datetime(2026, 7, 15, 1, 2, 4, tzinfo=timezone.utc)
    cursor = FakeCursor(
        many=[
            {
                "payload": {"id": "evt-b", "risk_score": 80},
                "updated_at": second_time,
                "event_id": "evt-b",
            }
        ]
    )
    monkeypatch.setattr(rds_alert_store, "get_conn", lambda: FakeConnection(cursor))

    updates = rds_alert_store.list_final_alert_updates((first_time, "evt-a"), limit=300)

    assert updates[0].cursor == (second_time, "evt-b")
    assert updates[0].alert["risk_score"] == 80
    assert "(updated_at, event_id) > (%(updated_at)s, %(event_id)s)" in cursor.sql
    assert "ORDER BY updated_at ASC, event_id ASC" in cursor.sql
    assert cursor.params == {
        "updated_at": first_time,
        "event_id": "evt-a",
        "limit": 300,
    }


def test_sync_batch_broadcasts_an_existing_id_as_an_update(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    old_time = datetime(2026, 7, 15, 1, 0, tzinfo=timezone.utc)
    new_time = datetime(2026, 7, 15, 1, 1, tzinfo=timezone.utc)
    memory = AlertStore()
    memory.add({"id": "evt-1", "timestamp": "2026-07-15T01:00:00Z", "risk_score": 70})
    broadcasts: list[tuple[dict[str, Any], bool]] = []

    class FakeWebSockets:
        async def broadcast_alert(self, alert: dict[str, Any], *, created: bool) -> None:
            broadcasts.append((dict(alert), created))

    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "websockets", FakeWebSockets())
    monkeypatch.setattr(
        main,
        "list_final_alert_updates",
        lambda after, *, limit: [
            FinalAlertUpdate(
                alert={"id": "evt-1", "timestamp": "2026-07-15T01:00:00Z", "risk_score": 95},
                updated_at=new_time,
                event_id="evt-1",
            )
        ],
    )

    next_cursor, count = asyncio.run(main._sync_rds_alert_batch((old_time, "evt-0"), limit=200))

    assert count == 1
    assert next_cursor == (new_time, "evt-1")
    assert broadcasts == [
        ({"id": "evt-1", "timestamp": "2026-07-15T01:00:00Z", "risk_score": 95}, False)
    ]


def test_rds_connection_has_bounded_timeout_and_application_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, Any] = {}
    monkeypatch.setenv("RDS_SECRET_ID", "soc/rds")
    monkeypatch.setenv("RDS_CONNECT_TIMEOUT_SECONDS", "7")
    monkeypatch.setenv("RDS_APPLICATION_NAME", "socai-worker")
    monkeypatch.setattr(
        rds_alert_store,
        "get_json_secret",
        lambda _secret_id: {
            "host": "db.internal",
            "port": 5432,
            "dbname": "soc",
            "username": "soc_app",
            "password": "secret",
        },
    )

    def fake_connect(**kwargs: Any) -> object:
        captured.update(kwargs)
        return object()

    monkeypatch.setattr(rds_alert_store.psycopg, "connect", fake_connect)

    rds_alert_store.get_conn()

    assert captured["connect_timeout"] == 7
    assert captured["application_name"] == "socai-worker"
