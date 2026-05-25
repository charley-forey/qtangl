"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type StateTransitionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function StateTransition({
  children,
  className = "",
  delay = 0,
}: StateTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      whileInView={
        reduceMotion
          ? undefined
          : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
