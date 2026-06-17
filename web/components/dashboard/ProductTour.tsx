"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import Button from "@/components/ui/Button";
import { PRODUCT_TOURS, type ProductTourStep } from "@/lib/coaching/tours";
import { patchDashboardJson } from "@/lib/dashboard-bff";

export default function ProductTour({
  tourId,
  completed,
  onTabChange,
  onComplete,
  autoStart = true,
}: {
  tourId: keyof typeof PRODUCT_TOURS;
  completed: string[];
  onTabChange: (tab: string) => void;
  onComplete?: () => void;
  autoStart?: boolean;
}) {
  const steps = PRODUCT_TOURS[tourId] ?? [];
  const startedRef = useRef(false);

  const finish = useCallback(async () => {
    if (completed.includes(tourId)) return;
    const next = [...completed, tourId];
    await patchDashboardJson("/tenant/onboarding", { toursCompleted: next });
    onComplete?.();
  }, [completed, onComplete, tourId]);

  const runDriver = useCallback(() => {
    if (!steps.length || completed.includes(tourId) || startedRef.current) return;

    const driverSteps = steps
      .filter((step) => step.element && document.querySelector(step.element))
      .map((step) => ({
        element: step.element!,
        popover: { title: step.title, description: step.body },
      }));

    if (!driverSteps.length) return;

    startedRef.current = true;
    const drv = driver({
      showProgress: true,
      steps: driverSteps,
      onDestroyed: () => {
        void finish();
      },
    });
    drv.drive();
  }, [completed, finish, steps, tourId]);

  useEffect(() => {
    if (!autoStart || !steps.length || completed.includes(tourId)) return;
    const first = steps[0];
    if (first?.targetTab) onTabChange(first.targetTab);
    const timer = window.setTimeout(() => runDriver(), 400);
    return () => window.clearTimeout(timer);
  }, [autoStart, completed, onTabChange, runDriver, steps, tourId]);

  if (!steps.length || completed.includes(tourId)) return null;

  return null;
}

export function TakeTourButton({
  tourId,
  completed,
  onStart,
}: {
  tourId: string;
  completed: string[];
  onStart: () => void;
}) {
  if (completed.includes(tourId)) return null;
  return (
    <button type="button" className="text-xs text-sky-400 underline" onClick={onStart}>
      Take {tourId} tour
    </button>
  );
}

export function ManualProductTour({
  tourId,
  completed,
  onTabChange,
  onComplete,
}: {
  tourId: keyof typeof PRODUCT_TOURS;
  completed: string[];
  onTabChange: (tab: string) => void;
  onComplete?: () => void;
}) {
  const steps = PRODUCT_TOURS[tourId] ?? [];

  async function start() {
    const first = steps[0];
    if (first?.targetTab) onTabChange(first.targetTab);
    window.setTimeout(() => {
      const driverSteps = steps
        .filter((step: ProductTourStep) => step.element && document.querySelector(step.element))
        .map((step) => ({
          element: step.element!,
          popover: { title: step.title, description: step.body },
        }));
      if (!driverSteps.length) return;
      const drv = driver({
        showProgress: true,
        steps: driverSteps,
        onDestroyed: () => {
          void patchDashboardJson("/tenant/onboarding", {
            toursCompleted: [...completed, tourId],
          }).then(() => onComplete?.());
        },
      });
      drv.drive();
    }, 400);
  }

  if (completed.includes(tourId)) return null;

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => void start()}>
      Take {tourId} tour
    </Button>
  );
}
