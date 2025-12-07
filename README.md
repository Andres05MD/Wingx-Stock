# 🧵 Wingx Stock

<div align="center">

![Wingx Stock](https://img.shields.io/badge/Wingx-Stock-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Sistema de gestión de confección y análisis de costos**

[Demo en vivo](https://wingx-stock.vercel.app) | [Reportar Bug](https://github.com/Andres05MD/Wingx-Stock/issues) | [Solicitar Feature](https://github.com/Andres05MD/Wingx-Stock/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Despliegue](#-despliegue)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎯 Descripción

**Wingx Stock** es una aplicación web diseñada para gestionar el inventario de prendas de confección, realizar seguimiento de pedidos y calcular costos y ganancias de manera eficiente. Perfecta para pequeños y medianos talleres de confección que buscan optimizar su producción y análisis financiero.

### ¿Por qué Wingx Stock?

- ✅ **Gestión simplificada** de inventario de prendas
- ✅ **Cálculo automático** de costos (materiales, mano de obra, transporte)
- ✅ **Análisis de rentabilidad** en tiempo real
- ✅ **Seguimiento de pedidos** con estados y fechas de entrega
- ✅ **Interfaz moderna** y responsive
- ✅ **Persistencia en la nube** con Firebase

---

## ✨ Características

### 🏠 Dashboard

- **Estadísticas en tiempo real:**
  - Total de prendas en inventario
  - Pedidos activos
  - Ganancia potencial total
  - Monto pendiente por cobrar
  
- **Vista general del inventario** con todas las prendas registradas

### 👕 Gestión de Prendas

- **Crear, editar y eliminar prendas**
- **Registro detallado:**
  - Nombre y talla de la prenda
  - Precio de venta
  - Costo de mano de obra
  - Costo de transporte
  - Lista de materiales con costos individuales
  
- **Cálculo automático:**
  - Costo total (materiales + mano de obra + transporte)
  - Ganancia neta por prenda

### 📦 Gestión de Pedidos

- **Crear pedidos** asociados a prendas del inventario
- **Campos personalizables:**
  - Cliente
  - Cantidad de prendas
  - Fecha de entrega
  - Adelanto recibido
  - Estado del pedido
  
- **Seguimiento visual** con estados diferenciados por colores:
  - 🟡 Pendiente
  - 🔵 En Producción
  - 🟢 Completado
  - 🔴 Cancelado

### 💾 Persistencia de Datos

- **Firebase Firestore** para almacenamiento en la nube
- Sincronización automática entre dispositivos
- Alta disponibilidad y seguridad

---

## 🛠️ Tecnologías

<div align="center">

| Frontend | Backend/DB | Herramientas |
|----------|-----------|--------------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | ![Firestore](https://img.shields.io/badge/Firestore-FFA611?style=flat&logo=firebase&logoColor=white) | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | | ![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat&logo=visual-studio-code&logoColor=white) |

</div>

### Detalles Técnicos

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript ES6+
- **Base de Datos:** Firebase Firestore (NoSQL)
- **UI/UX:** SweetAlert2 para notificaciones
- **Tipografía:** Google Fonts (Inter)
- **Hosting:** Vercel
- **Control de versiones:** Git & GitHub

---

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta de Firebase
- Git

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/Andres05MD/Wingx-Stock.git
cd Wingx-Stock
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase**

- Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
- Habilita Firestore Database
- Copia tu configuración de Firebase
- Actualiza el archivo `src/firebase.js` con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

4. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📖 Uso

### Crear una Prenda

1. Ve a **"Nueva Prenda"** desde el dashboard
2. Completa los datos básicos (nombre, talla, precio)
3. Agrega materiales necesarios con sus costos
4. Ingresa costos de mano de obra y transporte
5. Haz clic en **"Guardar Prenda"**

### Crear un Pedido

1. Desde el dashboard, haz clic en **"Ver Pedidos"**
2. Haz clic en **"Nuevo Pedido"**
3. Selecciona la prenda del inventario
4. Ingresa cantidad, cliente y fecha de entrega
5. Opcional: registra un adelanto
6. Selecciona el estado del pedido
7. **Guardar**

### Editar o Eliminar

- Cada tarjeta tiene botones de **Editar** ✏️ y **Eliminar** 🗑️
- La edición carga los datos en el formulario
- Al eliminar se solicita confirmación

---

## 📁 Estructura del Proyecto

```
Wingx-Stock/
├── 📄 index.html              # Página de redirección
├── 📂 pages/
│   ├── dashboard.html         # Dashboard principal
│   ├── form.html              # Formulario de prendas
│   └── orders.html            # Gestión de pedidos
├── 📂 src/
│   ├── app.js                 # Lógica principal de prendas
│   ├── dashboard.js           # Lógica del dashboard
│   ├── firebase.js            # Configuración de Firebase
│   ├── form.js                # Lógica del formulario
│   ├── orders.js              # Lógica de pedidos
│   ├── storage.js             # Operaciones con Firestore
│   └── ui.js                  # Renderizado de UI y utilidades
├── 📂 styles/
│   ├── base.css               # Estilos base y variables
│   ├── components.css         # Componentes reutilizables
│   ├── dashboard.css          # Estilos del dashboard
│   └── styles.css             # Archivo principal de estilos
├── 📂 resources/              # Recursos estáticos
├── 📄 package.json            # Dependencias del proyecto
├── 📄 vercel.json             # Configuración de Vercel
├── 📄 .gitignore              # Archivos ignorados por Git
└── 📄 README.md               # Este archivo
```

---

## 🌐 Despliegue

### Desplegar en Vercel (Recomendado)

#### Opción 1: Desde GitHub

1. Sube tu código a GitHub (ya realizado ✅)
2. Ve a [vercel.com](https://vercel.com)
3. Haz clic en **"Import Project"**
4. Selecciona tu repositorio `Wingx-Stock`
5. Vercel detectará automáticamente la configuración
6. Haz clic en **"Deploy"**

#### Opción 2: Con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# En el directorio del proyecto
npx vercel

# Para producción
npx vercel --prod
```

### Otras Plataformas

- **Netlify:** Conecta tu repositorio de GitHub
- **GitHub Pages:** Solo para versión estática
- **Firebase Hosting:** `firebase deploy`

---

## 📸 Capturas de Pantalla

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Formulario de Prendas
![Form](https://via.placeholder.com/800x400?text=Form+Screenshot)

### Gestión de Pedidos
![Orders](https://via.placeholder.com/800x400?text=Orders+Screenshot)

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Reportar Bugs

Si encuentras un bug, por favor [abre un issue](https://github.com/Andres05MD/Wingx-Stock/issues) con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Capturas de pantalla (si aplica)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👤 Contacto

**CEO:** Valeria Petaccia

**Desarrollador:** Andrés Morales
- GitHub: [@Andres05MD](https://github.com/Andres05MD)
- Proyecto: [Wingx-Stock](https://github.com/Andres05MD/Wingx-Stock)
---
