import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Propiedades de Badge para etiquetas de estado o categoría.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Componente Badge para destacar tags, categorías o estados.
 */
export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground shadow",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground shadow",
    outline: "text-foreground border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
