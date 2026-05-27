"use client";

import { useRef, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { trackEvent } from "@/lib/analytics";

type VideoEmbedProps = {
  src: string;
};

export default function VideoEmbed({ src }: VideoEmbedProps) {
  const [expanded, setExpanded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const milestonesRef = useRef(new Set<number>());

  return (
    <Card tone="feature" className="rounded-[var(--radius-feature)]">
      <p className="text-label">3.5-minute walkthrough</p>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Watch the hospital command center in action</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-gray-300)]">
            The walkthrough opens with the 04:11 call-out, shows the live CP-SAT solve, replays the
            cached QPU trace, and closes on the honest scoreboard.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const next = !expanded;
            setExpanded(next);
            trackEvent("video_toggled", { expanded: next });
          }}
        >
          {expanded ? "Hide walkthrough" : "Watch walkthrough"}
        </Button>
      </div>

      {expanded ? (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black">
          {videoError ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm font-medium text-white">Walkthrough video coming soon</p>
              <p className="max-w-md text-sm leading-7 text-[var(--color-gray-400)]">
                Use the steps below to run the live demo: pick a scenario, fire the call-out, compare
                plans, and open the audit drawer.
              </p>
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
              const milestones = [
                { threshold: 0.25, eventName: "video_progress_25" },
                { threshold: 0.5, eventName: "video_progress_50" },
                { threshold: 0.75, eventName: "video_progress_75" },
              ];
              for (const milestone of milestones) {
                if (progress >= milestone.threshold && !milestonesRef.current.has(milestone.threshold)) {
                  milestonesRef.current.add(milestone.threshold);
                  trackEvent(milestone.eventName, { source: "hospital-demo" });
                }
              }
            }}
            onEnded={() => trackEvent("video_progress_100", { source: "hospital-demo" })}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support embedded video playback.
          </video>
          )}
        </div>
      ) : null}
    </Card>
  );
}
