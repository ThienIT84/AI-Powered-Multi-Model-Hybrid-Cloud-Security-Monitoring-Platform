from __future__ import annotations

from app.services.store import dashboard_summary, network_activity


def _http_alert(*, zeek_evidence: dict) -> dict:
    return {
        "id": "zeek:zeek-local-lab:CTXLLX1yVb4uEuxkmb:1",
        "timestamp": "2026-07-14T13:10:31Z",
        "severity": "Low",
        "attack_type": "Unclassified Event",
        "source_ip": "192.168.137.145",
        "destination_ip": "192.168.137.141",
        "source_port": None,
        "destination_port": 443,
        "protocol": "HTTP",
        "direction": "External -> Internal",
        "risk_score": 0,
        "status": "new",
        "zeek_evidence": zeek_evidence,
    }


def test_zeek_http_only_observation_counts_as_one_network_flow() -> None:
    live_alert = _http_alert(
        zeek_evidence={
            "sensor_id": "zeek-local-lab",
            "transaction_id": "CTXLLX1yVb4uEuxkmb:1",
            "correlation_status": "http_only",
            "method": "GET",
            "uri": "/",
            "service": "http",
            "duration": None,
            "orig_bytes": None,
            "resp_bytes": None,
            "orig_pkts": None,
            "resp_pkts": None,
            "conn_state": None,
        }
    )

    assert dashboard_summary([live_alert])["totalNetworkFlows"] == 1
    activity = network_activity([live_alert])
    assert activity["totalFlows"] == 1
    assert activity["points"][0]["flows"] == 1
    assert activity["flows"][0]["source"] == "zeek.http"
    assert activity["flows"][0]["bytes"] == 0
    assert activity["flows"][0]["packets"] == 0


def test_generic_http_alert_is_not_counted_as_a_network_flow() -> None:
    generic_http_alert = _http_alert(
        zeek_evidence={
            "sensor_id": None,
            "transaction_id": None,
            "correlation_status": "http",
            "method": "GET",
            "uri": "/",
            "service": "http",
        }
    )

    assert dashboard_summary([generic_http_alert])["totalNetworkFlows"] == 0
    assert network_activity([generic_http_alert])["totalFlows"] == 0


def test_unidentified_http_only_alert_is_not_counted_as_a_network_flow() -> None:
    incomplete_alert = _http_alert(
        zeek_evidence={
            "sensor_id": "zeek-local-lab",
            "transaction_id": None,
            "correlation_status": "http_only",
            "method": "GET",
            "uri": "/",
        }
    )

    assert dashboard_summary([incomplete_alert])["totalNetworkFlows"] == 0
    assert network_activity([incomplete_alert])["totalFlows"] == 0
