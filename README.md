# Apolo Fitness Center - Sistema de Administración

## Descripción

Aplicación web completa desarrollada en Vue 3 con Pinia y Vue Router que incluye una landing page inspirada en el diseño de Apolo Fitness Center y un sistema completo de administración de usuarios con funcionalidades CRUD.

## Tecnologías Utilizadas

- **Vue 3** - Framework JavaScript progresivo
- **Pinia** - Store de estado para Vue 3
- **Vue Router** - Enrutador oficial para Vue.js
- **Tailwind CSS 3.4** - Framework de CSS utilitario
- **Vite** - Herramienta de construcción rápida
- **LocalStorage** - Persistencia de datos local

## Características

### 🏠 Landing Page
- Diseño responsive basado en Apolo Fitness Center
- Paleta de colores personalizada (negro, dorado/naranja)
- Navegación intuitiva con menú móvil
- Sección hero con call-to-action
- Sección de características del gimnasio
- Footer informativo

### 🔐 Sistema de Autenticación
- Login con validación de credenciales
- Persistencia de sesión en localStorage
- Guards de navegación para rutas protegidas
- Redirección automática según estado de autenticación

### 📊 Dashboard de Administración
- Panel de estadísticas en tiempo real
- Gestión completa de usuarios (CRUD)
- Búsqueda y filtrado de usuarios
- Modales para agregar/editar usuarios
- Confirmación de eliminación
- Interfaz responsive y moderna

## Credenciales de Prueba

### Administrador
- **Email:** admin@apolo.com
- **Password:** admin123

### Usuario
- **Email:** user@apolo.com
- **Password:** user123

## Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd apolo-fitness-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## Estructura del Proyecto

```
apolo-fitness-app/
├── src/
│   ├── components/
│   │   ├── LandingPage.vue      # Página principal
│   │   ├── LoginPage.vue        # Página de login
│   │   └── Dashboard.vue        # Panel de administración
│   ├── stores/
│   │   ├── auth.js             # Store de autenticación
│   │   └── users.js            # Store de usuarios
│   ├── router/
│   │   └── index.js            # Configuración de rutas
│   ├── style.css               # Estilos globales con Tailwind
│   ├── App.vue                 # Componente raíz
│   └── main.js                 # Punto de entrada
├── tailwind.config.js          # Configuración de Tailwind
├── package.json                # Dependencias del proyecto
└── README.md                   # Documentación
```

## Funcionalidades del CRUD

### ✅ Crear (Create)
- Formulario modal para agregar nuevos usuarios
- Validación de campos requeridos
- Asignación automática de ID y fecha de ingreso

### 📖 Leer (Read)
- Lista completa de usuarios en tabla responsive
- Búsqueda por nombre, email o tipo de membresía
- Estadísticas en tiempo real

### ✏️ Actualizar (Update)
- Edición de usuarios existentes
- Formulario pre-poblado con datos actuales
- Actualización inmediata en la interfaz

### 🗑️ Eliminar (Delete)
- Modal de confirmación antes de eliminar
- Eliminación segura con confirmación
- Actualización automática de estadísticas

## Paleta de Colores

- **Primary:** #D97706 (Dorado/Naranja)
- **Secondary:** #F59E0B (Dorado claro)
- **Dark:** #000000 (Negro principal)
- **Gray Dark:** #1F2937 (Gris oscuro)
- **Gray Light:** #9CA3AF (Gris claro)

## Rutas de la Aplicación

- `/` - Landing page (requiere no estar autenticado)
- `/login` - Página de login (requiere no estar autenticado)
- `/dashboard` - Panel de administración (requiere autenticación)

## Persistencia de Datos

Los datos se almacenan en localStorage del navegador:
- `apolo_user` - Información del usuario autenticado
- `apolo_authenticated` - Estado de autenticación
- `apolo_users` - Lista de usuarios del sistema

## Responsive Design

La aplicación está optimizada para:
- 📱 Dispositivos móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción

## Autor

Desarrollado como proyecto de demostración de Vue 3 con Pinia, Vue Router y Tailwind CSS.

## Licencia

Este proyecto es de uso educativo y de demostración.

