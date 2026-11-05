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
  iniciarSesion: (email: string, password: string) => Promise<ResultadoAuth>;
  registrarse: (datos: DatosRegistro) => Promise<ResultadoAuth>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_SESSION_KEY = "ojedaconecta_sesion_activa_v3";
const LOCAL_USERS_KEY = "ojedaconecta_usuarios_v3";
const SESSION_EVENT = "ojedaconecta_session_changed";
const CLAVES_A_PURGAR = [
  "ojedaconecta_usuarios_v2",
  "ojedaconecta_sesion_activa_v2",
  "ojedaconecta_usuarios_locales_v1",
  "ojedaconecta_sesion_activa_v1",
  "nexobocono_usuarios_locales_v2",
  "nexobocono_usuarios_locales_v1",
  "nexobocono_usuarios_locales",
  "nexobocono_sesion_activa_v2",
  "nexobocono_sesion_activa_v1",
  "nexobocono_sesion_activa",
];

function purgarClavesHistoricas() {
  if (typeof window === "undefined") return;
  try {
    for (const key of CLAVES_A_PURGAR) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignorar si localStorage no está disponible
  }
}

// Limpieza automática al cargar el módulo en el navegador
if (typeof window !== "undefined") {
  purgarClavesHistoricas();
}

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

function leerUsuariosLocales(): UsuarioLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as UsuarioLocal[]) : [];
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
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(lista));
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
      purgarClavesHistoricas();
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

  const cargando = !montado;

  const iniciarSesion = useCallback(
    async (email: string, password: string): Promise<ResultadoAuth> => {
      const emailLimpio = email.trim().toLowerCase();
      const locales = leerUsuariosLocales();

      const cuentaPorCorreo = locales.find(
        (u) => u.email.toLowerCase() === emailLimpio
      );

      if (!cuentaPorCorreo) {
        return {
          ok: false,
          error:
            "No encontramos ese correo. Regístrate primero (no necesitas confirmar el correo).",
        };
      }

      if (cuentaPorCorreo.password !== password) {
        return {
          ok: false,
          error: "La clave ingresada no coincide con la de esta cuenta.",
        };
      }

      const perfilLimpio: Perfil = {
        nombre: cuentaPorCorreo.nombre,
        sector: cuentaPorCorreo.sector,
        casa: cuentaPorCorreo.casa,
        cargo: cuentaPorCorreo.cargo,
        rol: cuentaPorCorreo.rol,
        email: cuentaPorCorreo.email,
        avatar_url: cuentaPorCorreo.avatar_url,
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

      // Guardamos el usuario y activamos su sesión de inmediato sin enviar correo de confirmación
      guardarUsuarioLocal({
        ...nuevoPerfil,
        email: emailLimpio,
        password: datos.password,
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
      iniciarSesion,
      registrarse,
      cerrarSesion,
    }),
    [perfil, rol, cargando, iniciarSesion, registrarse, cerrarSesion]
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
