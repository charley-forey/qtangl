"use client";

import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";

import Button from "@/components/ui/Button";

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

type HospitalDrawerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function HospitalDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
}: HospitalDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const panel = panelRef.current;
    const focusTarget = panel ? getFocusableElements(panel)[0] ?? panel : null;
    focusTarget?.focus();

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const focusable = getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!active || !panel.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="hospital-drawer-root">
      <button
        type="button"
        className="hospital-drawer-backdrop"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="hospital-drawer-panel"
      >
        <header className="hospital-drawer-header">
          <div className="min-w-0 pr-4">
            <p className="text-label">Compliance audit</p>
            <h2 id={titleId} className="mt-2 truncate text-xl font-semibold text-white">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-[var(--color-gray-400)]">{subtitle}</p>
            ) : null}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="hospital-drawer-body">{children}</div>
      </div>
    </div>
  );
}
