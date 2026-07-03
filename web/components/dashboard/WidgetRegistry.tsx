"use client";

import type { ComponentType } from "react";

import type { DashboardSummary } from "@/lib/dashboard-state";

/**
 * Widget plugin contract for the Command Center.
 *
 * A widget is a self-describing dashboard surface. Registering a widget makes it
 * discoverable by layout tools (DraggableWidgetGrid, DashboardWidgetGate) and the
 * command palette without hard-coding imports in every tab.
 */
export type WidgetContext = {
  summary: DashboardSummary;
  tenantSettings?: Record<string, unknown> | null;
  scanId?: string | null;
  canWrite?: boolean;
  persona?: string;
};

export type WidgetDefinition = {
  id: string;
  title: string;
  description?: string;
  /** Tab the widget belongs to, e.g. "overview" | "monitor" | "remediate". */
  tab?: string;
  /** Feature flag key from ccFlags; if the flag is off the widget is skipped. */
  flag?: string;
  /** Persona restriction; when set the widget only renders for these personas. */
  personas?: string[];
  /** Returns false to hide the widget for the given context. */
  isVisible?: (ctx: WidgetContext) => boolean;
  Component: ComponentType<WidgetContext>;
};

const registry = new Map<string, WidgetDefinition>();

export function registerWidget(definition: WidgetDefinition): void {
  registry.set(definition.id, definition);
}

export function registerWidgets(definitions: WidgetDefinition[]): void {
  definitions.forEach(registerWidget);
}

export function getWidget(id: string): WidgetDefinition | undefined {
  return registry.get(id);
}

export function listWidgets(tab?: string): WidgetDefinition[] {
  const all = Array.from(registry.values());
  return tab ? all.filter((w) => !w.tab || w.tab === tab) : all;
}

export function resolveVisibleWidgets(ctx: WidgetContext, tab?: string): WidgetDefinition[] {
  return listWidgets(tab).filter((widget) => {
    if (widget.personas && ctx.persona && !widget.personas.includes(ctx.persona)) return false;
    if (widget.isVisible && !widget.isVisible(ctx)) return false;
    return true;
  });
}

/** Renders a registered widget by id, or null when missing/hidden. */
export default function WidgetRegistry({ id, context }: { id: string; context: WidgetContext }) {
  const widget = getWidget(id);
  if (!widget) return null;
  if (widget.personas && context.persona && !widget.personas.includes(context.persona)) return null;
  if (widget.isVisible && !widget.isVisible(context)) return null;
  const Component = widget.Component;
  return <Component {...context} />;
}
