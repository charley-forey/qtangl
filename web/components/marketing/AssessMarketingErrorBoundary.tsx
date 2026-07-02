"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Props = { children: ReactNode };

type State = { error: Error | null };

export default class AssessMarketingErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Assess marketing section error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Card tone="panel" className="rounded-[var(--radius-xl)] p-6" role="alert">
          <p className="text-sm font-semibold text-white">Some marketing sections failed to load</p>
          <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
            {this.state.error.message}. The scanner above should still work — try reloading this section.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => this.setState({ error: null })}>
            Retry section
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
