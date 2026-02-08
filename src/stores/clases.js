import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useClasesStore = defineStore('clases', () => {
  // Estado
  const clases = ref([])
  const coaches = ref([])

  // Cargar datos desde localStorage
  const cargarClases = () => {
    const clasesGuardadas = localStorage.getItem('clases_configuradas_ikigai')
    if (clasesGuardadas) {
      clases.value = JSON.parse(clasesGuardadas)
    } else {
      // Datos de ejemplo
      clases.value = [
        {
          id: 1,
          nombre: 'Crossfit',
          horaInicio: '06:00',
          duracion: 60, // en minutos
          cuposMaximos: 9,
          dias: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
          coachPorDefecto: 'Juan Pérez',
          activa: true,
          excepciones: [] // {fecha: '2026-02-10', cancelada: true, coachReemplazo: 'María López'}
        },
        {
          id: 2,
          nombre: 'Yoga',
          horaInicio: '19:00',
          duracion: 60,
          cuposMaximos: 12,
          dias: ['lunes', 'miércoles', 'viernes'],
          coachPorDefecto: 'Ana García',
          activa: true,
          excepciones: []
        },
        {
          id: 3,
          nombre: 'Funcional',
          horaInicio: '08:00',
          duracion: 45,
          cuposMaximos: 15,
          dias: ['martes', 'jueves', 'sábado'],
          coachPorDefecto: 'Carlos Muñoz',
          activa: true,
          excepciones: []
        }
      ]
      guardarClases()
    }
  }

  const cargarCoaches = () => {
    const coachesGuardados = localStorage.getItem('coaches_ikigai')
    if (coachesGuardados) {
      coaches.value = JSON.parse(coachesGuardados)
    } else {
      // Coaches de ejemplo
      coaches.value = [
        { id: 1, nombre: 'Juan Pérez', activo: true },
        { id: 2, nombre: 'Ana García', activo: true },
        { id: 3, nombre: 'Carlos Muñoz', activo: true },
        { id: 4, nombre: 'María López', activo: true },
        { id: 5, nombre: 'Pedro Sánchez', activo: true }
      ]
      guardarCoaches()
    }
  }

  // Guardar en localStorage
  const guardarClases = () => {
    localStorage.setItem('clases_configuradas_ikigai', JSON.stringify(clases.value))
  }

  const guardarCoaches = () => {
    localStorage.setItem('coaches_ikigai', JSON.stringify(coaches.value))
  }

  // Obtener clases para un día específico
  const obtenerClasesPorDia = (nombreDia, fecha = null) => {
    return clases.value
      .filter(clase => clase.activa && clase.dias.includes(nombreDia.toLowerCase()))
      .map(clase => {
        let coach = clase.coachPorDefecto
        let cancelada = false

        // Verificar si hay excepciones para esta fecha
        if (fecha && clase.excepciones) {
          const excepcion = clase.excepciones.find(e => e.fecha === fecha)
          if (excepcion) {
            if (excepcion.cancelada) {
              cancelada = true
            }
            if (excepcion.coachReemplazo) {
              coach = excepcion.coachReemplazo
            }
          }
        }

        return {
          ...clase,
          coach,
          cancelada,
          // Generar datos para la vista del usuario
          titulo: clase.nombre,
          horario: clase.horaInicio,
          cupos: clase.cuposMaximos,
          reservas: 0 // Esto se debe obtener de las reservas reales
        }
      })
      .filter(clase => !clase.cancelada)
  }

  // Obtener calendario semanal completo
  const obtenerCalendarioSemanal = () => {
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    const calendario = {}

    diasSemana.forEach(dia => {
      calendario[dia] = clases.value
        .filter(clase => clase.activa && clase.dias.includes(dia))
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    })

    return calendario
  }

  // CRUD de clases
  const crearClase = (nuevaClase) => {
    const id = clases.value.length > 0 
      ? Math.max(...clases.value.map(c => c.id)) + 1 
      : 1

    clases.value.push({
      ...nuevaClase,
      id,
      activa: true,
      permitePrueba: nuevaClase.permitePrueba || false,
      excepciones: []
    })
    
    guardarClases()
    return id
  }

  const actualizarClase = (id, datosActualizados) => {
    const index = clases.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clases.value[index] = {
        ...clases.value[index],
        ...datosActualizados
      }
      guardarClases()
      return true
    }
    return false
  }

  const eliminarClase = (id) => {
    const index = clases.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clases.value.splice(index, 1)
      guardarClases()
      return true
    }
    return false
  }

  const toggleActivarClase = (id) => {
    const clase = clases.value.find(c => c.id === id)
    if (clase) {
      clase.activa = !clase.activa
      guardarClases()
      return true
    }
    return false
  }

  // Gestión de excepciones (cancelaciones o cambios de coach)
  const agregarExcepcion = (claseId, fecha, datos) => {
    const clase = clases.value.find(c => c.id === claseId)
    if (clase) {
      if (!clase.excepciones) {
        clase.excepciones = []
      }

      // Verificar si ya existe una excepción para esta fecha
      const indexExcepcion = clase.excepciones.findIndex(e => e.fecha === fecha)
      
      if (indexExcepcion !== -1) {
        // Actualizar excepción existente
        clase.excepciones[indexExcepcion] = { fecha, ...datos }
      } else {
        // Agregar nueva excepción
        clase.excepciones.push({ fecha, ...datos })
      }

      guardarClases()
      return true
    }
    return false
  }

  const eliminarExcepcion = (claseId, fecha) => {
    const clase = clases.value.find(c => c.id === claseId)
    if (clase && clase.excepciones) {
      clase.excepciones = clase.excepciones.filter(e => e.fecha !== fecha)
      guardarClases()
      return true
    }
    return false
  }

  // CRUD de coaches
  const crearCoach = (nuevoCoach) => {
    const id = coaches.value.length > 0 
      ? Math.max(...coaches.value.map(c => c.id)) + 1 
      : 1

    coaches.value.push({
      ...nuevoCoach,
      id,
      activo: true
    })
    
    guardarCoaches()
    return id
  }

  const actualizarCoach = (id, datosActualizados) => {
    const index = coaches.value.findIndex(c => c.id === id)
    if (index !== -1) {
      coaches.value[index] = {
        ...coaches.value[index],
        ...datosActualizados
      }
      guardarCoaches()
      return true
    }
    return false
  }

  const eliminarCoach = (id) => {
    const index = coaches.value.findIndex(c => c.id === id)
    if (index !== -1) {
      coaches.value.splice(index, 1)
      guardarCoaches()
      return true
    }
    return false
  }

  // Computed
  const clasesActivas = computed(() => clases.value.filter(c => c.activa))
  const coachesActivos = computed(() => coaches.value.filter(c => c.activo))

  // Inicializar store
  cargarClases()
  cargarCoaches()

  return {
    // Estado
    clases,
    coaches,
    
    // Computed
    clasesActivas,
    coachesActivos,
    
    // Métodos
    obtenerClasesPorDia,
    obtenerCalendarioSemanal,
    crearClase,
    actualizarClase,
    eliminarClase,
    toggleActivarClase,
    agregarExcepcion,
    eliminarExcepcion,
    crearCoach,
    actualizarCoach,
    eliminarCoach,
    guardarClases,
    guardarCoaches
  }
})
