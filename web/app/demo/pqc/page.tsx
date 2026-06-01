import { redirect } from "next/navigation";

/** Legacy URL — live assessment is at /assess. */
export default function LegacyPqcDemoPage() {
  redirect("/assess");
}
