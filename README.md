# Wingx - Sistema de Gestión para Talleres de Costura

Wingx es una aplicación web moderna diseñada para optimizar la gestión de pequeños y medianos talleres de costura y confección. Permite a los usuarios administrar pedidos, inventario, clientes y agenda de manera eficiente, con soporte para múltiples usuarios y roles de administración.

## Características Principales

### 🔐 Autenticación y Roles
*   **Inicio de Sesión Seguro**: Soporte para correo/contraseña.
*   **Separación de Datos por Usuario**: Cada taller (Owner) tiene su propia base de datos aislada.
*   **Sistema de Roles**: Distinción entre usuarios estándar y administradores.
*   **Gestión de Perfiles**: Registro de nombres y correos.

### 👥 Panel de Usuario (Taller)
*   **Gestión de Pedidos**: Creación, seguimiento de estado (Pendiente, En Proceso, Finalizado, Entregado) y control de pagos.
*   **Base de Datos de Prendas**: Cálculo de costos detallado y precios sugeridos.
*   **Inventario (Stock)**: Control de prendas listas para venta inmediata.
*   **Agenda Digital**: Calendario interactivo para organizar entregas.
*   **Gestión de Materiales**: Lista de compras necesarias para producción.
*   **Clientes**: Base de datos de clientes con historial de compras.
*   **Tasa de Cambio Global**: Widget integrado para conversión automática de precios (Bs/$) en toda la aplicación.
*   **Resumen Diario**: Generación automática de reportes para compartir.

### 🛡️ Panel de Administrador
*   **Dashboard Exclusivo**: Vista global de todo el sistema.
*   **Estadísticas en Tiempo Real**: Ingresos totales, número de pedidos, usuarios activos y métricas de rendimiento.
*   **Top Products**: Visualización de las prendas más vendidas en todo el sistema.
*   **Gestión de Usuarios**:
    *   Listado completo de usuarios.
    *   Visualización de ingresos generados por usuario.
    *   **Restablecimiento de Contraseña**: Envío de correos de recuperación directamente desde el panel.

## Tecnologías Utilizadas

*   **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), React 19, TypeScript.
*   **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/) con diseño responsivo y moderno (Glassmorphism).
*   **Base de Datos y Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication).
*   **Utilidades**:
    *   [Date-fns](https://date-fns.org/) para manejo de fechas.
    *   [Lucide React](https://lucide.dev/) para iconos.
    *   [SweetAlert2](https://sweetalert2.github.io/) para notificaciones y alertas.

## Estructura del Proyecto

```
/src
├── /app                 # Rutas (App Router) y Layouts
├── /components          # Componentes de UI (Formularios, Dashboards, Widgets)
├── /context             # Estado Global (Auth, ExchangeRate)
├── /lib                 # Configuración de Firebase y utilidades
└── /services            # Lógica de negocio y persistencia
```

## Configuración del Proyecto

### Prerrequisitos
*   Node.js 18+
*   Cuenta de Firebase configurada.

### Instalación

1.  Clonar el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/wingx.git
    cd wingx
    ```

2.  Instalar dependencias:
    ```bash
    npm install
    # o
    npm install --legacy-peer-deps
    ```

3.  Configurar Variables de Entorno:
    Crear un archivo `.env.local` con las credenciales de Firebase.

4.  Ejecutar en desarrollo:
    ```bash
    npm run dev
    ```

5.  Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue

La aplicación está preparada para ser desplegada en [Vercel](https://vercel.com).
