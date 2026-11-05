"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { esRutaPublica, esRutaSoloVocero } from "@/lib/auth/rutas";
import { EncabezadoComunidad } from "@/components/layout/encabezado";
import { NavegacionInferior } from "@/components/layout/navegacion-inferior";

/**
 * Determina a dónde redirigir según sesión, rol y ruta actual (null = sin redirección).
 */
function calcularRedireccion(
  pathname: string,
  autenticado: boolean,
  esVocero: boolean
): string | null {
  const publica = esRutaPublica(pathname);
  if (!autenticado && !publica) return "/login";
  if (autenticado && publica) return esVocero ? "/gestion" : "/";
  if (autenticado && !esVocero && esRutaSoloVocero(pathname)) return "/";
  return null;
}

function PantallaCarga() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-background"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-sm font-medium">Verificando sesión…</span>
      </div>
    </div>
  );
}

/**
 * Estructura de la app: protege rutas y muestra la navegación solo con sesión iniciada.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { autenticado, esVocero, cargando } = useAuth();

  const destino = cargando
    ? null
    : calcularRedireccion(pathname, autenticado, esVocero);

  useEffect(() => {
    if (destino) router.replace(destino);
  }, [destino, router]);

  // Evita mostrar contenido protegido mientras se resuelve la sesión o se redirige
  if (cargando || destino) return <PantallaCarga />;

  if (esRutaPublica(pathname)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EncabezadoComunidad />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pb-12 md:pt-7">
        {children}
      </main>
      <NavegacionInferior />
    </div>
  );
}
