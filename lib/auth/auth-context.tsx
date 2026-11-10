// lib/auth/auth-context.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import type { RolUsuario } from "@/types/reportes";
import {
  useAuthStore,
  type CuentaUsuario,
  type DatosRegistro,
  type Perfil,
  type ResultadoAuth,
} from "@/lib/store/use-auth-store";

export type { CuentaUsuario, DatosRegistro, Perfil, ResultadoAuth };

export type ResumenUsuarioRegistrado = {
  nombre: string;
  email: string;
  rol: RolUsuario;
  cargo: string;
};

/**
 * Proveedor de autenticación que hidrata el store centralizado de Zustand.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().inicializar();
  }, []);

  return <>{children}</>;
}

/**
 * Hook universal de autenticación para toda la aplicación.
 * Conecta directamente al store reactivo de Zustand garantizando persistencia
 * multi-perfil (Vocero y Vecino nunca se sobreescriben).
 */
export function useAuth() {
  const store = useAuthStore();
  const perfil = store.sesionActiva;
  const rol: RolUsuario = perfil?.rol ?? "vecino";

  const usuariosRegistrados: ResumenUsuarioRegistrado[] = store.cuentas.map((c) => ({
    nombre: c.nombre,
    email: c.email,
    rol: c.rol,
    cargo: c.cargo,
  }));

  return {
    perfil,
    rol,
    esVocero: rol === "vocero",
    autenticado: !!perfil,
    cargando: !store.hidratado,
    cuentas: store.cuentas,
    usuariosRegistrados,
    iniciarSesion: store.iniciarSesion,
    iniciarSesionDirecta: store.iniciarSesionDirecta,
    registrarse: store.registrarse,
    cerrarSesion: async () => {
      store.cerrarSesion();
    },
    cambiarPerfil: async (idORol: string) => {
      return store.cambiarPerfil(idORol);
    },
  };
}
