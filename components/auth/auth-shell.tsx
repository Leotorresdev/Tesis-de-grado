"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, Sprout, Trophy } from "lucide-react";
import { COMUNIDAD_INFO } from "@/types/reportes";

/**
 * Contenedor visual compartido por las pantallas de Login y Registro.
 * Presenta la identidad de la Comunidad Fabricio Ojeda (Boconó).
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)] md:grid-cols-[0.92fr_1.08fr]"
    >
      <PanelMarca />
      <section className="p-6 sm:p-8">{children}</section>
    </motion.div>
  );
}

function PanelMarca() {
  return (
    <aside className="relative flex flex-col justify-between bg-gradient-brand p-6 text-community-light sm:p-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-community-gold text-community-dark shadow-sm">
            <Sprout className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <span className="font-display text-xl font-bold tracking-tight">
              Ojeda<span className="text-community-gold">Conecta</span>
            </span>
            <span className="block text-xs text-community-light/75">
              {COMUNIDAD_INFO.nombre} · {COMUNIDAD_INFO.municipio}
            </span>
          </div>
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-community-gold">
          <Building2 className="h-3.5 w-3.5" aria-hidden /> 5 Edificios · 1 Cancha · 2 Entradas
        </p>
        <p className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
          Soluciones rápidas para nuestra Comunidad Fabricio Ojeda.
        </p>
        <p className="mt-2.5 text-xs leading-relaxed text-community-light/85 sm:text-sm">
          Una herramienta sencilla pensada para que nuestras {COMUNIDAD_INFO.familias} familias reporten problemas y se comuniquen con sus voceros sin complicaciones.
        </p>
      </div>

      <ul className="mt-8 hidden space-y-3 text-xs leading-relaxed text-community-light/90 md:block">
        <li className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-community-gold" aria-hidden />
          <span>
            <strong>Vecino:</strong> reporta fallas en tu edificio, cancha o entradas y entérate de los avisos.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-community-gold" aria-hidden />
          <span>
            <strong>3 Voceros de la Comunidad:</strong> Vocero Principal, Vocero Secundario (por Edificio) y Vocero de Deportes con acceso exclusivo a <strong>Gestión</strong>.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-community-gold" aria-hidden />
          <span>
            <strong>Espacios integrados:</strong> Edificios 1 al 5, Cancha Deportiva, Entrada Principal y Entrada Secundaria.
          </span>
        </li>
      </ul>
    </aside>
  );
}
