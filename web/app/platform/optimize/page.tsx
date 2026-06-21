import { redirect } from "next/navigation";

/** Legacy URL — optimization is out of scope; platform is readiness-only. */
export default function OptimizeHubRedirectPage() {
  redirect("/platform");
}
