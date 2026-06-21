import { redirect } from "next/navigation";

/** Legacy Labs hub — optimization demos retired from primary product. */
export default function LabsRedirectPage() {
  redirect("/platform");
}
