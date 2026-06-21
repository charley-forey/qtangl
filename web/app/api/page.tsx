import { redirect } from "next/navigation";

/** Legacy optimize API marketing page — PQC API docs live at /docs/api. */
export default function ApiMarketingRedirectPage() {
  redirect("/docs/api");
}
