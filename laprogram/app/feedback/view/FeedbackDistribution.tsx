"use client";

import type { Column, AnonFeedback } from "./columns";

interface Props {
  columns: Column[];
  data: AnonFeedback[];
  defaultMode: "bars" | "pie";
}

// matplotlib default (tab10) color cycle
const SLICE_COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

interface CardProps {
  col: Column;
  counts: Map<string, number>;
  total: number;
  mode: "bars" | "pie";
}

function DistributionCard({ col, counts, total, mode }: CardProps) {
  const options = col.options!;

  return (
    <div className="flex flex-col rounded-lg border bg-card p-3 text-card-foreground">
      <h3 className="mb-2 text-xs font-medium leading-snug">{col.header}</h3>

      <div className="flex flex-1 flex-col justify-center">
        {mode === "bars" ? (
          <ul className="space-y-1">
            {options.map((opt) => {
              const count = counts.get(opt.value) ?? 0;
              const pct = total ? (count / total) * 100 : 0;
              return (
                <li key={opt.value} className="text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{opt.label}</span>
                    <span className="shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">
                      {count} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <PieView options={options} counts={counts} total={total} />
        )}
      </div>
    </div>
  );
}

function PieView({
  options,
  counts,
  total,
}: {
  options: readonly { value: string; label: string }[];
  counts: Map<string, number>;
  total: number;
}) {
  const radius = 48;
  const cx = 60;
  const cy = 60;
  let acc = 0;
  const slices = options
    .map((opt, i) => {
      const count = counts.get(opt.value) ?? 0;
      if (count === 0) return null;
      const startAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
      acc += count;
      const endAngle = (acc / total) * Math.PI * 2 - Math.PI / 2;
      const large = endAngle - startAngle > Math.PI ? 1 : 0;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const pct = (count / total) * 100;
      // Full-circle fallback when a single option has all responses
      const d =
        count === total
          ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
      return {
        d,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
        label: opt.label,
        count,
        pct,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="h-24 w-24 shrink-0">
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill={s.color}
            stroke="var(--card)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <ul className="w-full space-y-0.5 text-[10px]">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">
              {s.count} · {s.pct.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeedbackDistribution({ columns, data, defaultMode }: Props) {
  const scored = columns.filter((c) => c.options && c.options.length > 0);
  if (scored.length === 0 || data.length === 0) return null;

  const cards = scored
    .map((col) => ({ ...col, options: col.options?.toReversed() }))
    .map((col) => {
      const counts = new Map<string, number>();
      let total = 0;
      for (const row of data) {
        const val = (row as Record<string, unknown>)[col.key];
        if (val === undefined || val === null || val === "") continue;
        counts.set(val as string, (counts.get(val as string) ?? 0) + 1);
        total += 1;
      }
      if (total === 0) return null;
      return { col, counts, total };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (cards.length === 0) return null;

  return (
    <div
      className="mb-4 grid gap-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gridAutoRows: "1fr",
      }}
    >
      {cards.map(({ col, counts, total }) => (
        <DistributionCard
          key={col.key}
          col={col}
          counts={counts}
          total={total}
          mode={defaultMode}
        />
      ))}
    </div>
  );
}
