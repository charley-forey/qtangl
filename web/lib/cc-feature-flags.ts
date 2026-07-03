/**
 * Per-feature flags for Command Center Next Wave.
 * Extend NEXT_PUBLIC_QTANGL_CC_V2 or gate individual surfaces.
 */

function flag(name: string, defaultOn = true): boolean {
  if (typeof process === "undefined") return defaultOn;
  const v = process.env[name];
  if (v === "false") return false;
  if (v === "true") return true;
  return defaultOn;
}

export const ccFlags = {
  v2: flag("NEXT_PUBLIC_QTANGL_CC_V2", true),
  graph: flag("NEXT_PUBLIC_QTANGL_CC_GRAPH", true),
  hndl: flag("NEXT_PUBLIC_QTANGL_CC_HNDL", true),
  nlQuery: flag("NEXT_PUBLIC_QTANGL_CC_NL_QUERY", true),
  correlation: flag("NEXT_PUBLIC_QTANGL_CC_CORRELATION", true),
  comments: flag("NEXT_PUBLIC_QTANGL_CC_COMMENTS", true),
  warRoom: flag("NEXT_PUBLIC_QTANGL_CC_WAR_ROOM", true),
  transparency: flag("NEXT_PUBLIC_QTANGL_CC_TRANSPARENCY", true),
  savedViews: flag("NEXT_PUBLIC_QTANGL_CC_SAVED_VIEWS", true),
  widgetLayout: flag("NEXT_PUBLIC_QTANGL_CC_WIDGET_LAYOUT", true),
  pwa: flag("NEXT_PUBLIC_QTANGL_CC_PWA", true),
  portfolio: flag("NEXT_PUBLIC_QTANGL_CC_PORTFOLIO", true),
} as const;
