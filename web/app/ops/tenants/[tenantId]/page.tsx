import OpsTenantDetailClient from "@/components/ops/OpsTenantDetailClient";

type Props = { params: Promise<{ tenantId: string }> };

export default async function OpsTenantDetailPage({ params }: Props) {
  const { tenantId } = await params;
  return <OpsTenantDetailClient tenantId={tenantId} />;
}
