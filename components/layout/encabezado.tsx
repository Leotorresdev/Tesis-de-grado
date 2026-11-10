"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftRight, LogOut, ShieldAlert, Sprout, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { COMUNIDAD_INFO } from "@/types/reportes";
import { cn } from "@/lib/utils";
import {
  esItemActivo,
  obtenerItemsNavegacion,
} from "@/components/layout/items-navegacion";

/**
 * Encabezado institucional de OjedaConecta.
 * Muestra la navegación según el rol y los datos de la sesión activa.
 */
export function EncabezadoComunidad() {
  const pathname = usePathname();
  const router = useRouter();
  const { perfil, esVocero, cerrarSesion, cambiarPerfil } = useAuth();
  const items = obtenerItemsNavegacion(esVocero);

  async function alternarRol() {
    const nuevoRol = esVocero ? "vecino" : "vocero";
    await cambiarPerfil(nuevoRol);
    toast.success(
      nuevoRol === "vocero"
        ? "Cambiado a perfil de Vocero (acceso a Gestión activado)"
        : "Cambiado a perfil de Vecino (vista de habitante comunitario)"
    );
    if (nuevoRol === "vecino" && pathname.startsWith("/gestion")) {
      router.replace("/");
    }
  }

  async function salir() {
    try {
      await cerrarSesion();
      toast.success("Sesión cerrada");
      router.replace("/login");
    } catch {
      router.push("/login");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        {/* Marca e Identidad de Boconó */}
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-community-dark text-community-gold shadow-[var(--shadow-card)] transition-transform group-hover:scale-105">
            <Sprout className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 truncate font-display text-base font-bold tracking-tight">
              Ojeda<span className="text-primary">Conecta</span>
              <span className="hidden rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary sm:inline-block">
                170 hab.
              </span>
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {COMUNIDAD_INFO.nombre} · {COMUNIDAD_INFO.municipio}
            </span>
          </span>
        </Link>

        {/* Navegación Central (Desktop) */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          {items.map(({ href, label, icon: Icon }) => {
            const activo = esItemActivo(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                  activo
                    ? "bg-primary-soft text-primary shadow-[inset_0_0_0_1px_var(--primary)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Datos de sesión y salida */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold",
              esVocero
                ? "border-amber-500/40 bg-warning-soft text-warning-foreground"
                : "border-primary/30 bg-primary-soft text-primary"
            )}
          >
            {esVocero ? (
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" aria-hidden />
            ) : (
              <UserCheck className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {perfil?.nombre.split(" ")[0]} ·{" "}
            </span>
            <span>{esVocero ? "Vocero" : "Vecino"}</span>
          </span>

          {/* Botón para alternar inmediatamente entre perfil Vocero y Vecino */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void alternarRol()}
            title={
              esVocero
                ? "Cambiar a vista de Vecino (probar la aplicación sin acceso a Gestión)"
                : "Cambiar a vista de Vocero (probar el acceso exclusivo a Gestión)"
            }
            className="h-8.5 px-2 sm:px-2.5 rounded-xl text-xs font-semibold border-primary/30 bg-card hover:bg-primary-soft hover:text-primary transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="hidden sm:inline">
              {esVocero ? "Ver como Vecino" : "Ver como Vocero"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={() => void salir()}
            className="h-9 px-2 sm:px-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline text-xs font-semibold">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
