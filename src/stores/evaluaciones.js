import { $api } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEvaluacionesStore = defineStore('evaluaciones', () => {
  const evaluaciones = ref([])
  const evaluacion = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Obtener todas las evaluaciones
  const fetchEvaluaciones = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/evaluaciones', {
        params: {
          per_page: params.perPage || 9999,
          ...params,
        },
      })
      
      evaluaciones.value = response.data || []
      
      return { success: true, data: response }
    } catch (err) {
      error.value = err.message || 'Error al cargar evaluaciones'
      console.error('Error fetching evaluaciones:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Obtener evaluación por ID
  const fetchEvaluacion = async id => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api(`/api/evaluaciones/${id}`)
      
      evaluacion.value = response.data || response
      
      return { success: true, data: evaluacion.value }
    } catch (err) {
      error.value = err.message || 'Error al cargar evaluación'
      console.error('Error fetching evaluacion:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Obtener evaluaciones de un usuario específico
  const fetchEvaluacionesPorUsuario = async (usuarioId, order = 'desc') => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api(`/api/evaluaciones/usuario/${usuarioId}`, {
        params: { order },
      })
      
      const data = response.data || []
      
      return { success: true, data }
    } catch (err) {
      error.value = err.message || 'Error al cargar evaluaciones del usuario'
      console.error('Error fetching evaluaciones por usuario:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Obtener evaluación anterior de un usuario
  const fetchEvaluacionAnterior = async (usuarioId, fechaActual = null) => {
    loading.value = true
    error.value = null
    
    try {
      const params = fechaActual ? { fecha_actual: fechaActual } : {}
      const response = await $api(`/api/evaluaciones/usuario/${usuarioId}/anterior`, {
        params,
      })
      
      const data = response.data || null
      
      return { success: true, data }
    } catch (err) {
      // Es válido que no haya evaluación anterior
      if (err.status === 404) {
        return { success: true, data: null }
      }
      
      error.value = err.message || 'Error al cargar evaluación anterior'
      console.error('Error fetching evaluación anterior:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Crear nueva evaluación
  const createEvaluacion = async data => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/evaluaciones', {
        method: 'POST',
        body: data,
      })

      // Agregar a la lista local
      if (response.data) {
        evaluaciones.value.unshift(response.data)
      }

      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.data?.message || err.message || 'Error al crear evaluación'
      console.error('Error creating evaluacion:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Actualizar evaluación
  const updateEvaluacion = async (id, data) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $api(`/api/evaluaciones/${id}`, {
        method: 'PUT',
        body: data,
      })

      // Actualizar en la lista local
      const index = evaluaciones.value.findIndex(e => e.id === id)
      if (index !== -1 && response.data) {
        evaluaciones.value[index] = response.data
      }

      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.data?.message || err.message || 'Error al actualizar evaluación'
      console.error('Error updating evaluacion:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Eliminar evaluación
  const deleteEvaluacion = async id => {
    loading.value = true
    error.value = null
    
    try {
      await $api(`/api/evaluaciones/${id}`, {
        method: 'DELETE',
      })

      // Eliminar de la lista local
      const index = evaluaciones.value.findIndex(e => e.id === id)
      if (index !== -1) {
        evaluaciones.value.splice(index, 1)
      }

      return { success: true }
    } catch (err) {
      error.value = err.data?.message || err.message || 'Error al eliminar evaluación'
      console.error('Error deleting evaluacion:', err)
      
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    evaluaciones,
    evaluacion,
    loading,
    error,

    // Actions
    fetchEvaluaciones,
    fetchEvaluacion,
    fetchEvaluacionesPorUsuario,
    fetchEvaluacionAnterior,
    createEvaluacion,
    updateEvaluacion,
    deleteEvaluacion,
  }
})
