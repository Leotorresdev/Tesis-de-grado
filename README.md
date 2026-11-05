# ComunidadConectada (Tesis)

Plataforma vecinal para el reporte, seguimiento y gestión colaborativa de fallas en servicios públicos (aseo, agua, electricidad, vialidad y seguridad).

---

## 🚀 Tecnologías y Arquitectura

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19).
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) con tokens de diseño cívico en formato OKLCH.
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) para transiciones de cards, pines y microinteracciones de apoyo.
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) (`lib/store/use-reportes.ts`) para reactividad sin re-renders innecesarios.
- **Iconografía**: [Lucide React](https://lucide.dev/).
- **Métricas y Gráficos**: [Recharts](https://recharts.org/) en el módulo de transparencia comunitaria.
- **Feedback**: [Sonner](https://sonner.emilkowal.ski/) para notificaciones toast.
- **Autenticación y Datos**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`).

---

## 📁 Estructura del Proyecto

```text
tesis/
├── app/
│   ├── layout.tsx             # Shell raíz con fuentes Google (Figtree/Outfit), Auth y navegación
│   ├── page.tsx               # Feed comunitario principal con filtros y listado
│   ├── reportar/page.tsx      # Formulario para publicar nueva incidencia con geolocalización y foto
│   ├── transparencia/page.tsx # Panel de datos abiertos con gráficos de barras y líneas
│   ├── gestion/page.tsx       # Centro de priorización y gestión de incidencias para voceros
│   ├── auth/page.tsx          # Inicio de sesión y registro de voceros vecinales
│   └── globals.css            # Configuración de Tailwind v4 (@theme inline) y utilidades
├── components/
│   ├── layout/
│   │   ├── encabezado.tsx     # Barra institucional superior con navegación desktop
│   │   └── navegacion-inferior.tsx # Barra de acceso rápido para dispositivos móviles
│   ├── reportes/
│   │   └── tarjeta-reporte.tsx # Card de reporte con animación de apoyo popular
│   └── ui/
│       ├── button.tsx         # Botón reutilizable con variantes y tamaños
│       └── badge.tsx          # Etiqueta visual para estados y categorías
├── lib/
│   ├── auth/
│   │   └── auth-context.tsx   # Contexto para sesión y perfil de vocero
│   ├── store/
│   │   └── use-reportes.ts    # Store Zustand para reportes, apoyos y persistencia
│   ├── supabase/
│   │   ├── client.ts          # Instancia del cliente Supabase configurada para Next.js
│   │   └── types.ts           # Definición de tipos de tablas Supabase
│   └── utils.ts               # Utilidad 'cn' para combinar clases de Tailwind
├── public/
│   └── images/                # Imágenes de muestra para reportes
└── types/
    └── reportes.ts            # Tipos de dominio, estados, categorías y métricas
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo con Turbopack
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm run start
```
