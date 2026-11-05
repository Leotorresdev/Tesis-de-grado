// lib/store/use-reportes.ts
import { create } from "zustand";
import {
  REPORTES_INICIALES,
  AVISOS_INICIALES,
  imagenRespaldoPorCategoria,
  type Reporte,
  type Estado,
  type AvisoComunitario,
  type TipoAviso,
} from "@/types/reportes";

/**
 * Datos de entrada para registrar un nuevo reporte vecinal.
 */
export type NuevoReporteInput = Omit<
  Reporte,
  "id" | "codigo" | "hace" | "apoyos" | "comentarios" | "bitacora"
>;

/**
 * Datos de entrada para publicar un nuevo aviso o actividad comunal.
 */
export type NuevoAvisoInput = {
  tipo: TipoAviso;
  titulo: string;
  descripcion: string;
  fechaEvento: string;
  lugar: string;
  vocero: string;
  cargoVocero?: string;
};

const STORAGE_KEY = "ojedaconecta_reportes_v2";
const CLAVES_REPORTES_A_PURGAR = [
  "ojedaconecta_fabricio_ojeda_v1",
  "nexobocono_fabricio_ojeda_v3",
  "nexobocono_fabricio_ojeda_v2",
  "nexobocono_fabricio_ojeda",
];

function purgarReportesViejos() {
  if (typeof window === "undefined") return;
  try {
    for (const key of CLAVES_REPORTES_A_PURGAR) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignorar errores
  }
}

if (typeof window !== "undefined") {
  purgarReportesViejos();
}

/**
 * Verifica que una URL de imagen sea válida y persistente (local en /images/ o Data URL).
 */
function normalizarImagen(imagen: string | undefined, categoria: Reporte["categoria"]): string | undefined {
  if (!imagen) return undefined;
  if (
    imagen.startsWith("/images/") ||
    imagen.startsWith("data:image/") ||
    imagen.startsWith("https://")
  ) {
    return imagen;
  }
  return imagenRespaldoPorCategoria[categoria];
}

interface DatosGuardados {
  reportes: Reporte[];
  avisos: AvisoComunitario[];
  apoyados: Record<string, boolean>;
}

function leerAlmacenamiento(): DatosGuardados | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DatosGuardados;
    return {
      reportes: Array.isArray(parsed.reportes)
        ? parsed.reportes.map((r) => ({
            ...r,
            imagen: normalizarImagen(r.imagen, r.categoria),
          }))
        : [],
      avisos: Array.isArray(parsed.avisos) ? parsed.avisos : AVISOS_INICIALES,
      apoyados: parsed.apoyados ?? {},
    };
  } catch {
    return null;
  }
}

function guardarAlmacenamiento(datos: DatosGuardados) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch {
    // Si el almacenamiento local está lleno, continúa en memoria sin bloquear la app
  }
}

/**
 * Estado global de la Comunidad Fabricio Ojeda en Zustand.
 */
interface ReportesState {
  reportes: Reporte[];
  avisos: AvisoComunitario[];
  apoyados: Record<string, boolean>;
  cargando: boolean;

  cargarReportes: () => Promise<void>;
  alternarApoyo: (id: string) => void;
  agregarReporte: (reporte: NuevoReporteInput) => Promise<void>;
  cambiarEstado: (
    id: string,
    estado: Estado,
    notaVocero?: string,
    autorVocero?: string,
    cargoVocero?: string
  ) => Promise<boolean>;
  agregarNotaBitacora: (
    id: string,
    nota: string,
    autor: string,
    cargo: string
  ) => void;
  confirmarAsistenciaAviso: (id: string) => void;
  publicarAviso: (aviso: NuevoAvisoInput) => void;
}

/**
 * Store centralizado con Zustand para reportes y avisos de la Comunidad Fabricio Ojeda.
 */
export const useReportesStore = create<ReportesState>((set, get) => ({
  reportes: REPORTES_INICIALES,
  avisos: AVISOS_INICIALES,
  apoyados: {},
  cargando: false,

  /**
   * Carga los datos locales persistidos sin sobrescribir ni romper las imágenes locales.
   */
  cargarReportes: async () => {
    const guardado = leerAlmacenamiento();
    if (guardado) {
      set({
        reportes: guardado.reportes,
        avisos: guardado.avisos,
        apoyados: guardado.apoyados,
        cargando: false,
      });
    }
  },

  /**
   * Permite a un vecino apoyar un reporte para darle prioridad.
   */
  alternarApoyo: (id: string) => {
    const { apoyados, reportes, avisos } = get();
    const activo = !apoyados[id];
    const nuevosApoyados = { ...apoyados, [id]: activo };
    const nuevosReportes = reportes.map((rep) =>
      rep.id === id
        ? { ...rep, apoyos: Math.max(0, rep.apoyos + (activo ? 1 : -1)) }
        : rep
    );

    set({ apoyados: nuevosApoyados, reportes: nuevosReportes });
    guardarAlmacenamiento({
      reportes: nuevosReportes,
      avisos,
      apoyados: nuevosApoyados,
    });
  },

  /**
   * Crea un nuevo reporte en la comunidad y lo guarda de forma persistente.
   */
  agregarReporte: async (input: NuevoReporteInput) => {
    const { reportes, avisos, apoyados } = get();
    const correlativo = 105 + reportes.length;
    const nuevoReporte: Reporte = {
      id: `r-${Date.now()}`,
      codigo: `FO-${correlativo}`,
      ...input,
      imagen: normalizarImagen(input.imagen, input.categoria),
      hace: "Hace un momento",
      apoyos: 1,
      comentarios: 1,
      bitacora: [
        {
          id: `b-${Date.now()}`,
          fecha: "Ahora mismo",
          autor: input.autor,
          cargo: input.familia,
          nota: "Reporte enviado a los voceros de la Comunidad Fabricio Ojeda.",
        },
      ],
    };

    const nuevosReportes = [nuevoReporte, ...reportes];
    const nuevosApoyados = { ...apoyados, [nuevoReporte.id]: true };

    set({ reportes: nuevosReportes, apoyados: nuevosApoyados });
    guardarAlmacenamiento({
      reportes: nuevosReportes,
      avisos,
      apoyados: nuevosApoyados,
    });
  },

  /**
   * Cambia el estado del reporte (Pendiente / En Revisión / Resuelto) y añade nota de seguimiento.
   */
  cambiarEstado: async (
    id: string,
    nuevoEstado: Estado,
    notaVocero?: string,
    autorVocero = "Vocero de la Comunidad",
    cargoVocero = "Vocero Comunal"
  ) => {
    const notaPorDefecto: Record<Estado, string> = {
      Pendiente: "El reporte quedó marcado como pendiente para revisión.",
      "En Revisión":
        "El vocero ya está revisando el problema y gestionando la solución.",
      Resuelto:
        "¡Problema solucionado! Verificado en la Comunidad Fabricio Ojeda.",
    };

    const { reportes, avisos, apoyados } = get();
    const nuevosReportes = reportes.map((rep) =>
      rep.id === id
        ? {
            ...rep,
            estado: nuevoEstado,
            comentarios: rep.comentarios + 1,
            bitacora: [
              ...rep.bitacora,
              {
                id: `b-${Date.now()}`,
                fecha: "Hace un momento",
                autor: autorVocero,
                cargo: cargoVocero,
                nota: notaVocero?.trim() || notaPorDefecto[nuevoEstado],
              },
            ],
          }
        : rep
    );

    set({ reportes: nuevosReportes });
    guardarAlmacenamiento({ reportes: nuevosReportes, avisos, apoyados });
    return true;
  },

  /**
   * Añade un comentario o avance al historial de seguimiento del reporte.
   */
  agregarNotaBitacora: (
    id: string,
    nota: string,
    autor: string,
    cargo: string
  ) => {
    if (!nota.trim()) return;
    const { reportes, avisos, apoyados } = get();
    const nuevosReportes = reportes.map((rep) =>
      rep.id === id
        ? {
            ...rep,
            comentarios: rep.comentarios + 1,
            bitacora: [
              ...rep.bitacora,
              {
                id: `b-${Date.now()}`,
                fecha: "Hace un momento",
                autor,
                cargo,
                nota: nota.trim(),
              },
            ],
          }
        : rep
    );

    set({ reportes: nuevosReportes });
    guardarAlmacenamiento({ reportes: nuevosReportes, avisos, apoyados });
  },

  /**
   * Permite a una familia confirmar que está enterada o asistirá a un aviso/reunión.
   */
  confirmarAsistenciaAviso: (id: string) => {
    const { reportes, avisos, apoyados } = get();
    const nuevosAvisos = avisos.map((av) => {
      if (av.id !== id) return av;
      const activo = !av.confirmadoPorMi;
      return {
        ...av,
        confirmadoPorMi: activo,
        confirmados: Math.max(0, av.confirmados + (activo ? 1 : -1)),
      };
    });

    set({ avisos: nuevosAvisos });
    guardarAlmacenamiento({ reportes, avisos: nuevosAvisos, apoyados });
  },

  /**
   * Publica un nuevo aviso de reunión, actividad deportiva en la cancha o servicio.
   */
  publicarAviso: (input: NuevoAvisoInput) => {
    const { reportes, avisos, apoyados } = get();
    const nuevo: AvisoComunitario = {
      id: `av-${Date.now()}`,
      ...input,
      confirmados: 1,
      confirmadoPorMi: true,
    };
    const nuevosAvisos = [nuevo, ...avisos];

    set({ avisos: nuevosAvisos });
    guardarAlmacenamiento({ reportes, avisos: nuevosAvisos, apoyados });
  },
}));
