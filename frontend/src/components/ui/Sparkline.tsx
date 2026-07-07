import { useId } from "react";

// Lightweight inline SVG sparkline (area + line)  matches the design's mini-charts
// without pulling in a charting library.
export function Sparkline({
  data,
  color = "var(--color-primary)",
  height = 56,
  className,
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const gradId = useId();
  const w = 100;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 8) - 4;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      width="100%"
      height={h}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="spark-area" d={area} fill={`url(#${gradId})`} />
      <path
        className="spark-line"
        d={line}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
