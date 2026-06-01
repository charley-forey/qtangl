"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  faqCategories,
  readinessFaq,
  type FaqItem,
} from "@/lib/copy/readiness-resources";

export default function ReadinessFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const categories = Object.keys(faqCategories) as FaqItem["category"][];

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const items = readinessFaq.filter((item) => item.category === category);
        if (!items.length) return null;

        return (
          <div key={category}>
            <Eyebrow>{faqCategories[category]}</Eyebrow>
            <div className="mt-4 space-y-3">
              {items.map((item) => {
                const index = readinessFaq.indexOf(item);
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
          </div>
        );
      })}
    </div>
  );
}
