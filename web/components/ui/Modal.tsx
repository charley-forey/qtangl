"use client";

import { KeyboardEvent, ReactNode, useEffect, useId, useRef } from "react";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  title?: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

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

export default function Modal({
  open,
  title,
  eyebrow = "Navigation",
  onClose,
  children,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const dialog = dialogRef.current;
    const focusTarget = dialog
      ? getFocusableElements(dialog)[0] ?? dialog
      : null;
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

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusableElements = getFocusableElements(dialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!activeElement || !dialog.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/80 px-3 py-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`surface-panel-strong relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full ${sizeClass[size]} flex-col overflow-hidden rounded-[1.5rem] shadow-[0_18px_60px_rgba(0,0,0,0.45)]`}
      >
        <div className="flex flex-none items-center justify-between gap-4 border-b border-[var(--border)] p-5 pb-4">
          <div>
            {eyebrow ? <p className="text-label">{eyebrow}</p> : null}
            {title ? (
              <h2 id={titleId} className="mt-2 text-lg font-semibold text-white">
                {title}
              </h2>
            ) : null}
          </div>
          <button
            type="button"
            className="touch-target rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </div>
  );
}
