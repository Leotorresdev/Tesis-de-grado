// lib/auth/validacion.ts
import type { RolUsuario } from "@/types/reportes";

/**
 * Validaciones de formularios de autenticación (cliente) para el proyecto de tesis.
 * Sin bloqueo por confirmación de correo electrónico.
 */
export type ErroresFormulario<T extends string> = Partial<Record<T, string>>;

export const LONGITUD_MIN_CLAVE = 3;

/** Elimina caracteres de control y espacios repetidos. */
export function limpiarTexto(valor: string, max = 80) {
  return valor
    .replace(/[\u0000-\u001F\u007F<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export type CamposLogin = "email" | "password";

export function validarLogin(datos: { email: string; password: string }) {
  const errores: ErroresFormulario<CamposLogin> = {};
  if (datos.email.trim().length < 3)
    errores.email = "Ingresa tu correo o usuario.";
  if (!datos.password) errores.password = "Ingresa tu clave.";
  return errores;
}

export type CamposRegistro = "nombre" | "casa" | "email" | "password";

export function validarRegistro(datos: {
  nombre: string;
  casa: string;
  email: string;
  password: string;
  rol: RolUsuario;
}) {
  const errores: ErroresFormulario<CamposRegistro> = {};
  if (limpiarTexto(datos.nombre).length < 3)
    errores.nombre = "Escribe tu nombre y apellido.";
  if (limpiarTexto(datos.casa).length < 2)
    errores.casa = "Indica tu familia o número de apartamento.";
  if (datos.email.trim().length < 3)
    errores.email = "Ingresa un correo (no requiere confirmación).";
  if (datos.password.length < LONGITUD_MIN_CLAVE)
    errores.password = `Mínimo ${LONGITUD_MIN_CLAVE} caracteres.`;
  return errores;
}

export const tieneErrores = (errores: object) =>
  Object.keys(errores).length > 0;
