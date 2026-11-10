"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, LogIn, Mail, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  tieneErrores,
  validarLogin,
  type CamposLogin,
  type ErroresFormulario,
} from "@/lib/auth/validacion";
import { AuthShell } from "@/components/auth/auth-shell";
import { AlertaFormulario, CampoClave, CampoTexto } from "@/components/auth/campos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pantalla de inicio de sesión para la Comunidad Fabricio Ojeda.
 * La redirección tras el login la gestiona AppShell (vocero → /gestion, vecino → /).
 */
export default function LoginPage() {
  const { iniciarSesion, usuariosRegistrados } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errores, setErrores] = useState<ErroresFormulario<CamposLogin>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo: CamposLogin, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setErrorGeneral(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevosErrores = validarLogin(form);
    setErrores(nuevosErrores);
    if (tieneErrores(nuevosErrores)) return;

    setEnviando(true);
    const resultado = await iniciarSesion(form.email, form.password);
    setEnviando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }
    toast.success("¡Bienvenido a la Comunidad Fabricio Ojeda!");
  }

  return (
    <AuthShell>
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Entrar a OjedaConecta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escribe tu correo y tu clave para entrar a la Comunidad Fabricio Ojeda.
        </p>
      </header>

      <form onSubmit={enviar} noValidate className="space-y-4" aria-busy={enviando}>
        <AlertaFormulario mensaje={errorGeneral} />

        {usuariosRegistrados.length > 0 && (
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              Cuentas registradas en este equipo (clic para autocompletar correo):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {usuariosRegistrados.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => actualizar("email", u.email)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:text-primary cursor-pointer shadow-2xs"
                  title={`Rol: ${u.rol === "vocero" ? u.cargo : "Vecino"} · Correo: ${u.email}`}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      u.rol === "vocero" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                  <span className="font-semibold">{u.nombre}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({u.rol === "vocero" ? "Vocero" : "Vecino"})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <CampoTexto
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          icono={<Mail className="h-4 w-4" />}
          value={form.email}
          error={errores.email}
          onChange={(e) => actualizar("email", e.target.value)}
        />

        <CampoClave
          label="Tu clave"
          autoComplete="current-password"
          placeholder="Escribe tu clave"
          value={form.password}
          error={errores.password}
          onChange={(e) => actualizar("password", e.target.value)}
        />

        <Button
          type="submit"
          disabled={enviando}
          className="h-12 w-full rounded-xl text-sm font-bold cursor-pointer"
        >
          {enviando ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden />
          )}
          <span>{enviando ? "Entrando…" : "Entrar a mi cuenta"}</span>
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Regístrate aquí (Vecino o Vocero)
        </Link>
      </p>
    </AuthShell>
  );
}
