"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  esItemActivo,
  obtenerItemsNavegacion,
} from "@/components/layout/items-navegacion";

/**
 * Barra de navegación inferior optimizada para dispositivos móviles con soporte para safe-area.
 */
export function NavegacionInferior() {
  const pathname = usePathname();
  const { esVocero } = useAuth();
  const items = obtenerItemsNavegacion(esVocero);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ href, labelCorto, icon: Icon }) => {
          const activo = esItemActivo(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "group flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                activo ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  activo && "bg-primary-soft text-primary"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="truncate">{labelCorto}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
