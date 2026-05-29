"use client";

import { ReactNode } from "react";

import SlideOverDrawer from "@/components/demo/SlideOverDrawer";

export default function EvFleetDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <SlideOverDrawer
      open={open}
      eyebrow="Depot charge audit"
      title={title}
      subtitle={subtitle}
      onClose={onClose}
    >
      {children}
    </SlideOverDrawer>
  );
}
