"""Cloud pull adapter tests."""

from __future__ import annotations

from app.coverage.cloud_pull import pull_aws_acm, pull_azure_keyvault, pull_gcp_certificate_manager


def test_azure_pull_empty_vault():
    result = pull_azure_keyvault(vault_name="")
    assert result["status"] == "error"


def test_azure_pull_without_sdk_returns_unavailable(monkeypatch):
    import sys

    for name in list(sys.modules):
        if name.startswith("azure."):
            monkeypatch.delitem(sys.modules, name, raising=False)
    monkeypatch.setitem(sys.modules, "azure.identity", None)  # type: ignore[arg-type]
    result = pull_azure_keyvault(vault_name="test-vault")
    assert result["status"] in {"unavailable", "error"}


def test_gcp_pull_without_sdk():
    result = pull_gcp_certificate_manager(project_id="demo")
    assert result["status"] in {"unavailable", "error", "ok"}
    assert result["provider"] == "gcp_certificate_manager"


def test_gcp_pull_requires_project_id():
    result = pull_gcp_certificate_manager(project_id="")
    assert result["status"] == "error"
    assert "project_id" in result.get("message", "").lower()


def test_gcp_pull_mock_client(monkeypatch):
    import sys
    import types

    class FakeManaged:
        domains = ["tls.example.com"]
        state = "ACTIVE"

    class FakeCert:
        name = "projects/demo/locations/global/certificates/cert-1"
        managed = FakeManaged()
        expire_time = None

    class FakeClient:
        def list_certificates(self, *, parent: str):
            assert parent == "projects/demo/locations/global"
            return [FakeCert()]

    cert_mod = types.ModuleType("google.cloud.certificate_manager_v1")
    cert_mod.CertificateManagerClient = lambda credentials=None: FakeClient()  # noqa: ARG005

    oauth_mod = types.ModuleType("google.oauth2.service_account")
    oauth_mod.Credentials = type(
        "Credentials",
        (),
        {"from_service_account_info": staticmethod(lambda info: object())},
    )

    cloud_mod = types.ModuleType("google.cloud")
    cloud_mod.certificate_manager_v1 = cert_mod
    google_mod = types.ModuleType("google")
    google_mod.cloud = cloud_mod
    oauth_pkg = types.ModuleType("google.oauth2")
    oauth_pkg.service_account = oauth_mod
    google_mod.oauth2 = oauth_pkg

    monkeypatch.setitem(sys.modules, "google", google_mod)
    monkeypatch.setitem(sys.modules, "google.cloud", cloud_mod)
    monkeypatch.setitem(sys.modules, "google.cloud.certificate_manager_v1", cert_mod)
    monkeypatch.setitem(sys.modules, "google.oauth2", oauth_pkg)
    monkeypatch.setitem(sys.modules, "google.oauth2.service_account", oauth_mod)

    result = pull_gcp_certificate_manager(project_id="demo")
    assert result["status"] == "ok"
    assert result["count"] == 1
    assert result["certificates"][0]["domain"] == "tls.example.com"


def test_aws_pull_without_boto3(monkeypatch):
    import builtins

    real_import = builtins.__import__

    def mock_import(name, *args, **kwargs):
        if name == "boto3":
            raise ImportError("no boto3")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", mock_import)
    result = pull_aws_acm(region="us-east-1")
    assert result["status"] == "unavailable"
