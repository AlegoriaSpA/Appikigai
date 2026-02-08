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
