// lib/store/use-auth-store.ts
"use client";

import { create } from "zustand";
import type { RolUsuario } from "@/types/reportes";

/**
 * Perfil público del habitante o vocero.
 */
export type Perfil = {
  id?: string;
  nombre: string;
  sector: string;
  casa: string;
  cargo: string;
  rol: RolUsuario;
  email: string;
  avatar_url: string | null;
};

/**
 * Cuenta de usuario persistida con credenciales locales.
 */
export interface CuentaUsuario extends Perfil {
  id: string;
  password: string;
}

/**
 * Datos requeridos para registrar una cuenta comunal.
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

export type ResultadoAuth = { ok: true } | { ok: false; error: string };

const AUTH_STORE_KEY = "ojedaconecta_auth_store_v2";
const ACTIVE_SESSION_KEY = "ojedaconecta_sesion_activa_v3";
const LEGACY_USERS_KEY = "ojedaconecta_usuarios_v3";

const CLAVES_HISTORICAS = [
  LEGACY_USERS_KEY,
  "ojedaconecta_usuarios_v2",
  "ojedaconecta_usuarios_v1",
  "ojedaconecta_usuarios",
  "ojedaconecta_usuarios_locales_v1",
  "ojedaconecta_usuarios_locales",
  "nexobocono_usuarios_locales_v2",
  "nexobocono_usuarios_locales_v1",
];

export const CUENTAS_SEMILLA: CuentaUsuario[] = [
  {
    id: "semilla_vocero",
    nombre: "Vocero Principal",
    email: "vocero@ojeda.com",
    password: "1234",
    sector: "Edificio 1",
    casa: "Apto 1-A",
    cargo: "Vocero Principal",
    rol: "vocero",
    avatar_url: null,
  },
  {
    id: "semilla_vecino",
    nombre: "Vecino Residente",
    email: "vecino@ojeda.com",
    password: "1234",
    sector: "Edificio 2",
    casa: "Apto 2-B",
    cargo: "Vecino de la Comunidad",
    rol: "vecino",
    avatar_url: null,
  },
];

function persistirEnStorage(sesion: CuentaUsuario | null, cuentas: CuentaUsuario[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(cuentas));
    window.localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(cuentas));

    if (sesion) {
      window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sesion));
    } else {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
      window.localStorage.removeItem("ojedaconecta_sesion_activa_v2");
      window.localStorage.removeItem("ojedaconecta_sesion_activa_v1");
    }
  } catch {
    // Si localStorage está bloqueado o lleno, continúa en memoria
  }
}

function recuperarCuentasDeStorage(): { cuentas: CuentaUsuario[]; sesion: CuentaUsuario | null } {
  if (typeof window === "undefined") {
    return { cuentas: CUENTAS_SEMILLA, sesion: null };
  }

  try {
    const mapa = new Map<string, CuentaUsuario>();

    // 1. Revisar store principal
    const rawStore = window.localStorage.getItem(AUTH_STORE_KEY);
    if (rawStore) {
      try {
        const lista = JSON.parse(rawStore);
        if (Array.isArray(lista)) {
          for (const c of lista) {
            if (c && c.email && c.rol) {
              const claveUnica = `${c.email.trim().toLowerCase()}__${c.rol}`;
              mapa.set(claveUnica, {
                id: c.id || `cuenta_${c.rol}_${c.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
                nombre: c.nombre || "Habitante",
                email: c.email.trim().toLowerCase(),
                password: (c.password || "").trim(),
                sector: c.sector || "Edificio 1",
                casa: c.casa || "",
                cargo: c.cargo || (c.rol === "vocero" ? "Vocero Principal" : "Vecino de la Comunidad"),
                rol: c.rol === "vocero" ? "vocero" : "vecino",
                avatar_url: c.avatar_url ?? null,
              });
            }
          }
        }
      } catch {}
    }

    // 2. Escanear claves históricas
    for (const k of CLAVES_HISTORICAS) {
      const raw = window.localStorage.getItem(k);
      if (raw) {
        try {
          const lista = JSON.parse(raw);
          if (Array.isArray(lista)) {
            for (const c of lista) {
              if (c && c.email && typeof c.password === "string") {
                const rol: RolUsuario = c.rol === "vocero" ? "vocero" : "vecino";
                const claveUnica = `${c.email.trim().toLowerCase()}__${rol}`;
                if (!mapa.has(claveUnica)) {
                  mapa.set(claveUnica, {
                    id: c.id || `cuenta_${rol}_${c.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
                    nombre: typeof c.nombre === "string" ? c.nombre.trim() : "Habitante",
                    email: c.email.trim().toLowerCase(),
                    password: c.password.trim(),
                    sector: c.sector || "Edificio 1",
                    casa: c.casa || "",
                    cargo: c.cargo || (rol === "vocero" ? "Vocero Principal" : "Vecino de la Comunidad"),
                    rol,
                    avatar_url: c.avatar_url ?? null,
                  });
                }
              }
            }
          }
        } catch {}
      }
    }

    // 3. Si no hay cuentas de algún rol, asegurar que existan las semillas
    for (const semilla of CUENTAS_SEMILLA) {
      const claveUnica = `${semilla.email}__${semilla.rol}`;
      const tieneRol = Array.from(mapa.values()).some((c) => c.rol === semilla.rol);
      if (!tieneRol && !mapa.has(claveUnica)) {
        mapa.set(claveUnica, semilla);
      }
    }

    const todas = Array.from(mapa.values());

    // 4. Leer sesión activa
    let sesionActiva: CuentaUsuario | null = null;
    const rawSesion = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (rawSesion) {
      try {
        const parsed = JSON.parse(rawSesion);
        if (parsed && parsed.email) {
          const rol: RolUsuario = parsed.rol === "vocero" ? "vocero" : "vecino";
          const match = todas.find(
            (c) => c.email.toLowerCase() === parsed.email.toLowerCase() && c.rol === rol
          );
          if (match) {
            sesionActiva = match;
          } else {
            sesionActiva = {
              id: parsed.id || `sesion_${Date.now()}`,
              nombre: parsed.nombre || "Habitante",
              email: parsed.email,
              password: parsed.password || "1234",
              sector: parsed.sector || "Edificio 1",
              casa: parsed.casa || "",
              cargo: parsed.cargo || (rol === "vocero" ? "Vocero Principal" : "Vecino"),
              rol,
              avatar_url: parsed.avatar_url ?? null,
            };
          }
        }
      } catch {}
    }

    persistirEnStorage(sesionActiva, todas);
    return { cuentas: todas, sesion: sesionActiva };
  } catch {
    return { cuentas: CUENTAS_SEMILLA, sesion: null };
  }
}

interface AuthStoreState {
  sesionActiva: CuentaUsuario | null;
  cuentas: CuentaUsuario[];
  hidratado: boolean;

  inicializar: () => void;
  iniciarSesion: (
    identificador: string,
    password: string,
    rolDeseado?: RolUsuario
  ) => ResultadoAuth;
  iniciarSesionDirecta: (idOEmail: string, rol?: RolUsuario) => ResultadoAuth;
  registrarse: (datos: DatosRegistro) => ResultadoAuth;
  cerrarSesion: () => void;
  cambiarPerfil: (idORol: string) => boolean;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  sesionActiva: null,
  cuentas: CUENTAS_SEMILLA,
  hidratado: false,

  inicializar: () => {
    if (get().hidratado) return;
    const { cuentas, sesion } = recuperarCuentasDeStorage();
    set({
      cuentas,
      sesionActiva: sesion,
      hidratado: true,
    });
  },

  iniciarSesion: (identificador, password, rolDeseado) => {
    const idLimpio = identificador.trim().toLowerCase();
    const passLimpia = password.trim();
    const { cuentas } = get();

    let candidatas = cuentas.filter(
      (c) =>
        c.email.toLowerCase() === idLimpio ||
        c.id.toLowerCase() === idLimpio ||
        (c.nombre && c.nombre.trim().toLowerCase() === idLimpio)
    );

    if (candidatas.length === 0) {
      return {
        ok: false,
        error: `No encontramos ninguna cuenta con el correo o usuario "${identificador.trim()}". Regístrate primero o pulsa directamente en uno de los perfiles disponibles.`,
      };
    }

    if (rolDeseado) {
      const matchRol = candidatas.find((c) => c.rol === rolDeseado);
      if (matchRol) {
        candidatas = [matchRol];
      }
    }

    const cuentaValida = candidatas.find(
      (c) => c.password === password || c.password.trim() === passLimpia
    );

    if (!cuentaValida) {
      return {
        ok: false,
        error: "La clave ingresada no es correcta. Verifica mayúsculas y minúsculas.",
      };
    }

    persistirEnStorage(cuentaValida, cuentas);
    set({ sesionActiva: cuentaValida });
    return { ok: true };
  },

  iniciarSesionDirecta: (idOEmail, rol) => {
    const { cuentas } = get();
    const query = idOEmail.trim().toLowerCase();

    const cuenta = cuentas.find(
      (c) =>
        (c.id.toLowerCase() === query || c.email.toLowerCase() === query) &&
        (!rol || c.rol === rol)
    );

    if (!cuenta) {
      return { ok: false, error: "Perfil no encontrado en este dispositivo." };
    }

    persistirEnStorage(cuenta, cuentas);
    set({ sesionActiva: cuenta });
    return { ok: true };
  },

  registrarse: (datos) => {
    const rol: RolUsuario = datos.rol === "vocero" ? "vocero" : "vecino";
    const emailLimpio = datos.email.trim().toLowerCase();
    const passLimpia = datos.password.trim();
    const cargoFinal = rol === "vocero" ? datos.cargo : "Vecino de la Comunidad";

    const { cuentas } = get();
    const idCuenta = `cuenta_${rol}_${emailLimpio.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const nuevaCuenta: CuentaUsuario = {
      id: idCuenta,
      nombre: datos.nombre.trim(),
      casa: datos.casa.trim(),
      sector: datos.sector,
      cargo: cargoFinal,
      rol,
      email: emailLimpio,
      password: passLimpia,
      avatar_url: null,
    };

    // Actualiza o agrega la cuenta DE ESE ROL.
    // NUNCA borra la cuenta del otro rol aunque compartan el mismo correo.
    const restantes = cuentas.filter(
      (c) => !(c.email.toLowerCase() === emailLimpio && c.rol === rol) && c.id !== idCuenta
    );
    const actualizadas = [nuevaCuenta, ...restantes];

    persistirEnStorage(nuevaCuenta, actualizadas);
    set({
      sesionActiva: nuevaCuenta,
      cuentas: actualizadas,
    });

    return { ok: true };
  },

  cerrarSesion: () => {
    const { cuentas } = get();
    persistirEnStorage(null, cuentas);
    set({ sesionActiva: null });
  },

  cambiarPerfil: (idORol) => {
    const { cuentas, sesionActiva } = get();
    const query = idORol.trim().toLowerCase();

    // 1. Buscar coincidencia exacta por rol (vocero o vecino)
    let objetivo = cuentas.find((c) => c.rol === query);

    // 2. Si no, buscar por id o email
    if (!objetivo) {
      objetivo = cuentas.find(
        (c) => c.id.toLowerCase() === query || c.email.toLowerCase() === query
      );
    }

    // 3. Si no existe aún una cuenta con el rol solicitado, crearla automáticamente como clon
    if (!objetivo && (query === "vecino" || query === "vocero")) {
      const rolNuevo: RolUsuario = query === "vocero" ? "vocero" : "vecino";
      const base = sesionActiva || cuentas[0];
      const nuevaCuenta: CuentaUsuario = {
        id: `perfil_${rolNuevo}_${Date.now()}`,
        nombre: base?.nombre || (rolNuevo === "vocero" ? "Vocero Comunal" : "Vecino de la Comunidad"),
        email: base?.email || `${rolNuevo}@ojeda.com`,
        password: base?.password || "1234",
        sector: base?.sector || "Edificio 1",
        casa: base?.casa || "Apto 1-A",
        cargo: rolNuevo === "vocero" ? "Vocero Principal" : "Vecino de la Comunidad",
        rol: rolNuevo,
        avatar_url: null,
      };

      const nuevasCuentas = [nuevaCuenta, ...cuentas];
      persistirEnStorage(nuevaCuenta, nuevasCuentas);
      set({ sesionActiva: nuevaCuenta, cuentas: nuevasCuentas });
      return true;
    }

    if (objetivo) {
      persistirEnStorage(objetivo, cuentas);
      set({ sesionActiva: objetivo });
      return true;
    }

    return false;
  },
}));
