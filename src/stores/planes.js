import { defineStore } from 'pinia'
import { $api } from '@/utils/api'

// Función para obtener datos del localStorage
function getLocalPlanes() {
  const stored = localStorage.getItem('planes_ikigai')
  return stored ? JSON.parse(stored) : []
}

// Función para guardar en localStorage
function saveLocalPlanes(planes) {
  localStorage.setItem('planes_ikigai', JSON.stringify(planes))
}

// Generar ID único
function generateId() {
  return Date.now() + Math.random()
}

export const usePlanesStore = defineStore('planes', {
  state: () => ({
    planes: getLocalPlanes(),
    loading: false,
    error: null,
    currentPlan: null,
    miPlanActual: null, // Plan activo del usuario con clases restantes
  }),

  getters: {
    planesActivos: state => state.planes.filter(plan => plan.activo),
    getPlanById: state => id => state.planes.find(plan => plan.id === id),
    clasesDisponibles: state => state.miPlanActual?.clases_restantes || 0,
    planVigente: state => {
      if (!state.miPlanActual) return false
      const ahora = new Date()
      const vencimiento = new Date(state.miPlanActual.fecha_vencimiento)
      return ahora < vencimiento && state.miPlanActual.clases_restantes > 0
    },
  },

  actions: {
    async fetchPlanes() {
      this.loading = true
      this.error = null
      try {
        // Cargar desde localStorage
        this.planes = getLocalPlanes()
        return { data: this.planes }
      } catch (error) {
        this.error = error.message || 'Error al cargar planes'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPlanesActivos() {
      this.loading = true
      this.error = null
      try {
        this.planes = getLocalPlanes()
        return { data: this.planesActivos }
      } catch (error) {
        this.error = error.message || 'Error al cargar planes'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPlan(planData) {
      this.loading = true
      this.error = null
      try {
        const newPlan = {
          id: generateId(),
          ...planData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        this.planes.push(newPlan)
        saveLocalPlanes(this.planes)
        
        return { data: newPlan }
      } catch (error) {
        this.error = error.message || 'Error al crear plan'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePlan(id, planData) {
      this.loading = true
      this.error = null
      try {
        const index = this.planes.findIndex(p => p.id === id)
        if (index !== -1) {
          this.planes[index] = {
            ...this.planes[index],
            ...planData,
            updated_at: new Date().toISOString(),
          }
          saveLocalPlanes(this.planes)
        }
        
        return { data: this.planes[index] }
      } catch (error) {
        this.error = error.message || 'Error al actualizar plan'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePlan(id) {
      this.loading = true
      this.error = null
      try {
        this.planes = this.planes.filter(p => p.id !== id)
        saveLocalPlanes(this.planes)
      } catch (error) {
        this.error = error.message || 'Error al eliminar plan'
        throw error
      } finally {
        this.loading = false
      }
    },

    async togglePlanStatus(id) {
      this.loading = true
      this.error = null
      try {
        const index = this.planes.findIndex(p => p.id === id)
        if (index !== -1) {
          this.planes[index].activo = !this.planes[index].activo
          this.planes[index].updated_at = new Date().toISOString()
          saveLocalPlanes(this.planes)
        }
        
        return { data: this.planes[index] }
      } catch (error) {
        this.error = error.message || 'Error al cambiar estado del plan'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUserPlan() {
      this.loading = true
      this.error = null
      try {
        // Simular plan de usuario desde localStorage
        const userPlan = localStorage.getItem('user_plan_ikigai')
        this.currentPlan = userPlan ? JSON.parse(userPlan) : null
        return { data: this.currentPlan }
      } catch (error) {
        this.error = error.message || 'Error al cargar plan actual'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
