import type { Metadata, Viewport } from "next";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "sonner";

// Carga optimizada de tipografías desde Google Fonts
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Metadatos de la aplicación para SEO y presentación de tesis
export const metadata: Metadata = {
  title: "Nexo Boconó — Comunidad Fabricio Ojeda (Boconó)",
  description:
    "Plataforma comunitaria sencilla para los 170 habitantes y 85 familias de la Comunidad Fabricio Ojeda (5 edificios, 1 cancha y 2 entradas) en Boconó, Edo. Trujillo: avisos de los voceros y reporte de problemas.",
  authors: [{ name: "Nexo Boconó" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Nexo Boconó — Comunidad Fabricio Ojeda",
    description:
      "Reporta problemas de agua, luz, aseo, cancha deportiva o entradas de la Comunidad Fabricio Ojeda en Boconó.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Layout principal de la aplicación Next.js.
 * Envuelve todas las páginas con autenticación, navegación y feedback de notificaciones.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${figtree.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-background antialiased font-sans">
        <AuthProvider>
          {/* Protección de rutas + navegación (oculta en login/registro) */}
          <AppShell>{children}</AppShell>

          {/* Sistema de notificaciones toast */}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
