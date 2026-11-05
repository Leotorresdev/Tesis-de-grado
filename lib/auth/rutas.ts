/**
 * Configuración central de rutas y permisos de la aplicación.
 */
export const RUTAS_PUBLICAS = ["/login", "/register"] as const;

/** Rutas visibles y accesibles únicamente para voceros. */
export const RUTAS_SOLO_VOCERO = ["/gestion"] as const;

const coincide = (pathname: string, ruta: string) =>
  pathname === ruta || pathname.startsWith(`${ruta}/`);

export function esRutaPublica(pathname: string) {
  return RUTAS_PUBLICAS.some((ruta) => coincide(pathname, ruta));
}

export function esRutaSoloVocero(pathname: string) {
  return RUTAS_SOLO_VOCERO.some((ruta) => coincide(pathname, ruta));
}
