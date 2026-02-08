import { defineStore } from 'pinia'

export const useClasesPruebaStore = defineStore('clasesPrueba', {
  state: () => ({
    solicitudes: JSON.parse(localStorage.getItem('solicitudes_clase_prueba_ikigai') || '[]'),
  }),

  getters: {
    solicitudesPendientes: state => state.solicitudes.filter(s => s.estado === 'pendiente'),
    solicitudesAprobadas: state => state.solicitudes.filter(s => s.estado === 'aprobada'),
    solicitudesRechazadas: state => state.solicitudes.filter(s => s.estado === 'rechazada'),
    
    obtenerSolicitudPorEmail: state => email => {
      return state.solicitudes.find(s => s.email === email && s.estado === 'pendiente')
    },
    
    tieneSolicitudPendiente: state => email => {
      return state.solicitudes.some(s => s.email === email && s.estado === 'pendiente')
    },
  },

  actions: {
    crearSolicitud(datos) {
      // Validar que no tenga solicitud pendiente
      if (this.tieneSolicitudPendiente(datos.email)) {
        throw new Error('Ya tienes una solicitud de clase de prueba pendiente')
      }

      const nuevaSolicitud = {
        id: Date.now(),
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        claseId: datos.claseId,
        claseNombre: datos.claseNombre,
        fechaPreferida: datos.fechaPreferida,
        horaInicio: datos.horaInicio,
        coach: datos.coach,
        mensaje: datos.mensaje || '',
        estado: 'pendiente', // pendiente, aprobada, rechazada
        fechaSolicitud: new Date().toISOString(),
        fechaRespuesta: null,
        notasAdmin: '',
      }

      this.solicitudes.push(nuevaSolicitud)
      this.guardarEnLocalStorage()
      return nuevaSolicitud
    },

    aprobarSolicitud(id, notasAdmin = '') {
      const solicitud = this.solicitudes.find(s => s.id === id)
      if (!solicitud) throw new Error('Solicitud no encontrada')

      solicitud.estado = 'aprobada'
      solicitud.fechaRespuesta = new Date().toISOString()
      solicitud.notasAdmin = notasAdmin
      this.guardarEnLocalStorage()
    },

    rechazarSolicitud(id, notasAdmin = '') {
      const solicitud = this.solicitudes.find(s => s.id === id)
      if (!solicitud) throw new Error('Solicitud no encontrada')

      solicitud.estado = 'rechazada'
      solicitud.fechaRespuesta = new Date().toISOString()
      solicitud.notasAdmin = notasAdmin
      this.guardarEnLocalStorage()
    },

    eliminarSolicitud(id) {
      const index = this.solicitudes.findIndex(s => s.id === id)
      if (index !== -1) {
        this.solicitudes.splice(index, 1)
        this.guardarEnLocalStorage()
      }
    },

    obtenerSolicitudesPorClase(claseId, fecha) {
      return this.solicitudes.filter(s => 
        s.claseId === claseId && 
        s.fechaPreferida === fecha &&
        s.estado === 'aprobada'
      )
    },

    contarSolicitudesAprobadas(claseId, fecha) {
      return this.obtenerSolicitudesPorClase(claseId, fecha).length
    },

    guardarEnLocalStorage() {
      localStorage.setItem('solicitudes_clase_prueba_ikigai', JSON.stringify(this.solicitudes))
    },

    limpiarDatos() {
      this.solicitudes = []
      localStorage.removeItem('solicitudes_clase_prueba_ikigai')
    },
  },
})
