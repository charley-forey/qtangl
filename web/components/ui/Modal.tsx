"use client";

import { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-end bg-black/75 p-4 backdrop-blur-sm md:hidden">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="surface-panel-strong relative z-10 w-full max-w-sm rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-label">Navigation</p>
            {title ? <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2> : null}
          </div>
          <button
            type="button"
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
