// lib/auth/auth-context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { RolUsuario } from "@/types/reportes";

/**
 * Perfil de cada habitante o vocero registrado en la Comunidad Fabricio Ojeda de Boconó.
 */
export type Perfil = {
  nombre: string;
  sector: string;
  casa: string;
  cargo: string;
  rol: RolUsuario;
  email?: string;
  avatar_url: string | null;
};

/**
 * Datos requeridos para registrar una nueva cuenta (sin confirmación de correo).
 */
export type DatosRegistro = {
  nombre: string;
  casa: string;
  sector: string;
  cargo: string;
  rol: RolUsuario;
  email: string;
  password: string;
};

export type ResumenUsuarioRegistrado = {
  nombre: string;
  email: string;
  rol: RolUsuario;
  cargo: string;
};

/**
 * Resultado uniforme de las operaciones de autenticación.
 */
export type ResultadoAuth = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  perfil: Perfil | null;
  rol: RolUsuario;
  esVocero: boolean;
  autenticado: boolean;
  cargando: boolean;
  usuariosRegistrados: ResumenUsuarioRegistrado[];
  iniciarSesion: (email: string, password: string) => Promise<ResultadoAuth>;
  registrarse: (datos: DatosRegistro) => Promise<ResultadoAuth>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_SESSION_KEY = "ojedaconecta_sesion_activa_v3";
const LOCAL_USERS_KEY = "ojedaconecta_usuarios_v3";
const SESSION_EVENT = "ojedaconecta_session_changed";

// Claves posibles donde puedan haberse guardado usuarios en pruebas anteriores
const CLAVES_USUARIOS_HISTORICAS = [
  LOCAL_USERS_KEY,
  "ojedaconecta_usuarios_v2",
  "ojedaconecta_usuarios_v1",
  "ojedaconecta_usuarios",
  "ojedaconecta_usuarios_locales_v1",
  "ojedaconecta_usuarios_locales",
  "nexobocono_usuarios_locales_v2",
  "nexobocono_usuarios_locales_v1",
  "nexobocono_usuarios_locales",
];

// Solo purgamos sesiones viejas, NUNCA las cuentas de usuarios registradas
const CLAVES_SESION_LEGACY = [
  "ojedaconecta_sesion_activa_v2",
  "ojedaconecta_sesion_activa_v1",
  "nexobocono_sesion_activa_v2",
  "nexobocono_sesion_activa_v1",
  "nexobocono_sesion_activa",
];

interface UsuarioLocal extends Perfil {
  email: string;
  password: string;
}

let cachedRaw: string | null = null;
let cachedPerfil: Perfil | null = null;

function getSessionSnapshot(): Perfil | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedPerfil = raw ? (JSON.parse(raw) as Perfil) : null;
    }
    return cachedPerfil;
  } catch {
    return null;
  }
}

function subscribeSession(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifySessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

let cachedUsersRaw: string | null = null;
let cachedUsersList: ResumenUsuarioRegistrado[] = [];

/**
 * Lee los usuarios locales buscando y consolidando en todas las versiones
 * históricas y claves de almacenamiento para no perder ninguna cuenta creada por el usuario.
 */
function leerUsuariosLocales(): UsuarioLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const mapa = new Map<string, UsuarioLocal>();

    // 1. Escaneo de claves históricas predefinidas
    for (const clave of CLAVES_USUARIOS_HISTORICAS) {
      const raw = window.localStorage.getItem(clave);
      if (raw) {
        try {
          const lista = JSON.parse(raw);
          if (Array.isArray(lista)) {
            for (const u of lista) {
              if (u && typeof u.email === "string" && typeof u.password === "string") {
                const emailNormalizado = u.email.trim().toLowerCase();
                if (emailNormalizado && !mapa.has(emailNormalizado)) {
                  mapa.set(emailNormalizado, {
                    nombre: typeof u.nombre === "string" ? u.nombre.trim() : "Vecino",
                    sector: typeof u.sector === "string" ? u.sector : "Edificio 1",
                    casa: typeof u.casa === "string" ? u.casa : "",
                    cargo:
                      typeof u.cargo === "string"
                        ? u.cargo
                        : u.rol === "vocero"
                        ? "Vocero Principal"
                        : "Vecino de la Comunidad",
                    rol: u.rol === "vocero" ? "vocero" : "vecino",
                    email: emailNormalizado,
                    password: u.password.trim(),
                    avatar_url: u.avatar_url ?? null,
                  });
                }
              }
            }
          }
        } catch {
          // Ignorar JSON corrupto
        }
      }
    }

    // 2. Escaneo dinámico de cualquier clave residual que mencione "usuario" o "user"
    for (let i = 0; i < window.localStorage.length; i++) {
      const keyName = window.localStorage.key(i);
      if (
        keyName &&
        (keyName.toLowerCase().includes("usuario") || keyName.toLowerCase().includes("user")) &&
        !keyName.toLowerCase().includes("sesion") &&
        !keyName.toLowerCase().includes("session")
      ) {
        const raw = window.localStorage.getItem(keyName);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            const lista = Array.isArray(data) ? data : [data];
            for (const u of lista) {
              if (u && typeof u.email === "string" && typeof u.password === "string") {
                const emailNormalizado = u.email.trim().toLowerCase();
                if (emailNormalizado && !mapa.has(emailNormalizado)) {
                  mapa.set(emailNormalizado, {
                    nombre: typeof u.nombre === "string" ? u.nombre.trim() : "Vecino",
                    sector: typeof u.sector === "string" ? u.sector : "Edificio 1",
                    casa: typeof u.casa === "string" ? u.casa : "",
                    cargo:
                      typeof u.cargo === "string"
                        ? u.cargo
                        : u.rol === "vocero"
                        ? "Vocero Principal"
                        : "Vecino de la Comunidad",
                    rol: u.rol === "vocero" ? "vocero" : "vecino",
                    email: emailNormalizado,
                    password: u.password.trim(),
                    avatar_url: u.avatar_url ?? null,
                  });
                }
              }
            }
          } catch {
            // Ignorar formatos distintos
          }
        }
      }
    }

    const todos = Array.from(mapa.values());
    if (todos.length > 0) {
      const serializado = JSON.stringify(todos);
      window.localStorage.setItem(LOCAL_USERS_KEY, serializado);
      cachedUsersRaw = serializado;
    }
    return todos;
  } catch {
    return [];
  }
}

function getRegisteredUsersSnapshot(): ResumenUsuarioRegistrado[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    if (raw !== cachedUsersRaw) {
      cachedUsersRaw = raw;
      const parsed = leerUsuariosLocales();
      cachedUsersList = parsed.map((u) => ({
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        cargo: u.cargo,
      }));
    }
    return cachedUsersList;
  } catch {
    return [];
  }
}

function guardarUsuarioLocal(usuario: UsuarioLocal) {
  if (typeof window === "undefined") return;
  try {
    const lista = leerUsuariosLocales().filter(
      (u) => u.email.toLowerCase() !== usuario.email.toLowerCase()
    );
    lista.push(usuario);
    const serializado = JSON.stringify(lista);
    window.localStorage.setItem(LOCAL_USERS_KEY, serializado);
    cachedUsersRaw = null;
    notifySessionChange();
  } catch {
    // Ignorar si localStorage no está disponible
  }
}

function guardarSesionActiva(perfil: Perfil | null) {
  if (typeof window === "undefined") return;
  try {
    if (perfil) {
      const serializado = JSON.stringify(perfil);
      window.localStorage.setItem(LOCAL_SESSION_KEY, serializado);
      cachedRaw = serializado;
      cachedPerfil = perfil;
    } else {
      window.localStorage.removeItem(LOCAL_SESSION_KEY);
      for (const k of CLAVES_SESION_LEGACY) {
        window.localStorage.removeItem(k);
      }
      cachedRaw = null;
      cachedPerfil = null;
    }
    notifySessionChange();
  } catch {
    // Ignorar errores de almacenamiento
  }
}

const subscribeClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Proveedor de autenticación directa para la tesis OjedaConecta.
 * Permite registrarse e iniciar sesión al instante sin necesidad de confirmar el correo electrónico.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const montado = useSyncExternalStore(
    subscribeClient,
    getClientSnapshot,
    getServerSnapshot
  );

  const perfil = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    () => null
  );

  const usuariosRegistrados = useSyncExternalStore(
    subscribeSession,
    getRegisteredUsersSnapshot,
    () => []
  );

  const cargando = !montado;

  const iniciarSesion = useCallback(
    async (email: string, password: string): Promise<ResultadoAuth> => {
      const identificadorLimpio = email.trim().toLowerCase();
      const passIngresada = password.trim();
      const locales = leerUsuariosLocales();

      // Permite buscar tanto por correo como por nombre registrado
      const cuentaEncontrada = locales.find(
        (u) =>
          u.email.toLowerCase() === identificadorLimpio ||
          (u.nombre && u.nombre.trim().toLowerCase() === identificadorLimpio)
      );

      if (!cuentaEncontrada) {
        return {
          ok: false,
          error: `No encontramos ninguna cuenta con el correo o usuario "${email.trim()}" en este navegador. Si te registraste en otra dirección (ej. en Vercel vs localhost) o en modo incógnito, recuerda registrarte una vez aquí para ingresar.`,
        };
      }

      const passGuardada = (cuentaEncontrada.password || "").trim();
      const passCoincide =
        cuentaEncontrada.password === password ||
        passGuardada === passIngresada;

      if (!passCoincide) {
        return {
          ok: false,
          error: "La clave ingresada no coincide con la de esta cuenta. Verifica mayúsculas y minúsculas.",
        };
      }

      const perfilLimpio: Perfil = {
        nombre: cuentaEncontrada.nombre,
        sector: cuentaEncontrada.sector,
        casa: cuentaEncontrada.casa,
        cargo: cuentaEncontrada.cargo,
        rol: cuentaEncontrada.rol,
        email: cuentaEncontrada.email,
        avatar_url: cuentaEncontrada.avatar_url,
      };

      guardarSesionActiva(perfilLimpio);
      return { ok: true };
    },
    []
  );

  const registrarse = useCallback(
    async (datos: DatosRegistro): Promise<ResultadoAuth> => {
      const rol: RolUsuario = datos.rol === "vocero" ? "vocero" : "vecino";
      const emailLimpio = datos.email.trim().toLowerCase();
      const passLimpia = datos.password.trim();
      const cargoFinal =
        rol === "vocero" ? datos.cargo : "Vecino de la Comunidad";

      const nuevoPerfil: Perfil = {
        nombre: datos.nombre.trim(),
        casa: datos.casa.trim(),
        sector: datos.sector,
        cargo: cargoFinal,
        rol,
        email: emailLimpio,
        avatar_url: null,
      };

      // Guardamos el usuario con contraseña limpia y activamos su sesión de inmediato
      guardarUsuarioLocal({
        ...nuevoPerfil,
        email: emailLimpio,
        password: passLimpia,
      });

      guardarSesionActiva(nuevoPerfil);
      return { ok: true };
    },
    []
  );

  const cerrarSesion = useCallback(async () => {
    guardarSesionActiva(null);
  }, []);

  const rol: RolUsuario = perfil?.rol ?? "vecino";

  const value = useMemo<AuthContextValue>(
    () => ({
      perfil,
      rol,
      esVocero: rol === "vocero",
      autenticado: !!perfil,
      cargando,
      usuariosRegistrados,
      iniciarSesion,
      registrarse,
      cerrarSesion,
    }),
    [
      perfil,
      rol,
      cargando,
      usuariosRegistrados,
      iniciarSesion,
      registrarse,
      cerrarSesion,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir el estado de autenticación y rol activo (Vecino / Vocero).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
}
