import { $api } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMensajesStore = defineStore('mensajes', () => {
  const mensajes = ref([])
  const mensajesNoLeidos = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Obtener todos los mensajes del usuario
  const fetchMensajes = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/mensajes', {
        params: {
          per_page: params.perPage || 9999,
          ...params,
        },
      })
      
      mensajes.value = response.data || []
      mensajesNoLeidos.value = response.no_leidos || 0
      
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Error al cargar mensajes'
      console.error('Error fetching mensajes:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Obtener mensaje por ID
  const fetchMensaje = async id => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api(`/api/mensajes/${id}`)
      
      // Actualizar en la lista local si existe
      const index = mensajes.value.findIndex(m => m.id === id)
      if (index !== -1) {
        mensajes.value[index] = response.data
      }
      
      return { success: true, data: response.data || response }
    } catch (err) {
      error.value = err.message || 'Error al cargar mensaje'
      console.error('Error fetching mensaje:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Crear mensaje (solo superadmin)
  const createMensaje = async data => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/mensajes', {
        method: 'POST',
        body: data,
      })

      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.data?.message || err.message || 'Error al crear mensaje'
      console.error('Error creating mensaje:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Responder mensaje
  const responderMensaje = async (id, contenido) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api(`/api/mensajes/${id}/responder`, {
        method: 'POST',
        body: { contenido },
      })

      // Actualizar mensaje en la lista local
      const index = mensajes.value.findIndex(m => m.id === id)
      if (index !== -1 && response.data) {
        // Agregar respuesta al mensaje
        if (!mensajes.value[index].respuestas) {
          mensajes.value[index].respuestas = []
        }
        mensajes.value[index].respuestas.push(response.data)
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.data?.message || err.message || 'Error al responder mensaje'
      console.error('Error responding mensaje:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Marcar mensaje como leído
  const marcarComoLeido = async id => {
    loading.value = true
    error.value = null
    
    try {
      await $api(`/api/mensajes/${id}/marcar-leido`, {
        method: 'POST',
      })

      // Actualizar en la lista local
      const index = mensajes.value.findIndex(m => m.id === id)
      if (index !== -1 && !mensajes.value[index].leido) {
        mensajes.value[index].leido = true
        mensajesNoLeidos.value = Math.max(0, mensajesNoLeidos.value - 1)
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Error al marcar como leído'
      console.error('Error marking mensaje as read:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Marcar todos los mensajes como leídos
  const marcarTodosComoLeidos = async () => {
    loading.value = true
    error.value = null
    
    try {
      await $api('/api/mensajes/marcar-todos-leidos', {
        method: 'POST',
      })

      // Actualizar en la lista local
      mensajes.value.forEach(mensaje => {
        mensaje.leido = true
      })
      mensajesNoLeidos.value = 0
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Error al marcar todos como leídos'
      console.error('Error marking all mensajes as read:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Eliminar mensaje (solo superadmin o remitente)
  const deleteMensaje = async id => {
    loading.value = true
    error.value = null
    
    try {
      await $api(`/api/mensajes/${id}`, {
        method: 'DELETE',
      })

      // Eliminar de la lista local
      const index = mensajes.value.findIndex(m => m.id === id)
      if (index !== -1) {
        mensajes.value.splice(index, 1)
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.data?.message || err.message || 'Error al eliminar mensaje'
      console.error('Error deleting mensaje:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Actualizar contador de no leídos
  const actualizarNoLeidos = cantidad => {
    mensajesNoLeidos.value = cantidad
  }

  return {
    // State
    mensajes,
    mensajesNoLeidos,
    loading,
    error,
    
    // Actions
    fetchMensajes,
    fetchMensaje,
    createMensaje,
    responderMensaje,
    marcarComoLeido,
    marcarTodosComoLeidos,
    deleteMensaje,
    actualizarNoLeidos,
  }
})
