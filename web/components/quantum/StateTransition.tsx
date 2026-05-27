"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

import usePrefersReducedMotion from "@/lib/usePrefersReducedMotion";

type StateTransitionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  parallax?: boolean;
  parallaxOffset?: number;
};

export default function StateTransition({
  children,
  className = "",
  delay = 0,
  distance = 16,
  parallax = false,
  parallaxOffset = 14,
}: StateTransitionProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));

      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [reduceMotion]);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const hiddenOffset = parallax ? Math.max(distance, parallaxOffset) : distance;

  return (
    <div
      ref={ref}
      className={[
        "transform-gpu transition-[opacity,transform] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0, 0, 0)" : `translate3d(0, ${hiddenOffset}px, 0)`,
        transitionDelay: delay > 0 ? `${delay}s` : undefined,
      }}
    >
      {children}
    </div>
  );
}
