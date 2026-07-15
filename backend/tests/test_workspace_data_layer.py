from __future__ import annotations

import asyncio

import pytest

from app import dependencies, main
from app.adapters.unavailable import UnavailableAdapter
from app.services.store import AlertStore, asset_inventory, dashboard_summary, ioc_inventory, network_activity
from app.services.workspace_store import WorkspaceStore


def alert(alert_id: str = "evt-1", *, timestamp: str = "2026-07-14T10:00:00Z") -> dict:
    return {
        "id": alert_id,
        "timestamp": timestamp,
        "severity": "High",
        "attack_type": "Port Scan / Reconnaissance",
        "source_ip": "203.0.113.10",
        "destination_ip": "10.0.0.10",
        "source_port": 50000,
        "destination_port": 22,
        "protocol": "TCP",
        "direction": "External -> Internal",
        "confidence_score": 0.93,
        "risk_score": 82,
        "status": "new",
        "mitre": {"technique_id": "T1046", "technique_name": "Network Service Discovery"},
        "zeek_evidence": {
            "sensor_id": "zeek-1",
            "duration": 1.5,
            "orig_bytes": 1200,
            "resp_bytes": 200,
            "orig_pkts": 20,
            "resp_pkts": 4,
            "conn_state": "S0",
            "service": "ssh",
        },
        "suricata_evidence": None,
        "ai_analysis": {},
    }


def test_predictor_default_is_unavailable_and_replay_is_explicit(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("AI1", "AI2A", "AI2B"):
        monkeypatch.delenv(f"{name}_PREDICTOR_MODE", raising=False)

    unavailable = dependencies.build_orchestrator()
    assert all(isinstance(adapter, UnavailableAdapter) for adapter in unavailable.adapters.values())

    monkeypatch.setenv("AI1_PREDICTOR_MODE", "replay")
    replay = dependencies.build_orchestrator()
    result = replay.process(
        {
            "event_id": "evt-replay",
            "event_type": "network_flow",
            "evidence": {"flow": {"attack_hint": "scan", "orig_pkts": 700}},
        }
    )
    assert result["ai_analysis"]["ai1"]["status"] == "simulated"
    assert result["ai_analysis"]["ai1"]["source"] == "replay"


def test_alert_store_get_update_metrics_and_pure_aggregates() -> None:
    alerts = AlertStore()
    alerts.add(alert())

    fetched = alerts.get("evt-1")
    assert fetched is not None
    fetched["status"] = "mutated-outside-store"
    assert alerts.get("evt-1")["status"] == "new"

    updated = alerts.update("evt-1", {"status": "investigating"})
    assert updated is not None
    assert updated["status"] == "investigating"
    assert alerts.metrics()["ingested_total"] == 1
    assert alerts.metrics()["last_ingest_at"] is not None

    dashboard = dashboard_summary(alerts.list())
    assert dashboard["totalAlerts"] == 1
    assert dashboard["totalNetworkFlows"] == 1
    assert dashboard["averageRiskScore"] == 82.0
    assert network_activity(alerts.list())["flows"][0]["bytes"] == 1400
    assert len(asset_inventory(alerts.list())) == 2
    assert ioc_inventory(alerts.list())[0]["value"] == "203.0.113.10"


def test_empty_aggregates_return_zero_or_null_not_seeded_values() -> None:
    assert dashboard_summary([]) == {
        "totalAlerts": 0,
        "totalFusionAlerts": 0,
        "totalNetworkFlows": 0,
        "criticalAlerts": 0,
        "highAlerts": 0,
        "mediumAlerts": 0,
        "lowAlerts": 0,
        "openAlerts": 0,
        "topThreat": None,
        "averageRiskScore": None,
        "averageConfidence": None,
        "severityDistribution": [
            {"name": "Critical", "value": 0},
            {"name": "High", "value": 0},
            {"name": "Medium", "value": 0},
            {"name": "Low", "value": 0},
        ],
        "scope": "retained_alerts",
    }
    assert network_activity([])["flows"] == []
    assert asset_inventory([]) == []
    assert ioc_inventory([]) == []


def test_alert_reads_merge_rds_and_memory_and_fall_back(monkeypatch: pytest.MonkeyPatch) -> None:
    memory = AlertStore()
    memory.add({**alert("shared", timestamp="2026-07-14T11:00:00Z"), "status": "investigating"})
    persisted = [
        {**alert("shared", timestamp="2026-07-14T10:00:00Z"), "status": "new"},
        alert("rds-only", timestamp="2026-07-14T09:00:00Z"),
    ]
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "list_final_alerts", lambda limit: persisted[:limit])

    merged = main.list_alerts(limit=50)
    assert [item["id"] for item in merged] == ["shared", "rds-only"]
    assert merged[0]["status"] == "investigating"

    monkeypatch.setattr(main, "list_final_alerts", lambda limit: (_ for _ in ()).throw(RuntimeError("down")))
    assert [item["id"] for item in main.list_alerts(limit=50)] == ["shared"]


def test_aws_alert_reads_use_only_rds_and_fail_closed(monkeypatch: pytest.MonkeyPatch) -> None:
    memory = AlertStore()
    memory.add(alert("memory-only"))
    persisted = alert("rds-only")
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "list_final_alerts", lambda limit: [persisted])

    assert main.list_alerts(limit=50) == [persisted]

    def fail_rds(limit: int) -> list[dict]:  # noqa: ARG001
        raise RuntimeError("database offline")

    monkeypatch.setattr(main, "list_final_alerts", fail_rds)
    with pytest.raises(main.HTTPException) as excinfo:
        main.list_alerts(limit=50)
    assert excinfo.value.status_code == 503
    assert "temporarily unavailable" in str(excinfo.value.detail)


def test_aws_alert_action_does_not_report_success_when_rds_write_fails(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeSockets:
        def __init__(self) -> None:
            self.calls: list[tuple[dict, bool]] = []

        async def broadcast_alert(self, item: dict, *, created: bool = True) -> None:
            self.calls.append((item, created))

    durable = {**alert(), "status": "new"}
    memory = AlertStore()
    memory.add({**durable, "status": "stale-memory-value"})
    sockets = FakeSockets()
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "websockets", sockets)
    monkeypatch.setattr(main, "get_final_alert", lambda alert_id: durable)

    def fail_write(item: dict) -> None:  # noqa: ARG001
        raise RuntimeError("commit failed")

    monkeypatch.setattr(main, "upsert_final_alert", fail_write)

    with pytest.raises(main.HTTPException) as excinfo:
        asyncio.run(
            main.alert_action(
                "evt-1",
                {"action": "updateAlertStatus", "status": "resolved"},
            )
        )

    assert excinfo.value.status_code == 503
    assert "not committed" in str(excinfo.value.detail)
    assert memory.get("evt-1")["status"] == "stale-memory-value"
    assert sockets.calls == []


def test_aws_create_case_action_fails_before_process_local_side_effect(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    durable = {**alert(), "status": "new"}
    process_workspace = WorkspaceStore()
    write_calls: list[dict] = []
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "workspace", process_workspace)
    monkeypatch.setattr(main, "get_final_alert", lambda alert_id: durable)
    monkeypatch.setattr(main, "upsert_final_alert", write_calls.append)

    with pytest.raises(main.HTTPException) as excinfo:
        asyncio.run(
            main.alert_action(
                "evt-1",
                {"action": "createCaseFromAlert"},
            )
        )

    assert excinfo.value.status_code == 501
    assert "durable" in str(excinfo.value.detail)
    assert process_workspace.list_cases() == []
    assert write_calls == []


def test_aws_case_api_rejects_process_local_mutations(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    process_workspace = WorkspaceStore()
    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setattr(main, "workspace", process_workspace)

    with pytest.raises(main.HTTPException) as create_error:
        main.create_case({"id": "CASE-1", "title": "Must be durable"})
    with pytest.raises(main.HTTPException) as update_error:
        main.update_case("CASE-1", {"status": "Resolved"})

    assert create_error.value.status_code == 501
    assert update_error.value.status_code == 501
    assert process_workspace.list_cases() == []


def test_aws_alert_action_commits_rds_before_cache_and_broadcast(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    call_order: list[str] = []
    durable = {**alert(), "status": "new"}
    memory = AlertStore()

    class FakeSockets:
        async def broadcast_alert(self, item: dict, *, created: bool = True) -> None:
            assert item["status"] == "resolved"
            assert created is False
            call_order.append("broadcast")

    def persist(item: dict) -> None:
        assert item["status"] == "resolved"
        assert item["analyst_actions"][0]["action"] == "updateAlertStatus"
        assert item["analyst_actions"][0]["updates"] == {"status": "resolved"}
        assert memory.get("evt-1") is None
        call_order.append("rds")

    original_upsert = memory.upsert

    def cache(item: dict) -> tuple[dict, bool]:
        call_order.append("cache")
        return original_upsert(item)

    monkeypatch.setenv("SOC_DEPLOYMENT_TARGET", "aws")
    monkeypatch.setenv("RDS_SECRET_ID", "test/rds")
    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "websockets", FakeSockets())
    monkeypatch.setattr(main, "get_final_alert", lambda alert_id: durable)
    monkeypatch.setattr(main, "upsert_final_alert", persist)
    monkeypatch.setattr(memory, "upsert", cache)

    result = asyncio.run(
        main.alert_action(
            "evt-1",
            {"action": "updateAlertStatus", "status": "resolved"},
        )
    )

    assert result["alert"]["status"] == "resolved"
    assert result["auditEventId"] == result["alert"]["analyst_actions"][0]["id"]
    assert call_order == ["rds", "cache", "broadcast"]


def test_alert_limit_200_retains_older_high_dos_amid_new_normal_traffic(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    memory = AlertStore(max_items=200)
    memory.add(
        {
            **alert("dos-older", timestamp="2026-07-14T10:00:00Z"),
            "severity": "High",
            "attack_type": "Denial of Service",
            "risk_score": 93,
        }
    )
    for index in range(100):
        timestamp = f"2026-07-14T11:{index // 60:02d}:{index % 60:02d}Z"
        memory.add(
            {
                **alert(f"normal-{index}", timestamp=timestamp),
                "severity": "Low",
                "attack_type": "Benign / No Confirmed Attack",
                "risk_score": 15,
            }
        )

    monkeypatch.delenv("RDS_SECRET_ID", raising=False)
    monkeypatch.setattr(main, "store", memory)

    latest_50 = main.list_alerts(limit=50)
    retained = main.list_alerts(limit=200)

    assert len(latest_50) == 50
    assert all(
        item["attack_type"] == "Benign / No Confirmed Attack"
        for item in latest_50
    )
    assert len(retained) == 101
    assert retained[-1]["id"] == "dos-older"
    assert retained[-1]["severity"] == "High"

    alerts_route = next(
        route for route in main.app.routes
        if getattr(route, "path", None) == "/api/alerts"
    )
    [limit_parameter] = alerts_route.dependant.query_params
    assert any(getattr(item, "le", None) == 200 for item in limit_parameter.field_info.metadata)


def test_websocket_initial_data_uses_full_retained_alert_window(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeSocketManager:
        async def connect(self, _websocket) -> None:  # noqa: ANN001
            return None

        def disconnect(self, _websocket) -> None:  # noqa: ANN001
            return None

    class FakeWebSocket:
        def __init__(self) -> None:
            self.messages: list[dict] = []

        async def send_json(self, payload: dict) -> None:
            self.messages.append(payload)

        async def receive_text(self) -> str:
            raise main.WebSocketDisconnect()

    memory = AlertStore(max_items=200)
    memory.add(alert("dos-older", timestamp="2026-07-14T10:00:00Z"))
    for index in range(100):
        timestamp = f"2026-07-14T11:{index // 60:02d}:{index % 60:02d}Z"
        memory.add(alert(f"normal-{index}", timestamp=timestamp))
    socket = FakeWebSocket()
    monkeypatch.delenv("RDS_SECRET_ID", raising=False)
    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "websockets", FakeSocketManager())

    asyncio.run(main.alerts_socket(socket))  # type: ignore[arg-type]

    assert len(socket.messages) == 1
    assert socket.messages[0]["type"] == "INITIAL_DATA"
    assert len(socket.messages[0]["data"]) == 101
    assert socket.messages[0]["data"][-1]["id"] == "dos-older"


def test_workspace_collections_start_empty_and_support_crud() -> None:
    workspace = WorkspaceStore(runtime_settings={"runtime": {"rdsConfigured": False}})
    assert workspace.list_cases() == []
    assert workspace.list_playbooks() == []
    assert workspace.list_alert_rules() == []

    case = workspace.create_case({"source": "alert", "alertId": "evt-1", "evidence": {"title": "Investigation"}})
    assert case["id"] == "CASE-evt-1"
    assert workspace.update_case(case["id"], {"status": "Resolved"})["status"] == "Resolved"

    playbook = workspace.create_playbook({"name": "Contain source"})
    assert workspace.update_playbook(playbook["id"], {"enabled": True})["enabled"] is True

    rule = workspace.create_alert_rule({"ruleName": "High risk", "isActive": True})
    assert rule["status"] == "active"
    assert workspace.update_settings({"reporting": {"format": "JSON"}})["reporting"]["format"] == "JSON"


def test_workspace_api_reports_process_local_non_durable_state() -> None:
    status = main.get_workspace_status()
    runtime = dependencies.runtime_settings()["runtime"]

    assert status["persistence"] == "process_local"
    assert status["durable"] is False
    assert status["sharedAcrossInstances"] is False
    assert status["survivesRestart"] is False
    assert runtime["workspacePersistence"] == "process_local"
    assert runtime["workspaceSharedAcrossInstances"] is False
    assert runtime["workspaceSurvivesRestart"] is False


def test_settings_api_does_not_allow_runtime_persistence_claims() -> None:
    with pytest.raises(main.HTTPException) as excinfo:
        main.update_settings(
            {"updates": {"runtime": {"workspacePersistence": "durable"}}}
        )

    assert excinfo.value.status_code == 400
    assert "read-only" in str(excinfo.value.detail)


def test_alert_action_updates_store_and_broadcasts(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeSockets:
        def __init__(self) -> None:
            self.calls: list[tuple[dict, bool]] = []

        async def broadcast_alert(self, item: dict, *, created: bool = True) -> None:
            self.calls.append((item, created))

    memory = AlertStore()
    memory.add(alert())
    sockets = FakeSockets()
    monkeypatch.delenv("RDS_SECRET_ID", raising=False)
    monkeypatch.setattr(main, "store", memory)
    monkeypatch.setattr(main, "websockets", sockets)

    result = asyncio.run(
        main.alert_action(
            "evt-1",
            {"action": "updateAlertStatus", "status": "resolved", "updates": {"status": "resolved"}},
        )
    )

    assert result["updates"] == {"status": "resolved"}
    assert memory.get("evt-1")["status"] == "resolved"
    assert sockets.calls == [(memory.get("evt-1"), False)]


def test_rule_test_counts_actual_retained_alerts(monkeypatch: pytest.MonkeyPatch) -> None:
    memory = AlertStore()
    memory.add(alert())
    monkeypatch.delenv("RDS_SECRET_ID", raising=False)
    monkeypatch.setattr(main, "store", memory)

    result = main.test_alert_rule(
        {
            "conditions": {
                "severity": "HIGH",
                "attackType": "Port Scan",
                "protocol": "TCP",
                "sourceIp": "203.0.113.0/24",
                "destPort": "22",
                "confidence": 90,
            },
            "mitreId": "T1046",
        }
    )
    assert result["matchedEvents"] == 1
    assert result["matchedAlertIds"] == ["evt-1"]
