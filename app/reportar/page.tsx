// app/reportar/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  Droplets,
  Zap,
  Trash2,
  Trophy,
  DoorOpen,
  Loader2,
  MapPin,
  Send,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  COMUNIDAD_INFO,
  type Categoria,
  type Gravedad,
} from "@/types/reportes";
import { useReportesStore } from "@/lib/store/use-reportes";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Categorías adaptadas exactamente a la Comunidad Fabricio Ojeda (5 Edificios, 1 Cancha, 2 Entradas)
const OPCIONES_CATEGORIA: {
  id: Categoria;
  titulo: string;
  subtitulo: string;
  icon: React.ElementType;
  sugerencias: string[];
}[] = [
  {
    id: "Agua",
    titulo: "Agua Potable",
    subtitulo: "Bote de agua, falta de agua en los edificios o tubería rota",
    icon: Droplets,
    sugerencias: [
      "Bote de agua en la entrada del edificio",
      "No sube el agua a los pisos altos",
      "Llave de paso del edificio dañada",
    ],
  },
  {
    id: "Electricidad",
    titulo: "Luz y Alumbrado",
    subtitulo: "Bombillos quemados en escaleras, entradas o bajones de luz",
    icon: Zap,
    sugerencias: [
      "Faltan bombillos en las escaleras del edificio",
      "Lámpara apagada en la entrada de la comunidad",
      "Cable suelto o bajones de luz en el edificio",
    ],
  },
  {
    id: "Aseo",
    titulo: "Aseo y Basura",
    subtitulo: "Bolsas acumuladas o retraso del camión del aseo",
    icon: Trash2,
    sugerencias: [
      "Contenedor de basura lleno en la entrada",
      "El camión del aseo no ha pasado esta semana",
      "Falta limpieza alrededor del edificio",
    ],
  },
  {
    id: "Cancha y Deporte",
    titulo: "Cancha Deportiva",
    subtitulo: "Malla rota, arcos, piso o luces de nuestra única cancha",
    icon: Trophy,
    sugerencias: [
      "Malla suelta detrás del arco en la Cancha Deportiva",
      "Reflector apagado en la Cancha Deportiva",
      "Piso o pintura deteriorada en la cancha",
    ],
  },
  {
    id: "Entradas y Áreas",
    titulo: "Las 2 Entradas y Áreas",
    subtitulo: "Portón de Entrada Principal, Entrada Secundaria o caminerías",
    icon: DoorOpen,
    sugerencias: [
      "Portón de la Entrada Principal cuesta para cerrar",
      "Maleza crecida en la Entrada Secundaria",
      "Rejilla de desagüe suelta en el paso peatonal",
    ],
  },
];

const GRAVEDADES: { nivel: Gravedad; desc: string }[] = [
  { nivel: "Baja", desc: "No es urgente, puede esperar unos días" },
  { nivel: "Media", desc: "Molesta a varios vecinos del edificio" },
  { nivel: "Alta", desc: "Es urgente: hay peligro o falta total del servicio" },
];

/**
 * Convierte un archivo de imagen a DataURL comprimido para que se guarde siempre y no se borre al recargar.
 */
function convertirImagenADataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxAncho = 900;
        const escala = img.width > maxAncho ? maxAncho / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Asistente Guiado en 3 Pasos Sencillos para Reportar un Problema en la Comunidad Fabricio Ojeda.
 */
export default function ReportarPage() {
  const router = useRouter();
  const agregarReporte = useReportesStore((state) => state.agregarReporte);
  const { perfil } = useAuth();
  const inputFoto = useRef<HTMLInputElement>(null);

  const [paso, setPaso] = useState<1 | 2 | 3>(1);

  const [categoria, setCategoria] = useState<Categoria>("Agua");
  const [sector, setSector] = useState<string>(
    perfil?.sector || COMUNIDAD_INFO.zonas[0]
  );
  const [direccion, setDireccion] = useState("");
  const [gravedad, setGravedad] = useState<Gravedad>("Media");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  const infoCatActual =
    OPCIONES_CATEGORIA.find((c) => c.id === categoria) ||
    OPCIONES_CATEGORIA[0];

  const validoPaso3 =
    titulo.trim().length > 3 && descripcion.trim().length > 4;

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await convertirImagenADataUrl(file);
      setFoto(dataUrl);
    } catch {
      toast.error("No se pudo leer la imagen seleccionada");
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!validoPaso3 || enviando) return;
    setEnviando(true);

    try {
      await agregarReporte({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        gravedad,
        estado: "Pendiente",
        ...(foto ? { imagen: foto } : {}),
        autor: perfil?.nombre || "Vecino de Fabricio Ojeda",
        familia: perfil?.casa || `Vecino · ${sector}`,
        sector,
        direccion: direccion.trim() || `Ubicado en ${sector}`,
      });

      setEnviando(false);
      setListo(true);
      toast.success("¡Tu reporte fue publicado con éxito!");
      setTimeout(() => router.push("/"), 900);
    } catch {
      setEnviando(false);
      toast.error("No pudimos publicar el reporte");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Encabezado muy fácil de seguir */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {COMUNIDAD_INFO.nombre} · Boconó
            </span>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Reportar un problema en 3 pasos
            </h1>
          </div>
          <span className="rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary">
            Paso {paso} de 3
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "1. ¿Qué pasa?" },
            { num: 2, label: "2. ¿Dónde es?" },
            { num: 3, label: "3. Enviar" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => setPaso(item.num as 1 | 2 | 3)}
              className={cn(
                "rounded-2xl py-2.5 text-center text-xs font-bold transition-colors cursor-pointer sm:text-sm",
                paso === item.num
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : paso > item.num
                    ? "bg-success-soft text-success"
                    : "bg-secondary text-muted-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          {paso === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold">
                  Paso 1: ¿Con qué tiene que ver el problema?
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Toca una de las tarjetas grandes de abajo:
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {OPCIONES_CATEGORIA.map((op) => {
                  const Icon = op.icon;
                  const activo = categoria === op.id;

                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setCategoria(op.id);
                        if (op.id === "Cancha y Deporte") {
                          setSector("Cancha Deportiva");
                        } else if (op.id === "Entradas y Áreas") {
                          setSector("Entrada Principal");
                        }
                      }}
                      className={cn(
                        "flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all cursor-pointer",
                        activo
                          ? "border-primary bg-primary-soft/60 shadow-xs"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                          activo
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground sm:text-base">
                          {op.titulo}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {op.subtitulo}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                onClick={() => setPaso(2)}
                className="mt-2 h-12 w-full rounded-2xl gap-2 text-sm font-bold cursor-pointer"
              >
                <span>Siguiente paso</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </motion.div>
          )}

          {paso === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-lg font-bold">
                  Paso 2: ¿En qué parte de Fabricio Ojeda ocurre?
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Elige uno de los 5 edificios, la cancha o una de las 2
                  entradas:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {COMUNIDAD_INFO.zonas.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setSector(z)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-xs font-bold transition-colors cursor-pointer",
                      sector === z
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-background text-foreground hover:border-primary"
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{z}</span>
                  </button>
                ))}
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  Detalle del lugar (opcional, ej: piso 2, escalera, portón):
                </span>
                <input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder={`Ej: Planta baja de ${sector}`}
                  className="auth-input"
                />
              </label>

              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  ¿Qué tan urgente es?
                </span>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {GRAVEDADES.map(({ nivel, desc }) => (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => setGravedad(nivel)}
                      className={cn(
                        "rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                        gravedad === nivel
                          ? nivel === "Alta"
                            ? "border-urgent bg-urgent-soft text-urgent"
                            : "border-primary bg-primary-soft text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary"
                      )}
                    >
                      <p className="text-sm font-bold">{nivel}</p>
                      <p className="mt-0.5 text-xs leading-snug opacity-90">
                        {desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaso(1)}
                  className="h-12 rounded-2xl gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Volver
                </Button>
                <Button
                  type="button"
                  onClick={() => setPaso(3)}
                  className="h-12 flex-1 rounded-2xl gap-2 text-sm font-bold cursor-pointer"
                >
                  <span>Último paso: Explicar y enviar</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </motion.div>
          )}

          {paso === 3 && (
            <motion.form
              key="step-3"
              onSubmit={enviar}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-lg font-bold">
                  Paso 3: Explica el problema o toca una frase lista
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Para que sea más fácil, puedes tocar una de estas frases y se
                  llenará sola:
                </p>
              </div>

              {/* Frases listas para no tener que escribir */}
              <div className="space-y-2 rounded-2xl bg-secondary/50 p-3.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden /> Toca una
                  frase rápida:
                </span>
                <div className="flex flex-wrap gap-2">
                  {infoCatActual.sugerencias.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setTitulo(sug);
                        setDescripcion(
                          `${sug} en ${sector}. Solicitamos el apoyo de los voceros de la Comunidad Fabricio Ojeda para revisarlo.`
                        );
                      }}
                      className="rounded-xl border border-primary/25 bg-card px-3.5 py-2 text-left text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  Título corto del problema
                </span>
                <input
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={`Ej: Problema de ${categoria.toLowerCase()} en ${sector}`}
                  className="auth-input"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  Explicación sencilla
                </span>
                <textarea
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Cuenta brevemente qué está pasando..."
                  className="w-full resize-none rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-primary"
                />
              </label>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  Foto del problema (Opcional)
                </span>
                <input
                  ref={inputFoto}
                  type="file"
                  accept="image/*"
                  onChange={elegirFoto}
                  className="hidden"
                />
                {foto ? (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <img
                      src={foto}
                      alt="Vista previa de tu foto"
                      className="h-44 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFoto(null)}
                      className="w-full bg-secondary py-2.5 text-xs font-bold text-secondary-foreground hover:bg-muted cursor-pointer"
                    >
                      Cambiar o quitar foto
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputFoto.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background py-5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer sm:text-sm"
                  >
                    <Camera className="h-5 w-5" aria-hidden />
                    <span>Toca aquí si deseas subir una foto</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaso(2)}
                  className="h-12 rounded-2xl gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Volver
                </Button>

                <motion.button
                  type="submit"
                  disabled={!validoPaso3 || enviando || listo}
                  whileTap={{ scale: validoPaso3 ? 0.97 : 1 }}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
                >
                  {listo ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" aria-hidden /> ¡Listo!
                    </>
                  ) : enviando ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />{" "}
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden /> Enviar Reporte
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
