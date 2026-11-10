// app/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, LogIn, Mail, ShieldAlert, UserCheck } from "lucide-react";
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

/**
 * Pantalla de inicio de sesión para la Comunidad Fabricio Ojeda.
 * Admite acceso rápido con 1 clic por rol y formulario con correo/clave.
 */
export default function LoginPage() {
  const { iniciarSesion, iniciarSesionDirecta, cuentas } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errores, setErrores] = useState<ErroresFormulario<CamposLogin>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Perfiles representativos de cada rol guardados en este equipo
  const cuentaVocero = cuentas.find((c) => c.rol === "vocero");
  const cuentaVecino = cuentas.find((c) => c.rol === "vecino");

  function actualizar(campo: CamposLogin, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setErrorGeneral(null);
  }

  function entrarDirecto(id: string, rol: "vocero" | "vecino") {
    setEnviando(true);
    const res = iniciarSesionDirecta(id, rol);
    setEnviando(false);
    if (res.ok) {
      toast.success(
        rol === "vocero"
          ? "¡Bienvenido Vocero! Acceso habilitado al panel de Gestión."
          : "¡Bienvenido Vecino! Entrando al muro comunitario."
      );
    } else {
      setErrorGeneral(res.error);
    }
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
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Entrar a OjedaConecta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona tu perfil de acceso o escribe tu correo y clave.
        </p>
      </header>

      {/* 1. Acceso directo con 1 clic por perfil guardado */}
      <div className="mb-5 space-y-2">
        <p className="text-xs font-bold text-foreground">
          Acceso rápido por perfil (1 clic):
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {cuentaVocero && (
            <button
              type="button"
              disabled={enviando}
              onClick={() => entrarDirecto(cuentaVocero.id, "vocero")}
              className="group flex flex-col items-start gap-1 rounded-2xl border border-amber-500/30 bg-warning-soft/30 p-3 text-left transition hover:border-amber-500 hover:bg-warning-soft/60 cursor-pointer shadow-2xs"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Vocero
                </span>
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  Con Gestión
                </span>
              </div>
              <p className="truncate text-xs font-semibold text-foreground">
                {cuentaVocero.nombre}
              </p>
              <span className="text-[11px] font-bold text-amber-700 group-hover:underline">
                Entrar como Vocero →
              </span>
            </button>
          )}

          {cuentaVecino && (
            <button
              type="button"
              disabled={enviando}
              onClick={() => entrarDirecto(cuentaVecino.id, "vecino")}
              className="group flex flex-col items-start gap-1 rounded-2xl border border-primary/30 bg-primary-soft/30 p-3 text-left transition hover:border-primary hover:bg-primary-soft/60 cursor-pointer shadow-2xs"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Vecino
                </span>
                <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  Sin Gestión
                </span>
              </div>
              <p className="truncate text-xs font-semibold text-foreground">
                {cuentaVecino.nombre}
              </p>
              <span className="text-[11px] font-bold text-primary group-hover:underline">
                Entrar como Vecino →
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="relative mb-4 flex items-center justify-center">
        <span className="absolute inset-x-0 h-px bg-border/80" />
        <span className="relative bg-card px-2 text-[11px] font-semibold uppercase text-muted-foreground">
          O escribe tus datos
        </span>
      </div>

      {/* 2. Formulario estándar con correo y contraseña */}
      <form onSubmit={enviar} noValidate className="space-y-3.5" aria-busy={enviando}>
        <AlertaFormulario mensaje={errorGeneral} />

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
          className="h-11 w-full rounded-xl text-sm font-bold cursor-pointer"
        >
          {enviando ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden />
          )}
          <span>{enviando ? "Entrando…" : "Entrar a mi cuenta"}</span>
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Regístrate aquí (Vecino o Vocero)
        </Link>
      </p>
    </AuthShell>
  );
}
