import { NextResponse } from "next/server";

import { getLibraryIndex } from "@/lib/library";

export async function GET() {
  const entries = await getLibraryIndex();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: entries.length,
    entries,
  });
}
