// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  ArrowRight,
  Building2,
  Trophy,
  DoorOpen,
  CalendarDays,
  MapPin,
  Megaphone,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { TarjetaReporte } from "@/components/reportes/tarjeta-reporte";
import { useReportesStore } from "@/lib/store/use-reportes";
import { useAuth } from "@/lib/auth/auth-context";
import {
  CATEGORIAS,
  COMUNIDAD_INFO,
  type Categoria,
} from "@/types/reportes";
import { cn } from "@/lib/utils";

type FiltroCategoria = "Todas" | Categoria;
type FiltroZona = "Todas" | string;

/**
 * Devuelve el icono adecuado para cada espacio de la Comunidad Fabricio Ojeda.
 */
function iconoPorZona(zona: string) {
  if (zona.includes("Cancha")) return Trophy;
  if (zona.includes("Entrada")) return DoorOpen;
  return Building2;
}

/**
 * Panel Principal de OjedaConecta — Comunidad Fabricio Ojeda.
 * Diseñado con botones grandes y secciones simples para cualquier habitante de Boconó.
 */
export default function FeedPage() {
  const reportes = useReportesStore((state) => state.reportes);
  const avisos = useReportesStore((state) => state.avisos);
  const cargarReportes = useReportesStore((state) => state.cargarReportes);
  const confirmarAsistenciaAviso = useReportesStore(
    (state) => state.confirmarAsistenciaAviso
  );

  const { perfil, esVocero } = useAuth();
  const [filtroCategoria, setFiltroCategoria] =
    useState<FiltroCategoria>("Todas");
  const [filtroZona, setFiltroZona] = useState<FiltroZona>("Todas");

  useEffect(() => {
    void cargarReportes();
  }, [cargarReportes]);

  // Filtra los reportes según la zona de la comunidad y el tipo de servicio elegido
  const visibles = useMemo(() => {
    return reportes.filter((r) => {
      const coincideCat =
        filtroCategoria === "Todas" || r.categoria === filtroCategoria;
      const coincideZona = filtroZona === "Todas" || r.sector === filtroZona;
      return coincideCat && coincideZona;
    });
  }, [reportes, filtroCategoria, filtroZona]);

  const pendientes = reportes.filter((r) => r.estado !== "Resuelto").length;
  const resueltos = reportes.filter((r) => r.estado === "Resuelto").length;

  return (
    <div className="space-y-7">
      {/* 1. BIENVENIDA SENCILLA Y DIRECTA */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl bg-gradient-brand p-6 text-community-light shadow-[var(--shadow-float)] sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-community-gold">
            {COMUNIDAD_INFO.nombre} · {COMUNIDAD_INFO.municipio}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            5 Edificios · 1 Cancha · 2 Entradas
          </span>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-community-gold">
              Hola, {perfil?.nombre || "Vecino"} ·{" "}
              {esVocero ? perfil?.cargo : perfil?.sector || "Habitante"}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
              ¿Hay algún problema en tu edificio, en la cancha o en las entradas?
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-community-light/85">
              Aquí puedes avisar de forma rápida cualquier falla de agua, luz,
              aseo o arreglo necesario para que nuestros 3 voceros lo gestionen.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/reportar"
                className="inline-flex items-center gap-2 rounded-2xl bg-community-gold px-5 py-3 text-sm font-bold text-community-dark shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5" aria-hidden /> Reportar un problema
              </Link>
              {esVocero && (
                <Link
                  href="/gestion"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                >
                  Ir al Panel del Vocero <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          </div>

          {/* Resumen muy fácil de leer */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-4 backdrop-blur-xs">
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="font-display text-3xl font-bold text-community-gold tabular-nums">
                {pendientes}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/85">
                Por resolver
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-center">
              <p className="font-display text-3xl font-bold text-white tabular-nums">
                {resueltos}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/85">
                Solucionados
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. EXPLORADOR RÁPIDO DE LOS ESPACIOS DE FABRICIO OJEDA */}
      <section aria-label="Espacios de la comunidad" className="space-y-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Espacios de nuestra comunidad
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Toca cualquier edificio, la cancha o una entrada para ver sus
            reportes:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-9">
          <button
            type="button"
            onClick={() => setFiltroZona("Todas")}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all cursor-pointer",
              filtroZona === "Todas"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-foreground hover:border-primary/50"
            )}
          >
            <LayoutGrid className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold">Toda la comunidad</span>
          </button>

          {COMUNIDAD_INFO.zonas.map((zona) => {
            const Icono = iconoPorZona(zona);
            const activo = filtroZona === zona;
            const cantidad = reportes.filter(
              (r) => r.sector === zona && r.estado !== "Resuelto"
            ).length;

            return (
              <button
                key={zona}
                type="button"
                onClick={() =>
                  setFiltroZona(activo ? "Todas" : zona)
                }
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all cursor-pointer",
                  activo
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                {cantidad > 0 && (
                  <span
                    className={cn(
                      "absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold",
                      activo
                        ? "bg-white text-primary"
                        : "bg-urgent-soft text-urgent"
                    )}
                  >
                    {cantidad}
                  </span>
                )}
                <Icono className="h-5 w-5" aria-hidden />
                <span className="text-xs font-bold leading-tight">{zona}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CARTELERA DE AVISOS, REUNIONES Y CANCHA DEPORTIVA */}
      <section aria-label="Avisos de los voceros" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Avisos y reuniones de la comunidad
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Informaciones publicadas por el Vocero Principal, Voceros de
                Edificio y Vocero de Deportes
              </p>
            </div>
          </div>
          {esVocero && (
            <Link
              href="/gestion"
              className="rounded-xl bg-primary-soft px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              + Publicar un aviso
            </Link>
          )}
        </div>

        {avisos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center">
            <Megaphone className="mx-auto h-7 w-7 text-muted-foreground/60" aria-hidden />
            <p className="mt-2 text-sm font-bold text-foreground">
              No hay avisos ni reuniones publicadas por el momento
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Los voceros publicarán aquí las convocatorias a asambleas, jornadas o actividades en la cancha.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {avisos.map((aviso) => (
              <div
                key={aviso.id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warning-foreground">
                      {aviso.tipo}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {aviso.fechaEvento}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold leading-snug text-foreground">
                    {aviso.titulo}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {aviso.descripcion}
                  </p>
                </div>

                <div className="mt-4 space-y-3 border-t border-border/70 pt-3">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                      {aviso.lugar}
                    </span>
                    <span>
                      Por: <strong>{aviso.vocero}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      confirmarAsistenciaAviso(aviso.id);
                      toast.success(
                        aviso.confirmadoPorMi
                          ? "Confirmación retirada"
                          : "¡Listo! Confirmaste que estás enterado"
                      );
                    }}
                    className={cn(
                      "w-full rounded-2xl py-2.5 text-xs font-bold transition-colors cursor-pointer sm:text-sm",
                      aviso.confirmadoPorMi
                        ? "bg-success-soft text-success border border-success/30"
                        : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {aviso.confirmadoPorMi
                      ? `✓ Enterado (${aviso.confirmados} vecinos)`
                      : `Estoy enterado / Asistiré (${aviso.confirmados})`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. LISTA DE PROBLEMAS REPORTADOS */}
      <section aria-label="Problemas reportados" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Problemas reportados{" "}
              {filtroZona !== "Todas" ? `en ${filtroZona}` : "en la comunidad"}
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Puedes apoyar los problemas de tu edificio o abrir
              &ldquo;Respuestas&rdquo; para ver qué ha dicho el vocero
            </p>
          </div>
          {filtroZona !== "Todas" && (
            <button
              type="button"
              onClick={() => setFiltroZona("Todas")}
              className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Ver toda la comunidad
            </button>
          )}
        </div>

        {/* Botones sencillos para filtrar por categoría */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["Todas", ...CATEGORIAS] as FiltroCategoria[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFiltroCategoria(c)}
              className={cn(
                "shrink-0 rounded-2xl border px-4 py-2 text-xs font-bold transition-colors cursor-pointer sm:text-sm",
                filtroCategoria === c
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {c === "Todas" ? "Todos los servicios" : c}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {visibles.map((r, i) => (
            <TarjetaReporte key={r.id} reporte={r} index={i} />
          ))}
          {visibles.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-success" aria-hidden />
              <p className="mt-2 text-base font-bold text-foreground">
                No hay problemas reportados en esta selección
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Todo está al día aquí. Si ocurre algo nuevo, presiona el botón
                de reportar.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Botón flotante para celulares */}
      <motion.div
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 z-40 md:hidden"
      >
        <Link
          href="/reportar"
          aria-label="Reportar un problema"
          className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)]"
        >
          <Plus className="h-6 w-6" aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}
