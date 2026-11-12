// app/transparencia/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  Droplets,
  Zap,
  Trash2,
  Trophy,
  DoorOpen,
  Building2,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useReportesStore } from "@/lib/store/use-reportes";
import {
  CATEGORIAS,
  COMUNIDAD_INFO,
  type Categoria,
} from "@/types/reportes";
import { cn } from "@/lib/utils";

const ICONOS_CATEGORIA: Record<Categoria, React.ElementType> = {
  Agua: Droplets,
  Electricidad: Zap,
  Aseo: Trash2,
  "Cancha y Deporte": Trophy,
  "Entradas y Áreas": DoorOpen,
};

/**
 * Panel de Rendición de Cuentas y Resumen Comunitario — Nexo Boconó.
 * 100% dinámico y calculado en tiempo real con los reportes reales de la comunidad.
 */
export default function TransparenciaPage() {
  const reportes = useReportesStore((state) => state.reportes);

  const total = reportes.length;
  const resueltos = reportes.filter((r) => r.estado === "Resuelto").length;
  const enRevision = reportes.filter((r) => r.estado === "En Revisión").length;
  const pendientes = reportes.filter((r) => r.estado === "Pendiente").length;
  const porcentajeEfectividad =
    total > 0 ? Math.round((resueltos / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO INSTITUCIONAL */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Transparencia y Soluciones
        </span>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Rendición de Cuentas de la Comunidad
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          {COMUNIDAD_INFO.nombre} · {COMUNIDAD_INFO.municipio} ·{" "}
          {COMUNIDAD_INFO.estructura} ({COMUNIDAD_INFO.familias} familias)
        </p>
      </div>

      {/* 2. SEMÁFORO COMUNITARIO (3 TARJETAS CLARAS) */}
      <section aria-label="Semáforo de incidencias" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Solucionados */}
        <div className="rounded-3xl border border-success/30 bg-success-soft/40 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-success uppercase tracking-wider">
              Solucionados
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-success text-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold tabular-nums text-success">
            {resueltos}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {resueltos === 1
              ? "1 problema resuelto y verificado"
              : `${resueltos} problemas resueltos y verificados`}
          </p>
        </div>

        {/* En Atención */}
        <div className="rounded-3xl border border-amber-500/30 bg-warning-soft/40 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              En Atención
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-white">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold tabular-nums text-amber-600">
            {enRevision}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {enRevision === 1
              ? "1 caso en gestión o compra de repuestos"
              : `${enRevision} casos en gestión o compra de repuestos`}
          </p>
        </div>

        {/* Por Resolver */}
        <div className="rounded-3xl border border-destructive/25 bg-urgent-soft/40 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-destructive uppercase tracking-wider">
              Por Resolver
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-destructive text-white">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-4xl font-bold tabular-nums text-destructive">
            {pendientes}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pendientes === 1
              ? "1 reporte pendiente por los voceros"
              : `${pendientes} reportes pendientes por los voceros`}
          </p>
        </div>
      </section>

      {/* 3. TERMÓMETRO DE EFECTIVIDAD COMUNITARIA */}
      <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
              <TrendingUp className="h-4 w-4" /> Efectividad Comunitaria
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              {total === 0
                ? "100% · Comunidad al día"
                : `${porcentajeEfectividad}% de problemas resueltos`}
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {total === 0
              ? "0 incidencias activas"
              : `${resueltos} de ${total} reportes resueltos`}
          </span>
        </div>

        {/* Barra de progreso visual */}
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeEfectividad}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-all",
              porcentajeEfectividad >= 70
                ? "bg-success"
                : porcentajeEfectividad >= 40
                ? "bg-amber-500"
                : "bg-primary"
            )}
          />
        </div>

        <p className="mt-2.5 text-xs text-muted-foreground">
          {total === 0
            ? "No hay fallas reportadas en los 5 edificios ni en la cancha. Todo marcha con normalidad."
            : `El ${porcentajeEfectividad}% de los casos registrados por las familias ha recibido solución satisfactoria por parte de los voceros.`}
        </p>
      </section>

      {/* 4. ESTADO POR CADA SERVICIO PÚBLICO */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Balance por Servicio Público
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monitoreo de agua, luz, aseo y áreas comunitarias en tiempo real:
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS.map((cat) => {
            const Icono = ICONOS_CATEGORIA[cat];
            const delServicio = reportes.filter((r) => r.categoria === cat);
            const cantTotal = delServicio.length;
            const cantResueltos = delServicio.filter(
              (r) => r.estado === "Resuelto"
            ).length;
            const cantActivos = cantTotal - cantResueltos;

            return (
              <div
                key={cat}
                className="flex flex-col justify-between rounded-3xl border border-border bg-card p-4.5 shadow-[var(--shadow-card)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Icono className="h-4.5 w-4.5" />
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                        cantActivos === 0
                          ? "bg-success-soft text-success"
                          : "bg-urgent-soft text-urgent"
                      )}
                    >
                      {cantActivos === 0
                        ? "✓ Al día"
                        : `${cantActivos} pendiente${cantActivos > 1 ? "s" : ""}`}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-foreground">
                    {cat}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cantTotal === 0
                      ? "Sin fallas reportadas"
                      : `${cantTotal} caso${cantTotal > 1 ? "s" : ""} registrado${
                          cantTotal > 1 ? "s" : ""
                        } · ${cantResueltos} resuelto${
                          cantResueltos !== 1 ? "s" : ""
                        }`}
                  </p>
                </div>

                {cantTotal > 0 && (
                  <div className="mt-3 border-t border-border/70 pt-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Avance</span>
                      <span className="font-bold text-foreground">
                        {Math.round((cantResueltos / cantTotal) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: `${(cantResueltos / cantTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ESTADO POR CADA ESPACIO FÍSICO (5 EDIFICIOS, CANCHA, ENTRADAS) */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Situación de los 5 Edificios y Áreas
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Diagnóstico directo para saber qué edificio necesita mayor atención:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {COMUNIDAD_INFO.zonas.map((zona) => {
            const deLaZona = reportes.filter((r) => r.sector === zona);
            const pendientesZona = deLaZona.filter(
              (r) => r.estado !== "Resuelto"
            ).length;
            const esCancha = zona.includes("Cancha");
            const esEntrada = zona.includes("Entrada");
            const Icono = esCancha ? Trophy : esEntrada ? DoorOpen : Building2;

            return (
              <div
                key={zona}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all",
                  pendientesZona > 0
                    ? "border-amber-500/40 bg-warning-soft/30"
                    : "border-border bg-card"
                )}
              >
                <Icono
                  className={cn(
                    "h-5 w-5",
                    pendientesZona > 0 ? "text-amber-600" : "text-muted-foreground"
                  )}
                />
                <span className="mt-1.5 text-xs font-bold leading-tight text-foreground">
                  {zona.replace("Edificio ", "Edif. ")}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-bold",
                    pendientesZona > 0 ? "text-urgent" : "text-success"
                  )}
                >
                  {pendientesZona > 0
                    ? `${pendientesZona} activo${pendientesZona > 1 ? "s" : ""}`
                    : "✓ Al día"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PIE DE PÁGINA INFORMATIVO PARA LA TESIS */}
      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-5 text-center sm:p-6">
        <ShieldCheck className="mx-auto h-7 w-7 text-primary" />
        <h3 className="mt-2 text-sm font-bold text-foreground">
          Rendición de Cuentas Transparente para Asambleas
        </h3>
        <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
          Este informe se genera de forma 100% automática a partir de los
          reportes vecinales y las respuestas oficiales de los voceros. Sirve
          como soporte técnico para presentar balances en asambleas de vecinos y
          ante organismos públicos de Boconó.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/reportar"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Reportar una nueva falla
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-bold text-foreground transition hover:bg-secondary/70"
          >
            Ver problemas de la comunidad
          </Link>
        </div>
      </div>
    </div>
  );
}
