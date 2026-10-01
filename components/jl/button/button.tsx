import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: "button" | "a";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      trailingIcon,
      fullWidth = false,
      as: Tag = "button",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const cls = [
      "jl-btn",
      `jl-btn--${variant}`,
      `jl-btn--${size}`,
      fullWidth ? "jl-btn--block" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const Component = Tag as React.ElementType;
    return (
      <Component ref={ref} className={cls} {...props}>
        {icon}
        {children != null && <span>{children}</span>}
        {trailingIcon}
      </Component>
    );
  }
);

Button.displayName = "Button";

export { Button };
