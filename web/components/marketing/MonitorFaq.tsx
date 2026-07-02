"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { monitorFaqItems } from "@/lib/copy/readiness-monitor-faq";

export default function MonitorFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <Eyebrow>Monitor FAQ</Eyebrow>
      {monitorFaqItems.map((item, index) => {
        const open = openIndex === index;
        return (
          <Card
            key={item.question}
            tone={open ? "feature" : "ghost"}
            className="rounded-[var(--radius-xl)]"
          >
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 text-left"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
            >
              <span className="text-sm font-medium text-white">{item.question}</span>
              <span className="text-[var(--color-gray-500)]">{open ? "−" : "+"}</span>
            </button>
            {open ? (
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">{item.answer}</p>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
