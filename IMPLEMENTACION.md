# Implementación API APP IKIGAI BOX - Resumen de Cambios

## ✅ Cambios Implementados

### 1. Modelo User Actualizado
- ✅ Agregados campos: `apellidos`, `numero_documento`, `edad`, `fecha_nacimiento`, `diaNacimiento`, `mesNacimiento`, `anioNacimiento`
- ✅ Migración creada: `2026_01_26_000001_add_nutri_fields_to_users_table.php`
- ✅ Relaciones agregadas con: Evaluacion, Mensaje, PlanAlimentacion, PlanCompetitivo

### 2. Modelo Evaluacion (Nuevo)
- ✅ Modelo creado con todos los campos antropométricos
- ✅ Migración: `2026_01_26_000002_create_evaluaciones_table.php`
- ✅ Campos: peso, estatura, circunferencias, pliegues, IMC, porcentaje grasa, etc.

### 3. Modelo Mensaje (Nuevo)
- ✅ Modelo y migración creados
- ✅ Tabla: `mensajes` (`2026_01_26_000003_create_mensajes_table.php`)
- ✅ Tabla respuestas: `respuestas_mensajes` (`2026_01_26_000004_create_respuestas_mensajes_table.php`)
- ✅ Tipos: bienvenida, notificacion, evaluacion, sistema

### 4. Modelos de Planes (Nuevos)
- ✅ PlanAlimentacion: pautas, suplementos, macros
- ✅ PlanCompetitivo: tipo deporte, fases preparación
- ✅ Migraciones creadas

### 5. Controladores Implementados

#### AuthController (Actualizado)
- ✅ Login con campos adicionales
- ✅ Register con validaciones completas
- ✅ Me con todos los datos del usuario
- ✅ **Nuevo**: `updateProfile()` - Actualizar perfil
- ✅ **Nuevo**: `updatePassword()` - Cambiar contraseña
- ✅ ForgotPassword y ResetPassword

#### UserController (Actualizado)
- ✅ Index con paginación, búsqueda y filtros
- ✅ **Nuevo**: `show()` - Obtener usuario específico
- ✅ Store con validaciones completas
- ✅ Update con todos los campos
- ✅ Destroy

#### EvaluacionController (Nuevo)
- ✅ `index()` - Listar evaluaciones con filtros
- ✅ `show()` - Obtener evaluación específica
- ✅ `store()` - Crear evaluación
- ✅ `update()` - Actualizar evaluación
- ✅ `destroy()` - Eliminar evaluación
- ✅ `getPorUsuario()` - Evaluaciones de un usuario
- ✅ `getAnterior()` - Evaluación anterior

#### MensajeController (Nuevo)
- ✅ `index()` - Listar mensajes del usuario
- ✅ `show()` - Obtener mensaje y marcar como leído
- ✅ `store()` - Crear mensaje (Superadmin)
- ✅ `responder()` - Responder mensaje
- ✅ `marcarLeido()` - Marcar como leído
- ✅ `destroy()` - Eliminar mensaje (Superadmin)

#### InformeController (Nuevo)
- ✅ `evolucion()` - Informe de evolución completo
- ✅ `comparacion()` - Comparar primera y última evaluación

#### PlanAlimentacionController (Nuevo)
- ✅ `getPorUsuario()` - Obtener plan de usuario
- ✅ `store()` - Crear plan
- ✅ `update()` - Actualizar plan
- ✅ `destroy()` - Eliminar plan

#### PlanCompetitivoController (Nuevo)
- ✅ `getPorUsuario()` - Obtener plan de usuario
- ✅ `store()` - Crear plan
- ✅ `update()` - Actualizar plan
- ✅ `destroy()` - Eliminar plan

### 6. Rutas API (Actualizadas)
Todas las rutas documentadas en API-ENDPOINTS.md han sido implementadas:

```
✅ POST   /api/auth/login
✅ POST   /api/auth/register
✅ GET    /api/auth/me
✅ POST   /api/auth/logout
✅ POST   /api/auth/forgot-password
✅ POST   /api/auth/reset-password

✅ GET    /api/perfil
✅ PUT    /api/perfil
✅ PUT    /api/perfil/password

✅ GET    /api/users
✅ GET    /api/users/{id}
✅ POST   /api/users
✅ PUT    /api/users/{id}
✅ DELETE /api/users/{id}

✅ GET    /api/evaluaciones
✅ GET    /api/evaluaciones/{id}
✅ POST   /api/evaluaciones
✅ PUT    /api/evaluaciones/{id}
✅ DELETE /api/evaluaciones/{id}
✅ GET    /api/evaluaciones/usuario/{usuario_id}
✅ GET    /api/evaluaciones/usuario/{usuario_id}/anterior

✅ GET    /api/informes/usuario/{usuario_id}/evolucion
✅ GET    /api/informes/usuario/{usuario_id}/comparacion

✅ GET    /api/mensajes
✅ GET    /api/mensajes/{id}
✅ POST   /api/mensajes
✅ POST   /api/mensajes/{id}/responder
✅ PUT    /api/mensajes/{id}/marcar-leido
✅ DELETE /api/mensajes/{id}

✅ GET    /api/planes-alimentacion/usuario/{usuario_id}
✅ POST   /api/planes-alimentacion
✅ PUT    /api/planes-alimentacion/{id}
✅ DELETE /api/planes-alimentacion/{id}

✅ GET    /api/planes-competitivos/usuario/{usuario_id}
✅ POST   /api/planes-competitivos
✅ PUT    /api/planes-competitivos/{id}
✅ DELETE /api/planes-competitivos/{id}
```

## 📋 Próximos Pasos

### 1. Instalar Dependencias (si no se completó)
```bash
composer install
```

### 2. Ejecutar Migraciones
```bash
php artisan migrate
```

### 3. Configurar .env
Asegúrate de tener configurado:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=apinutri
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@appikigai.cl
MAIL_FROM_NAME="APP IKIGAI BOX"
```

### 4. Generar APP_KEY (si no existe)
```bash
php artisan key:generate
```

### 5. Crear Storage Link
```bash
php artisan storage:link
```

### 6. Iniciar Servidor
```bash
php artisan serve
```

## 🔐 Roles Implementados

Los siguientes roles están configurados en el sistema:
- `superadmin` - Acceso total
- `admin` - Administrador
- `user` - Usuario regular (paciente)
- `secretaria` - Secretaria
- `editor` - Editor

## 📝 Notas Importantes

1. **Password Confirmation**: Los endpoints que requieren `password` también requieren `password_confirmation`
2. **Autenticación**: Todos los endpoints excepto login, register, forgot-password y reset-password requieren token Bearer
3. **Fechas**: Formato `YYYY-MM-DD`
4. **Paginación**: Use `per_page` y `page` en query params
5. **Búsqueda**: Use `search` para buscar usuarios por nombre, apellidos o email
6. **Filtros**: Use `role` para filtrar usuarios, `usuario_id` para evaluaciones

## 🧪 Testing

Puedes probar los endpoints con:
- Postman
- Thunder Client (VS Code)
- cURL

Ejemplo de autenticación:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## 📊 Estructura de Base de Datos

### Tablas Creadas
1. `users` (actualizada con campos nutricionales)
2. `evaluaciones` (nueva)
3. `mensajes` (nueva)
4. `respuestas_mensajes` (nueva)
5. `planes_alimentacion` (nueva)
6. `planes_competitivos` (nueva)

### Relaciones
- User -> hasMany Evaluaciones
- User -> hasMany Mensajes
- User -> hasOne PlanAlimentacion
- User -> hasOne PlanCompetitivo
- Mensaje -> hasMany RespuestasMensajes

## ✨ Características Adicionales Implementadas

- ✅ Validaciones completas en todos los endpoints
- ✅ Respuestas JSON estandarizadas
- ✅ Mensajes de error descriptivos
- ✅ Soft deletes opcionales (puede activarse en modelos)
- ✅ Paginación automática
- ✅ Búsqueda y filtros
- ✅ Relaciones Eloquent
- ✅ Casts de tipos de datos
- ✅ Protección CSRF
- ✅ Autenticación Sanctum

## 🐛 Troubleshooting

### Error: "vendor/autoload.php not found"
```bash
composer install
```

### Error: "SQLSTATE[HY000] [1049] Unknown database"
Crear la base de datos:
```sql
CREATE DATABASE apinutri CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: SSL Certificate en Composer
Agregar a composer.json:
```json
{
  "config": {
    "disable-tls": false,
    "secure-http": false
  }
}
```

O ejecutar:
```bash
composer config -g -- disable-tls true
```

---

**Fecha de implementación**: 26 de Enero, 2026
**Versión API**: 1.0
**Framework**: Laravel 11.x
---

# 🎯 SISTEMA DE GESTIÓN DE CLASES Y RESERVAS - IKIGAI BOX

## Fecha: 8 de Febrero, 2026

## 📋 NUEVAS FUNCIONALIDADES IMPLEMENTADAS

### 1. SISTEMA DE CLASES

#### 1.1 Store de Clases (`src/stores/clases.js`)

**Estructura de datos - Clase:**
```javascript
{
  id: Number,
  nombre: String,              // Ej: "Crossfit", "Yoga", "Funcional"
  horaInicio: String,          // Formato HH:mm (24 horas)
  duracion: Number,            // En minutos (30, 45, 60, 90, 120)
  cuposMaximos: Number,        // Capacidad de la clase
  dias: Array<String>,         // ['lunes', 'martes', ...]
  coachPorDefecto: String,     // Nombre del coach asignado
  activa: Boolean,             // Si la clase está activa
  excepciones: Array<Object>   // Excepciones por fecha
}
```

**Estructura de excepciones:**
```javascript
{
  fecha: String,               // YYYY-MM-DD
  cancelada: Boolean,          // Si la clase está cancelada ese día
  coachReemplazo: String       // Coach de reemplazo (opcional)
}
```

**Estructura de datos - Coach:**
```javascript
{
  id: Number,
  nombre: String,
  activo: Boolean
}
```

**Métodos del Store:**
- `obtenerClasesPorDia(nombreDia, fecha)` - Obtiene clases para un día específico con excepciones aplicadas
- `obtenerCalendarioSemanal()` - Retorna objeto con clases organizadas por día
- `crearClase(nuevaClase)` - Crea nueva clase recurrente
- `actualizarClase(id, datos)` - Actualiza clase existente
- `eliminarClase(id)` - Elimina clase
- `toggleActivarClase(id)` - Activa/desactiva clase
- `agregarExcepcion(claseId, fecha, datos)` - Agrega o actualiza excepción
- `eliminarExcepcion(claseId, fecha)` - Elimina excepción
- `crearCoach(nuevoCoach)` - Crea coach
- `actualizarCoach(id, datos)` - Actualiza coach
- `eliminarCoach(id)` - Elimina coach

**Storage:** `localStorage.clases_configuradas_ikigai`, `localStorage.coaches_ikigai`

---

### 2. SISTEMA DE RESERVAS

#### 2.1 Store de Reservas (`src/stores/reservas.js`)

**Estructura de datos - Reserva:**
```javascript
{
  id: Number,
  usuarioId: Number,           // ID del usuario
  usuarioNombre: String,       // Nombre completo
  claseId: Number,             // ID de la clase
  claseNombre: String,         // Nombre de la clase
  fecha: String,               // YYYY-MM-DD
  horaInicio: String,          // HH:mm
  duracion: Number,            // Minutos
  coach: String,               // Nombre del coach
  fechaReserva: String,        // ISO timestamp
  cancelada: Boolean,
  fechaCancelacion: String,    // ISO timestamp (si cancelada)
  asistio: Boolean,            // Marcada por admin en check-in
  fechaAsistencia: String      // ISO timestamp (si asistió)
}
```

**Reglas de Negocio:**
1. **Tiempo de cancelación:** 90 minutos antes de la clase
2. **Validación de cupos:** No permitir reservas si clase completa
3. **Reservas únicas:** Un usuario solo puede reservar una vez por clase/fecha
4. **Ventana de reserva:** Máximo 7 días de anticipación

**Métodos del Store:**
- `obtenerReservasUsuario(usuarioId)` - Reservas activas del usuario
- `obtenerProximasReservas(usuarioId)` - Próximas clases ordenadas por fecha
- `tieneReserva(usuarioId, claseId, fecha)` - Verifica si usuario ya reservó
- `contarReservas(claseId, fecha)` - Cuenta reservas para una clase
- `puedeCancelar(fecha, horaInicio)` - Valida si puede cancelar (90 min)
- `crearReserva(datosReserva)` - Crea nueva reserva
- `cancelarReserva(usuarioId, claseId, fecha)` - Cancela con validación de tiempo
- `cancelarReservaPorAdmin(usuarioId, claseId, fecha)` - Cancela sin validación
- `marcarAsistencia(reservaId)` - Toggle de asistencia (admin)
- `obtenerEstadisticasUsuario(usuarioId)` - Estadísticas de reservas

**Storage:** `localStorage.reservas_clases_ikigai`

---

### 3. PÁGINAS IMPLEMENTADAS

#### 3.1 Clases (`src/pages/clases.vue`)

**Funcionalidad:**
- Calendario de 7 días (rolling window desde hoy)
- Lista de clases del día seleccionado
- Sistema de reserva/cancelación para usuarios
- Validación de cupos en tiempo real
- Botón dinámico según estado:
  - "Reservar" - Si no tiene reserva y hay cupos
  - "Cancelar Reserva" - Si tiene reserva y puede cancelar (>90 min)
  - "No se puede cancelar" - Si faltan <90 minutos

**Características:**
- Muestra coach asignado para cada clase
- Contador de cupos disponibles
- Indicador visual de estado de reserva
- Integración con sistema de planes (descuenta clase del plan)

---

#### 3.2 Administrar Clases (`src/pages/administrar-clases.vue`)

**Permisos:** Solo admin/superadmin

**Vista Lista:**
- Cards con información completa de cada clase
- Switch para activar/desactivar clases
- Botones: Editar, Agregar Excepción, Eliminar
- Indicador de excepciones activas
- Lista de coaches con gestión

**Vista Calendario:**
- Vista semanal con todas las clases
- Organización por día de la semana
- Colores distintivos por día
- Vista rápida de horarios y coaches

**Gestión de Clases:**
- Crear clase con:
  - Nombre, hora inicio, duración
  - Cupos máximos
  - Días de repetición (checkboxes)
  - Coach asignado
- Editar todas las propiedades
- Agregar excepciones (cancelación o cambio de coach)
- Activar/desactivar clases

**Gestión de Coaches:**
- Agregar nuevos coaches
- Ver lista de coaches activos
- Eliminar coaches

**Validaciones:**
- Todos los campos requeridos con mensajes de error específicos
- No permitir guardar sin completar campos
- Validación de formato de hora (HH:mm)

---

#### 3.3 Check In de Clases (`src/pages/check-in-clases.vue`)

**Permisos:** Solo admin/superadmin

**Panel Izquierdo - Selección:**
- Selector de fecha (cualquier día)
- Dropdown de clases (filtra por día seleccionado)
- Botón "Agregar cliente a la clase"

**Panel Derecho - Gestión:**
- Información de la clase seleccionada
- Contador de reservas (X de Y cupos)
- Lista de reservas con:
  - Avatar del usuario
  - Nombre completo
  - Estado (Activo/Asistió)
  - Fecha de reserva
  - Botón "Marcar asistencia"
  - Botón "Eliminar"

**Dialog Agregar Cliente:**
- Búsqueda en tiempo real (nombre o email)
- **Filtro automático:** Solo usuarios con planes activos
- Validaciones:
  - Usuario tiene plan activo
  - Plan tiene clases disponibles (>0)
  - Plan no ha expirado
  - Usuario no tiene reserva duplicada

**Funcionalidades Admin:**
- Agregar clientes manualmente (bypass de restricciones)
- Eliminar reservas sin restricción de tiempo
- Marcar/desmarcar asistencia
- Ver todas las reservas de cualquier clase

---

#### 3.4 Dashboard (`src/pages/index.vue`)

**Nueva Sección: "Mis Próximas Clases"**

**Contenido:**
- Muestra las próximas 3 clases reservadas del usuario
- Cards con información:
  - Nombre de la clase
  - Fecha completa (día de semana, día, mes)
  - Hora de inicio y duración
  - Coach asignado
  - Estado: "Confirmada"
- Botón para ver todas las clases
- Solo visible si el usuario tiene reservas

**Integración:**
- Carga automática al iniciar sesión
- Actualización en tiempo real
- Link directo a página de clases

---

### 4. NAVEGACIÓN

**Menú actualizado (`src/navigation/vertical/index.js`):**

```javascript
// Usuario regular
- Inicio
- Mi Plan
- Contratar Plan
- Clases                    // ← NUEVO
- Mi Perfil

// Admin/Superadmin (adicionales)
- Check In                  // ← NUEVO (tabler-clipboard-check)
- Administrar Clases        // ← NUEVO (tabler-calendar-cog)
- Usuarios
- Administrar Planes
- Pagos (submenu)
  - Validar Pagos
  - Todos los Pagos
```

---

## 🔧 API ENDPOINTS REQUERIDOS

### Endpoints de Clases

```
GET    /api/clases
GET    /api/clases/{id}
POST   /api/clases                    (admin)
PUT    /api/clases/{id}               (admin)
DELETE /api/clases/{id}               (admin)
PATCH  /api/clases/{id}/toggle        (admin)
GET    /api/clases/dia/{dia}/fecha/{fecha}
POST   /api/clases/{id}/excepciones   (admin)
DELETE /api/clases/{id}/excepciones/{fecha} (admin)
```

**Request Body - Crear/Actualizar Clase:**
```json
{
  "nombre": "Crossfit",
  "horaInicio": "06:00",
  "duracion": 60,
  "cuposMaximos": 9,
  "dias": ["lunes", "martes", "miércoles", "jueves", "viernes"],
  "coachPorDefecto": "Juan Pérez",
  "activa": true
}
```

**Request Body - Excepción:**
```json
{
  "fecha": "2026-02-15",
  "cancelada": false,
  "coachReemplazo": "María López"
}
```

---

### Endpoints de Coaches

```
GET    /api/coaches
GET    /api/coaches/{id}
POST   /api/coaches                   (admin)
PUT    /api/coaches/{id}              (admin)
DELETE /api/coaches/{id}              (admin)
```

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "activo": true
}
```

---

### Endpoints de Reservas

```
GET    /api/reservas
GET    /api/reservas/{id}
POST   /api/reservas
DELETE /api/reservas/{id}              (cancelar)
GET    /api/reservas/usuario/{usuario_id}
GET    /api/reservas/usuario/{usuario_id}/proximas
GET    /api/reservas/clase/{clase_id}/fecha/{fecha}
GET    /api/reservas/clase/{clase_id}/fecha/{fecha}/count
POST   /api/reservas/{id}/asistencia   (admin - toggle)
DELETE /api/reservas/{id}/admin        (admin - sin validación tiempo)
GET    /api/reservas/estadisticas/{usuario_id}
```

**Request Body - Crear Reserva:**
```json
{
  "usuarioId": 1,
  "claseId": 1,
  "fecha": "2026-02-10"
}
```

**Response - Crear Reserva:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuarioId": 1,
    "usuarioNombre": "Juan Pérez",
    "claseId": 1,
    "claseNombre": "Crossfit",
    "fecha": "2026-02-10",
    "horaInicio": "06:00",
    "duracion": 60,
    "coach": "Juan Pérez",
    "fechaReserva": "2026-02-08T10:30:00Z",
    "cancelada": false,
    "asistio": false
  }
}
```

**Request Body - Cancelar Reserva (Usuario):**
```json
{
  "usuarioId": 1,
  "claseId": 1,
  "fecha": "2026-02-10"
}
```

**Response - Cancelar Reserva:**
```json
{
  "success": true,
  "message": "Reserva cancelada exitosamente"
}
```

O en caso de error:
```json
{
  "success": false,
  "message": "Solo puedes cancelar hasta 90 minutos antes de la clase"
}
```

---

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tabla: `clases`

```sql
CREATE TABLE clases (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  hora_inicio TIME NOT NULL,
  duracion INT NOT NULL COMMENT 'Duración en minutos',
  cupos_maximos INT NOT NULL,
  dias JSON NOT NULL COMMENT 'Array de días: ["lunes", "martes", ...]',
  coach_por_defecto VARCHAR(255) NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  excepciones JSON COMMENT 'Array de excepciones por fecha',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL
);
```

**Índices:**
- PRIMARY KEY (id)
- INDEX idx_activa (activa)
- INDEX idx_hora_inicio (hora_inicio)

---

### Tabla: `coaches`

```sql
CREATE TABLE coaches (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL
);
```

**Índices:**
- PRIMARY KEY (id)
- INDEX idx_activo (activo)

---

### Tabla: `reservas`

```sql
CREATE TABLE reservas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  clase_id BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  duracion INT NOT NULL,
  coach VARCHAR(255) NOT NULL,
  fecha_reserva TIMESTAMP NOT NULL,
  cancelada BOOLEAN DEFAULT FALSE,
  fecha_cancelacion TIMESTAMP NULL,
  asistio BOOLEAN DEFAULT FALSE,
  fecha_asistencia TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_reserva (usuario_id, clase_id, fecha)
);
```

**Índices:**
- PRIMARY KEY (id)
- UNIQUE KEY (usuario_id, clase_id, fecha)
- INDEX idx_usuario (usuario_id)
- INDEX idx_clase_fecha (clase_id, fecha)
- INDEX idx_fecha_reserva (fecha_reserva)
- INDEX idx_cancelada (cancelada)
- INDEX idx_asistio (asistio)

---

## 🔐 VALIDACIONES Y REGLAS DE NEGOCIO

### Crear Reserva

**Validaciones:**
1. Usuario autenticado
2. Clase existe y está activa
3. Fecha es válida (no es pasada)
4. Fecha no supera 7 días de anticipación
5. Usuario no tiene reserva para esa clase/fecha
6. Hay cupos disponibles (count < cuposMaximos)
7. Usuario tiene plan activo
8. Plan tiene clases disponibles (>0)
9. Plan no ha expirado

**Proceso:**
1. Validar datos
2. Crear reserva
3. Descontar 1 clase del plan del usuario
4. Retornar reserva creada

---

### Cancelar Reserva (Usuario)

**Validaciones:**
1. Reserva existe
2. Reserva pertenece al usuario
3. Reserva no está cancelada
4. Faltan al menos 90 minutos para la clase

**Cálculo de tiempo:**
```javascript
const fechaHoraClase = new Date(`${fecha}T${horaInicio}`)
const ahora = new Date()
const diferenciaMinutos = (fechaHoraClase - ahora) / (1000 * 60)
const puedeCancelar = diferenciaMinutos >= 90
```

**Proceso:**
1. Validar tiempo
2. Marcar reserva como cancelada
3. Devolver 1 clase al plan del usuario
4. Guardar fecha de cancelación
5. Retornar confirmación

---

### Cancelar Reserva (Admin)

**Sin validación de tiempo**

**Proceso:**
1. Validar que reserva existe
2. Marcar como cancelada
3. Devolver clase al plan del usuario
4. Guardar fecha de cancelación
5. Retornar confirmación

---

### Marcar Asistencia (Admin)

**Validaciones:**
1. Reserva existe
2. Reserva no está cancelada

**Proceso:**
1. Toggle campo `asistio`
2. Si asistio = true: guardar fecha_asistencia
3. Si asistio = false: limpiar fecha_asistencia
4. Retornar nuevo estado

---

### Agregar Cliente a Clase (Admin - Check In)

**Validaciones:**
1. Usuario existe
2. Clase existe y está activa
3. Usuario tiene plan activo
4. Plan tiene clases disponibles (>0)
5. Plan no ha expirado
6. Usuario no tiene reserva duplicada

**Proceso:**
1. Validar plan del usuario
2. Crear reserva
3. Descontar clase del plan
4. Retornar confirmación

---

## 🎨 CARACTERÍSTICAS ESPECIALES

### 1. Calendario de 7 Días

**Generación dinámica:**
```javascript
const generarProximos7Dias = () => {
  const dias = []
  const hoy = new Date()
  
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    
    dias.push({
      value: fecha.toISOString().split('T')[0],
      text: nombresDias[fecha.getDay()],
      numero: fecha.getDate(),
      mes: fecha.toLocaleString('es-CL', { month: 'long' }),
      nombreCompleto: nombresCompletos[fecha.getDay()],
      nombreDiaKey: nombresCompletos[fecha.getDay()].toLowerCase(),
      fecha: fecha
    })
  }
  
  return dias
}
```

---

### 2. Sistema de Excepciones

**Permite:**
- Cancelar clase en fecha específica
- Cambiar coach para fecha específica
- Mantener programación normal en otras fechas

**Aplicación:**
```javascript
const obtenerClasesPorDia = (nombreDia, fecha) => {
  return clases
    .filter(clase => clase.activa && clase.dias.includes(nombreDia))
    .map(clase => {
      let coach = clase.coachPorDefecto
      let cancelada = false

      const excepcion = clase.excepciones?.find(e => e.fecha === fecha)
      if (excepcion) {
        if (excepcion.cancelada) cancelada = true
        if (excepcion.coachReemplazo) coach = excepcion.coachReemplazo
      }

      return { ...clase, coach, cancelada }
    })
    .filter(clase => !clase.cancelada)
}
```

---

### 3. Integración con Sistema de Planes

**Al crear reserva:**
```javascript
// Obtener plan del usuario
const plan = await Plan.where('usuario_id', usuarioId)
  .where('activo', true)
  .where('fecha_expiracion', '>', now())
  .first()

// Validar clases disponibles
if (plan.clases_disponibles <= 0) {
  throw new Error('No tienes clases disponibles')
}

// Crear reserva
const reserva = await Reserva.create(datos)

// Descontar clase
plan.clases_disponibles -= 1
plan.save()
```

**Al cancelar reserva:**
```javascript
// Marcar como cancelada
reserva.cancelada = true
reserva.fecha_cancelacion = now()
reserva.save()

// Devolver clase al plan
plan.clases_disponibles += 1
plan.save()
```

---

## 📱 FLUJOS DE USUARIO

### Usuario Regular

1. **Ver clases disponibles:**
   - Ir a "Clases"
   - Seleccionar día en calendario de 7 días
   - Ver lista de clases del día

2. **Reservar clase:**
   - Click en "Reservar"
   - Sistema valida plan y cupos
   - Confirma reserva
   - Descuenta clase del plan
   - Botón cambia a "Cancelar Reserva"

3. **Cancelar reserva:**
   - Si faltan más de 90 minutos: click en "Cancelar Reserva"
   - Confirmar cancelación
   - Sistema devuelve clase al plan
   - Botón vuelve a "Reservar"

4. **Ver próximas clases:**
   - Dashboard muestra próximas 3 clases
   - Click en "Ver todas mis clases" para ver más

---

### Administrador

1. **Configurar clases:**
   - Ir a "Administrar Clases"
   - Click en "Nueva Clase"
   - Completar formulario:
     - Nombre, hora, duración
     - Seleccionar días de semana
     - Asignar coach
   - Guardar

2. **Gestionar excepciones:**
   - Seleccionar clase
   - Click en "Excepción"
   - Elegir fecha
   - Opción A: Cancelar clase ese día
   - Opción B: Cambiar coach

3. **Check-in de clases:**
   - Ir a "Check In"
   - Seleccionar fecha
   - Seleccionar clase
   - Ver lista de reservas
   - Opciones:
     - Marcar asistencia
     - Eliminar reserva
     - Agregar cliente manualmente

4. **Agregar cliente a clase:**
   - En Check In, click "Agregar cliente"
   - Buscar usuario (solo con planes activos)
   - Seleccionar usuario
   - Confirmar
   - Sistema valida plan y crea reserva

---

## 🔍 CASOS DE USO ESPECIALES

### Caso 1: Clase Recurrente con Excepciones

**Escenario:**
- Crossfit lunes a viernes 6:00 AM
- Coach habitual: Juan Pérez
- El 15 de febrero Juan no puede, lo reemplaza María López
- El 20 de febrero se cancela la clase

**Configuración:**
```javascript
{
  nombre: "Crossfit",
  horaInicio: "06:00",
  dias: ["lunes", "martes", "miércoles", "jueves", "viernes"],
  coachPorDefecto: "Juan Pérez",
  excepciones: [
    {
      fecha: "2026-02-15",
      cancelada: false,
      coachReemplazo: "María López"
    },
    {
      fecha: "2026-02-20",
      cancelada: true,
      coachReemplazo: null
    }
  ]
}
```

**Resultado:**
- 15/02: Clase normal pero con María López
- 20/02: Clase no aparece en el sistema
- Resto de días: Clase con Juan Pérez

---

### Caso 2: Usuario con Plan Open Box

**Características:**
- Clases ilimitadas por mes
- No descuenta clases
- Vence por fecha

**Validación modificada:**
```javascript
if (plan.tipo === 'open_box') {
  // Solo validar fecha de expiración
  if (plan.fecha_expiracion <= now()) {
    throw new Error('Tu plan ha expirado')
  }
  // No descontar clases
} else {
  // Validación normal con descuento
  if (plan.clases_disponibles <= 0) {
    throw new Error('No tienes clases disponibles')
  }
  plan.clases_disponibles -= 1
}
```

---

### Caso 3: Cancelación Tardía

**Escenario:**
- Usuario reserva clase para hoy 18:00
- A las 17:00 (60 min antes) intenta cancelar

**Sistema:**
```javascript
const fechaHoraClase = new Date("2026-02-08T18:00:00")
const ahora = new Date("2026-02-08T17:00:00")
const diferencia = (fechaHoraClase - ahora) / (1000 * 60) // 60 minutos

if (diferencia < 90) {
  return {
    success: false,
    message: "Solo puedes cancelar hasta 90 minutos antes de la clase"
  }
}
```

**Resultado:**
- Botón "Cancelar Reserva" deshabilitado
- Mensaje: "Solo puedes cancelar hasta 90 min antes"
- Usuario pierde la clase de su plan

---

## 🎯 ENDPOINTS PRIORITARIOS PARA BACKEND

### Alta Prioridad

1. **Clases:**
   - `GET /api/clases/dia/{dia}/fecha/{fecha}` - Para página de clases
   - `POST /api/clases` - Crear clase
   - `PUT /api/clases/{id}` - Editar clase
   - `POST /api/clases/{id}/excepciones` - Agregar excepción

2. **Reservas:**
   - `POST /api/reservas` - Crear reserva (con validación de plan)
   - `DELETE /api/reservas/{id}` - Cancelar reserva (con validación 90 min)
   - `GET /api/reservas/usuario/{id}/proximas` - Para dashboard
   - `GET /api/reservas/clase/{id}/fecha/{fecha}` - Para check-in

3. **Check-in:**
   - `POST /api/reservas/{id}/asistencia` - Marcar asistencia
   - `DELETE /api/reservas/{id}/admin` - Cancelar sin validación

### Media Prioridad

4. **Coaches:**
   - `GET /api/coaches` - Listar coaches
   - `POST /api/coaches` - Crear coach

5. **Estadísticas:**
   - `GET /api/reservas/estadisticas/{usuario_id}` - Estadísticas usuario
   - `GET /api/clases/estadisticas` - Estadísticas generales

---

## 📝 NOTAS TÉCNICAS IMPORTANTES

### LocalStorage Keys Utilizados

```javascript
// Clases y Coaches
'clases_configuradas_ikigai'  // Array de clases
'coaches_ikigai'               // Array de coaches

// Reservas
'reservas_clases_ikigai'       // Array de reservas

// Planes (ya existente)
'user_plan_ikigai'            // Plan actual del usuario
```

### Formatos de Fecha y Hora

```javascript
// Fecha: YYYY-MM-DD
'2026-02-08'

// Hora: HH:mm (24 horas)
'06:00', '18:30', '23:45'

// Timestamp completo: ISO 8601
'2026-02-08T10:30:00Z'
```

### Días de la Semana

**Formato en base de datos:** Lowercase en español
```javascript
['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN BACKEND

### Base de Datos
- [ ] Crear tabla `clases`
- [ ] Crear tabla `coaches`
- [ ] Crear tabla `reservas`
- [ ] Crear índices necesarios
- [ ] Agregar foreign keys
- [ ] Agregar constraint UNIQUE en reservas

### Modelos Laravel
- [ ] Modelo `Clase` con casts para JSON
- [ ] Modelo `Coach`
- [ ] Modelo `Reserva`
- [ ] Relaciones:
  - [ ] User hasMany Reservas
  - [ ] Clase hasMany Reservas
  - [ ] Reserva belongsTo User
  - [ ] Reserva belongsTo Clase

### Controladores
- [ ] ClaseController (CRUD completo)
- [ ] CoachController (CRUD completo)
- [ ] ReservaController:
  - [ ] Crear con validación de plan
  - [ ] Cancelar con validación de tiempo
  - [ ] Cancelar por admin sin validación
  - [ ] Marcar asistencia
  - [ ] Estadísticas

### Validaciones
- [ ] Request para crear clase
- [ ] Request para crear reserva
- [ ] Request para crear coach
- [ ] Validación de tiempo de cancelación (90 min)
- [ ] Validación de plan activo
- [ ] Validación de cupos disponibles
- [ ] Validación de reservas duplicadas

### Lógica de Negocio
- [ ] Descontar clase del plan al reservar
- [ ] Devolver clase al plan al cancelar
- [ ] Aplicar excepciones al obtener clases
- [ ] Filtrar clases por día
- [ ] Calcular cupos disponibles
- [ ] Validar ventana de 7 días

### Middleware
- [ ] Verificar que usuario tenga plan activo
- [ ] Verificar permisos admin para check-in
- [ ] Verificar permisos admin para gestión de clases

### Testing
- [ ] Test crear reserva con plan válido
- [ ] Test crear reserva sin plan
- [ ] Test crear reserva sin clases disponibles
- [ ] Test cancelar reserva a tiempo
- [ ] Test cancelar reserva tarde (debe fallar)
- [ ] Test marcar asistencia
- [ ] Test excepciones de clases
- [ ] Test cupos completos

---

---

## 🎁 SISTEMA DE CLASES DE PRUEBA

### Fecha: 8 de Febrero, 2026

## 📋 FUNCIONALIDAD IMPLEMENTADA

### 1. STORE DE CLASES DE PRUEBA (`src/stores/clasesPrueba.js`)

**Estructura de datos - Solicitud:**
```javascript
{
  id: Number,
  nombre: String,              // Nombre completo del interesado
  email: String,               // Email del interesado
  telefono: String,            // Teléfono de contacto
  claseId: Number,             // ID de la clase solicitada
  claseNombre: String,         // Nombre de la clase
  fechaPreferida: String,      // YYYY-MM-DD
  horaInicio: String,          // HH:mm
  coach: String,               // Coach asignado
  mensaje: String,             // Mensaje opcional del interesado
  estado: String,              // 'pendiente', 'aprobada', 'rechazada'
  fechaSolicitud: String,      // ISO timestamp
  fechaRespuesta: String,      // ISO timestamp (cuando se aprueba/rechaza)
  notasAdmin: String           // Notas internas del admin
}
```

**Estados posibles:**
- `pendiente` - Solicitud recién creada, esperando revisión
- `aprobada` - Admin aprobó la solicitud
- `rechazada` - Admin rechazó la solicitud

**Métodos del Store:**
- `crearSolicitud(datos)` - Crea nueva solicitud de clase de prueba
- `aprobarSolicitud(id, notasAdmin)` - Aprueba solicitud
- `rechazarSolicitud(id, notasAdmin)` - Rechaza solicitud
- `eliminarSolicitud(id)` - Elimina solicitud
- `obtenerSolicitudesPorClase(claseId, fecha)` - Solicitudes aprobadas de una clase
- `contarSolicitudesAprobadas(claseId, fecha)` - Cuenta solicitudes aprobadas
- `tieneSolicitudPendiente(email)` - Verifica si email tiene solicitud pendiente

**Storage:** `localStorage.solicitudes_clase_prueba_ikigai`

---

### 2. CONFIGURACIÓN EN CLASES

**Campo agregado al modelo Clase:**
```javascript
{
  ...camposExistentes,
  permitePrueba: Boolean  // Si la clase permite solicitudes de prueba
}
```

**Por defecto:** `false` (las clases no permiten prueba hasta que admin lo active)

---

### 3. PÁGINAS IMPLEMENTADAS

#### 3.1 Clase de Prueba (`src/pages/clase-prueba.vue`)

**Permisos:** Público/Usuario regular

**Funcionalidad:**
- Formulario para solicitar clase de prueba gratuita
- Solo muestra clases que tienen `permitePrueba: true`
- Calendario de 14 días con días disponibles según horario de clase
- Respeta excepciones (no muestra días cancelados)

**Campos del formulario:**
- Nombre completo *
- Email * (validación de formato)
- Teléfono *
- Clase que te interesa * (dropdown)
- Fecha preferida * (dropdown de días disponibles)
- Mensaje adicional (opcional)

**Validaciones:**
- Todos los campos requeridos
- Email con formato válido
- No permitir duplicados: un email solo puede tener 1 solicitud pendiente
- Solo fechas futuras dentro de 14 días
- Solo clases activas y que permiten prueba

**Panel lateral informativo:**
- Lista de qué incluye la clase de prueba
- Lista de clases disponibles con horarios
- Mensaje de confirmación

**Dialog de éxito:**
- Confirmación visual al enviar
- Mensaje de que serán contactados en 24 horas

---

#### 3.2 Gestionar Pruebas (`src/pages/administrar-clases-prueba.vue`)

**Permisos:** Solo admin/superadmin

**Sección: Estadísticas (Cards superiores)**
- Pendientes (amarillo)
- Aprobadas (verde)
- Rechazadas (rojo)
- Total (azul)

**Tab 1: Solicitudes Pendientes**

Vista en cards con:
- Estado (chip de color)
- Información del interesado:
  - Nombre
  - Email
  - Teléfono
- Información de la clase:
  - Nombre de la clase
  - Fecha preferida
  - Hora
  - Coach asignado
- Mensaje del interesado (si existe)
- Fecha de solicitud
- Botones de acción:
  - ✅ Aprobar (verde)
  - ❌ Rechazar (rojo)
  - 🗑️ Eliminar

**Tab 2: Historial**

Tabla con todas las solicitudes procesadas:
- Nombre
- Email
- Clase
- Fecha
- Estado (chip)
- Fecha de respuesta
- Acciones (eliminar)

**Dialog: Configurar Clases**

Botón en header que abre modal con:
- Lista de todas las clases
- Switch para activar/desactivar `permitePrueba`
- Solo clases activas pueden activar permitePrueba
- Guarda automáticamente en localStorage

**Dialog: Responder Solicitud**

Al aprobar o rechazar:
- Muestra resumen de la solicitud
- Campo de texto para "Notas del administrador" (opcional)
- Botón confirmar (verde para aprobar, rojo para rechazar)
- Guarda fecha de respuesta automáticamente

---

### 4. NAVEGACIÓN

**Menú actualizado:**

```javascript
// Usuario regular
- Clases
- Clase de Prueba        // ← NUEVO (icono: tabler-discount-check)

// Admin/Superadmin (adicionales)
- Check In
- Administrar Clases
- Gestionar Pruebas      // ← NUEVO (icono: tabler-clipboard-list)
```

---

## 🔧 API ENDPOINTS REQUERIDOS

### Endpoints de Solicitudes de Clase de Prueba

```
GET    /api/clases-prueba
GET    /api/clases-prueba/{id}
POST   /api/clases-prueba
PATCH  /api/clases-prueba/{id}/aprobar     (admin)
PATCH  /api/clases-prueba/{id}/rechazar    (admin)
DELETE /api/clases-prueba/{id}             (admin)
GET    /api/clases-prueba/pendientes       (admin)
GET    /api/clases-prueba/historial        (admin)
```

**Request Body - Crear Solicitud:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "+56912345678",
  "claseId": 1,
  "fechaPreferida": "2026-02-15",
  "mensaje": "Me interesa probar Crossfit para mejorar mi condición física"
}
```

**Response - Crear Solicitud:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "telefono": "+56912345678",
    "claseId": 1,
    "claseNombre": "Crossfit",
    "fechaPreferida": "2026-02-15",
    "horaInicio": "06:00",
    "coach": "Juan Pérez",
    "mensaje": "Me interesa probar Crossfit...",
    "estado": "pendiente",
    "fechaSolicitud": "2026-02-08T10:30:00Z",
    "fechaRespuesta": null,
    "notasAdmin": ""
  },
  "message": "Solicitud enviada exitosamente. Te contactaremos pronto."
}
```

**Request Body - Aprobar Solicitud:**
```json
{
  "notasAdmin": "Cliente aprobado, recordar enviar email de confirmación"
}
```

**Response - Aprobar/Rechazar:**
```json
{
  "success": true,
  "message": "Solicitud aprobada exitosamente"
}
```

---

### Endpoints de Clases (Actualizar)

**PATCH /api/clases/{id}/toggle-prueba** (admin)

Request Body:
```json
{
  "permitePrueba": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Crossfit",
    "permitePrueba": true
  }
}
```

---

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tabla: `solicitudes_clase_prueba`

```sql
CREATE TABLE solicitudes_clase_prueba (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  clase_id BIGINT UNSIGNED NOT NULL,
  fecha_preferida DATE NOT NULL,
  mensaje TEXT NULL,
  estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  fecha_solicitud TIMESTAMP NOT NULL,
  fecha_respuesta TIMESTAMP NULL,
  notas_admin TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  
  FOREIGN KEY (clase_id) REFERENCES clases(id) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_estado (estado),
  INDEX idx_clase_fecha (clase_id, fecha_preferida),
  INDEX idx_fecha_solicitud (fecha_solicitud)
);
```

**Índices:**
- PRIMARY KEY (id)
- FOREIGN KEY clase_id → clases(id)
- INDEX por email (para búsquedas rápidas)
- INDEX por estado (filtrar pendientes/aprobadas/rechazadas)
- INDEX compuesto (clase_id, fecha_preferida) para contar solicitudes
- INDEX por fecha_solicitud (ordenamiento)

---

### Actualización Tabla: `clases`

```sql
ALTER TABLE clases 
ADD COLUMN permite_prueba BOOLEAN DEFAULT FALSE AFTER activa;
```

---

## 🔐 VALIDACIONES Y REGLAS DE NEGOCIO

### Crear Solicitud

**Validaciones:**
1. Nombre requerido (mín 3 caracteres)
2. Email requerido y formato válido
3. Teléfono requerido
4. Clase existe y está activa
5. Clase tiene `permitePrueba = true`
6. Fecha es futura (mayor a hoy)
7. Fecha está dentro de 14 días
8. Fecha coincide con días de la clase (lunes-domingo)
9. No hay excepción de cancelación para esa fecha
10. Email NO tiene solicitud pendiente

**Validación de email duplicado:**
```javascript
const solicitudExistente = await SolicitudClasePrueba
  .where('email', email)
  .where('estado', 'pendiente')
  .first()

if (solicitudExistente) {
  throw new Error('Ya tienes una solicitud de clase de prueba pendiente')
}
```

**Validación de fecha disponible:**
```javascript
const clase = await Clase.findOrFail(claseId)
const diaSemana = obtenerDiaSemana(fechaPreferida) // 'lunes', 'martes', etc.

if (!clase.dias.includes(diaSemana)) {
  throw new Error('La clase no se dicta el día seleccionado')
}

// Verificar excepciones
const excepcion = clase.excepciones.find(e => e.fecha === fechaPreferida)
if (excepcion && excepcion.cancelada) {
  throw new Error('La clase está cancelada para esta fecha')
}
```

**Proceso:**
1. Validar todos los datos
2. Obtener información de la clase (nombre, horario, coach)
3. Crear solicitud con estado 'pendiente'
4. Guardar fecha de solicitud (now)
5. Retornar confirmación
6. (Opcional) Enviar email de confirmación al interesado
7. (Opcional) Notificar a administradores

---

### Aprobar Solicitud (Admin)

**Validaciones:**
1. Solicitud existe
2. Solicitud está en estado 'pendiente'

**Proceso:**
1. Cambiar estado a 'aprobada'
2. Guardar fecha de respuesta (now)
3. Guardar notas del admin (si existen)
4. Retornar confirmación
5. (Opcional) Enviar email de confirmación al cliente
6. (Opcional) Agregar al sistema de reservas con tipo 'prueba'

---

### Rechazar Solicitud (Admin)

**Validaciones:**
1. Solicitud existe
2. Solicitud está en estado 'pendiente'

**Proceso:**
1. Cambiar estado a 'rechazada'
2. Guardar fecha de respuesta (now)
3. Guardar notas del admin (si existen)
4. Retornar confirmación
5. (Opcional) Enviar email explicando rechazo

---

### Configurar Clase para Permitir Pruebas

**Validaciones:**
1. Clase existe
2. Clase está activa
3. Usuario es admin/superadmin

**Proceso:**
1. Toggle campo `permitePrueba`
2. Guardar cambio
3. Retornar confirmación

---

## 🎨 CARACTERÍSTICAS ESPECIALES

### 1. Calendario Inteligente de 14 Días

Genera solo días en los que la clase se dicta:

```javascript
const generarDiasDisponibles = (clase) => {
  const dias = []
  const hoy = new Date()
  const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 
                       'jueves', 'viernes', 'sábado']
  
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    const nombreDia = nombresDias[fecha.getDay()]
    
    // Solo días en que se dicta la clase
    if (clase.dias.includes(nombreDia)) {
      // Verificar excepciones
      const excepcion = clase.excepciones?.find(e => 
        e.fecha === fecha.toISOString().split('T')[0]
      )
      
      if (!excepcion || !excepcion.cancelada) {
        dias.push({
          value: fecha.toISOString().split('T')[0],
          text: `${nombreDia} ${fecha.getDate()}/${fecha.getMonth() + 1}`
        })
      }
    }
  }
  
  return dias
}
```

---

### 2. Prevención de Duplicados

Un email solo puede tener una solicitud pendiente a la vez:

```javascript
// En frontend
if (clasesPruebaStore.tieneSolicitudPendiente(formulario.email)) {
  errores.email = 'Ya tienes una solicitud de clase de prueba pendiente'
  return
}

// En backend
const validator = {
  email: [
    'required',
    'email',
    Rule.unique('solicitudes_clase_prueba', 'email')
      .where('estado', 'pendiente')
  ]
}
```

Si el usuario quiere solicitar otra clase:
1. Admin debe aprobar/rechazar la pendiente primero
2. O admin puede eliminarla
3. Luego podrá crear una nueva

---

### 3. Integración con Sistema de Reservas (Opcional)

Cuando se aprueba una solicitud, opcionalmente se puede:

```javascript
const aprobarYReservar = async (solicitudId) => {
  const solicitud = await SolicitudClasePrueba.findOrFail(solicitudId)
  
  // Aprobar solicitud
  solicitud.estado = 'aprobada'
  solicitud.fechaRespuesta = now()
  await solicitud.save()
  
  // Crear reserva automática con tipo 'prueba'
  await Reserva.create({
    usuarioId: null, // No es usuario registrado
    nombreCompleto: solicitud.nombre,
    email: solicitud.email,
    telefono: solicitud.telefono,
    claseId: solicitud.claseId,
    fecha: solicitud.fechaPreferida,
    tipo: 'prueba', // Nuevo campo para diferenciar
    estado: 'confirmada'
  })
  
  return solicitud
}
```

---

### 4. Estadísticas en Dashboard Admin

Cards con métricas:
- **Pendientes** (warning): Requieren atención inmediata
- **Aprobadas** (success): Clases de prueba confirmadas
- **Rechazadas** (error): Solicitudes denegadas
- **Total**: Todas las solicitudes históricas

```javascript
const estadisticas = {
  pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
  aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
  rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
  total: solicitudes.length
}
```

---

## 📱 FLUJOS DE USUARIO

### Usuario Interesado (No Cliente)

1. **Descubrir clases de prueba:**
   - Ver página pública o menú "Clase de Prueba"
   - Ver lista de clases disponibles para prueba

2. **Solicitar clase:**
   - Completar formulario con datos personales
   - Seleccionar clase de interés
   - Elegir fecha preferida (próximos 14 días)
   - Agregar mensaje opcional
   - Enviar solicitud

3. **Confirmación:**
   - Ver mensaje de éxito
   - Recibir email de confirmación (opcional)
   - Esperar contacto del box (24-48 hrs)

4. **Asistir a clase:**
   - Admin lo agrega en check-in como "clase de prueba"
   - Participa en la clase
   - Recibe información de planes disponibles

---

### Administrador

1. **Configurar clases:**
   - Ir a "Gestionar Pruebas"
   - Click en "Configurar Clases"
   - Activar switch en clases que permiten prueba
   - Solo clases activas pueden activarse

2. **Revisar solicitudes:**
   - Ver dashboard con estadísticas
   - Tab "Solicitudes Pendientes"
   - Ver cards con información completa
   - Leer mensaje del interesado

3. **Aprobar solicitud:**
   - Click en "Aprobar"
   - Agregar notas internas (opcional)
   - Confirmar
   - Sistema marca como aprobada
   - (Opcional) Enviar email al cliente
   - (Opcional) Agendar en calendario

4. **Rechazar solicitud:**
   - Click en "Rechazar"
   - Agregar motivo en notas (opcional)
   - Confirmar
   - Sistema marca como rechazada
   - (Opcional) Enviar email explicativo

5. **Gestionar historial:**
   - Tab "Historial"
   - Ver todas las solicitudes procesadas
   - Filtrar por estado
   - Eliminar solicitudes antiguas

6. **Check-in día de la clase:**
   - Agregar cliente manualmente en check-in
   - Marcar asistencia
   - Registrar si completó la clase

---

## 🔍 CASOS DE USO ESPECIALES

### Caso 1: Usuario Solicita Múltiples Clases

**Escenario:**
- Usuario quiere probar Crossfit Y Yoga
- Intenta crear segunda solicitud

**Sistema:**
```javascript
// Primera solicitud
POST /api/clases-prueba
{
  "claseId": 1, // Crossfit
  "email": "juan@email.com"
}
// ✅ Éxito, estado: pendiente

// Segunda solicitud (inmediata)
POST /api/clases-prueba
{
  "claseId": 2, // Yoga
  "email": "juan@email.com"
}
// ❌ Error: "Ya tienes una solicitud pendiente"
```

**Solución:**
- Admin debe procesar primera solicitud
- Una vez aprobada/rechazada, puede solicitar otra
- O admin puede eliminar la pendiente

---

### Caso 2: Clase con Horarios Múltiples

**Escenario:**
- Crossfit lunes, miércoles, viernes 6:00 AM
- Crossfit martes, jueves 18:00 PM
- Son dos clases diferentes

**Configuración:**
```javascript
// Clase 1
{
  nombre: "Crossfit Mañana",
  horaInicio: "06:00",
  dias: ["lunes", "miércoles", "viernes"],
  permitePrueba: true
}

// Clase 2
{
  nombre: "Crossfit Tarde",
  horaInicio: "18:00",
  dias: ["martes", "jueves"],
  permitePrueba: true
}
```

Usuario puede elegir el horario que le acomode.

---

### Caso 3: Clase Llena

**Escenario:**
- Crossfit tiene 9 cupos
- Hay 8 reservas confirmadas
- 3 solicitudes de prueba aprobadas para el mismo día

**Consideración:**
- Solicitudes de prueba NO descuentan cupos automáticamente
- Admin debe revisar disponibilidad antes de aprobar
- Puede crear sistema de "lista de espera"

**Validación mejorada:**
```javascript
const aprobarSolicitud = async (solicitudId) => {
  const solicitud = await SolicitudClasePrueba.findOrFail(solicitudId)
  
  // Contar reservas + solicitudes aprobadas
  const reservasConfirmadas = await Reserva
    .where('claseId', solicitud.claseId)
    .where('fecha', solicitud.fechaPreferida)
    .where('cancelada', false)
    .count()
  
  const solicitudesAprobadas = await SolicitudClasePrueba
    .where('claseId', solicitud.claseId)
    .where('fecha', solicitud.fechaPreferida)
    .where('estado', 'aprobada')
    .count()
  
  const clase = await Clase.findOrFail(solicitud.claseId)
  const totalOcupados = reservasConfirmadas + solicitudesAprobadas
  
  if (totalOcupados >= clase.cuposMaximos) {
    throw new Error('No hay cupos disponibles para esta clase')
  }
  
  // Aprobar
  solicitud.estado = 'aprobada'
  await solicitud.save()
}
```

---

## 🎯 ENDPOINTS PRIORITARIOS PARA BACKEND

### Alta Prioridad

1. **Solicitudes:**
   - `POST /api/clases-prueba` - Crear solicitud (con todas las validaciones)
   - `GET /api/clases-prueba/pendientes` - Para dashboard admin
   - `PATCH /api/clases-prueba/{id}/aprobar` - Aprobar solicitud
   - `PATCH /api/clases-prueba/{id}/rechazar` - Rechazar solicitud

2. **Clases:**
   - `PATCH /api/clases/{id}/toggle-prueba` - Activar/desactivar permitePrueba
   - `GET /api/clases/disponibles-prueba` - Solo clases con permitePrueba=true

### Media Prioridad

3. **Historial:**
   - `GET /api/clases-prueba/historial` - Todas las solicitudes procesadas
   - `GET /api/clases-prueba/estadisticas` - Métricas para dashboard

4. **Gestión:**
   - `DELETE /api/clases-prueba/{id}` - Eliminar solicitud

---

## 📝 NOTAS TÉCNICAS IMPORTANTES

### LocalStorage Keys Utilizados

```javascript
// Solicitudes de clase de prueba
'solicitudes_clase_prueba_ikigai'  // Array de solicitudes

// Clases (actualizado)
'clases_configuradas_ikigai'       // Incluye campo permitePrueba
```

### Estados de Solicitud

```javascript
enum Estado {
  PENDIENTE = 'pendiente',   // Recién creada
  APROBADA = 'aprobada',     // Admin aprobó
  RECHAZADA = 'rechazada'    // Admin rechazó
}
```

### Notificaciones (Opcional)

Al crear solicitud:
```javascript
// Email al interesado
subject: "Hemos recibido tu solicitud de clase de prueba"
body: "Nos contactaremos contigo dentro de las próximas 24 horas..."

// Notificación a admins
subject: "Nueva solicitud de clase de prueba"
body: "Juan Pérez ha solicitado clase de Crossfit para el 15/02/2026"
```

Al aprobar:
```javascript
// Email al interesado
subject: "¡Tu clase de prueba ha sido confirmada!"
body: "Te esperamos el [fecha] a las [hora] para tu clase de [nombre]..."
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN BACKEND

### Base de Datos
- [ ] Crear tabla `solicitudes_clase_prueba`
- [ ] Agregar columna `permite_prueba` a tabla `clases`
- [ ] Crear índices necesarios
- [ ] Agregar foreign key a clases

### Modelos Laravel
- [ ] Modelo `SolicitudClasePrueba`
- [ ] Actualizar modelo `Clase` con campo `permitePrueba`
- [ ] Casts para fechas y enum de estado

### Controladores
- [ ] SolicitudClasePruebaController:
  - [ ] Crear con validaciones
  - [ ] Listar pendientes
  - [ ] Aprobar
  - [ ] Rechazar
  - [ ] Historial
  - [ ] Estadísticas
  - [ ] Eliminar

### Validaciones
- [ ] Request para crear solicitud:
  - [ ] Email único en pendientes
  - [ ] Clase existe y permite prueba
  - [ ] Fecha válida y disponible
- [ ] Request para aprobar/rechazar
- [ ] Validación de cupos disponibles (opcional)

### Lógica de Negocio
- [ ] Validar días disponibles según clase
- [ ] Aplicar excepciones (no permitir días cancelados)
- [ ] Prevenir solicitudes duplicadas por email
- [ ] Integración opcional con sistema de reservas
- [ ] Conteo de cupos incluyendo solicitudes aprobadas

### Notificaciones (Opcional)
- [ ] Email confirmación al crear solicitud
- [ ] Email a admins con nueva solicitud
- [ ] Email al aprobar solicitud
- [ ] Email al rechazar solicitud

### Testing
- [ ] Test crear solicitud válida
- [ ] Test crear solicitud duplicada (debe fallar)
- [ ] Test crear solicitud sin permitePrueba (debe fallar)
- [ ] Test aprobar solicitud
- [ ] Test rechazar solicitud
- [ ] Test validación de fechas
- [ ] Test clase llena (opcional)

---

**Versión:** 2.1
**Última actualización:** 8 de Febrero, 2026
**Desarrollado para:** APP IKIGAI BOX