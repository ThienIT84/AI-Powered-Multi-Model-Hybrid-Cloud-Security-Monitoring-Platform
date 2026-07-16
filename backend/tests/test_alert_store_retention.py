from __future__ import annotations

from app.services.store import AlertStore


def _alert(identifier: str, severity: str, *, attack_type: str = "Benign / No Confirmed Attack") -> dict:
    return {
        "id": identifier,
        "timestamp": f"2026-07-15T00:00:{identifier.removeprefix('normal-').zfill(2)}Z",
        "severity": severity,
        "attack_type": attack_type,
    }


def test_high_dos_survives_subsequent_normal_telemetry_overflow() -> None:
    store = AlertStore(max_items=5)
    store.add(_alert("dos", "High", attack_type="Denial of Service"))

    for index in range(20):
        store.add(_alert(f"normal-{index}", "Low"))

    retained = store.list(limit=100)
    retained_ids = [alert["id"] for alert in retained]

    assert len(retained) == 5
    assert "dos" in retained_ids
    assert retained_ids == ["normal-19", "normal-18", "normal-17", "normal-16", "dos"]


def test_retention_evicts_oldest_low_and_preserves_remaining_chronology() -> None:
    store = AlertStore(max_items=4)
    for alert in (
        _alert("high-old", "High"),
        _alert("low-old", "Low"),
        _alert("critical", "Critical"),
        _alert("low-newer", "Low"),
        _alert("high-new", "High"),
    ):
        store.add(alert)

    retained_ids = [alert["id"] for alert in store.list(limit=100)]

    assert retained_ids == ["high-new", "low-newer", "critical", "high-old"]


def test_retention_falls_back_to_oldest_when_no_low_alert_exists() -> None:
    store = AlertStore(max_items=2)
    store.add(_alert("high-old", "High"))
    store.add(_alert("critical", "Critical"))
    store.add(_alert("high-new", "High"))

    assert [alert["id"] for alert in store.list(limit=100)] == ["high-new", "critical"]
