import { redirect } from "next/navigation";

/** Legacy URL — Q-Day product entry is /assess. */
export default function PqcLegacyRedirectPage() {
  redirect("/assess");
}
