"use client";

import Link from "next/link";

import MoscaTimeline from "@/components/pqc/MoscaTimeline";
import ReadinessGauge from "@/components/pqc/ReadinessGauge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { assessHowItWorks } from "@/lib/copy/readiness-assess-faq";
import type { MoscaAssessment } from "@/lib/pqc";

const sampleMosca: MoscaAssessment = {
  data_shelf_life_years: 10,
  migration_time_years: 5,
  years_to_q_day: 8,
  inequality_holds: true,
  summary: "10-year retention plus 5-year migration exceeds an 8-year quantum timeline.",
};

const STEP_ICONS = ["①", "②", "③", "④"];

export default function AssessHowItWorks() {
  return (
    <div>
      <div className="content-reading">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="heading-section mt-4">Three paths to your baseline</h2>
      </div>

      <ol className="mt-8 hidden gap-4 lg:grid lg:grid-cols-4">
        {assessHowItWorks.map((item, index) => (
          <li
            key={item.step}
            className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-5"
          >
            <p className="text-label">
              <span aria-hidden>{STEP_ICONS[index]}</span> Step {item.step}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.detail}</p>
            {item.step <= 2 ? (
              <Link href="#scanner" className="mt-3 inline-block text-xs text-white underline">
                Go to scanner
              </Link>
            ) : null}
            {item.step === 3 ? (
              <div className="mt-4 space-y-3">
                <ReadinessGauge score={58.2} />
                <MoscaTimeline mosca={sampleMosca} />
              </div>
            ) : null}
            {item.step === 4 ? (
              <Link href="#deliverables" className="mt-3 inline-block text-xs text-white underline">
                Preview deliverables
              </Link>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-3 lg:hidden">
        {assessHowItWorks.map((item, index) => (
          <Card key={item.step} tone="ghost" className="rounded-[var(--radius-xl)]">
            <p className="text-label">
              <span aria-hidden>{STEP_ICONS[index]}</span> Step {item.step}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.detail}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6">
        <Button href="/assess/methodology" variant="secondary" size="sm">
          How scoring works
        </Button>
      </p>
    </div>
  );
}
