// app/gestion/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Megaphone,
  Users,
  ShieldAlert,
  PlusCircle,
  Sparkles,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import {
  COMUNIDAD_INFO,
  estadoClases,
  type Estado,
  type TipoAviso,
} from "@/types/reportes";
import { useReportesStore } from "@/lib/store/use-reportes";
import { cn } from "@/lib/utils";

const ESTADOS_REPORTE: Estado[] = ["Pendiente", "En Revisión", "Resuelto"];
const TIPOS_AVISO: TipoAviso[] = [
  "Reunión",
  "Deporte en Cancha",
  "Servicio",
  "Urgente",
];

// Plantillas rápidas para que el vocero publique un aviso con 1 solo toque
const PLANTILLAS_AVISO: {
  etiqueta: string;
  tipo: TipoAviso;
  titulo: string;
  lugar: string;
  fechaEvento: string;
  descripcion: string;
}[] = [
  {
    etiqueta: "Reunión de Vecinos",
    tipo: "Reunión",
    titulo: "Reunión de vecinos de los 5 edificios",
    lugar: "Cancha Deportiva",
    fechaEvento: "Este Sábado · 4:30 p. m.",
    descripcion:
      "Convocamos a un representante por apartamento para tratar mejoras de nuestra comunidad Fabricio Ojeda.",
  },
  {
    etiqueta: "Actividad en la Cancha",
    tipo: "Deporte en Cancha",
    titulo: "Tarde deportiva y recreativa en la cancha",
    lugar: "Cancha Deportiva",
    fechaEvento: "Este Domingo · 9:00 a. m.",
    descripcion:
      "El Vocero de Deportes invita a los niños, jóvenes y familias de los 5 edificios a compartir en la cancha.",
  },
  {
    etiqueta: "Jornada de Gas / Agua",
    tipo: "Servicio",
    titulo: "Aviso de servicio para los 5 edificios",
    lugar: "Entrada Principal",
    fechaEvento: "Mañana · 8:00 a. m.",
    descripcion:
      "Informamos a los vecinos estar atentos con el vocero de su edificio para la jornada programada.",
  },
];

// Respuestas rápidas para que el vocero responda un reporte fácilmente
const RESPUESTAS_RAPIDAS = [
  "Ya estamos revisando el problema con el vocero del edificio.",
  "Se gestionó el arreglo; quedará listo esta semana.",
  "¡Problema resuelto! Gracias a los vecinos por avisar.",
];

/**
 * Panel de Gestión del Vocero — Comunidad Fabricio Ojeda (Boconó).
 * Simplificado en 2 tareas claras: Publicar Avisos y Resolver Problemas Reportados.
 */
export default function GestionPage() {
  const reportes = useReportesStore((state) => state.reportes);
  const cambiarEstado = useReportesStore((state) => state.cambiarEstado);
  const publicarAviso = useReportesStore((state) => state.publicarAviso);

  const { perfil } = useAuth();

  const [notaPorReporte, setNotaPorReporte] = useState<Record<string, string>>(
    {}
  );

  const [nuevoAviso, setNuevoAviso] = useState({
    tipo: "Reunión" as TipoAviso,
    titulo: "",
    descripcion: "",
    fechaEvento: "",
    lugar: "Cancha Deportiva",
  });

  const pendientes = reportes.filter((r) => r.estado === "Pendiente");
  const revision = reportes.filter((r) => r.estado === "En Revisión");
  const resueltos = reportes.filter((r) => r.estado === "Resuelto");

  // Ordenados dando prioridad a los pendientes y con más apoyos
  const prioritarios = [...reportes].sort((a, b) => {
    if (a.estado === "Resuelto" && b.estado !== "Resuelto") return 1;
    if (a.estado !== "Resuelto" && b.estado === "Resuelto") return -1;
    return b.apoyos - a.apoyos;
  });

  async function manejarCambioEstado(id: string, nuevoEstado: Estado) {
    const nota = notaPorReporte[id];
    const ok = await cambiarEstado(
      id,
      nuevoEstado,
      nota,
      perfil?.nombre || "Vocero",
      perfil?.cargo || "Vocero Comunal"
    );
    if (ok) {
      setNotaPorReporte((prev) => ({ ...prev, [id]: "" }));
      toast.success(`Reporte marcado como "${nuevoEstado}"`);
    }
  }

  function manejarPublicarAviso(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoAviso.titulo.trim() || !nuevoAviso.descripcion.trim()) return;

    publicarAviso({
      tipo: nuevoAviso.tipo,
      titulo: nuevoAviso.titulo.trim(),
      descripcion: nuevoAviso.descripcion.trim(),
      fechaEvento: nuevoAviso.fechaEvento.trim() || "Próximamente",
      lugar: nuevoAviso.lugar,
      vocero: perfil?.nombre || "Vocero Comunal",
      cargoVocero: perfil?.cargo || "Vocería Fabricio Ojeda",
    });

    setNuevoAviso({
      tipo: "Reunión",
      titulo: "",
      descripcion: "",
      fechaEvento: "",
      lugar: "Cancha Deportiva",
    });

    toast.success("¡Aviso publicado para toda la comunidad!");
  }

  return (
    <div className="space-y-6">
      {/* Encabezado claro del Vocero */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {COMUNIDAD_INFO.nombre} · {COMUNIDAD_INFO.municipio}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Panel del Vocero
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Aquí puedes atender los problemas de los 5 edificios, la cancha y
            las 2 entradas, o publicar un aviso.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-warning-soft px-4 py-2 text-xs font-bold text-warning-foreground sm:text-sm">
          <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden />
          {perfil?.nombre} · {perfil?.cargo || "Vocero"}
        </span>
      </header>

      {/* Resumen numérico grande y fácil de entender */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricaCard
          icon={AlertTriangle}
          valor={pendientes.length}
          label="Pendientes por atender"
          tono="bg-urgent text-urgent-foreground"
        />
        <MetricaCard
          icon={Clock3}
          valor={revision.length}
          label="En revisión ahora"
          tono="bg-warning text-warning-foreground"
        />
        <MetricaCard
          icon={CheckCircle2}
          valor={resueltos.length}
          label="Ya solucionados"
          tono="bg-success text-success-foreground"
        />
        <MetricaCard
          icon={Users}
          valor="3 Voceros"
          label="Principal · Edificio · Deporte"
          tono="bg-community-dark text-community-light"
        />
      </section>

      {/* DOS SECCIONES SIMPLES: 1. PUBLICAR AVISO | 2. ATENDER REPORTES */}
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
        {/* SECCIÓN 1: PUBLICAR UN AVISO O REUNIÓN DE FORMA FÁCIL */}
        <form
          onSubmit={manejarPublicarAviso}
          className="h-fit space-y-4 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-warning-soft text-warning-foreground">
              <Megaphone className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">
                1. Publicar un Aviso Rápido
              </h2>
              <p className="text-xs text-muted-foreground">
                Avisa sobre una reunión, juego en la cancha o jornada
              </p>
            </div>
          </div>

          {/* Botones de plantilla rápida */}
          <div className="space-y-1.5 rounded-2xl bg-secondary/50 p-3">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Toca un ejemplo
              para llenar rápido:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PLANTILLAS_AVISO.map((pl) => (
                <button
                  key={pl.etiqueta}
                  type="button"
                  onClick={() =>
                    setNuevoAviso({
                      tipo: pl.tipo,
                      titulo: pl.titulo,
                      lugar: pl.lugar,
                      fechaEvento: pl.fechaEvento,
                      descripcion: pl.descripcion,
                    })
                  }
                  className="rounded-xl border border-primary/25 bg-card px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                >
                  + {pl.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold">Tipo de aviso:</span>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_AVISO.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNuevoAviso({ ...nuevoAviso, tipo: t })}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-bold transition-colors cursor-pointer",
                    nuevoAviso.tipo === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold">Título del aviso</span>
            <input
              required
              value={nuevoAviso.titulo}
              onChange={(e) =>
                setNuevoAviso({ ...nuevoAviso, titulo: e.target.value })
              }
              placeholder="Ej: Reunión en la cancha este sábado"
              className="auth-input"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-bold">Lugar de la comunidad</span>
              <select
                value={nuevoAviso.lugar}
                onChange={(e) =>
                  setNuevoAviso({ ...nuevoAviso, lugar: e.target.value })
                }
                className="auth-input"
              >
                {COMUNIDAD_INFO.zonas.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-bold">Cuándo será (Día y hora)</span>
              <input
                required
                value={nuevoAviso.fechaEvento}
                onChange={(e) =>
                  setNuevoAviso({ ...nuevoAviso, fechaEvento: e.target.value })
                }
                placeholder="Ej: Sábado · 4:30 p. m."
                className="auth-input"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold">Mensaje para los vecinos</span>
            <textarea
              required
              rows={3}
              value={nuevoAviso.descripcion}
              onChange={(e) =>
                setNuevoAviso({ ...nuevoAviso, descripcion: e.target.value })
              }
              placeholder="Escribe de forma sencilla la información para los vecinos..."
              className="w-full resize-none rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl gap-2 text-sm font-bold cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            <span>Publicar Aviso Ahora</span>
          </Button>
        </form>

        {/* SECCIÓN 2: ATENDER LOS PROBLEMAS REPORTADOS */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-lg font-bold">
                2. Problemas Reportados por los Vecinos
              </h2>
              <p className="text-xs text-muted-foreground">
                Toca un botón para cambiar el estado o deja una nota rápida
              </p>
            </div>
            <span className="rounded-xl bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              {prioritarios.length} reportes
            </span>
          </div>

          <div className="divide-y divide-border">
            {prioritarios.map((reporte, index) => (
              <motion.article
                key={reporte.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="space-y-3.5 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                      {reporte.sector}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold",
                        estadoClases[reporte.estado]
                      )}
                    >
                      {reporte.estado}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      · {reporte.apoyos} vecinos apoyan
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {reporte.titulo}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {reporte.descripcion}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-foreground/75">
                    Reportado por: {reporte.autor} ({reporte.familia})
                  </p>
                </div>

                {/* Botones grandes para cambiar estado en 1 toque */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">
                    Cambiar estado con un toque:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {ESTADOS_REPORTE.map((est) => {
                      const activo = reporte.estado === est;
                      return (
                        <button
                          key={est}
                          type="button"
                          onClick={() =>
                            void manejarCambioEstado(reporte.id, est)
                          }
                          className={cn(
                            "rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer",
                            activo
                              ? est === "Resuelto"
                                ? "border-success bg-success text-success-foreground shadow-xs"
                                : est === "En Revisión"
                                  ? "border-warning bg-warning text-warning-foreground shadow-xs"
                                  : "border-urgent bg-urgent text-urgent-foreground shadow-xs"
                              : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
                          )}
                        >
                          {est}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Respuesta rápida opcional del vocero */}
                <div className="space-y-2 rounded-2xl bg-secondary/40 p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {RESPUESTAS_RAPIDAS.map((resp) => (
                      <button
                        key={resp}
                        type="button"
                        onClick={() =>
                          setNotaPorReporte((prev) => ({
                            ...prev,
                            [reporte.id]: resp,
                          }))
                        }
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-primary cursor-pointer"
                      >
                        + {resp}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={notaPorReporte[reporte.id] || ""}
                      onChange={(e) =>
                        setNotaPorReporte((prev) => ({
                          ...prev,
                          [reporte.id]: e.target.value,
                        }))
                      }
                      placeholder="Escribe una respuesta para los vecinos..."
                      className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        void manejarCambioEstado(reporte.id, reporte.estado)
                      }
                      className="rounded-xl text-xs cursor-pointer"
                    >
                      Enviar nota
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}

            {prioritarios.length === 0 && (
              <div className="p-10 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-success" aria-hidden />
                <p className="mt-2 text-base font-bold text-foreground">
                  No hay problemas pendientes por atender
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  La comunidad está al día. Cuando los vecinos reporten fallas de agua, luz o aseo, aparecerán aquí para gestionarlas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricaCard({
  icon: Icon,
  valor,
  label,
  tono,
}: {
  icon: React.ElementType;
  valor: string | number;
  label: string;
  tono: string;
}) {
  return (
    <div className={cn("rounded-3xl p-4 shadow-[var(--shadow-card)]", tono)}>
      <Icon className="h-5 w-5 opacity-85" aria-hidden />
      <p className="mt-3 font-display text-2xl font-bold tabular-nums sm:text-3xl">
        {valor}
      </p>
      <p className="text-xs font-semibold opacity-90">{label}</p>
    </div>
  );
}
