"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const SAVED_KEY = "qtangl-learn-saved";

type SaveResourceButtonProps = {
  slug: string;
  title: string;
};

export default function SaveResourceButton({ slug, title }: SaveResourceButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      const slugs = raw ? (JSON.parse(raw) as string[]) : [];
      setSaved(slugs.includes(slug));
    } catch {
      setSaved(false);
    }
  }, [slug]);

  function toggleSaved() {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      const slugs = raw ? (JSON.parse(raw) as string[]) : [];
      const next = saved ? slugs.filter((item) => item !== slug) : [...slugs, slug];
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(!saved);
      trackEvent(saved ? "learn_unsave_resource" : "learn_save_resource", { slug, title });
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      className="inline-flex rounded-full border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--color-gray-300)] transition hover:border-[var(--border-strong)] hover:text-white"
    >
      {saved ? "Saved" : "Save resource"}
    </button>
  );
}
