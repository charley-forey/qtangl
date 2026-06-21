import OpsDogfoodClient from "@/components/ops/OpsDogfoodClient";
import { requireOpsEmail } from "@/lib/ops-auth";

export const metadata = {
  title: "Dogfood ops | Qtangl",
};

export default async function OpsDogfoodPage() {
  await requireOpsEmail();
  return <OpsDogfoodClient />;
}
