import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases condicionales y resuelve conflictos de Tailwind CSS.
 * @param inputs Clases a combinar (strings, objetos, arrays).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
