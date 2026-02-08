# Documentación de Endpoints - API APP IKIGAI BOX

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Evaluaciones Nutricionales](#evaluaciones-nutricionales)
4. [Informes y Reportes](#informes-y-reportes)
5. [Mensajes](#mensajes)
6. [Perfil de Usuario](#perfil-de-usuario)
7. [Planes de Alimentación](#planes-de-alimentación)

---

## 🔐 Autenticación

Base URL: `/api/auth`

### POST /auth/login
Iniciar sesión en la aplicación.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userData": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez",
    "email": "usuario@ejemplo.com",
    "role": "admin",
    "numero_documento": "12.345.678-9",
    "telefono": "+56912345678"
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas
- `422 Unprocessable Entity`: Validación fallida

---

### POST /auth/register
Registrar nuevo usuario.

**Request:**
```json
{
  "name": "Juan",
  "apellidos": "Pérez",
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "password_confirmation": "password123",
  "numero_documento": "12.345.678-9",
  "telefono": "+56912345678",
  "diaNacimiento": 15,
  "mesNacimiento": 8,
  "anioNacimiento": 1990,
  "edad": 35,
  "fecha_nacimiento": "1990-08-15"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez",
    "email": "usuario@ejemplo.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### GET /auth/me
Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez",
    "email": "usuario@ejemplo.com",
    "role": "admin",
    "numero_documento": "12.345.678-9",
    "telefono": "+56912345678",
    "edad": 35,
    "fecha_nacimiento": "1990-08-15"
  }
}
```

---

### POST /auth/logout
Cerrar sesión del usuario actual.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### POST /auth/forgot-password
Solicitar recuperación de contraseña.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Se ha enviado un correo con las instrucciones para restablecer la contraseña"
}
```

---

### POST /auth/reset-password
Restablecer contraseña con token.

**Request:**
```json
{
  "token": "reset-token-hash",
  "email": "usuario@ejemplo.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Contraseña restablecida exitosamente"
}
```

---

## 👥 Usuarios

Base URL: `/api/users`

### GET /users
Listar todos los usuarios (Admin/Superadmin).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `per_page` (optional): Número de registros por página (default: 10)
- `page` (optional): Número de página (default: 1)
- `search` (optional): Búsqueda por nombre o email
- `role` (optional): Filtrar por rol (user, admin, superadmin, secretaria, editor)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan",
      "apellidos": "Pérez",
      "email": "juan@ejemplo.com",
      "role": "user",
      "numero_documento": "12.345.678-9",
      "telefono": "+56912345678",
      "edad": 35,
      "fecha_nacimiento": "1990-08-15",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ],
  "current_page": 1,
  "per_page": 10,
  "total": 50,
  "last_page": 5
}
```

**Roles disponibles:**
- `user`: Usuario regular (paciente)
- `admin`: Administrador
- `superadmin`: Super administrador
- `secretaria`: Secretaria
- `editor`: Editor

---

### GET /users/{id}
Obtener información de un usuario específico.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez",
    "email": "juan@ejemplo.com",
    "role": "user",
    "numero_documento": "12.345.678-9",
    "telefono": "+56912345678",
    "edad": 35,
    "fecha_nacimiento": "1990-08-15",
    "diaNacimiento": 15,
    "mesNacimiento": 8,
    "anioNacimiento": 1990,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

---

### POST /users
Crear nuevo usuario (Admin/Superadmin).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Juan",
  "apellidos": "Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "user",
  "numero_documento": "12.345.678-9",
  "telefono": "+56912345678",
  "diaNacimiento": 15,
  "mesNacimiento": 8,
  "anioNacimiento": 1990,
  "edad": 35,
  "fecha_nacimiento": "1990-08-15"
}
```

**Response (201 Created):**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez",
    "email": "juan@ejemplo.com",
    "role": "user"
  }
}
```

---

### PUT /users/{id}
Actualizar información de un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Juan",
  "apellidos": "Pérez García",
  "email": "juan.nuevo@ejemplo.com",
  "role": "admin",
  "numero_documento": "12.345.678-9",
  "telefono": "+56912345678",
  "diaNacimiento": 15,
  "mesNacimiento": 8,
  "anioNacimiento": 1990,
  "edad": 35,
  "fecha_nacimiento": "1990-08-15"
}
```

**Response (200 OK):**
```json
{
  "message": "Usuario actualizado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez García",
    "email": "juan.nuevo@ejemplo.com"
  }
}
```

---

### DELETE /users/{id}
Eliminar un usuario (Superadmin).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

---

## 📊 Evaluaciones Nutricionales

Base URL: `/api/evaluaciones`

### GET /evaluaciones
Listar todas las evaluaciones nutricionales.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `per_page` (optional): Registros por página
- `page` (optional): Número de página
- `usuario_id` (optional): Filtrar por ID de usuario
- `fecha_desde` (optional): Fecha desde (YYYY-MM-DD)
- `fecha_hasta` (optional): Fecha hasta (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "usuario": {
        "id": 1,
        "name": "Carlos",
        "apellidos": "Mendoza Silva"
      },
      "fecha_evaluacion": "2024-12-03",
      "peso": 83.8,
      "estatura": 179,
      "circunferencia_cintura": 85,
      "circunferencia_brazo_relajado": 36,
      "circunferencia_brazo_contraccion": 38,
      "circunferencia_muslo": 60,
      "circunferencia_pantorrilla": 39.5,
      "pliegue_tricipital": 9,
      "pliegue_bicipital": 2,
      "pliegue_suprailiaco": 18.5,
      "pliegue_subescapular": 9.5,
      "pliegue_abdominal": 10,
      "pliegue_muslo": 15,
      "pliegue_pantorrilla": 8,
      "porcentaje_grasa": 18.9,
      "imc": 26.1,
      "objetivo_paciente": "Reducir porcentaje de grasa corporal manteniendo masa muscular",
      "fecha_proxima_evaluacion": "2025-03-03",
      "notas": "Primera evaluación del paciente. Buen estado físico general.",
      "created_at": "2024-12-03T10:00:00Z",
      "updated_at": "2024-12-03T10:00:00Z"
    }
  ],
  "current_page": 1,
  "per_page": 25,
  "total": 100,
  "last_page": 4
}
```

---

### GET /evaluaciones/{id}
Obtener una evaluación específica.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "usuario_id": 1,
    "usuario": {
      "id": 1,
      "name": "Carlos",
      "apellidos": "Mendoza Silva",
      "email": "carlos@ejemplo.com"
    },
    "fecha_evaluacion": "2024-12-03",
    "peso": 83.8,
    "estatura": 179,
    "circunferencia_cintura": 85,
    "circunferencia_brazo_relajado": 36,
    "circunferencia_brazo_contraccion": 38,
    "circunferencia_muslo": 60,
    "circunferencia_pantorrilla": 39.5,
    "pliegue_tricipital": 9,
    "pliegue_bicipital": 2,
    "pliegue_suprailiaco": 18.5,
    "pliegue_subescapular": 9.5,
    "pliegue_abdominal": 10,
    "pliegue_muslo": 15,
    "pliegue_pantorrilla": 8,
    "porcentaje_grasa": 18.9,
    "imc": 26.1,
    "objetivo_paciente": "Reducir porcentaje de grasa corporal",
    "fecha_proxima_evaluacion": "2025-03-03",
    "notas": "Primera evaluación del paciente"
  }
}
```

---

### GET /evaluaciones/usuario/{usuario_id}
Obtener todas las evaluaciones de un usuario específico.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `order` (optional): Orden (asc/desc, default: desc)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "fecha_evaluacion": "2024-12-03",
      "peso": 83.8,
      "imc": 26.1,
      "porcentaje_grasa": 18.9
    },
    {
      "id": 2,
      "fecha_evaluacion": "2025-03-12",
      "peso": 82,
      "imc": 25.5,
      "porcentaje_grasa": 19
    }
  ]
}
```

---

### GET /evaluaciones/usuario/{usuario_id}/anterior
Obtener la evaluación anterior de un usuario (para comparación).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `fecha_actual` (optional): Fecha de referencia para buscar la anterior

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "fecha_evaluacion": "2024-12-03",
    "peso": 83.8,
    "estatura": 179,
    "imc": 26.1,
    "porcentaje_grasa": 18.9,
    "circunferencia_cintura": 85,
    "objetivo_paciente": "Reducir grasa corporal",
    "notas": "Primera evaluación"
  }
}
```

---

### POST /evaluaciones
Crear nueva evaluación nutricional.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "usuario_id": 1,
  "fecha_evaluacion": "2024-12-03",
  "peso": 83.8,
  "estatura": 179,
  "circunferencia_cintura": 85,
  "circunferencia_brazo_relajado": 36,
  "circunferencia_brazo_contraccion": 38,
  "circunferencia_muslo": 60,
  "circunferencia_pantorrilla": 39.5,
  "pliegue_tricipital": 9,
  "pliegue_bicipital": 2,
  "pliegue_suprailiaco": 18.5,
  "pliegue_subescapular": 9.5,
  "pliegue_abdominal": 10,
  "pliegue_muslo": 15,
  "pliegue_pantorrilla": 8,
  "porcentaje_grasa": 18.9,
  "imc": 26.1,
  "objetivo_paciente": "Reducir porcentaje de grasa corporal manteniendo masa muscular",
  "fecha_proxima_evaluacion": "2025-03-03",
  "notas": "Primera evaluación del paciente. Buen estado físico general."
}
```

**Response (201 Created):**
```json
{
  "message": "Evaluación creada exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "fecha_evaluacion": "2024-12-03",
    "peso": 83.8,
    "imc": 26.1
  }
}
```

**Validaciones:**
- `usuario_id`: Requerido, debe existir
- `fecha_evaluacion`: Requerida, formato YYYY-MM-DD
- `peso`: Opcional, numérico, mayor a 0
- `estatura`: Opcional, numérico, mayor a 0
- Todos los valores antropométricos son opcionales

---

### PUT /evaluaciones/{id}
Actualizar evaluación existente.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** (mismo formato que POST)

**Response (200 OK):**
```json
{
  "message": "Evaluación actualizada exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1,
    "fecha_evaluacion": "2024-12-03",
    "peso": 84,
    "imc": 26.2
  }
}
```

---

### DELETE /evaluaciones/{id}
Eliminar evaluación.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Evaluación eliminada exitosamente"
}
```

---

## 📈 Informes y Reportes

Base URL: `/api/informes`

### GET /informes/usuario/{usuario_id}/evolucion
Obtener informe de evolución completo de un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "usuario": {
    "id": 1,
    "name": "Carlos",
    "apellidos": "Mendoza Silva",
    "numero_documento": "18.456.789-2",
    "edad": 37
  },
  "evaluaciones": [
    {
      "id": 1,
      "fecha_evaluacion": "2024-12-03",
      "peso": 83.8,
      "imc": 26.1,
      "porcentaje_grasa": 18.9
    }
  ],
  "resumen": {
    "total_evaluaciones": 4,
    "primera_evaluacion": "2024-12-03",
    "ultima_evaluacion": "2025-10-04",
    "cambios": {
      "peso": {
        "inicial": 83.8,
        "actual": 84.9,
        "diferencia": 1.1,
        "porcentaje": 1.3
      },
      "imc": {
        "inicial": 26.1,
        "actual": 26.5,
        "diferencia": 0.4,
        "porcentaje": 1.5
      },
      "grasa": {
        "inicial": 18.9,
        "actual": 17.5,
        "diferencia": -1.4,
        "porcentaje": -7.4
      }
    }
  }
}
```

---

### GET /informes/usuario/{usuario_id}/comparacion
Comparar primera y última evaluación.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "primera": {
    "fecha": "2024-12-03",
    "peso": 83.8,
    "imc": 26.1,
    "grasa": 18.9
  },
  "ultima": {
    "fecha": "2025-10-04",
    "peso": 84.9,
    "imc": 26.5,
    "grasa": 17.5
  },
  "cambios": {
    "peso": 1.1,
    "imc": 0.4,
    "grasa": -1.4
  }
}
```

---

### GET /informes/usuario/{usuario_id}
Obtener historial de informes generados para un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "tipo_informe": "evolucion",
      "nombre_archivo": "Informe_Carlos_Mendoza_2026-01-26.pdf",
      "fecha_generacion": "2026-01-26T14:30:00.000Z",
      "total_evaluaciones": 4,
      "periodo": {
        "desde": "2024-12-03",
        "hasta": "2025-10-04"
      },
      "incluye_plan_alimentacion": true,
      "incluye_plan_competitivo": false,
      "generado_por": "Juan Pérez",
      "metadata": {
        "primera_evaluacion": {...},
        "ultima_evaluacion": {...},
        "graficos_incluidos": ["peso_imc", "grasa", "circunferencias", "pliegues"]
      },
      "created_at": "2026-01-26T14:30:00.000Z"
    }
  ]
}
```

---

### POST /informes
Registrar un nuevo informe generado.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "usuario_id": 1,
  "tipo_informe": "evolucion",
  "nombre_archivo": "Informe_Carlos_Mendoza_2026-01-26.pdf",
  "fecha_generacion": "2026-01-26T14:30:00.000Z",
  "total_evaluaciones": 4,
  "periodo": {
    "desde": "2024-12-03",
    "hasta": "2025-10-04"
  },
  "incluye_plan_alimentacion": true,
  "incluye_plan_competitivo": false,
  "generado_por": "Juan Pérez",
  "metadata": {
    "primera_evaluacion": {...},
    "ultima_evaluacion": {...},
    "graficos_incluidos": ["peso_imc", "grasa", "circunferencias", "pliegues"]
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "usuario_id": 1,
    "tipo_informe": "evolucion",
    "nombre_archivo": "Informe_Carlos_Mendoza_2026-01-26.pdf",
    "fecha_generacion": "2026-01-26T14:30:00.000Z",
    "created_at": "2026-01-26T14:30:00.000Z"
  },
  "message": "Informe registrado exitosamente"
}
```

---

### DELETE /informes/{id}
Eliminar un registro de informe.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Informe eliminado exitosamente"
}
```

---

## 📩 Mensajes

Base URL: `/api/mensajes`

### GET /mensajes
Listar mensajes del usuario autenticado.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `per_page` (optional): Registros por página
- `page` (optional): Número de página
- `leido` (optional): Filtrar por leído (true/false)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Bienvenido a APP IKIGAI BOX",
      "contenido": "Gracias por registrarte en nuestra plataforma...",
      "tipo": "bienvenida",
      "leido": false,
      "fecha_lectura": null,
      "usuario_id": 1,
      "created_by_id": null,
      "respuestas": [],
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ],
  "no_leidos": 5,
  "current_page": 1,
  "per_page": 9999,
  "total": 10
}
```

**Tipos de mensajes:**
- `bienvenida`: Mensaje de bienvenida
- `notificacion`: Notificación general
- `evaluacion`: Relacionado a evaluaciones
- `sistema`: Mensaje del sistema

---

### GET /mensajes/{id}
Obtener mensaje específico y marcarlo como leído.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "titulo": "Bienvenido a APP IKIGAI BOX",
    "contenido": "Gracias por registrarte...",
    "tipo": "bienvenida",
    "leido": true,
    "fecha_lectura": "2024-01-01T10:30:00Z",
    "usuario_id": 1,
    "respuestas": [
      {
        "id": 1,
        "contenido": "Gracias por tu mensaje",
        "usuario_id": 1,
        "created_at": "2024-01-01T11:00:00Z"
      }
    ]
  }
}
```

---

### POST /mensajes
Crear nuevo mensaje (Solo Superadmin).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "titulo": "Actualización del sistema",
  "contenido": "Hemos actualizado la plataforma con nuevas funcionalidades...",
  "tipo": "notificacion",
  "usuario_id": 1
}
```

**Nota:** Si no se especifica `usuario_id`, el mensaje se envía a todos los usuarios.

**Response (201 Created):**
```json
{
  "message": "Mensaje creado exitosamente",
  "data": {
    "id": 1,
    "titulo": "Actualización del sistema",
    "tipo": "notificacion"
  }
}
```

---

### POST /mensajes/{id}/responder
Responder a un mensaje.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "contenido": "Gracias por la información"
}
```

**Response (201 Created):**
```json
{
  "message": "Respuesta enviada exitosamente",
  "data": {
    "id": 1,
    "mensaje_id": 1,
    "contenido": "Gracias por la información",
    "usuario_id": 1
  }
}
```

---

### PUT /mensajes/{id}/marcar-leido
Marcar mensaje como leído.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Mensaje marcado como leído",
  "data": {
    "id": 1,
    "leido": true,
    "fecha_lectura": "2024-01-01T10:30:00Z"
  }
}
```

---

### DELETE /mensajes/{id}
Eliminar mensaje (Solo Superadmin).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Mensaje eliminado exitosamente"
}
```

---

## 👤 Perfil de Usuario

Base URL: `/api/perfil`

### GET /perfil
Obtener perfil del usuario autenticado (alias de /auth/me).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez",
    "email": "juan@ejemplo.com",
    "role": "user",
    "numero_documento": "12.345.678-9",
    "telefono": "+56912345678",
    "edad": 35,
    "fecha_nacimiento": "1990-08-15",
    "diaNacimiento": 15,
    "mesNacimiento": 8,
    "anioNacimiento": 1990
  }
}
```

---

### PUT /perfil
Actualizar perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Juan",
  "apellidos": "Pérez García",
  "email": "juan.nuevo@ejemplo.com",
  "numero_documento": "12.345.678-9",
  "telefono": "+56987654321",
  "diaNacimiento": 15,
  "mesNacimiento": 8,
  "anioNacimiento": 1990,
  "edad": 35,
  "fecha_nacimiento": "1990-08-15"
}
```

**Response (200 OK):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "name": "Juan",
    "apellidos": "Pérez García",
    "email": "juan.nuevo@ejemplo.com"
  }
}
```

---

### PUT /perfil/password
Cambiar contraseña del usuario autenticado.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `422`: La contraseña actual es incorrecta
- `422`: Las contraseñas no coinciden

---

## 🍽️ Planes de Alimentación

Base URL: `/api/planes-alimentacion`

### GET /planes-alimentacion/usuario/{usuario_id}
Obtener plan de alimentación de un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "usuario_id": 1,
    "pautas": [
      {
        "id": 1,
        "nombre": "Desayuno",
        "horario": "08:00",
        "alimentacion": "2 tazas de avena con 1 scoop de proteína, 1 plátano"
      },
      {
        "id": 2,
        "nombre": "Colación Media Mañana",
        "horario": "11:00",
        "alimentacion": "1 manzana + 30g de almendras"
      }
    ],
    "suplementos": [
      {
        "id": 1,
        "nombre": "Proteína Whey",
        "dosis": "1 scoop (30g)",
        "indicaciones": "Post-entrenamiento"
      }
    ],
    "macros_totales": {
      "calorias": "3200",
      "proteinas": "180g",
      "carbohidratos": "400g",
      "grasas": "90g"
    },
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

---

### POST /planes-alimentacion
Crear plan de alimentación para un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "usuario_id": 1,
  "pautas": [
    {
      "nombre": "Desayuno",
      "horario": "08:00",
      "alimentacion": "2 tazas de avena con proteína"
    }
  ],
  "suplementos": [
    {
      "nombre": "Proteína Whey",
      "dosis": "1 scoop",
      "indicaciones": "Post-entrenamiento"
    }
  ],
  "macros_totales": {
    "calorias": "3200",
    "proteinas": "180g",
    "carbohidratos": "400g",
    "grasas": "90g"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Plan de alimentación creado exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1
  }
}
```

---

### PUT /planes-alimentacion/{id}
Actualizar plan de alimentación.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:** (mismo formato que POST)

**Response (200 OK):**
```json
{
  "message": "Plan de alimentación actualizado exitosamente",
  "data": {
    "id": 1,
    "usuario_id": 1
  }
}
```

---

### DELETE /planes-alimentacion/{id}
Eliminar plan de alimentación.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "message": "Plan de alimentación eliminado exitosamente"
}
```

---

## 🏆 Plan Competitivo (Opcional)

Base URL: `/api/planes-competitivos`

### GET /planes-competitivos/usuario/{usuario_id}
Obtener plan competitivo de un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "usuario_id": 1,
    "tipo_deporte": "Fisicoculturismo",
    "proxima_competencia": "2026-05-15",
    "objetivo_competitivo": "Aumentar masa muscular limpia para la temporada",
    "fases_preparacion": [
      {
        "id": 1,
        "nombre": "Fase de Volumen",
        "fecha_inicio": "2026-01-01",
        "fecha_fin": "2026-03-31",
        "objetivo": "Ganancia de masa muscular",
        "ajustes_nutricionales": "Incremento calórico de 500 kcal"
      }
    ],
    "recomendaciones_generales": "Mantener hidratación adecuada...",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

---

## 📊 Códigos de Estado HTTP

### Exitosos (2xx)
- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Operación exitosa sin contenido de respuesta

### Errores del Cliente (4xx)
- `400 Bad Request`: Solicitud mal formada
- `401 Unauthorized`: No autenticado o token inválido
- `403 Forbidden`: No tiene permisos para esta acción
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Error de validación

### Errores del Servidor (5xx)
- `500 Internal Server Error`: Error interno del servidor

---

## 🔒 Autenticación y Autorización

### Headers requeridos
```
Authorization: Bearer {accessToken}
Accept: application/json
Content-Type: application/json
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **user** | - Ver su propio perfil<br>- Ver sus propias evaluaciones<br>- Ver sus mensajes |
| **secretaria** | - Todo lo de user<br>- Ver usuarios<br>- Crear usuarios |
| **editor** | - Todo lo de secretaria<br>- Crear/editar contenido |
| **admin** | - Todo lo de editor<br>- Crear/editar/eliminar evaluaciones<br>- Ver informes de todos los usuarios<br>- Gestionar usuarios |
| **superadmin** | - Acceso completo a todas las funcionalidades<br>- Enviar mensajes a todos los usuarios<br>- Eliminar cualquier recurso |

---

## 🌐 Variables de Entorno

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Para producción:
```env
VITE_API_BASE_URL=https://api.appnutri.cl/api
```

---

## 📝 Notas Importantes

1. **Paginación**: Por defecto, las respuestas con múltiples items están paginadas. Usa `per_page=9999` para obtener todos los registros.

2. **Fechas**: Todas las fechas deben estar en formato `YYYY-MM-DD`.

3. **Timestamps**: Los campos `created_at` y `updated_at` están en formato ISO 8601 (UTC).

4. **Cálculos automáticos**: El IMC se puede calcular automáticamente en el frontend si se proporciona peso y estatura.

5. **Validación de RUT**: El RUT chileno se valida con dígito verificador. Formato aceptado: XX.XXX.XXX-X o sin formato. El sistema valida automáticamente el dígito verificador usando el algoritmo módulo 11.

6. **Soft Deletes**: Considerar implementar eliminación suave para poder recuperar datos.

7. **Rate Limiting**: Implementar límites de tasa para prevenir abuso de la API.

8. **CORS**: Configurar CORS apropiadamente para permitir solicitudes desde el frontend.

---

## 🚀 Endpoints Adicionales Recomendados

### Estadísticas del Sistema (Superadmin)
```
GET /api/estadisticas/dashboard
```

### Exportación de Datos
```
GET /api/evaluaciones/usuario/{usuario_id}/exportar
GET /api/informes/usuario/{usuario_id}/pdf
```

### Búsqueda Global
```
GET /api/buscar?q={query}&tipo={usuarios|evaluaciones}
```

---

## 📞 Soporte

Para más información o reportar problemas, contactar al equipo de desarrollo.

**Última actualización:** 26 de Enero, 2026
