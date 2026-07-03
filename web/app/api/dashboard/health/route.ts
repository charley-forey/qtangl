import { NextResponse } from "next/server";

import { qtanglApiBaseUrlServer } from "@/lib/auth/workos";

export const runtime = "nodejs";

/** Passthrough subset of backend /health/ready for Command Center ops panels. */
export async function GET() {
  try {
    const upstream = await fetch(`${qtanglApiBaseUrlServer()}/health/ready`, { cache: "no-store" });
    const body = (await upstream.json()) as Record<string, unknown>;
    return NextResponse.json({
      status: body.status ?? "unknown",
      database: body.database,
      redis: body.redis,
      persistenceEnabled: body.persistenceEnabled,
      redisEnabled: body.redisEnabled,
      inlineJobs: body.inlineJobs,
      workerQueueEnabled: body.workerQueueEnabled,
      scheduler: body.scheduler,
      schedulerStale: body.schedulerStale,
    });
  } catch {
    return NextResponse.json({ status: "degraded", schedulerStale: true }, { status: 503 });
  }
}
