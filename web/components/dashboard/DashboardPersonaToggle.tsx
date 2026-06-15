"use client";

export type DashboardPersona = "executive" | "operator" | "admin";

export default function DashboardPersonaToggle({
  value,
  onChange,
}: {
  value: DashboardPersona;
  onChange: (persona: DashboardPersona) => void;
}) {
  const options: Array<{ id: DashboardPersona; label: string }> = [
    { id: "executive", label: "Executive" },
    { id: "operator", label: "Operator" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-[var(--border-subtle)] p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={[
            "rounded-full px-3 py-1 text-xs transition",
            value === opt.id ? "bg-white text-black" : "text-[var(--color-gray-400)] hover:text-white",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
