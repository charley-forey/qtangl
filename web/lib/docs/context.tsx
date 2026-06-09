"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { DocsTocItem } from "@/lib/docs/types";

type DocsContextValue = {
  toc: DocsTocItem[];
  registerHeading: (item: DocsTocItem) => void;
  pathname: string;
};

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) {
  const [toc, setToc] = useState<DocsTocItem[]>([]);
  const orderRef = useRef(0);

  const registerHeading = useCallback((item: DocsTocItem) => {
    setToc((current) => {
      if (current.some((entry) => entry.id === item.id)) {
        return current;
      }
      const order = item.order ?? orderRef.current++;
      const next = [...current, { ...item, order }].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ toc, registerHeading, pathname }),
    [toc, registerHeading, pathname],
  );

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}

export function useDocsContext() {
  const ctx = useContext(DocsContext);
  if (!ctx) {
    throw new Error("useDocsContext must be used within DocsProvider");
  }
  return ctx;
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
