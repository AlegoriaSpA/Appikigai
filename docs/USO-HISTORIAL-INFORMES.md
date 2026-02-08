# 📚 Guía de Uso - Historial de Informes

## 🎯 ¿Qué es el Historial de Informes?

El historial de informes mantiene un registro automático de todos los PDFs de evolución nutricional que se generan en el sistema, con fecha, hora y detalles del contenido.

---

## 📋 Cómo Usar la Funcionalidad

### **1. Generar un Informe**

1. Ve a la página **"Informes de Evolución"**
2. Selecciona un **usuario** del desplegable
3. Espera a que carguen las evaluaciones
4. (Opcional) Completa el plan de alimentación si lo deseas
5. Haz clic en **"Exportar Informe"**
6. El PDF se descarga automáticamente
7. **¡Listo!** El informe queda registrado automáticamente

### **2. Ver el Historial**

1. Con un usuario seleccionado, haz clic en **"Historial"**
2. Se despliega un panel con todos los informes generados
3. Puedes ver:
   - 📄 Nombre del archivo
   - 📅 Fecha y hora de generación
   - ✅ Cantidad de evaluaciones incluidas
   - 📊 Periodo de datos (desde - hasta)
   - 🍽️ Si incluye plan de alimentación
   - 🏃 Si incluye plan competitivo
   - 👤 Quién generó el informe

### **3. Eliminar un Registro**

1. En el historial, localiza el informe
2. Haz clic en el ícono de **basura** (🗑️)
3. Confirma la eliminación
4. El registro se elimina (el PDF descargado no se elimina)

---

## 💡 Características

### **Registro Automático**
Cada vez que exportas un PDF, se guarda automáticamente:
- Fecha y hora exacta
- Usuario asociado
- Número de evaluaciones
- Periodo de tiempo cubierto
- Contenido incluido
- Profesional que lo generó

### **Información Detallada**
El sistema guarda:
```json
{
  "nombre_archivo": "Informe_Carlos_Mendoza_2026-01-26.pdf",
  "fecha_generacion": "2026-01-26 14:30",
  "total_evaluaciones": 4,
  "periodo": {
    "desde": "2024-12-03",
    "hasta": "2025-10-04"
  },
  "incluye_plan_alimentacion": true,
  "incluye_plan_competitivo": false,
  "generado_por": "Juan Pérez"
}
```

### **Chips de Colores**
- 🔵 **Azul** (Info): Fecha y hora de generación
- 🟢 **Verde** (Success): Número de evaluaciones
- ⚪ **Gris** (Default): Periodo de datos
- 🟠 **Naranja** (Warning): Incluye plan de alimentación
- 🟣 **Morado** (Secondary): Incluye plan competitivo

---

## 🔍 Casos de Uso

### **1. Auditoría**
Ver cuándo y quién generó cada informe para un paciente:
```
Usuario: Carlos Mendoza
Informes generados: 5
Último informe: 26/01/2026 14:30 por Juan Pérez
```

### **2. Control de Calidad**
Verificar que se generan informes con la frecuencia adecuada:
```
Primer informe: 15/12/2025
Último informe: 26/01/2026
Tiempo transcurrido: 42 días ✅
```

### **3. Trazabilidad**
Saber exactamente qué datos incluía cada informe:
```
Informe del 15/12/2025:
- 3 evaluaciones
- Periodo: Dic 2024 - Jun 2025
- Con plan de alimentación
- Generado por María García
```

---

## ⚠️ Notas Importantes

1. **Los PDFs no se almacenan**: Solo se guarda el registro metadata
2. **Eliminar es permanente**: No se puede recuperar un registro eliminado
3. **Visible para admin**: Solo administradores ven todos los informes
4. **Sincronización**: Los cambios se ven inmediatamente en todos los dispositivos

---

## 🚀 Beneficios

✅ **Trazabilidad completa** de informes generados
✅ **Auditoría profesional** para cumplimiento normativo
✅ **Control de calidad** del seguimiento nutricional
✅ **Estadísticas** de uso del sistema
✅ **Respaldo** de información crítica

---

## 🆘 Solución de Problemas

### El historial no carga
- Verifica que hayas seleccionado un usuario
- Asegúrate de tener conexión a internet
- Recarga la página si es necesario

### No se registra el informe
- Confirma que el PDF se descargó correctamente
- Verifica tu conexión durante la exportación
- El registro se hace automáticamente al exportar

### El botón "Historial" está deshabilitado
- Debes seleccionar un usuario primero
- Solo admin/superadmin tienen acceso

---

## 📊 Ejemplo Visual

```
┌──────────────────────────────────────────────────────────┐
│ [Seleccionar Usuario ▼]  [Historial] [Exportar Informe] │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Historial de Informes Generados                    [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📄 Informe_Carlos_Mendoza_2026-01-26.pdf              │
│    [26/01/2026 14:30] [4 evaluaciones] [Plan 🍽️]     │
│    [03/12/2024 - 04/10/2025]                           │
│    👤 Juan Pérez                              [🗑️]    │
│                                                         │
│ 📄 Informe_Carlos_Mendoza_2025-12-15.pdf              │
│    [15/12/2025 10:15] [3 evaluaciones]                │
│    [03/12/2024 - 28/06/2025]                           │
│    👤 María García                            [🗑️]    │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 Soporte

¿Preguntas sobre el historial de informes?
Contacta al administrador del sistema.
