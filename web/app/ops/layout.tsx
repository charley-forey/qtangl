import { requireOpsEmail } from "@/lib/ops-auth";

export const metadata = {
  title: "Ops console | Qtangl",
  robots: { index: false, follow: false },
};

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  await requireOpsEmail();
  return <>{children}</>;
}
