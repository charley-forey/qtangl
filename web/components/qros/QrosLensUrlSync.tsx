"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useQrosLens } from "@/lib/qros-lens-context";
import type { GlobalLens } from "@/lib/qros-types";

function lensFromParams(params: URLSearchParams): Partial<GlobalLens> {
  return {
    businessUnit: params.get("bu"),
    framework: params.get("framework"),
    severity: params.get("severity"),
    environment: params.get("env"),
    query: params.get("q"),
  };
}

/** Sync global lens filters with URL search params (bu, framework, severity, env, q). */
export default function QrosLensUrlSync() {
  const searchParams = useSearchParams();
  const { setLens } = useQrosLens();

  useEffect(() => {
    const patch = lensFromParams(searchParams);
    setLens(patch);
  }, [searchParams, setLens]);

  return null;
}
