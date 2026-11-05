"use client";

import { ShieldAlert, UserCheck, type LucideIcon } from "lucide-react";
import type { RolUsuario } from "@/types/reportes";
import { cn } from "@/lib/utils";

type OpcionRol = {
  valor: RolUsuario;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
};

const OPCIONES: OpcionRol[] = [
  {
    valor: "vecino",
    titulo: "Usuario normal",
    descripcion: "Vecino o habitante: reporta y apoya incidencias.",
    icono: UserCheck,
  },
  {
    valor: "vocero",
    titulo: "Vocero",
    descripcion: "Miembro del consejo comunal: accede a Gestión.",
    icono: ShieldAlert,
  },
];

/**
 * Selector accesible (radiogroup) del tipo de cuenta: usuario normal o vocero.
 */
export function SelectorRol({
  valor,
  onChange,
}: {
  valor: RolUsuario;
  onChange: (rol: RolUsuario) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-bold text-foreground">
        Tipo de cuenta
      </legend>
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
        {OPCIONES.map(({ valor: opcion, titulo, descripcion, icono: Icono }) => {
          const activo = valor === opcion;
          const esVocero = opcion === "vocero";
          return (
            <button
              key={opcion}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => onChange(opcion)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-all cursor-pointer",
                activo
                  ? esVocero
                    ? "border-amber-500 bg-warning-soft/50"
                    : "border-primary bg-primary-soft/60"
                  : "border-border bg-background hover:border-primary/40"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors",
                  activo
                    ? esVocero
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Icono className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">
                  {titulo}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {descripcion}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
