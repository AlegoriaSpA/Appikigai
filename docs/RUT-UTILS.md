# Utilidades de RUT Chileno

Este módulo proporciona utilidades para validar y formatear RUT (Rol Único Tributario) chileno en el frontend.

## Características

- ✅ Validación de RUT con dígito verificador (algoritmo módulo 11)
- ✅ Formateo automático mientras se escribe (XX.XXX.XXX-X)
- ✅ Limpieza de caracteres no válidos
- ✅ Mensajes de error descriptivos
- ✅ Componente Vue reutilizable

## Uso Básico

### Importar las utilidades

```javascript
import { 
  formatearRutOnInput, 
  validarRut, 
  obtenerErrorRut,
  limpiarRut,
  formatearRut
} from '@/utils/rut'
```

### Funciones Disponibles

#### `formatearRutOnInput(valor)`
Formatea el RUT mientras el usuario escribe. Limita a 9 caracteres y aplica formato.

```javascript
const rut = formatearRutOnInput('123456789')
// Retorna: "12.345.678-9"
```

#### `validarRut(rut)`
Valida si un RUT es válido (verifica dígito verificador).

```javascript
const esValido = validarRut('12.345.678-9')
// Retorna: true o false
```

#### `obtenerErrorRut(rut)`
Obtiene un mensaje de error descriptivo si el RUT no es válido.

```javascript
const error = obtenerErrorRut('12.345.678-0')
// Retorna: "El RUT ingresado no es válido"
```

#### `limpiarRut(rut)`
Limpia el RUT de puntos y guión, solo deja números y K.

```javascript
const limpio = limpiarRut('12.345.678-9')
// Retorna: "123456789"
```

#### `formatearRut(rut)`
Formatea un RUT limpio con puntos y guión.

```javascript
const formateado = formatearRut('123456789')
// Retorna: "12.345.678-9"
```

## Uso en Formularios Vue

### Opción 1: Componente RutInput

El componente `RutInput` proporciona validación y formateo automático:

```vue
<script setup>
import RutInput from '@/components/RutInput.vue'
import { ref } from 'vue'

const rut = ref('')
const rutError = ref('')
</script>

<template>
  <RutInput
    v-model="rut"
    label="RUT"
    :error-messages="rutError"
    required
  />
</template>
```

### Opción 2: Watcher Manual

```vue
<script setup>
import { formatearRutOnInput, obtenerErrorRut } from '@/utils/rut'
import { ref, watch } from 'vue'

const formData = ref({
  numeroDocumento: ''
})

const formErrors = ref({})

// Formatear automáticamente
watch(() => formData.value.numeroDocumento, (newValue) => {
  if (newValue) {
    const formatted = formatearRutOnInput(newValue)
    if (formatted !== newValue) {
      formData.value.numeroDocumento = formatted
    }
  }
})

// Validar en submit
const validateForm = () => {
  const errorRut = obtenerErrorRut(formData.value.numeroDocumento)
  if (errorRut) {
    formErrors.value.numeroDocumento = errorRut
    return false
  }
  return true
}
</script>

<template>
  <VTextField
    v-model="formData.numeroDocumento"
    label="RUT"
    placeholder="12.345.678-9"
    :error-messages="formErrors.numeroDocumento"
  />
</template>
```

## Ejemplos de RUT Válidos

- `12.345.678-9`
- `1.234.567-K`
- `9.876.543-2`
- `18456789-2` (sin puntos)
- `12345678-9` (sin puntos)

## Algoritmo de Validación

El dígito verificador se calcula usando el algoritmo módulo 11:

1. Multiplicar cada dígito del RUT (de derecha a izquierda) por 2, 3, 4, 5, 6, 7, 2, 3...
2. Sumar todos los productos
3. Dividir la suma por 11 y obtener el resto
4. Restar el resto de 11
5. Si el resultado es 11, el dígito verificador es 0
6. Si el resultado es 10, el dígito verificador es K
7. En otro caso, el dígito verificador es el resultado

## Props del Componente RutInput

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | String | `''` | Valor del RUT (v-model) |
| `label` | String | `'RUT'` | Etiqueta del campo |
| `placeholder` | String | `'12.345.678-9'` | Placeholder |
| `errorMessages` | String/Array | `''` | Mensajes de error |
| `disabled` | Boolean | `false` | Deshabilitar campo |
| `readonly` | Boolean | `false` | Solo lectura |
| `hint` | String | `'Formato: 12.345.678-9'` | Texto de ayuda |
| `persistentHint` | Boolean | `false` | Mostrar hint siempre |
| `required` | Boolean | `false` | Campo requerido |
| `validateOnBlur` | Boolean | `true` | Validar al perder foco |

## Eventos del Componente RutInput

- `update:modelValue`: Emitido cuando cambia el valor
- `blur`: Emitido al perder el foco (incluye error si existe)
- `focus`: Emitido al obtener el foco

## Integración en el Backend

El backend debe aceptar RUT en cualquier formato (con o sin puntos/guión) y validar el dígito verificador usando el mismo algoritmo módulo 11.

### Ejemplo Laravel

```php
public function validateRut($rut)
{
    // Limpiar RUT
    $rut = preg_replace('/[^0-9kK]/', '', strtoupper($rut));
    
    if (strlen($rut) < 2 || strlen($rut) > 9) {
        return false;
    }
    
    $cuerpo = substr($rut, 0, -1);
    $dv = substr($rut, -1);
    
    // Calcular DV
    $suma = 0;
    $multiplicador = 2;
    
    for ($i = strlen($cuerpo) - 1; $i >= 0; $i--) {
        $suma += (int)$cuerpo[$i] * $multiplicador;
        $multiplicador = $multiplicador == 7 ? 2 : $multiplicador + 1;
    }
    
    $dvCalculado = 11 - ($suma % 11);
    
    if ($dvCalculado == 11) $dvCalculado = '0';
    if ($dvCalculado == 10) $dvCalculado = 'K';
    else $dvCalculado = (string)$dvCalculado;
    
    return $dv === $dvCalculado;
}
```

## Testing

```javascript
import { validarRut } from '@/utils/rut'

// Tests básicos
console.assert(validarRut('12.345.678-9') === true)
console.assert(validarRut('12.345.678-0') === false)
console.assert(validarRut('1.234.567-K') === true)
console.assert(validarRut('123456789') === true) // sin formato
console.assert(validarRut('') === false)
console.assert(validarRut('abc') === false)
```

## Archivos Modificados

- ✅ `src/utils/rut.js` - Utilidades principales
- ✅ `src/components/RutInput.vue` - Componente reutilizable
- ✅ `src/pages/users.vue` - Validación en gestión de usuarios
- ✅ `src/pages/register.vue` - Validación en registro
- ✅ `src/pages/profile.vue` - Validación en perfil
- ✅ `API-ENDPOINTS.md` - Documentación actualizada

## Notas

- El RUT se formatea automáticamente mientras se escribe
- La validación se ejecuta en tiempo real
- Los errores son descriptivos y en español
- El componente muestra un ícono de verificación cuando el RUT es válido
- El formateo limita automáticamente a 9 caracteres (sin contar puntos y guión)
