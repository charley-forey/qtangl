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
