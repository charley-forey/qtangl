"use client";

import { useRef, useState } from "react";

import Link from "next/link";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

import { AirlineSection, AirlineSectionHeader } from "./ui";

export default function VideoEmbed({ src }: { src: string }) {
  const [expanded, setExpanded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const milestonesRef = useRef(new Set<number>());

  return (
    <AirlineSection tone="feature">
      <AirlineSectionHeader
        label="Overview"
        title="3-minute OCC walkthrough"
        description="Disruption → routing repair → crew rebid → audit pack."
        action={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = !expanded;
              setExpanded(next);
              trackEvent("video_toggled", { expanded: next });
            }}
          >
            {expanded ? "Hide video" : "Play walkthrough"}
          </Button>
        }
      />
      {expanded ? (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black">
          {videoError ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm font-medium text-white">Recorded demo</p>
              <p className="max-w-sm text-sm text-[var(--color-gray-400)]">
                Run the live Q-Day assessment workflow — same inventory and signed report flow.
              </p>
              <Link
                href="/assess"
                className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black"
              >
                Open live assessment
              </Link>
            </div>
          ) : (
            <video
              className="aspect-video w-full"
              controls
              src={src}
              onError={() => setVideoError(true)}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;
                const pct = (video.currentTime / video.duration) * 100;
                const milestones = [
                  { at: 25, eventName: "video_progress_25" },
                  { at: 50, eventName: "video_progress_50" },
                  { at: 75, eventName: "video_progress_75" },
                ] as const;
                for (const milestone of milestones) {
                  if (pct >= milestone.at && !milestonesRef.current.has(milestone.at)) {
                    milestonesRef.current.add(milestone.at);
                    trackEvent(milestone.eventName, { source: "airline-demo" });
                  }
                }
              }}
              onEnded={() => trackEvent("video_progress_100", { source: "airline-demo" })}
            />
          )}
        </div>
      ) : null}
    </AirlineSection>
  );
}
