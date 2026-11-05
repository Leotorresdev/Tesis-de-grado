import {
  BarChart3,
  LayoutList,
  PanelsTopLeft,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { esRutaSoloVocero } from "@/lib/auth/rutas";

export type ItemNavegacion = {
  href: string;
  label: string;
  labelCorto: string;
  icon: LucideIcon;
};

const ITEMS: ItemNavegacion[] = [
  { href: "/", label: "Panel", labelCorto: "Feed", icon: LayoutList },
  { href: "/reportar", label: "Reportar", labelCorto: "Reportar", icon: PlusCircle },
  { href: "/gestion", label: "Gestión", labelCorto: "Gestión", icon: PanelsTopLeft },
  { href: "/transparencia", label: "Rendición de Cuentas", labelCorto: "Resumen", icon: BarChart3 },
];

/**
 * Devuelve los enlaces visibles según el rol: /gestion solo aparece para voceros.
 */
export function obtenerItemsNavegacion(esVocero: boolean) {
  return ITEMS.filter((item) => esVocero || !esRutaSoloVocero(item.href));
}

export function esItemActivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
