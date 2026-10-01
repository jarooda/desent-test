import * as React from "react";

export type StatDeltaTone = "positive" | "negative" | "neutral";
export type StatSize = "sm" | "md";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  value: React.ReactNode;
  /** Change indicator, e.g. "+12%" or "-0.4%". Sign drives the default arrow + tone. */
  delta?: React.ReactNode;
  deltaTone?: StatDeltaTone;
  caption?: React.ReactNode;
  icon?: React.ReactNode;
  /** Inline sparkline values rendered under the delta. Needs ≥2 points. */
  data?: number[];
  /** Sparkline stroke color. Defaults to the delta tone (danger when negative, else accent). */
  sparkColor?: string;
  /** Drop the card surface (no border/padding) for embedding. @default false */
  plain?: boolean;
  size?: StatSize;
}

/** Build a normalized sparkline path in a 100×36 box (stretched to fit). */
function sparkPath(data: number[], w = 100, h = 36, pad = 3): string {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const n = data.length;
  return data
    .map((v, i) => {
      const x = pad + (n <= 1 ? (w - 2 * pad) / 2 : ((w - 2 * pad) * i) / (n - 1));
      const y = pad + (h - 2 * pad) - ((v - min) / span) * (h - 2 * pad);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed column count. Omit for a responsive auto-fit grid. */
  columns?: number;
}

const ARROW_UP = (
  <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
);
const ARROW_DOWN = (
  <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
);

interface StatComponent extends React.FC<StatProps> {
  Group: React.FC<StatGroupProps>;
}

const Stat = (({
  label,
  value,
  delta,
  deltaTone,
  caption,
  icon,
  data,
  sparkColor,
  plain = false,
  size = "md",
  className = "",
  ...props
}: StatProps) => {
  let tone = deltaTone;
  let dir: "up" | "down" | null = null;
  if (delta != null) {
    const s = String(delta).trim();
    if (!tone) tone = s.startsWith("-") ? "negative" : s.startsWith("+") ? "positive" : "neutral";
    dir = s.startsWith("-") ? "down" : s.startsWith("+") ? "up" : null;
  }

  const cls = ["jl-stat", `jl-stat--${size}`, plain ? "jl-stat--plain" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...props}>
      <div className="jl-stat__top">
        {label && <span className="jl-stat__label">{label}</span>}
        {icon && <span className="jl-stat__icon">{icon}</span>}
      </div>
      <div className="jl-stat__value">{value}</div>
      {(delta != null || caption) && (
        <div className="jl-stat__foot">
          {delta != null && (
            <span className={`jl-stat__delta jl-stat__delta--${tone}`}>
              {dir && (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {dir === "up" ? ARROW_UP : ARROW_DOWN}
                </svg>
              )}
              {delta}
            </span>
          )}
          {caption && <span className="jl-stat__caption">{caption}</span>}
        </div>
      )}
      {data && data.length > 1 && (
        <div className="jl-stat__spark">
          <svg
            viewBox="0 0 100 36"
            preserveAspectRatio="none"
            width="100%"
            height="36"
            aria-hidden="true"
            style={
              {
                "--_sc": sparkColor || (tone === "negative" ? "var(--danger)" : "var(--accent)"),
              } as React.CSSProperties
            }
          >
            <path className="jl-stat__spark-line" vectorEffect="non-scaling-stroke" d={sparkPath(data)} />
          </svg>
        </div>
      )}
    </div>
  );
}) as StatComponent;

Stat.displayName = "Stat";

const StatGroup: React.FC<StatGroupProps> = ({ columns, className = "", style, children, ...props }) => {
  const gridStyle: React.CSSProperties = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }
    : (style ?? {});
  return (
    <div
      className={["jl-stat-group", className].filter(Boolean).join(" ")}
      style={gridStyle}
      {...props}
    >
      {children}
    </div>
  );
};
StatGroup.displayName = "Stat.Group";

Stat.Group = StatGroup;

export { Stat };
