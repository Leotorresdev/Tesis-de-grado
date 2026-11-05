import { redirect } from "next/navigation";

/**
 * Ruta heredada: el acceso ahora vive en /login y /register.
 */
export default function AuthPage() {
  redirect("/login");
}
