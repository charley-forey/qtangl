import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { latencyEnvelopeCopy } from "@/lib/copy/visualization";
import { latencyChartData } from "@/lib/copy/technology-deep";

type LatencyEnvelopeProps = {
  className?: string;
};

const WIDTH = 560;
const HEIGHT = 280;
const PAD = { top: 24, right: 24, bottom: 44, left: 52 };

function scaleX(size: number, minSize: number, maxSize: number) {
  const inner = WIDTH - PAD.left - PAD.right;
  return PAD.left + ((size - minSize) / (maxSize - minSize)) * inner;
}

function scaleY(ms: number, maxMs: number) {
  const inner = HEIGHT - PAD.top - PAD.bottom;
  return PAD.top + inner - (ms / maxMs) * inner;
}

function pathFromSeries(
  series: readonly { size: number; ms: number }[],
  minSize: number,
  maxSize: number,
  maxMs: number
) {
  return series
    .map((point, index) => {
      const x = scaleX(point.size, minSize, maxSize);
      const y = scaleY(point.ms, maxMs);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function LatencyEnvelope({ className = "" }: LatencyEnvelopeProps) {
  const sizes = latencyChartData.classical.map((p) => p.size);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const maxMs = Math.max(
    ...latencyChartData.classical.map((p) => p.ms),
    ...latencyChartData.hybrid.map((p) => p.ms)
  );

  const classicalPath = pathFromSeries(
    latencyChartData.classical,
    minSize,
    maxSize,
    maxMs
  );
  const hybridPath = pathFromSeries(latencyChartData.hybrid, minSize, maxSize, maxMs);

  const env = latencyChartData.envelope;
  const envX1 = scaleX(env.minSize, minSize, maxSize);
  const envX2 = scaleX(env.maxSize, minSize, maxSize);
  const envY = scaleY(env.maxMs, maxMs);
  const envBottom = HEIGHT - PAD.bottom;

  return (
    <TechnologyBlock
      eyebrow={latencyEnvelopeCopy.eyebrow}
      title={latencyEnvelopeCopy.title}
      description={latencyEnvelopeCopy.description}
      className={className}
      contentClassName="grid-min-0"
    >
      <div className="w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="auto"
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto max-w-[36rem]"
          role="img"
          aria-label="Latency chart: problem size versus response time with safe operating envelope"
        >
          <rect
            x={envX1}
            y={envY}
            width={envX2 - envX1}
            height={envBottom - envY}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="4 4"
          />
          <text
            x={(envX1 + envX2) / 2}
            y={envY - 8}
            textAnchor="middle"
            className="fill-[var(--color-gray-500)] text-[10px] uppercase tracking-widest"
          >
            Safe operating band
          </text>

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const ms = maxMs * tick;
            const y = scaleY(ms, maxMs);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={WIDTH - PAD.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[var(--color-gray-600)] text-[10px]"
                >
                  {Math.round(ms)}ms
                </text>
              </g>
            );
          })}

          <path
            d={classicalPath}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={2}
          />
          <path
            d={hybridPath}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />

          <text
            x={WIDTH / 2}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-[var(--color-gray-500)] text-[11px] uppercase tracking-[0.18em]"
          >
            Problem size (tasks / stops)
          </text>
        </svg>
      </div>

      <ul className="space-y-2">
        {latencyChartData.notes.map((note) => (
          <li key={note} className="text-sm leading-7 text-[var(--color-gray-500)]">
            {note}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-4 sm:gap-6 text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
        <span className="flex items-center gap-2">
          <span className="h-px w-8 bg-white/90" />
          Classical
        </span>
        <span className="flex items-center gap-2">
          <span className="h-px w-8 border-t border-dashed border-white/45" />
          Hybrid
        </span>
      </div>
    </TechnologyBlock>
  );
}
