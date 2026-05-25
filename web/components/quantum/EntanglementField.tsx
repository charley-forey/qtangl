"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type EntanglementFieldProps = {
  className?: string;
};

const lineTransition = {
  duration: 10,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "mirror" as const,
  ease: "linear" as const,
};

export default function EntanglementField({
  className = "",
}: EntanglementFieldProps) {
  const reduceMotion = useReducedMotion();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const shouldAnimate = !reduceMotion && !isCompact;

  return (
    <div
      className={[
        "surface-panel-strong relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] p-8 sm:p-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_62%)]" />
      <svg
        viewBox="0 0 640 480"
        className="relative z-10 h-full w-full"
        role="img"
        aria-label="Abstract entanglement field"
      >
        <motion.path
          d="M96 240C176 144 248 116 320 240C392 364 464 336 544 240"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.25"
          strokeLinecap="round"
          initial={false}
          animate={
            shouldAnimate
              ? {
                  d: [
                    "M96 240C176 144 248 116 320 240C392 364 464 336 544 240",
                    "M96 240C176 188 248 92 320 240C392 388 464 292 544 240",
                  ],
                }
              : undefined
          }
          transition={{ ...lineTransition, duration: 14 }}
        />
        <motion.path
          d="M96 240C176 332 248 364 320 240C392 116 464 148 544 240"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={false}
          animate={
            shouldAnimate
              ? {
                  d: [
                    "M96 240C176 332 248 364 320 240C392 116 464 148 544 240",
                    "M96 240C176 288 248 388 320 240C392 92 464 188 544 240",
                  ],
                }
              : {
                  opacity: isCompact ? 0.7 : 1,
                }
          }
          transition={{ ...lineTransition, duration: 18 }}
        />

        <circle cx="96" cy="240" r="14" fill="white" />
        <circle cx="544" cy="240" r="14" fill="white" />
        <circle cx="320" cy="240" r="8" fill="rgba(255,255,255,0.55)" />

        <circle cx="96" cy="240" r="44" fill="none" stroke="rgba(255,255,255,0.16)" />
        <circle cx="544" cy="240" r="44" fill="none" stroke="rgba(255,255,255,0.16)" />

        <g fill="rgba(255,255,255,0.28)">
          <circle cx="208" cy="170" r="2.5" />
          <circle cx="256" cy="300" r="2.5" />
          <circle cx="382" cy="172" r="2.5" />
          <circle cx="430" cy="302" r="2.5" />
        </g>
      </svg>

      <div className="relative z-10 mt-6 flex flex-col items-start gap-2 text-xs uppercase tracking-[0.28em] text-[var(--color-gray-400)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span>Entangled state</span>
        <span>Constraint interference</span>
        <span>Ranked collapse</span>
      </div>
    </div>
  );
}
