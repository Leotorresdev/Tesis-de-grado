// app/register/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Home,
  Loader2,
  Mail,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import {
  limpiarTexto,
  tieneErrores,
  validarRegistro,
  type CamposRegistro,
  type ErroresFormulario,
} from "@/lib/auth/validacion";
import {
  CARGOS_VOCERO,
  COMUNIDAD_INFO,
  type CargoVocero,
  type RolUsuario,
} from "@/types/reportes";
import { AuthShell } from "@/components/auth/auth-shell";
import { AlertaFormulario, CampoClave, CampoTexto } from "@/components/auth/campos";
import { SelectorRol } from "@/components/auth/selector-rol";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INFO_CARGOS: Record<
  CargoVocero,
  { descripcion: string; icono: React.ElementType }
> = {
  "Vocero Principal": {
    descripcion: "Coordina toda la Comunidad Fabricio Ojeda y las asambleas.",
    icono: ShieldCheck,
  },
  "Vocero Secundario (Por Edificio)": {
    descripcion: "Representa a los vecinos de su edificio (Edificio 1 al 5).",
    icono: Users,
  },
  "Vocero de Deportes": {
    descripcion: "Encargado de la Cancha Deportiva, torneos y actividades.",
    icono: Trophy,
  },
};

const FORM_INICIAL = {
  nombre: "",
  casa: "",
  sector: COMUNIDAD_INFO.edificios[0] as string,
  cargo: CARGOS_VOCERO[0] as string,
  email: "",
  password: "",
};

type CampoForm = keyof typeof FORM_INICIAL;

/**
 * Pantalla de registro directo para la Comunidad Fabricio Ojeda (Boconó).
 * No solicita confirmación por correo electrónico: al registrarse entra directamente a la aplicación.
 */
export default function RegisterPage() {
  const { registrarse } = useAuth();
  const [rol, setRol] = useState<RolUsuario>("vecino");
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState<ErroresFormulario<CamposRegistro>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo: CampoForm, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setErrorGeneral(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevosErrores = validarRegistro({
      ...form,
      rol,
    });
    setErrores(nuevosErrores);
    if (tieneErrores(nuevosErrores)) return;

    setEnviando(true);
    const resultado = await registrarse({
      nombre: limpiarTexto(form.nombre),
      casa: limpiarTexto(form.casa),
      sector: form.sector,
      cargo: rol === "vocero" ? form.cargo : "Vecino de la Comunidad",
      rol,
      email: form.email,
      password: form.password,
    });
    setEnviando(false);

    if (!resultado.ok) {
      setErrorGeneral(resultado.error);
      return;
    }

    toast.success(
      rol === "vocero"
        ? `¡Bienvenido, ${form.cargo}! Ya tienes acceso directo al Panel de Vocero.`
        : "¡Cuenta creada con éxito! Entrando directamente a la Comunidad Fabricio Ojeda."
    );
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Crear cuenta (Acceso directo)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige si eres <strong>Vecino</strong> o <strong>Vocero</strong>. Entrarás de inmediato sin tener que confirmar tu correo.
          </p>
        </header>

        <form
          onSubmit={enviar}
          noValidate
          className="space-y-4"
          aria-busy={enviando}
        >
          <AlertaFormulario mensaje={errorGeneral} />

          {/* 1. Selección de Rol: Vecino o Vocero */}
          <SelectorRol valor={rol} onChange={setRol} />

          {/* Si elige Vocero: mostrar los 3 tipos de vocero de la comunidad */}
          <AnimatePresence initial={false}>
            {rol === "vocero" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-primary/25 bg-primary-soft/50 p-3.5 space-y-2.5">
                  <label className="block text-xs font-bold text-primary">
                    ¿Cuál de los 3 voceros eres en la comunidad?
                  </label>
                  <div className="grid gap-2">
                    {CARGOS_VOCERO.map((cargo) => {
                      const activo = form.cargo === cargo;
                      const Icono = INFO_CARGOS[cargo].icono;
                      return (
                        <button
                          key={cargo}
                          type="button"
                          onClick={() => actualizar("cargo", cargo)}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border p-2.5 text-left transition cursor-pointer",
                            activo
                              ? "border-primary bg-card shadow-xs"
                              : "border-border/70 bg-card/60 hover:bg-card"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                              activo
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            <Icono className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground">
                              {cargo}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {INFO_CARGOS[cargo].descripcion}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Selección rápida de Edificio (1 al 5) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              ¿En cuál de los 5 edificios vives?
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {COMUNIDAD_INFO.edificios.map((edif) => {
                const activo = form.sector === edif;
                return (
                  <button
                    key={edif}
                    type="button"
                    onClick={() => actualizar("sector", edif)}
                    className={cn(
                      "rounded-xl border py-2 px-1 text-center text-xs font-bold transition cursor-pointer",
                      activo
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                    )}
                  >
                    {edif.replace("Edificio ", "Edif. ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Datos personales sencillos */}
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoTexto
              label="Tu nombre y apellido"
              autoComplete="name"
              maxLength={80}
              placeholder="Ej: María Pérez"
              value={form.nombre}
              error={errores.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
            />
            <CampoTexto
              label="Familia o Nº de Apartamento"
              maxLength={80}
              placeholder="Ej: Familia Pérez · Apto 2-B"
              icono={<Home className="h-4 w-4" />}
              value={form.casa}
              error={errores.casa}
              onChange={(e) => actualizar("casa", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CampoTexto
              label="Correo (sin confirmación)"
              type="text"
              autoComplete="email"
              placeholder="Ej: maria@correo.com"
              icono={<Mail className="h-4 w-4" />}
              value={form.email}
              error={errores.email}
              onChange={(e) => actualizar("email", e.target.value)}
            />
            <CampoClave
              label="Crea una clave sencilla"
              autoComplete="new-password"
              placeholder="Ej: 1234"
              value={form.password}
              error={errores.password}
              onChange={(e) => actualizar("password", e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={enviando}
            className="h-12 w-full rounded-xl text-sm font-bold cursor-pointer"
          >
            {enviando ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden />
            )}
            <span>
              {enviando
                ? "Entrando a la aplicación…"
                : rol === "vocero"
                ? `Registrarme y entrar como ${form.cargo}`
                : "Registrarme y entrar como Vecino"}
            </span>
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
