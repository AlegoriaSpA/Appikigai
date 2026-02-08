import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReservasStore = defineStore('reservas', () => {
  // Estado
  const reservas = ref([])

  // Cargar datos desde localStorage
  const cargarReservas = () => {
    const reservasGuardadas = localStorage.getItem('reservas_clases_ikigai')
    if (reservasGuardadas) {
      reservas.value = JSON.parse(reservasGuardadas)
    } else {
      reservas.value = []
    }
  }

  // Guardar en localStorage
  const guardarReservas = () => {
    localStorage.setItem('reservas_clases_ikigai', JSON.stringify(reservas.value))
  }

  // Obtener reservas de un usuario específico
  const obtenerReservasUsuario = (usuarioId) => {
    return reservas.value.filter(r => r.usuarioId === usuarioId && !r.cancelada)
  }

  // Obtener próximas reservas del usuario (ordenadas por fecha/hora)
  const obtenerProximasReservas = (usuarioId) => {
    const ahora = new Date()
    return reservas.value
      .filter(r => 
        r.usuarioId === usuarioId && 
        !r.cancelada &&
        new Date(`${r.fecha}T${r.horaInicio}`) > ahora
      )
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.horaInicio}`)
        const fechaB = new Date(`${b.fecha}T${b.horaInicio}`)
        return fechaA - fechaB
      })
  }

  // Verificar si un usuario tiene una reserva para una clase específica
  const tieneReserva = (usuarioId, claseId, fecha) => {
    return reservas.value.some(r => 
      r.usuarioId === usuarioId && 
      r.claseId === claseId && 
      r.fecha === fecha &&
      !r.cancelada
    )
  }

  // Obtener reserva específica
  const obtenerReserva = (usuarioId, claseId, fecha) => {
    return reservas.value.find(r => 
      r.usuarioId === usuarioId && 
      r.claseId === claseId && 
      r.fecha === fecha &&
      !r.cancelada
    )
  }

  // Contar reservas para una clase en una fecha específica
  const contarReservas = (claseId, fecha) => {
    return reservas.value.filter(r => 
      r.claseId === claseId && 
      r.fecha === fecha &&
      !r.cancelada
    ).length
  }

  // Verificar si se puede cancelar (90 minutos antes)
  const puedeCancelar = (fecha, horaInicio) => {
    const fechaHoraClase = new Date(`${fecha}T${horaInicio}`)
    const ahora = new Date()
    const diferenciaMinutos = (fechaHoraClase - ahora) / (1000 * 60)
    
    return diferenciaMinutos >= 90
  }

  // Crear una reserva
  const crearReserva = (datosReserva) => {
    const id = reservas.value.length > 0 
      ? Math.max(...reservas.value.map(r => r.id)) + 1 
      : 1

    const nuevaReserva = {
      id,
      usuarioId: datosReserva.usuarioId,
      usuarioNombre: datosReserva.usuarioNombre,
      claseId: datosReserva.claseId,
      claseNombre: datosReserva.claseNombre,
      fecha: datosReserva.fecha, // YYYY-MM-DD
      horaInicio: datosReserva.horaInicio, // HH:mm
      duracion: datosReserva.duracion, // minutos
      coach: datosReserva.coach,
      fechaReserva: new Date().toISOString(),
      cancelada: false,
      fechaCancelacion: null,
      asistio: false,
      fechaAsistencia: null
    }

    reservas.value.push(nuevaReserva)
    guardarReservas()
    
    return nuevaReserva
  }

  // Cancelar una reserva
  const cancelarReserva = (usuarioId, claseId, fecha) => {
    const reserva = reservas.value.find(r => 
      r.usuarioId === usuarioId && 
      r.claseId === claseId && 
      r.fecha === fecha &&
      !r.cancelada
    )

    if (!reserva) {
      return { success: false, message: 'Reserva no encontrada' }
    }

    // Verificar si puede cancelar (90 minutos antes)
    if (!puedeCancelar(reserva.fecha, reserva.horaInicio)) {
      return { 
        success: false, 
        message: 'Solo puedes cancelar hasta 90 minutos antes de la clase' 
      }
    }

    reserva.cancelada = true
    reserva.fechaCancelacion = new Date().toISOString()
    
    guardarReservas()
    
    return { success: true, message: 'Reserva cancelada exitosamente' }
  }

  // Eliminar reservas antiguas (opcional, para limpiar el localStorage)
  const limpiarReservasAntiguas = () => {
    const hace30Dias = new Date()
    hace30Dias.setDate(hace30Dias.getDate() - 30)

    reservas.value = reservas.value.filter(r => {
      const fechaReserva = new Date(r.fechaReserva)
      return fechaReserva > hace30Dias
    })

    guardarReservas()
  }

  // Cancelar reserva por admin (sin validación de tiempo)
  const cancelarReservaPorAdmin = (usuarioId, claseId, fecha) => {
    const reserva = reservas.value.find(r => 
      r.usuarioId === usuarioId && 
      r.claseId === claseId && 
      r.fecha === fecha &&
      !r.cancelada
    )

    if (!reserva) {
      return { success: false, message: 'Reserva no encontrada' }
    }

    reserva.cancelada = true
    reserva.fechaCancelacion = new Date().toISOString()
    
    guardarReservas()
    
    return { success: true, message: 'Reserva cancelada exitosamente' }
  }

  // Marcar asistencia
  const marcarAsistencia = (reservaId) => {
    const reserva = reservas.value.find(r => r.id === reservaId)

    if (!reserva) {
      return { success: false, message: 'Reserva no encontrada' }
    }

    if (reserva.cancelada) {
      return { success: false, message: 'Esta reserva está cancelada' }
    }

    reserva.asistio = !reserva.asistio
    reserva.fechaAsistencia = reserva.asistio ? new Date().toISOString() : null
    
    guardarReservas()
    
    return { 
      success: true, 
      message: reserva.asistio ? 'Asistencia marcada' : 'Asistencia desmarcada',
      asistio: reserva.asistio
    }
  }

  // Obtener estadísticas de un usuario
  const obtenerEstadisticasUsuario = (usuarioId) => {
    const todasReservas = reservas.value.filter(r => r.usuarioId === usuarioId)
    const reservasActivas = todasReservas.filter(r => !r.cancelada)
    const reservasCanceladas = todasReservas.filter(r => r.cancelada)

    return {
      total: todasReservas.length,
      activas: reservasActivas.length,
      canceladas: reservasCanceladas.length,
      proximasClases: obtenerProximasReservas(usuarioId).length
    }
  }

  // Computed
  const totalReservasActivas = computed(() => 
    reservas.value.filter(r => !r.cancelada).length
  )

  // Inicializar store
  cargarReservas()

  return {
    // Estado
    reservas,
    
    // Computed
    totalReservasActivas,
    
    // Métodos
    obtenerReservasUsuario,
    obtenerProximasReservas,
    tieneReserva,
    obtenerReserva,
    contarReservas,
    puedeCancelar,
    crearReserva,
    cancelarReserva,
    cancelarReservaPorAdmin,
    marcarAsistencia,
    limpiarReservasAntiguas,
    obtenerEstadisticasUsuario,
    guardarReservas
  }
})
