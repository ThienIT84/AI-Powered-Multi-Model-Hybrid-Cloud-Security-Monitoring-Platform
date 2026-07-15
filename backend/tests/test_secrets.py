from __future__ import annotations

import json

import pytest

from app.services import secrets


class FakeSecretsManagerClient:
    def __init__(self, calls: list[str]) -> None:
        self.calls = calls

    def get_secret_value(self, *, SecretId: str) -> dict[str, str]:
        self.calls.append(SecretId)
        return {"SecretString": json.dumps({"username": "soc", "revision": len(self.calls)})}


def test_secret_cache_refreshes_after_ttl(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[str] = []
    clock = {"now": 100.0}

    def fake_client(service: str, *, region_name: str) -> FakeSecretsManagerClient:
        assert service == "secretsmanager"
        assert region_name == "ap-southeast-1"
        return FakeSecretsManagerClient(calls)

    monkeypatch.setenv("SECRETS_CACHE_TTL_SECONDS", "10")
    monkeypatch.setattr(secrets.boto3, "client", fake_client)
    monkeypatch.setattr(secrets.time, "monotonic", lambda: clock["now"])
    secrets.clear_secret_cache()

    first = secrets.get_json_secret("soc/rds")
    second = secrets.get_json_secret("soc/rds")
    assert first == second == {"username": "soc", "revision": 1}
    assert calls == ["soc/rds"]

    clock["now"] = 111.0
    refreshed = secrets.get_json_secret("soc/rds")
    assert refreshed == {"username": "soc", "revision": 2}
    assert calls == ["soc/rds", "soc/rds"]
    secrets.clear_secret_cache()


def test_zero_ttl_disables_secret_cache(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[str] = []
    monkeypatch.setenv("SECRETS_CACHE_TTL_SECONDS", "0")
    monkeypatch.setattr(
        secrets.boto3,
        "client",
        lambda *args, **kwargs: FakeSecretsManagerClient(calls),
    )
    secrets.clear_secret_cache()

    secrets.get_json_secret("soc/ingest")
    secrets.get_json_secret("soc/ingest")

    assert calls == ["soc/ingest", "soc/ingest"]
    secrets.clear_secret_cache()
