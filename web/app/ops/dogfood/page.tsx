import { redirect } from "next/navigation";

import OpsDogfoodClient from "@/components/ops/OpsDogfoodClient";

export const metadata = {
  title: "Dogfood ops | Qtangl",
};

export default function OpsDogfoodPage() {
  return <OpsDogfoodClient />;
}
