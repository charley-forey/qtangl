import { redirect } from "next/navigation";

/** Legacy optimize API docs — product is Q-Day readiness only. */
export default function OptimizeReferenceRedirectPage() {
  redirect("/docs/api");
}
