"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Campo de formulario con etiqueta accesible, icono opcional y mensaje de error.
 */
export function CampoTexto({
  label,
  error,
  icono,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icono?: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        {icono && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center">
            {icono}
          </span>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "auth-input",
            icono && "!pl-10",
            error && "border-destructive focus:border-destructive",
            className
          )}
          {...props}
        />
      </div>
      <MensajeError id={errorId} mensaje={error} />
    </div>
  );
}

/**
 * Campo de contraseña con botón para mostrar u ocultar el valor.
 */
export function CampoClave({
  label,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-bold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "auth-input pr-11",
            error && "border-destructive focus:border-destructive"
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <MensajeError id={errorId} mensaje={error} />
    </div>
  );
}

function MensajeError({ id, mensaje }: { id: string; mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p id={id} className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
      <AlertCircle className="h-3 w-3" aria-hidden /> {mensaje}
    </p>
  );
}

/**
 * Alerta de error general del formulario (ej. credenciales inválidas).
 */
export function AlertaFormulario({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{mensaje}</span>
    </div>
  );
}
