import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Propiedades del botón con variantes visuales y tamaños.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

/**
 * Componente de botón estilizado con soporte de accesibilidad y variantes.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    // Definición de variantes según token del sistema
    const variantClasses = {
      default:
        "bg-primary text-primary-foreground shadow hover:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline:
        "border border-input bg-background shadow-sm hover:bg-secondary hover:text-foreground",
      secondary:
        "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-secondary hover:text-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    // Tamaños
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-xl px-8 text-base",
      icon: "h-9 w-9",
    };

    const baseClass = cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    // Si se pasa asChild, clonamos el primer hijo (como Link)
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(baseClass, (children.props as { className?: string }).className),
        ...props,
      });
    }

    return (
      <button ref={ref} className={baseClass} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
