"use client";

import React, { type ReactNode } from "react";

import Card from "@/components/ui/Card";

export function ChartEmptyState({ message = "No data for this chart yet." }: { message?: string }) {
  return (
    <div
      className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-black/20 px-4 text-center text-xs text-[var(--color-gray-500)]"
      role="status"
    >
      {message}
    </div>
  );
}

export function ChartLoadingState({ label = "Loading chart…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[120px] animate-pulse items-center justify-center rounded-xl bg-white/5 text-xs text-[var(--color-gray-500)]"
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}

type ChartErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type State = { error: Error | null };

export class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Card tone="panel" className="p-4">
          <p className="text-xs text-amber-300">{this.props.title ?? "Chart unavailable"}</p>
          <p className="mt-1 text-[10px] text-[var(--color-gray-500)]">
            This widget failed to render. Other dashboard sections remain available.
          </p>
        </Card>
      );
    }
    return this.props.children;
  }
}
