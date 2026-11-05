// components/reportes/tarjeta-reporte.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ThumbsUp,
  MessageSquareText,
  MapPin,
  Send,
  TriangleAlert,
  ChevronDown,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import {
  categoriaColor,
  estadoClases,
  imagenRespaldoPorCategoria,
  type Estado,
  type Reporte,
} from "@/types/reportes";
import { useReportesStore } from "@/lib/store/use-reportes";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

interface TarjetaReporteProps {
  reporte: Reporte;
  index?: number;
}

const ESTADOS: Estado[] = ["Pendiente", "En Revisión", "Resuelto"];

/**
 * Tarjeta sencilla y clara para ver cada problema reportado en la Comunidad Fabricio Ojeda.
 */
export function TarjetaReporte({ reporte, index = 0 }: TarjetaReporteProps) {
  const apoyado = useReportesStore((state) => !!state.apoyados[reporte.id]);
  const alternarApoyo = useReportesStore((state) => state.alternarApoyo);
  const cambiarEstado = useReportesStore((state) => state.cambiarEstado);
  const agregarNotaBitacora = useReportesStore(
    (state) => state.agregarNotaBitacora
  );
  const { perfil, esVocero } = useAuth();

  const [seguimientoAbierto, setSeguimientoAbierto] = useState(false);
  const [nuevaNota, setNuevaNota] = useState("");
  const [srcFallido, setSrcFallido] = useState(false);

  const imagenFinal = srcFallido
    ? imagenRespaldoPorCategoria[reporte.categoria]
    : reporte.imagen;

  function enviarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    agregarNotaBitacora(
      reporte.id,
      nuevaNota,
      perfil?.nombre || "Vecino de Fabricio Ojeda",
      esVocero
        ? perfil?.cargo || "Vocero Comunal"
        : perfil?.casa || "Vecino residente"
    );
    setNuevaNota("");
    toast.success(
      esVocero
        ? "Respuesta del vocero guardada"
        : "Tu comentario fue agregado al reporte"
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.2),
        ease: "easeOut",
      }}
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      {/* Parte superior: Categoría, Lugar exacto y Estado actual */}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-primary-foreground",
            categoriaColor[reporte.categoria]
          )}
        >
          {reporte.categoria}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
          {reporte.sector}
        </span>

        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
            estadoClases[reporte.estado]
          )}
        >
          {reporte.estado}
        </span>

        {reporte.gravedad === "Alta" && reporte.estado !== "Resuelto" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-urgent-soft px-2.5 py-1 text-xs font-bold text-urgent">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Urgente
          </span>
        )}

        <span className="ml-auto text-xs font-medium text-muted-foreground">
          {reporte.hace}
        </span>
      </div>

      {/* Título y explicación sencilla */}
      <div className="px-5 pt-3">
        <h3 className="text-lg font-bold leading-snug text-foreground">
          {reporte.titulo}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {reporte.descripcion}
        </p>

        {/* Quién lo reportó y dónde */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/85">
            <Home className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            {reporte.familia}
          </span>
          <span>· {reporte.direccion}</span>
        </div>
      </div>

      {/* Foto del problema con respaldo garantizado */}
      {imagenFinal && (
        <div className="relative mx-5 mt-3.5 aspect-[16/9] max-h-64 overflow-hidden rounded-2xl border border-border/60 bg-muted">
          <img
            src={imagenFinal}
            alt={reporte.titulo}
            onError={() => setSrcFallido(true)}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Botones grandes y fáciles de tocar */}
      <div className="flex flex-wrap items-center gap-2.5 px-5 py-4">
        <motion.button
          type="button"
          onClick={() => alternarApoyo(reporte.id)}
          whileTap={{ scale: 0.96 }}
          aria-pressed={apoyado}
          className={cn(
            "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer sm:text-sm",
            apoyado
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-secondary text-secondary-foreground hover:bg-primary-soft hover:text-primary"
          )}
        >
          <ThumbsUp
            className={cn("h-4 w-4", apoyado && "fill-current")}
            aria-hidden
          />
          <span>{apoyado ? "Apoyado por mí" : "Me afecta (Apoyar)"}</span>
          <span className="rounded-lg bg-black/10 px-2 py-0.5 tabular-nums text-xs">
            {reporte.apoyos}
          </span>
        </motion.button>

        <button
          type="button"
          onClick={() => setSeguimientoAbierto((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer sm:text-sm",
            seguimientoAbierto
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-background text-foreground hover:bg-secondary"
          )}
        >
          <MessageSquareText className="h-4 w-4 text-primary" aria-hidden />
          <span>Respuestas ({reporte.bitacora.length})</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              seguimientoAbierto && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        {/* Si es vocero, puede cambiar el estado rápido desde la misma tarjeta */}
        {esVocero && (
          <div className="ml-auto flex items-center gap-1.5">
            <select
              aria-label="Cambiar estado del reporte"
              value={reporte.estado}
              onChange={(e) => {
                const nuevo = e.target.value as Estado;
                void cambiarEstado(
                  reporte.id,
                  nuevo,
                  undefined,
                  perfil?.nombre || "Vocero",
                  perfil?.cargo || "Vocero Comunal"
                );
                toast.success(`Estado cambiado a: ${nuevo}`);
              }}
              className="h-10 rounded-2xl border border-amber-500/40 bg-warning-soft px-3 text-xs font-bold text-warning-foreground outline-none cursor-pointer"
            >
              {ESTADOS.map((est) => (
                <option key={est} value={est}>
                  Estado: {est}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Respuestas del vocero y comentarios de los vecinos */}
      <AnimatePresence initial={false}>
        {seguimientoAbierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border bg-secondary/35"
          >
            <div className="space-y-3 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Seguimiento de los voceros y vecinos
              </p>

              <div className="space-y-2.5 border-l-2 border-primary/30 pl-3.5">
                {reporte.bitacora.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-card p-3 text-xs shadow-2xs border border-border/60"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-foreground">
                        {item.autor}
                      </span>
                      <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                        {item.cargo}
                      </span>
                      <span className="text-muted-foreground">
                        · {item.fecha}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed">
                      {item.nota}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={enviarNota} className="flex gap-2 pt-1">
                <input
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  placeholder={
                    esVocero
                      ? "Escribe qué solución se está gestionando..."
                      : "Escribe un comentario sobre este problema..."
                  }
                  className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer sm:text-sm"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
