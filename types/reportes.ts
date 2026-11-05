// types/reportes.ts
/**
 * Modelo de datos para OjedaConecta — Comunidad Fabricio Ojeda (Boconó, Edo. Trujillo).
 * Estructura exacta: 5 Edificios, 1 Cancha Deportiva, 2 Entradas y 3 Tipos de Voceros.
 */

// Categorías sencillas de entender para los vecinos de Fabricio Ojeda
export type Categoria =
  | "Agua"
  | "Electricidad"
  | "Aseo"
  | "Cancha y Deporte"
  | "Entradas y Áreas";

// Estados del flujo de resolución de un reporte
export type Estado = "Pendiente" | "En Revisión" | "Resuelto";

// Nivel de urgencia de la incidencia
export type Gravedad = "Baja" | "Media" | "Alta";

// Roles de usuario dentro de la comunidad
export type RolUsuario = "vecino" | "vocero";

// Los 3 cargos únicos de vocería en la Comunidad Fabricio Ojeda
export type CargoVocero =
  | "Vocero Principal"
  | "Vocero Secundario (Por Edificio)"
  | "Vocero de Deportes";

export const CARGOS_VOCERO: readonly CargoVocero[] = [
  "Vocero Principal",
  "Vocero Secundario (Por Edificio)",
  "Vocero de Deportes",
] as const;

// Registro de avance dentro del seguimiento de un reporte
export type EntradaBitacora = {
  id: string;
  fecha: string;
  autor: string;
  cargo: string;
  nota: string;
};

// Estructura completa de una incidencia vecinal
export type Reporte = {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria;
  estado: Estado;
  gravedad: Gravedad;
  imagen?: string;
  autor: string;
  familia: string;
  sector: string;
  direccion: string;
  hace: string;
  apoyos: number;
  comentarios: number;
  bitacora: EntradaBitacora[];
};

// Avisos oficiales, reuniones y actividades deportivas
export type TipoAviso = "Reunión" | "Deporte en Cancha" | "Servicio" | "Urgente";

export type AvisoComunitario = {
  id: string;
  tipo: TipoAviso;
  titulo: string;
  descripcion: string;
  fechaEvento: string;
  lugar: string;
  vocero: string;
  cargoVocero?: string;
  confirmados: number;
  confirmadoPorMi?: boolean;
};

// Información real y exacta de la Comunidad Fabricio Ojeda en Boconó
export const COMUNIDAD_INFO = {
  nombre: "Comunidad Fabricio Ojeda",
  municipio: "Boconó, Edo. Trujillo",
  estructura: "5 Edificios · 1 Cancha Deportiva · 2 Entradas",
  habitantes: 170,
  familias: 55,
  voceroPrincipal: "Vocería Principal Fabricio Ojeda",
  // Los 5 edificios residenciales donde viven las familias
  edificios: [
    "Edificio 1",
    "Edificio 2",
    "Edificio 3",
    "Edificio 4",
    "Edificio 5",
  ],
  // Todas las zonas físicas con las que cuenta la comunidad (5 edificios, 1 cancha y 2 entradas)
  zonas: [
    "Edificio 1",
    "Edificio 2",
    "Edificio 3",
    "Edificio 4",
    "Edificio 5",
    "Cancha Deportiva",
    "Entrada Principal",
    "Entrada Secundaria",
  ],
};

// Categorías disponibles para filtros y formularios
export const CATEGORIAS: Categoria[] = [
  "Agua",
  "Electricidad",
  "Aseo",
  "Cancha y Deporte",
  "Entradas y Áreas",
];

// Asignación de clases de color por categoría
export const categoriaColor: Record<Categoria, string> = {
  Agua: "bg-cat-agua",
  Electricidad: "bg-cat-electricidad",
  Aseo: "bg-cat-aseo",
  "Cancha y Deporte": "bg-cat-vialidad",
  "Entradas y Áreas": "bg-cat-seguridad",
};

// Imágenes de respaldo locales garantizadas por categoría
export const imagenRespaldoPorCategoria: Record<Categoria, string> = {
  Agua: "/images/reporte-agua.jpg",
  Electricidad: "/images/reporte-alumbrado.jpg",
  Aseo: "/images/reporte-basura.jpg",
  "Cancha y Deporte": "/images/reporte-vialidad.jpg",
  "Entradas y Áreas": "/images/reporte-alumbrado.jpg",
};

// Clases visuales según el estado del reporte
export const estadoClases: Record<Estado, string> = {
  Pendiente: "bg-urgent-soft text-urgent",
  "En Revisión": "bg-warning-soft text-warning-foreground",
  Resuelto: "bg-success-soft text-success",
};

// Cartelera inicial de avisos y actividades de la Comunidad Fabricio Ojeda
export const AVISOS_INICIALES: AvisoComunitario[] = [
  {
    id: "av-01",
    tipo: "Reunión",
    titulo: "Reunión general de vecinos de los 5 edificios",
    descripcion:
      "Nos reuniremos para acordar la reparación de la bomba de agua y la iluminación de la Entrada Principal y la Entrada Secundaria.",
    fechaEvento: "Este Sábado · 4:30 p. m.",
    lugar: "Cancha Deportiva",
    vocero: "Gerardo Valladares",
    cargoVocero: "Vocero Principal",
    confirmados: 42,
  },
  {
    id: "av-02",
    tipo: "Deporte en Cancha",
    titulo: "Torneo amistoso de fútbol sala y limpieza de la cancha",
    descripcion:
      "Invitamos a los jóvenes y familias de los 5 edificios a la tarde deportiva y mantenimiento de los arcos de nuestra única cancha.",
    fechaEvento: "Domingo · 9:00 a. m.",
    lugar: "Cancha Deportiva",
    vocero: "Carlos Montilla",
    cargoVocero: "Vocero de Deportes",
    confirmados: 36,
  },
  {
    id: "av-03",
    tipo: "Servicio",
    titulo: "Jornada de entrega de cilindros de Gas por edificio",
    descripcion:
      "Los voceros secundarios de cada edificio estarán anotando las bombonas en planta baja desde temprano.",
    fechaEvento: "Viernes · 8:00 a. m.",
    lugar: "Entrada Principal",
    vocero: "Carmen Berrios",
    cargoVocero: "Vocero Secundario (Edificio 2)",
    confirmados: 49,
  },
];

// Inicialmente la aplicación comienza limpia (0 reportes) para recibir incidencias reales
export const REPORTES_INICIALES: Reporte[] = [];

// Estadísticas adaptadas a los 170 habitantes de la Comunidad Fabricio Ojeda
export const ESTADISTICAS = {
  resueltosMes: 16,
  totalMes: 20,
  tiempoRespuestaDias: 1.5,
  tiempoRespuestaPrevio: 5.0,
  vecinosActivos: 152,
  totalHabitantes: 170,
  familiasRegistradas: 55,
  porCategoria: [
    { categoria: "Agua", reportes: 6, resueltos: 5 },
    { categoria: "Electricidad", reportes: 5, resueltos: 4 },
    { categoria: "Aseo", reportes: 4, resueltos: 3 },
    { categoria: "Cancha y Deporte", reportes: 3, resueltos: 2 },
    { categoria: "Entradas y Áreas", reportes: 2, resueltos: 2 },
  ],
  porMes: [
    { mes: "May", reportes: 12, resueltos: 9 },
    { mes: "Jun", reportes: 14, resueltos: 11 },
    { mes: "Jul", reportes: 15, resueltos: 13 },
    { mes: "Ago", reportes: 17, resueltos: 15 },
    { mes: "Sep", reportes: 19, resueltos: 16 },
    { mes: "Oct", reportes: 20, resueltos: 16 },
  ],
  tiempoPorCategoria: [
    { categoria: "Agua", dias: 1.1 },
    { categoria: "Electricidad", dias: 1.4 },
    { categoria: "Aseo", dias: 1.6 },
    { categoria: "Entradas y Áreas", dias: 1.8 },
    { categoria: "Cancha y Deporte", dias: 2.2 },
  ],
};
