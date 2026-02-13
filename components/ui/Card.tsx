/** @format */

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  bordered?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  title,
  subtitle,
  actions,
  className = "",
  bordered = true,
  shadow = "md",
}: CardProps) {
  const cardClasses = [
    "card bg-base-100",
    bordered && "card-bordered",
    shadow !== "none" && `shadow-${shadow}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      {(title || subtitle || actions) && (
        <div className="card-header px-6 pt-6 pb-4">
          <div className="flex-1">
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="text-base-content/70 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body px-6 pb-6">{children}</div>
    </div>
  );
}

