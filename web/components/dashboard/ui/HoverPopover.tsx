"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type HoverPopoverProps = {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
  side?: "top" | "bottom";
};

export default function HoverPopover({
  trigger,
  content,
  className = "",
  side = "bottom",
}: HoverPopoverProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const tipId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = side === "bottom" ? rect.bottom + 8 : rect.top - 8;
    setCoords({ top, left: rect.left });
  }, [side]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pinned]);

  const show = () => {
    updatePosition();
    setOpen(true);
  };
  const hide = () => {
    if (!pinned) setOpen(false);
  };

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            id={tipId}
            role="tooltip"
            className={`fixed z-[200] max-w-sm rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-3 text-left text-xs leading-5 text-[var(--color-gray-300)] shadow-lg ${className}`}
            style={{ top: coords.top, left: coords.left }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => {
              if (!pinned) setOpen(false);
            }}
          >
            {content}
          </div>,
          document.body
        )
      : null;

  return (
    <span className="relative inline-flex">
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => {
          setPinned((p) => !p);
          setOpen(true);
        }}
        aria-describedby={open ? tipId : undefined}
      >
        {trigger}
      </span>
      {panel}
    </span>
  );
}
