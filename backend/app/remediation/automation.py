"""Remediation automation connectors (Venafi, ACME, hybrid TLS)."""

from __future__ import annotations

import os
import uuid
from typing import Any

_HYBRID_TLS_SNIPPET = """# Qtangl hybrid TLS remediation snippet
ssl_protocols TLSv1.3;
ssl_conf_command Groups X25519MLKEM768:X25519:secp384r1;
ssl_conf_command SignatureAlgorithms ml-dsa-65:ecdsa_secp384r1:rsa_pss_rsae_sha256;
# Verify with staged rollout and re-scan after deploy.
"""


def request_acme_reissue(*, domain: str, pqc_preferred: bool = True) -> dict[str, Any]:
    directory_url = os.environ.get("QTANGL_ACME_DIRECTORY_URL", "").strip()
    if not directory_url:
        return {
            "provider": "acme",
            "domain": domain,
            "status": "stub",
            "pqcPreferred": pqc_preferred,
            "message": "Wire QTANGL_ACME_DIRECTORY_URL for live certificate automation.",
        }
    try:
        import httpx
    except ImportError:
        return {
            "provider": "acme",
            "domain": domain,
            "status": "stub",
            "pqcPreferred": pqc_preferred,
            "message": "httpx is required for ACME automation (pip install httpx).",
        }
    try:
        with httpx.Client(timeout=30) as client:
            resp = client.get(directory_url)
            resp.raise_for_status()
            directory = resp.json()
            new_order_url = directory.get("newOrder")
            if not new_order_url:
                return {
                    "provider": "acme",
                    "domain": domain,
                    "status": "error",
                    "pqcPreferred": pqc_preferred,
                    "message": "ACME directory missing newOrder endpoint.",
                }
            nonce_resp = client.head(new_order_url)
            nonce = nonce_resp.headers.get("Replay-Nonce")
            identifiers = [{"type": "dns", "value": domain}]
            if pqc_preferred:
                identifiers.append({"type": "dns", "value": f"pqc.{domain}"})
            return {
                "provider": "acme",
                "domain": domain,
                "status": "ok",
                "pqcPreferred": pqc_preferred,
                "orderUrl": new_order_url,
                "directoryUrl": directory_url,
                "identifiers": identifiers,
                "nonceAvailable": bool(nonce),
                "message": (
                    f"ACME directory reachable; submit signed newOrder JWS for {domain} "
                    "with a registered account key to complete issuance."
                ),
            }
    except Exception as exc:
        return {
            "provider": "acme",
            "domain": domain,
            "status": "error",
            "pqcPreferred": pqc_preferred,
            "message": str(exc),
        }


def venafi_policy_check(*, policy_id: str) -> dict[str, Any]:
    base_url = os.environ.get("VENAFI_BASE_URL", "").strip()
    api_key = os.environ.get("VENAFI_API_KEY", "").strip()
    pqc_keywords = ("pqc", "hybrid", "ml-kem", "ml-dsa", "post-quantum", "kyber", "dilithium")
    heuristic_ready = any(kw in policy_id.lower() for kw in pqc_keywords)

    if not base_url or not api_key:
        return {
            "provider": "venafi",
            "policyId": policy_id,
            "status": "stub",
            "pqcReady": heuristic_ready,
            "heuristic": True,
            "message": "Configure VENAFI_BASE_URL and VENAFI_API_KEY for live policy checks.",
        }

    try:
        import httpx
    except ImportError:
        return {
            "provider": "venafi",
            "policyId": policy_id,
            "status": "error",
            "pqcReady": heuristic_ready,
            "message": "httpx is required for Venafi policy checks.",
        }

    try:
        with httpx.Client(timeout=30) as client:
            resp = client.get(
                f"{base_url.rstrip('/')}/vedpolicy/v2/policies/{policy_id}",
                headers={"Authorization": f"Bearer {api_key}", "Accept": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
            policy_name = str(data.get("Name") or data.get("name") or policy_id)
            cipher_suite = str(data.get("CipherSuite") or data.get("cipherSuite") or "").lower()
            key_algo = str(data.get("KeyAlgorithm") or data.get("keyAlgorithm") or "").lower()
            combined = f"{policy_name} {cipher_suite} {key_algo}".lower()
            pqc_ready = any(kw in combined for kw in pqc_keywords)
            return {
                "provider": "venafi",
                "policyId": policy_id,
                "status": "ok",
                "pqcReady": pqc_ready,
                "policyName": policy_name,
                "message": "Venafi policy retrieved.",
            }
    except Exception as exc:
        return {
            "provider": "venafi",
            "policyId": policy_id,
            "status": "error",
            "pqcReady": heuristic_ready,
            "message": str(exc),
        }


def open_hybrid_tls_pr(*, repo: str, branch: str, title: str) -> dict[str, Any]:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        return {
            "provider": "github",
            "repo": repo,
            "branch": branch,
            "title": title,
            "status": "stub",
            "message": "Configure GITHUB_TOKEN for auto-PR remediation workflows.",
        }
    try:
        import httpx
    except ImportError:
        return {
            "provider": "github",
            "repo": repo,
            "branch": branch,
            "title": title,
            "status": "stub",
            "message": "httpx is required for GitHub PR automation.",
        }

    if "/" not in repo:
        return {
            "provider": "github",
            "repo": repo,
            "status": "error",
            "message": "repo must be owner/name format.",
        }
    owner, repo_name = repo.split("/", 1)
    branch_name = branch or f"qtangl/hybrid-tls-{uuid.uuid4().hex[:8]}"
    file_path = "qtangl/hybrid-tls.conf"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    api_base = "https://api.github.com"

    try:
        with httpx.Client(timeout=30) as client:
            repo_resp = client.get(f"{api_base}/repos/{owner}/{repo_name}", headers=headers)
            repo_resp.raise_for_status()
            default_branch = repo_resp.json().get("default_branch", "main")

            ref_resp = client.get(
                f"{api_base}/repos/{owner}/{repo_name}/git/ref/heads/{default_branch}",
                headers=headers,
            )
            ref_resp.raise_for_status()
            base_sha = ref_resp.json()["object"]["sha"]

            create_ref = client.post(
                f"{api_base}/repos/{owner}/{repo_name}/git/refs",
                headers=headers,
                json={"ref": f"refs/heads/{branch_name}", "sha": base_sha},
            )
            if create_ref.status_code == 422 and "Reference already exists" in create_ref.text:
                pass
            else:
                create_ref.raise_for_status()

            content_resp = client.put(
                f"{api_base}/repos/{owner}/{repo_name}/contents/{file_path}",
                headers=headers,
                json={
                    "message": title or "Add hybrid TLS configuration (Qtangl remediation)",
                    "content": __import__("base64").b64encode(_HYBRID_TLS_SNIPPET.encode()).decode(),
                    "branch": branch_name,
                },
            )
            content_resp.raise_for_status()

            pr_resp = client.post(
                f"{api_base}/repos/{owner}/{repo_name}/pulls",
                headers=headers,
                json={
                    "title": title or "Enable hybrid TLS (Qtangl remediation)",
                    "head": branch_name,
                    "base": default_branch,
                    "body": "Automated hybrid TLS config from Qtangl remediation workflow.",
                },
            )
            pr_resp.raise_for_status()
            pr_data = pr_resp.json()
            return {
                "provider": "github",
                "repo": repo,
                "branch": branch_name,
                "title": title,
                "status": "ok",
                "prUrl": pr_data.get("html_url"),
                "prNumber": pr_data.get("number"),
                "filePath": file_path,
            }
    except Exception as exc:
        return {
            "provider": "github",
            "repo": repo,
            "branch": branch_name if "/" in repo else branch,
            "title": title,
            "status": "error",
            "message": str(exc),
        }
