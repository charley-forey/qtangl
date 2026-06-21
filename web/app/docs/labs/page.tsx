import { redirect } from "next/navigation";

/** Legacy Labs docs — product is Q-Day readiness only. */
export default function DocsLabsRedirectPage() {
  redirect("/docs");
}
