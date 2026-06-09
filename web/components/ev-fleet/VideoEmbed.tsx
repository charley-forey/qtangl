"use client";

import { useRef, useState } from "react";

import Link from "next/link";

import Button from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

import { EvFleetSection, EvFleetSectionHeader } from "./ui";

type VideoEmbedProps = {
  src: string;
};

export default function VideoEmbed({ src }: VideoEmbedProps) {
  const [expanded, setExpanded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const milestonesRef = useRef(new Set<number>());

  return (
    <EvFleetSection tone="feature">
      <EvFleetSectionHeader
        label="Overview"
        title="3-minute depot walkthrough"
        description="Routes → charger queue → TOU peak shift → audit pack."
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
              controls
              preload="metadata"
              className="aspect-video w-full"
              onError={() => setVideoError(true)}
              onTimeUpdate={(event) => {
                const target = event.currentTarget;
                if (!target.duration) {
                  return;
                }
                const progress = target.currentTime / target.duration;
                for (const milestone of [
                  { threshold: 0.25, eventName: "video_progress_25" },
                  { threshold: 0.5, eventName: "video_progress_50" },
                  { threshold: 0.75, eventName: "video_progress_75" },
                ]) {
                  if (
                    progress >= milestone.threshold &&
                    !milestonesRef.current.has(milestone.threshold)
                  ) {
                    milestonesRef.current.add(milestone.threshold);
                    trackEvent(milestone.eventName, { source: "ev-fleet-demo" });
                  }
                }
              }}
              onEnded={() => trackEvent("video_progress_100", { source: "ev-fleet-demo" })}
            >
              <source src={src} type="video/mp4" />
            </video>
          )}
        </div>
      ) : null}
    </EvFleetSection>
  );
}
