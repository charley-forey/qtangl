import type { DocsSearchEntry } from "@/lib/docs/types";
import { buildStaticDocsSearchIndex } from "@/lib/docs/search-index";

import builtIndex from "../../public/docs-search-index.json";

const parsed = builtIndex as DocsSearchEntry[];

export const docsSearchIndex: DocsSearchEntry[] =
  Array.isArray(parsed) && parsed.length > 0
    ? parsed
    : buildStaticDocsSearchIndex();
