/**
 * Store de Informes - Gestión de historial de informes generados
 * 
 * Este store maneja el historial de informes de evolución nutricional:
 * - Registra automáticamente cada PDF exportado
 * - Almacena metadata completa (evaluaciones, periodo, planes)
 * - Permite consultar historial por usuario
 * - Facilita auditoría y trazabilidad
 * 
 * Endpoints API:
 * - GET /informes - Lista todos los informes
 * - GET /informes/usuario/{id} - Informes de un usuario
 * - POST /informes - Registrar nuevo informe
 * - DELETE /informes/{id} - Eliminar registro
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { $api } from '@/utils/api'

export const useInformesStore = defineStore('informes', () => {
  const informes = ref([])
  const isLoading = ref(false)

  /**
   * Obtener lista de informes generados
   */
  const fetchInformes = async (params = {}) => {
    try {
      isLoading.value = true
      const response = await $api('/api/informes', {
        method: 'GET',
        params,
      })
      
      informes.value = response.data || response
      return { success: true, data: informes.value }
    } catch (error) {
      console.error('Error al obtener informes:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener informes de un usuario específico
   */
  const fetchInformesPorUsuario = async (usuarioId) => {
    try {
      isLoading.value = true
      const response = await $api(`/api/informes/usuario/${usuarioId}`, {
        method: 'GET',
      })
      
      // La API devuelve { data: [...] }
      const data = Array.isArray(response) ? response : (response.data || [])
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener informes del usuario:', error)
      return { success: false, error: error.message, data: [] }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registrar un nuevo informe generado
   */
  const registrarInforme = async (data) => {
    try {
      isLoading.value = true
      const response = await $api('/api/informes', {
        method: 'POST',
        body: data,
      })
      
      // Agregar al listado local
      const nuevoInforme = response.data || response
      if (nuevoInforme && nuevoInforme.id) {
        informes.value.unshift(nuevoInforme)
      }
      
      return { success: true, data: nuevoInforme }
    } catch (error) {
      console.error('Error al registrar informe:', error)
      return { success: false, error: error.response?.data?.message || error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtener un informe específico por ID
   */
  const fetchInforme = async (id) => {
    try {
      isLoading.value = true
      const response = await $api(`/api/informes/${id}`, {
        method: 'GET',
      })
      
      return { success: true, data: response.data || response }
    } catch (error) {
      console.error('Error al obtener informe:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Eliminar un informe
   */
  const deleteInforme = async (id) => {
    try {
      isLoading.value = true
      await $api(`/api/informes/${id}`, {
        method: 'DELETE',
      })
      
      // Remover del listado local
      informes.value = informes.value.filter(inf => inf.id !== id)
      
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar informe:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    informes,
    isLoading,

    // Actions
    fetchInformes,
    fetchInformesPorUsuario,
    registrarInforme,
    fetchInforme,
    deleteInforme,
  }
})
