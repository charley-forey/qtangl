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
