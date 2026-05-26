"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

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
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [parallaxOffset, 0, -parallaxOffset]
  );

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {parallax ? <motion.div style={{ y: parallaxY }}>{children}</motion.div> : children}
    </motion.div>
  );
}
