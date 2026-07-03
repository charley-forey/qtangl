"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartTooltip from "@/components/charts/ChartTooltip";
import {
  chartAxisTick,
  chartGridStroke,
  readinessBandAreas,
} from "@/lib/chart-theme";

export function TrendLine({
  data,
  dataKey = "score",
  xKey = "date",
  height = 200,
}: {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  xKey?: string;
  height?: number;
}) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {readinessBandAreas.map((band, i) => (
          <Area
            key={i}
            type="monotone"
            dataKey={() => band.y2}
            stroke="none"
            fill={band.fill}
            fillOpacity={band.opacity}
            isAnimationActive={false}
          />
        ))}
        <CartesianGrid stroke={chartGridStroke} vertical={false} />
        <XAxis dataKey={xKey} tick={chartAxisTick} />
        <YAxis domain={[0, 100]} tick={chartAxisTick} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey={dataKey} stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SeverityBars({
  data,
  height = 180,
  onBarClick,
}: {
  data: Array<{ name: string; value: number; fill?: string }>;
  height?: number;
  onBarClick?: (name: string) => void;
}) {
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid stroke={chartGridStroke} horizontal={false} />
        <XAxis type="number" tick={chartAxisTick} />
        <YAxis type="category" dataKey="name" width={72} tick={chartAxisTick} />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          onClick={(d) => onBarClick?.(String((d as { name?: string }).name ?? ""))}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.fill ?? colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SeverityDonutV2({
  data,
  height = 160,
}: {
  data: Array<{ name: string; value: number }>;
  height?: number;
}) {
  const colors = ["#ef4444", "#f59e0b", "#64748b", "#22c55e"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AlgorithmFamilyBars({
  data,
  height = 180,
}: {
  data: Array<{ family: string; count: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid stroke={chartGridStroke} vertical={false} />
        <XAxis dataKey="family" tick={chartAxisTick} />
        <YAxis tick={chartAxisTick} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DriftArea({
  data,
  height = 180,
}: {
  data: Array<{ date: string; changes: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid stroke={chartGridStroke} vertical={false} />
        <XAxis dataKey="date" tick={chartAxisTick} />
        <YAxis tick={chartAxisTick} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="changes" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RemediationVelocityChart({
  closed,
  open,
  height = 120,
}: {
  closed: number;
  open: number;
  height?: number;
}) {
  const data = [
    { name: "Closed", value: closed, fill: "#22c55e" },
    { name: "Open", value: open, fill: "#64748b" },
  ];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid stroke={chartGridStroke} vertical={false} />
        <XAxis dataKey="name" tick={chartAxisTick} />
        <YAxis tick={chartAxisTick} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComplianceRadar({
  data,
  height = 200,
}: {
  data: Array<{ framework: string; coverage: number }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke={chartGridStroke} />
        <PolarAngleAxis dataKey="framework" tick={chartAxisTick} />
        <Radar dataKey="coverage" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
        <Tooltip content={<ChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
