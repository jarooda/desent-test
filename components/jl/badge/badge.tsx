import * as React from "react";

export type BadgeColor =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  solid?: boolean;
  pill?: boolean;
  /** Leading dot in the current color. @default false */
  dot?: boolean;
  icon?: React.ReactNode;
  /** If provided, renders a trailing × button; called when clicked (dismissible). */
  onRemove?: (e: React.MouseEvent) => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      color = "neutral",
      solid = false,
      pill = false,
      dot = false,
      icon,
      onRemove,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const cls = [
      "jl-badge",
      `jl-badge--${color}`,
      solid ? "jl-badge--solid" : "",
      pill ? "jl-badge--pill" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={cls} {...props}>
        {dot && <span className="jl-badge__dot" />}
        {icon}
        {children}
        {onRemove && (
          <button
            type="button"
            className="jl-badge__remove"
            aria-label="Remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(e);
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
