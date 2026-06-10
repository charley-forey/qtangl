import assert from "node:assert/strict";
import test from "node:test";

import {
  markdownToPlainText,
  slugifyExportFilename,
} from "../lib/docs/page-export.ts";

test("slugifyExportFilename normalizes docs paths", () => {
  assert.equal(slugifyExportFilename("/docs/concepts"), "concepts");
  assert.equal(slugifyExportFilename("/docs/guides/assess"), "guides-assess");
});

test("markdownToPlainText strips frontmatter and links", () => {
  const md = `---
title: "Test"
---

# Title

Read the [Assess guide](https://qtangl.com/docs/guides/assess).`;

  const plain = markdownToPlainText(md);
  assert.match(plain, /Assess guide \(https:\/\/qtangl.com\/docs\/guides\/assess\)/);
  assert.doesNotMatch(plain, /^---/);
});
