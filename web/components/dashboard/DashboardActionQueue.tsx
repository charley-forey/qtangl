import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function DashboardActionQueue({
  role,
  hasScans,
  hasSchedule,
  canWrite,
}: {
  role?: string;
  hasScans: boolean;
  hasSchedule: boolean;
  canWrite: boolean;
}) {
  const isViewer = role === "viewer";
  const actions: Array<{ label: string; href: string; done?: boolean }> = [];

  if (!hasScans && canWrite && !isViewer) {
    actions.push({ label: "Run authorized baseline scan", href: "#run-baseline" });
  }
  if (hasScans && !hasSchedule && canWrite && !isViewer) {
    actions.push({ label: "Create weekly monitoring schedule", href: "#dashboard-monitor" });
  }
  if (hasScans) {
    actions.push({ label: "Export board report", href: "#evidence-toolbar" });
  }
  if (role === "admin") {
    actions.push({ label: "Invite teammates", href: "#dashboard-settings" });
  }
  if (isViewer) {
    actions.push({ label: "Review latest scan reports", href: "#dashboard-scans", done: hasScans });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Recommended next steps</Eyebrow>
      <ul className="mt-4 space-y-2">
        {actions.map((action) => (
          <li key={action.label}>
            <Button href={action.href} variant="secondary" size="sm">
              {action.label}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
