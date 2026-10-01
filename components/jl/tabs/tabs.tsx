import * as React from "react";

export type TabItem =
  | string
  | {
      value: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      count?: number;
      disabled?: boolean;
    };

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  variant?: "line" | "pill";
  orientation?: "horizontal" | "vertical";
}

export function Tabs({
  items = [],
  value,
  onChange,
  variant = "line",
  orientation = "horizontal",
  className = "",
  ...rest
}: TabsProps) {
  const vertical = orientation === "vertical";
  return (
    <div
      className={[
        "jl-tabs",
        `jl-tabs--${variant}`,
        vertical ? "jl-tabs--vertical" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-orientation={vertical ? "vertical" : undefined}
      {...rest}
    >
      {items.map((it) => {
        const tab = typeof it === "string" ? { value: it, label: it } : it;
        const selected = value === tab.value;
        const disabled = "disabled" in tab && tab.disabled;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            className="jl-tab"
            aria-selected={selected}
            aria-disabled={disabled || undefined}
            disabled={disabled || undefined}
            onClick={() => !disabled && onChange?.(tab.value)}
          >
            {"icon" in tab && tab.icon}
            {tab.label}
            {"count" in tab && tab.count != null && (
              <span className="jl-tab__count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
