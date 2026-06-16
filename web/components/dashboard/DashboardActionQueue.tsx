import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function DashboardActionQueue({
  role,
  hasScans,
  hasSchedule,
  canWrite,
  onAction,
}: {
  role?: string;
  hasScans: boolean;
  hasSchedule: boolean;
  canWrite: boolean;
  onAction?: (action: string) => void;
}) {
  const isViewer = role === "viewer";
  const actions: Array<{ id: string; label: string }> = [];

  if (!hasScans && canWrite && !isViewer) {
    actions.push({ id: "baseline", label: "Run authorized baseline scan" });
  }
  if (hasScans && !hasSchedule && canWrite && !isViewer) {
    actions.push({ id: "schedule", label: "Create weekly monitoring schedule" });
  }
  if (hasScans) {
    actions.push({ id: "export", label: "Export board report" });
  }
  if (role === "admin") {
    actions.push({ id: "invite", label: "Invite teammates" });
  }
  if (isViewer) {
    actions.push({ id: "review", label: "Review latest scan reports" });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Recommended next steps</Eyebrow>
      <ul className="mt-4 space-y-2">
        {actions.map((action) => (
          <li key={action.id}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onAction?.(action.id)}
            >
              {action.label}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
