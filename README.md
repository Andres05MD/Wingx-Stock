# Wingx - Sistema de Gestión para Talleres de Costura

Wingx es una aplicación web moderna diseñada para optimizar la gestión de pequeños y medianos talleres de costura y confección. Permite a los usuarios administrar pedidos, inventario, clientes y agenda de manera eficiente, con soporte para múltiples usuarios y roles de administración.

## Características Principales

### 🔐 Autenticación y Roles
*   **Inicio de Sesión Seguro**: Soporte para correo/contraseña y Google Sign-In (próximamente).
*   **Sistema de Roles**: Distinción entre usuarios estándar y administradores.
*   **Gestión de Perfiles**: Registro de nombres y correos.

### 👥 Panel de Usuario (Taller)
*   **Gestión de Pedidos**: Creación, seguimiento de estado (Pendiente, En Proceso, Finalizado, Entregado) y control de pagos (saldos pendientes).
*   **Base de Datos de Prendas**: Cálculo de costos (Mano de obra, Transporte, Materiales) y precios sugeridos.
*   **Inventario (Stock)**: Control de prendas listas para venta inmediata.
*   **Agenda Digital**: Calendario para organizar citas de medidas y fechas de entrega.
*   **Lista de Materiales**: Gestión de compras necesarias para la producción.
*   **Clientes**: Base de datos de clientes con historial y datos de contacto.
*   **Resumen Diario**: Generación automática de reportes para WhatsApp con entregas y pendientes del día.

### 🛡️ Panel de Administrador
*   **Dashboard Exclusivo**: Vista global de todo el sistema.
*   **Estadísticas en Tiempo Real**: Ingresos totales, número de pedidos, usuarios activos y métricas de rendimiento.
*   **Top Products**: Visualización de las prendas más vendidas en todo el sistema.
*   **Gestión de Usuarios**:
    *   Listado completo de usuarios.
    *   Visualización de ingresos generados por usuario.
    *   **Restablecimiento de Contraseña**: Envío de correos de recuperación directamente desde el panel.

## Tecnologías Utilizadas

*   **Frontend**: [Next.js 15+](https://nextjs.org/) (App Directory), React, TypeScript.
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/) con diseño responsivo y moderno (Glassmorphism).
*   **Base de Datos y Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication).
*   **Iconos**: [Lucide React](https://lucide.dev/).
*   **Alertas**: [SweetAlert2](https://sweetalert2.github.io/).

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
    ```

3.  Configurar Variables de Entorno:
    Crear un archivo `.env.local` (o configurar directamente en `src/lib/firebase.ts` para desarrollo local) con las credenciales de Firebase.

4.  Ejecutar en desarrollo:
    ```bash
    npm run dev
    ```

5.  Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue

La aplicación está optimizada para ser desplegada en [Vercel](https://vercel.com). Simplemente conecta tu repositorio y configura las variables de entorno.

---

**Wingx** - Gestiona tu pasión, optimiza tu negocio.
