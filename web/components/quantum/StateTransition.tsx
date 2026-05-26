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

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
