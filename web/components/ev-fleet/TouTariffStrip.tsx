export default function TouTariffStrip() {
  const bands = [
    { name: "Off-peak", time: "00:00–16:00", price: "$0.15/kWh", className: "bg-emerald-500/30" },
    { name: "Peak", time: "16:00–21:00", price: "$0.45/kWh", className: "bg-amber-500/40" },
    { name: "Off-peak", time: "21:00–24:00", price: "$0.15/kWh", className: "bg-emerald-500/30" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {bands.map((band) => (
        <div
          key={band.name + band.time}
          className={`rounded-lg border border-[var(--border)] px-3 py-2 text-xs ${band.className}`}
        >
          <span className="font-medium text-white">{band.name}</span>
          <span className="text-[var(--color-gray-400)]"> · {band.time} · {band.price}</span>
        </div>
      ))}
    </div>
  );
}
