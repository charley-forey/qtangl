import { NextResponse } from "next/server";

import { getLibraryIndex } from "@/lib/library";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const entries = await getLibraryIndex();
  const header = [
    "slug",
    "title",
    "owner",
    "category",
    "primaryLanguage",
    "license",
    "stars",
    "lastPushedAt",
    "flagship",
    "qtanglRelevant",
    "repoUrl",
    "summary",
  ];
  const rows = entries.map((entry) =>
    [
      entry.slug,
      entry.title,
      entry.owner,
      entry.category.title,
      entry.primaryLanguage ?? "",
      entry.license ?? "",
      String(entry.stars),
      entry.lastPushedAt ?? "",
      entry.flagship ? "yes" : "no",
      entry.qtanglRelevant ? "yes" : "no",
      entry.repoUrl,
      entry.summary,
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="qtangl-learn-library.csv"',
    },
  });
}
