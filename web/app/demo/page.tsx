import { redirect } from "next/navigation";

/** Q-Day readiness is the only product demo — legacy /demo URLs land on Assess. */
export default function DemosPage() {
  redirect("/assess");
}
