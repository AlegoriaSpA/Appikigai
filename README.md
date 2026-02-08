# APP IKIGAI BOX - Sistema de Gestión

Sistema de gestión desarrollado con Vue 3, Vite y Vuetify 3.

## 🚀 Características

- ✅ **Sistema de autenticación completo** con JWT
- 👥 **Gestión de usuarios**: Crear, listar, editar y validar usuarios
- 🔒 **Control de acceso y permisos**
- 🎨 **Diseño moderno** con Vuetify 3 y Material Design
- 🌙 **Modo oscuro** integrado
- 📱 **Diseño responsive** para todos los dispositivos

## 📋 Módulos Disponibles

### Usuarios
- Lista de usuarios con búsqueda y filtros
- Formulario de creación con validaciones
- Validación de usuarios
- Gestión de perfiles y permisos

## 🛠️ Stack Tecnológico

- **Vue 3.5.22** - Framework progresivo
- **Vite** - Build tool ultra rápido
- **Vuetify 3.10.8** - Framework de componentes Material Design
- **Pinia 3.0.3** - State management
- **Vue Router 4.5.1** - Enrutamiento
- **JWT** - Autenticación y autorización

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Build para producción
pnpm build
```

## 🚀 Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Genera el build de producción
- `pnpm preview` - Previsualiza el build de producción
- `pnpm lint` - Ejecuta el linter

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

## 📚 Documentación

- [API_INTEGRATION.md](API_INTEGRATION.md) - Integración con API
- [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) - Guía de endpoints
- [LOGIN_STATUS.md](LOGIN_STATUS.md) - Estado del sistema de login
- [MIGRACION_VISTAS.md](MIGRACION_VISTAS.md) - Detalles de la migración de vistas

## 🔐 Autenticación

El sistema está integrado con la API en: `https://api.geoapp.alegoria.cl`

Endpoints disponibles:
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

## 🐳 Docker

### Desarrollo
```sh
docker-compose -f docker-compose.dev.yml up
```

### Producción
```sh
docker-compose -f docker-compose.prod.yml up
```

## 🎯 Estructura del Proyecto

```
src/
├── @core/          # Componentes y utilidades core
├── @layouts/       # Layouts y componentes de layout
├── pages/          # Páginas de la aplicación
│   ├── propiedades/  # Gestión de propiedades
│   ├── airbnb/       # Gestión de Airbnb
│   └── informes/     # Informes y reportes
├── stores/         # Stores de Pinia
├── navigation/     # Configuración de menús
└── utils/          # Utilidades y helpers
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.
