"use client";

import UpgradeModal from "@/components/dashboard/UpgradeModal";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";

type AssessUpgradePromptProps = {
  open: boolean;
  product: UpgradeProduct;
  onClose: () => void;
  onMessage?: (message: string) => void;
};

export default function AssessUpgradePrompt({
  open,
  product,
  onClose,
  onMessage,
}: AssessUpgradePromptProps) {
  return (
    <UpgradeModal
      open={open}
      product={product}
      onClose={onClose}
      onMessage={onMessage}
    />
  );
}
