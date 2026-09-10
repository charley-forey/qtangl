from __future__ import annotations

import unittest

from app.partner.portfolio_export import _merge_pdfs, build_portfolio_board_pdf


class PortfolioExportMergeTest(unittest.TestCase):
    def test_merge_pdfs_combines_cover_and_placeholder(self) -> None:
        pdf = build_portfolio_board_pdf(
            parent_tenant_id="parent-merge-test",
            child_summaries=[
                {
                    "childTenantId": "child-no-scan",
                    "childTenantName": "Demo Bank",
                }
            ],
        )
        self.assertTrue(pdf.startswith(b"%PDF"))
        try:
            import io

            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(pdf))
            self.assertGreaterEqual(len(reader.pages), 2)
            text = "".join(page.extract_text() or "" for page in reader.pages)
            self.assertIn("Portfolio board pack", text)
            self.assertIn("Demo Bank", text)
        except ImportError:
            self.assertGreater(len(pdf), 500)

    def test_merge_pdfs_requires_valid_chunks(self) -> None:
        cover = build_portfolio_board_pdf(parent_tenant_id="parent-only", child_summaries=[])
        merged = _merge_pdfs([cover])
        self.assertEqual(merged, cover)


if __name__ == "__main__":
    unittest.main()


def test_rollup_uses_latest_target_scores_and_exact_business_units(monkeypatch):
    from app.portfolio import service

    reports = {
        "a-new": {"targetDomain": "HTTPS://A.EXAMPLE./", "readinessScore": 80},
        "b-new": {"targetDomain": "b.example", "readinessScore": 40},
        "a-old": {"targetDomain": "a.example", "readinessScore": 20},
        "a-older": {"targetDomain": "a.example", "readinessScore": 10},
        "lookalike": {"targetDomain": "not-a.example", "readinessScore": 0},
    }
    monkeypatch.setattr(service, "list_portfolio", lambda **kw: [
        {"target": "a.example", "businessUnit": "Finance"},
        {"target": "b.example", "businessUnit": "Finance"},
    ])

    def jobs(*, tenant_id, limit):
        assert tenant_id == "tenant-only"
        return [{"scanId": key, "status": "done"} for key in reports]

    def bundle(scan_id, *, tenant_id):
        assert tenant_id == "tenant-only"
        return {"report": reports[scan_id]}

    monkeypatch.setattr(service, "list_jobs_for_tenant", jobs)
    monkeypatch.setattr(service, "load_scan_bundle", bundle)
    result = service.readiness_rollup(tenant_id="tenant-only")
    assert result["overallReadiness"] == 40
    assert result["byBusinessUnit"] == {"Finance": 60, "unassigned": 0}
    assert [row["scanId"] for row in result["scans"]] == ["a-new", "b-new", "lookalike"]
    assert result["scans"][0]["readinessDelta"] == 60
    assert result["businessUnitDeltas"] == {"Finance": 60}


def test_rollup_does_not_replace_missing_latest_score_with_history(monkeypatch):
    from app.portfolio import service

    monkeypatch.setattr(service, "list_portfolio", lambda **kw: [])
    monkeypatch.setattr(service, "list_jobs_for_tenant", lambda **kw: [
        {"scanId": "new", "status": "done"}, {"scanId": "old", "status": "done"},
    ])
    monkeypatch.setattr(service, "load_scan_bundle", lambda scan_id, **kw: {
        "report": {"targetDomain": "a.example", "readinessScore": None if scan_id == "new" else 90}
    })
    result = service.readiness_rollup(tenant_id="tenant-only")
    assert result["overallReadiness"] is None
    assert result["byBusinessUnit"] == {"unassigned": None}
    assert len(result["scans"]) == 1
    assert result["scans"][0]["readinessDelta"] is None


def test_empty_portfolio_score_is_unavailable(monkeypatch):
    from app.portfolio import service

    monkeypatch.setattr(service, "list_portfolio", lambda **kw: [])
    monkeypatch.setattr(service, "list_jobs_for_tenant", lambda **kw: [])
    assert service.readiness_rollup(tenant_id="empty")["overallReadiness"] is None
