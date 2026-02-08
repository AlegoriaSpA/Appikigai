/**
 * Utilidades para formatear y validar RUT chileno
 */

/**
 * Limpia el RUT de puntos y guión
 * @param {string} rut - RUT a limpiar
 * @returns {string} RUT limpio
 */
export const limpiarRut = rut => {
  if (!rut) return ''
  return rut.toString().replace(/[^0-9kK]/g, '').toUpperCase()
}

/**
 * Formatea el RUT con puntos y guión (XX.XXX.XXX-X)
 * @param {string} rut - RUT a formatear
 * @returns {string} RUT formateado
 */
export const formatearRut = rut => {
  if (!rut) return ''
  
  // Limpiar el RUT
  const rutLimpio = limpiarRut(rut)
  
  if (rutLimpio.length < 2) return rutLimpio
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  
  // Formatear el cuerpo con puntos
  let cuerpoFormateado = cuerpo.split('').reverse().join('')
  cuerpoFormateado = cuerpoFormateado.match(/.{1,3}/g).join('.')
  cuerpoFormateado = cuerpoFormateado.split('').reverse().join('')
  
  return `${cuerpoFormateado}-${dv}`
}

/**
 * Calcula el dígito verificador de un RUT
 * @param {string} rut - RUT sin dígito verificador
 * @returns {string} Dígito verificador
 */
export const calcularDV = rut => {
  if (!rut) return ''
  
  const rutLimpio = limpiarRut(rut)
  let suma = 0
  let multiplicador = 2
  
  // Iterar desde el final hacia el inicio
  for (let i = rutLimpio.length - 1; i >= 0; i--) {
    suma += parseInt(rutLimpio[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  
  const resto = suma % 11
  const dv = 11 - resto
  
  if (dv === 11) return '0'
  if (dv === 10) return 'K'
  return dv.toString()
}

/**
 * Valida si un RUT es válido
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si es válido, false si no
 */
export const validarRut = rut => {
  if (!rut) return false
  
  const rutLimpio = limpiarRut(rut)
  
  // Verificar que tenga al menos 2 caracteres (1 número + 1 DV)
  if (rutLimpio.length < 2) return false
  
  // Verificar que no tenga más de 9 caracteres
  if (rutLimpio.length > 9) return false
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1)
  const dvIngresado = rutLimpio.slice(-1)
  
  // Verificar que el cuerpo solo contenga números
  if (!/^\d+$/.test(cuerpo)) return false
  
  // Calcular el DV esperado
  const dvCalculado = calcularDV(cuerpo)
  
  // Comparar
  return dvIngresado === dvCalculado
}

/**
 * Formatea el RUT mientras el usuario escribe
 * @param {string} valor - Valor actual del input
 * @returns {string} Valor formateado
 */
export const formatearRutOnInput = valor => {
  if (!valor) return ''
  
  // Limpiar
  let rutLimpio = limpiarRut(valor)
  
  // Limitar a 9 caracteres
  if (rutLimpio.length > 9) {
    rutLimpio = rutLimpio.slice(0, 9)
  }
  
  // Si tiene menos de 2 caracteres, retornar sin formato
  if (rutLimpio.length < 2) return rutLimpio
  
  // Formatear
  return formatearRut(rutLimpio)
}

/**
 * Obtiene un mensaje de error según el problema del RUT
 * @param {string} rut - RUT a validar
 * @returns {string} Mensaje de error o vacío si es válido
 */
export const obtenerErrorRut = rut => {
  if (!rut) return 'El RUT es requerido'
  
  const rutLimpio = limpiarRut(rut)
  
  if (rutLimpio.length < 2) {
    return 'El RUT debe tener al menos 2 caracteres'
  }
  
  if (rutLimpio.length > 9) {
    return 'El RUT no puede tener más de 9 caracteres'
  }
  
  const cuerpo = rutLimpio.slice(0, -1)
  if (!/^\d+$/.test(cuerpo)) {
    return 'El RUT contiene caracteres inválidos'
  }
  
  if (!validarRut(rut)) {
    return 'El RUT ingresado no es válido'
  }
  
  return ''
}

/**
 * Hook para usar en inputs de RUT
 * Retorna funciones para manejar el input y validación
 */
export const useRutInput = () => {
  const formatear = valor => formatearRutOnInput(valor)
  const validar = valor => validarRut(valor)
  const obtenerError = valor => obtenerErrorRut(valor)
  
  return {
    formatear,
    validar,
    obtenerError,
  }
}
