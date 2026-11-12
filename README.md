# Nexo Boconó (NexoBoconó) 🏢🇻🇪

> **Proyecto de Grado / Tesis Universitaria**  
> *Plataforma Web Progresiva para la Optimización del Reporte de Incidencias, Gestión de Servicios Públicos y Rendición de Cuentas en la Comunidad Fabricio Ojeda (Boconó, Estado Trujillo).*

---

## 📌 Contexto Institucional y Territorial

* **Comunidad:** Complejo Habitacional Fabricio Ojeda.
* **Ubicación:** Municipio Boconó, Estado Trujillo, Venezuela.
* **Estructura Física:** 5 Edificios residenciales (Edificios 1 al 5), 1 Cancha Deportiva y 2 Entradas (Principal y Secundaria).
* **Población:** ~170 habitantes (85 familias censadas).
* **Organización:** Consejos Comunales bajo 3 figuras de vocería:
  1. **Vocero Principal:** Coordinación general de la comunidad y asambleas.
  2. **Vocero Secundario (Por Edificio):** Enlace directo con las familias de su edificio.
  3. **Vocero de Deportes:** Mantenimiento de la cancha, torneos y recreación.

---

## 🎯 Planteamiento del Problema y Justificación

| Medio Tradicional | Limitaciones Reales en Venezuela | Solución con Nexo Boconó |
| :--- | :--- | :--- |
| **Grupos de WhatsApp** | Caos de información, pérdida de reportes entre memes y audios, cero trazabilidad y saturación del vocero. | **Registro estructurado** con código único (`FO-XXX`), categorías y fotos. |
| **VenApp / 1x10 Estatal** | Buzón centralizado y lejano; el vecino no sabe qué pasa en su edificio ni promueve la autogestión local. | **Gestión hiperlocal descentralizada** atendida directamente por los voceros de la comunidad. |
| **Software de Condominio Comercial** | Enfocados exclusivamente en cobros de alícuotas y contabilidad en divisas; costosos y complejos. | **Enfoque cívico-comunitario**, gratuito, ligero, sin tecnicismos y con baja curva de aprendizaje. |

---

## ✨ Funcionalidades Principales

### 1. Control de Acceso por Roles (RBAC)
* **Modo Vecino (Usuario Normal):**
  - Acceso al Feed Comunitario filtrable por los 5 edificios, cancha y accesos.
  - Creación de reportes de fallas (*Agua, Electricidad, Aseo, Cancha, Entradas*) con carga fotográfica.
  - Sistema de **Apoyo Comunitario (Upvotes)** para evitar reportes duplicados y priorizar colectivamente.
  - **Confirmación activa en la Cartelera de Avisos:** Opción *"Estoy enterado / Asistiré"* con conteo de vecinos.
  - Consulta del panel de **Rendición de Cuentas**.
  - **Ruta `/gestion` estrictamente bloqueada y oculta.**

* **Modo Vocero (Consejo Comunal):**
  - Todo lo del modo vecino más acceso exclusivo a la sección **`/gestion`**.
  - Actualización de estados del ciclo de vida: `Pendiente` ➜ `En Revisión` ➜ `Resuelto`.
  - Publicación de respuestas y notas oficiales en la **Bitácora Pública** con plantillas de 1 clic.
  - Publicación de convocatorias a asambleas, jornadas de gas y actividades deportivas en la cancha.

### 2. Trazabilidad de Ciclo Cerrado
Cada falla cuenta con una bitácora transparente con fecha, hora, responsable y acciones tomadas (ej. *"Se compró la unión de 2 pulgadas en el centro de Boconó; hoy a las 4:00 p.m. se repara"*).

### 3. Rendición de Cuentas y Apoyo a la Toma de Decisiones
* **Semáforo Comunitario:** Muestra en tiempo real cuántas incidencias están *Solucionadas (Verde)*, *En Atención (Amarillo)* y *Por Resolver (Rojo)*.
* **Termómetro de Efectividad:** Porcentaje dinámico de resolución ($\frac{\text{Resueltos}}{\text{Total}} \times 100$).
* **Diagnóstico por Servicio y por Edificio:** Detección preventiva de qué edificio o servicio público requiere mayor inversión comunitaria o solicitud de recursos ante entes estatales (Corpoelec, Hidroandes, Alcaldía).

---

## 🚀 Tecnologías y Arquitectura

* **Framework Core:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19).
* **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/) para tipado estático estricto.
* **Estilos y Diseño:** [Tailwind CSS v4](https://tailwindcss.com/) (Mobile-first, paleta esmeralda y oro comunitario).
* **Animaciones y Microinteracciones:** [Framer Motion](https://www.framer.com/motion/).
* **Gestión de Estado y Persistencia:** [Zustand](https://github.com/pmndrs/zustand) con arquitectura *Offline-First* sincronizada en `localStorage` (resiliente ante cortes de conectividad).
* **Notificaciones:** [Sonner](https://sonner.emilkowal.ski/).
* **Iconografía:** [Lucide React](https://lucide.dev/).

---

## 📁 Estructura del Proyecto

```text
tesis/
├── app/
│   ├── layout.tsx             # Shell raíz, metadatos SEO, fuentes (Outfit/Figtree) y Toaster
│   ├── page.tsx               # Feed principal, cartelera de avisos y filtro por edificios
│   ├── login/page.tsx         # Inicio de sesión seguro y directo
│   ├── register/page.tsx      # Registro selectivo (Vecino vs 3 tipos de Vocero)
│   ├── reportar/page.tsx      # Asistente guiado de reporte de averías con foto
│   ├── gestion/page.tsx       # Panel administrativo exclusivo para voceros (RBAC)
│   ├── transparencia/page.tsx # Módulo de Rendición de Cuentas y Semáforo Comunitario
│   ├── icon.svg               # Favicon institucional vectorial de alta definición
│   └── globals.css            # Estilos globales y tokens visuales de Tailwind v4
├── components/
│   ├── auth/                  # Componentes de autenticación, campos y selector de rol
│   ├── layout/                # Encabezado institucional, AppShell y navegación móvil
│   ├── reportes/              # Tarjeta de reporte con bitácora desplegable y apoyos
│   └── ui/                    # Botones e insignias reutilizables
├── lib/
│   ├── auth/                  # Contexto de autenticación, protección de rutas y validaciones
│   ├── store/                 # Store Zustand para reportes, avisos y apoyos
│   └── utils.ts               # Utilidades de clases (clsx + twMerge)
├── types/
│   └── reportes.ts            # Modelos de datos TypeScript, zonas, cargos y categorías
└── public/
    └── images/                # Activos e imágenes de la comunidad
```

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
* Node.js 18.18+ o Node.js 20+ instalado.
* Gestor de paquetes `npm` (o `pnpm`).

### Pasos
```bash
# 1. Clonar o acceder al directorio del proyecto
cd c:/Users/LEOFERSON/Desktop/tesis

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo con Turbopack
npm run dev

# 4. Abrir en el navegador
http://localhost:3000
```

### Comandos de Calidad y Producción
```bash
# Ejecutar verificación de linter
npm run lint

# Generar compilación optimizada para producción
npm run build

# Iniciar servidor de producción compilado
npm run start
```

---

## 🎓 Autoría y Créditos
* **Proyecto:** Tesis de Grado en Ingeniería / Sistemas / Informática.
* **Caso de Aplicación:** Comunidad Fabricio Ojeda · Boconó, Edo. Trujillo.
* **Año:** 2026.
