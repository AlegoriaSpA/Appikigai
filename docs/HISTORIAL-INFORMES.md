# 📊 Historial de Informes - Guía de Implementación

## 🎯 Objetivo

Mantener un registro histórico de todos los informes de evolución generados, con fecha, hora y metadatos asociados.

---

## 📋 Funcionalidad Implementada (Frontend)

### **Store de Informes** (`src/stores/informes.js`)

Métodos disponibles:
- `fetchInformes()` - Obtener todos los informes
- `fetchInformesPorUsuario(usuarioId)` - Obtener informes de un usuario específico
- `registrarInforme(data)` - Registrar un nuevo informe generado
- `fetchInforme(id)` - Obtener un informe específico
- `deleteInforme(id)` - Eliminar un registro de informe

### **Página de Informes** (`src/pages/informes.vue`)

**Nuevas características:**
1. **Botón "Historial"** - Muestra/oculta el panel de historial de informes
2. **Panel expandible** - Lista todos los informes generados con:
   - Nombre del archivo
   - Fecha y hora de generación
   - Número de evaluaciones incluidas
   - Periodo de datos (desde - hasta)
   - Badges indicando si incluye planes de alimentación
   - Nombre del profesional que lo generó
   - Botón para eliminar registro

3. **Registro automático** - Cada vez que se exporta un PDF:
   - Se guarda metadata del informe en la base de datos
   - Incluye información completa del contenido
   - Vincula al usuario y al profesional

---

## 🔧 Implementación Backend Requerida

### **Base de Datos - Tabla `informes`**

```sql
CREATE TABLE informes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    tipo_informe VARCHAR(50) NOT NULL DEFAULT 'evolucion',
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_generacion DATETIME NOT NULL,
    total_evaluaciones INT,
    periodo JSON,
    incluye_plan_alimentacion BOOLEAN DEFAULT FALSE,
    incluye_plan_competitivo BOOLEAN DEFAULT FALSE,
    generado_por VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_generacion (fecha_generacion),
    INDEX idx_tipo_informe (tipo_informe)
);
```

### **Modelo Laravel - `app/Models/Informe.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Informe extends Model
{
    protected $fillable = [
        'usuario_id',
        'tipo_informe',
        'nombre_archivo',
        'fecha_generacion',
        'total_evaluaciones',
        'periodo',
        'incluye_plan_alimentacion',
        'incluye_plan_competitivo',
        'generado_por',
        'metadata',
    ];

    protected $casts = [
        'fecha_generacion' => 'datetime',
        'periodo' => 'array',
        'incluye_plan_alimentacion' => 'boolean',
        'incluye_plan_competitivo' => 'boolean',
        'metadata' => 'array',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

### **Controlador - `app/Http/Controllers/InformeController.php`**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Informe;
use Illuminate\Http\Request;

class InformeController extends Controller
{
    /**
     * Listar todos los informes
     */
    public function index(Request $request)
    {
        $informes = Informe::with('usuario')
            ->orderBy('fecha_generacion', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($informes);
    }

    /**
     * Obtener informes de un usuario específico
     */
    public function getByUser($usuarioId)
    {
        $informes = Informe::where('usuario_id', $usuarioId)
            ->orderBy('fecha_generacion', 'desc')
            ->get();

        return response()->json(['data' => $informes]);
    }

    /**
     * Registrar un nuevo informe
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'tipo_informe' => 'required|string|max:50',
            'nombre_archivo' => 'required|string|max:255',
            'fecha_generacion' => 'required|date',
            'total_evaluaciones' => 'nullable|integer',
            'periodo' => 'nullable|array',
            'incluye_plan_alimentacion' => 'boolean',
            'incluye_plan_competitivo' => 'boolean',
            'generado_por' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $informe = Informe::create($validated);

        return response()->json([
            'data' => $informe,
            'message' => 'Informe registrado exitosamente'
        ], 201);
    }

    /**
     * Obtener un informe específico
     */
    public function show($id)
    {
        $informe = Informe::with('usuario')->findOrFail($id);

        return response()->json(['data' => $informe]);
    }

    /**
     * Eliminar un informe
     */
    public function destroy($id)
    {
        $informe = Informe::findOrFail($id);
        $informe->delete();

        return response()->json([
            'message' => 'Informe eliminado exitosamente'
        ]);
    }
}
```

### **Rutas - `routes/api.php`**

```php
// Informes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/informes', [InformeController::class, 'index']);
    Route::get('/informes/usuario/{usuario_id}', [InformeController::class, 'getByUser']);
    Route::post('/informes', [InformeController::class, 'store']);
    Route::get('/informes/{id}', [InformeController::class, 'show']);
    Route::delete('/informes/{id}', [InformeController::class, 'destroy']);
});
```

---

## 📊 Datos Registrados

Cada informe guarda:

### **Datos Básicos:**
- Usuario al que pertenece el informe
- Tipo de informe (evolución, comparación, etc.)
- Nombre del archivo PDF generado
- Fecha y hora exacta de generación

### **Contenido del Informe:**
- Total de evaluaciones incluidas
- Periodo de datos (fecha desde - fecha hasta)
- Si incluye plan de alimentación
- Si incluye plan de alimentación competitivo
- Nombre del profesional que generó el informe

### **Metadata (JSON):**
- Primera evaluación completa
- Última evaluación completa
- Lista de gráficos incluidos
- Cualquier otro dato relevante

---

## 🎨 Interfaz de Usuario

### **Vista del Historial:**

```
┌─────────────────────────────────────────────────────┐
│ Historial de Informes Generados              [X]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📄 Informe_Carlos_Mendoza_2026-01-26.pdf          │
│    📅 26/01/2026 14:30                             │
│    ✅ 4 evaluaciones                               │
│    📊 03/12/2024 - 04/10/2025                      │
│    🍽️ Plan alimentación                            │
│    👤 Generado por: Juan Pérez                     │
│                                            [🗑️]    │
│                                                     │
│ 📄 Informe_Carlos_Mendoza_2025-12-15.pdf          │
│    📅 15/12/2025 10:15                             │
│    ✅ 3 evaluaciones                               │
│    📊 03/12/2024 - 28/06/2025                      │
│    👤 Generado por: María García                  │
│                                            [🗑️]    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Beneficios

1. **Trazabilidad completa** - Registro de quién generó qué informe y cuándo
2. **Auditoría** - Historial completo de informes para cumplimiento normativo
3. **Estadísticas** - Posibilidad de analizar frecuencia de generación de informes
4. **Backup metadata** - Aunque el PDF se pierda, queda registro del contenido
5. **Control de calidad** - Supervisar qué profesionales generan informes

---

## 🔒 Permisos

- **Admin/Superadmin**: Pueden ver todos los informes y eliminar registros
- **User**: No tiene acceso a esta funcionalidad
- Los informes solo son visibles para el profesional que los creó y superiores

---

## 📝 Notas de Implementación

1. La eliminación de un registro **NO elimina el archivo PDF** (solo el registro)
2. Los informes están vinculados al usuario, si se elimina el usuario, se eliminan sus registros
3. La metadata JSON permite flexibilidad para agregar campos futuros
4. El campo `tipo_informe` permite diferentes tipos en el futuro (comparación, evolución, etc.)
