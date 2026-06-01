import { redirect } from "next/navigation";

/** Legacy URL — optimization demos live under /labs (expansion motion). */
export default function OptimizeHubRedirectPage() {
  redirect("/labs");
}
