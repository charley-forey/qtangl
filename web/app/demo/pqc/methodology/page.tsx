import { redirect } from "next/navigation";

/** Legacy URL — methodology lives at /assess/methodology. */
export default function LegacyPqcMethodologyPage() {
  redirect("/assess/methodology");
}
