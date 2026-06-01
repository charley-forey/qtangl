import { redirect } from "next/navigation";

/** Legacy URL — Q-Day product entry is /assess and /demo/pqc. */
export default function PqcLegacyRedirectPage() {
  redirect("/assess");
}
