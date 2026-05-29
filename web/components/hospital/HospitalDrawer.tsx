"use client";

import { ReactNode } from "react";

import SlideOverDrawer from "@/components/demo/SlideOverDrawer";

type HospitalDrawerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function HospitalDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
}: HospitalDrawerProps) {
  return (
    <SlideOverDrawer
      open={open}
      eyebrow="Compliance audit"
      title={title}
      subtitle={subtitle}
      onClose={onClose}
    >
      {children}
    </SlideOverDrawer>
  );
}
