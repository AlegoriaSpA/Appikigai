import { defineStore } from 'pinia'
import { $api } from '@/utils/api'

export const usePagosStore = defineStore('pagos', {
  state: () => ({
    pagos: [],
    pagosPendientes: [],
    loading: false,
    error: null,
    datosBancarios: null,
  }),

  getters: {
    pagosValidados: state => state.pagos.filter(pago => pago.estado === 'validado'),
    pagosPendientesValidacion: state => state.pagos.filter(pago => pago.estado === 'pendiente'),
  },

  actions: {
    async fetchPagos() {
      this.loading = true
      this.error = null
      try {
        const pagos = JSON.parse(localStorage.getItem('pagos_ikigai') || '[]')
        this.pagos = pagos
        return { data: pagos }
      } catch (error) {
        this.error = error.message || 'Error al cargar pagos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPagosPendientes() {
      this.loading = true
      this.error = null
      try {
        const pagos = JSON.parse(localStorage.getItem('pagos_ikigai') || '[]')
        this.pagosPendientes = pagos.filter(pago => pago.estado === 'pendiente')
        return { data: this.pagosPendientes }
      } catch (error) {
        this.error = error.message || 'Error al cargar pagos pendientes'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPagoTransferencia(pagoData) {
      this.loading = true
      this.error = null
      try {
        // Trabajar con localStorage
        const pagos = JSON.parse(localStorage.getItem('pagos_ikigai') || '[]')
        
        const nuevoPago = {
          id: Date.now(),
          ...pagoData,
          estado: 'pendiente',
          fecha_registro: new Date().toISOString(),
          usuario: JSON.parse(localStorage.getItem('user') || '{}'),
        }
        
        pagos.push(nuevoPago)
        localStorage.setItem('pagos_ikigai', JSON.stringify(pagos))
        
        this.pagos.push(nuevoPago)
        
        return { data: nuevoPago }
      } catch (error) {
        this.error = error.message || 'Error al registrar pago'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPagoMercadoPago(pagoData) {
      this.loading = true
      this.error = null
      try {
        const response = await $api('/pagos/mercadopago', {
          method: 'POST',
          body: pagoData,
        })
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al procesar pago'
        throw error
      } finally {
        this.loading = false
      }
    },

    async validarPago(pagoId, validacionData) {
      this.loading = true
      this.error = null
      try {
        const pagos = JSON.parse(localStorage.getItem('pagos_ikigai') || '[]')
        const index = pagos.findIndex(p => p.id === pagoId)
        
        if (index !== -1) {
          pagos[index].estado = 'validado'
          pagos[index].fecha_validacion = new Date().toISOString()
          pagos[index].validado_por = JSON.parse(localStorage.getItem('user') || '{}')
          
          // Actualizar las fechas del plan si el admin las editó
          if (validacionData.fecha_inicio_plan) {
            pagos[index].fecha_inicio_plan = validacionData.fecha_inicio_plan
          }
          if (validacionData.fecha_fin_plan) {
            pagos[index].fecha_fin_plan = validacionData.fecha_fin_plan
          }
          
          localStorage.setItem('pagos_ikigai', JSON.stringify(pagos))
          
          // Actualizar el estado local
          const pendienteIndex = this.pagosPendientes.findIndex(p => p.id === pagoId)
          if (pendienteIndex !== -1) {
            this.pagosPendientes.splice(pendienteIndex, 1)
          }
          
          // Activar el plan del usuario usando las fechas editadas por el admin o las originales
          const planActivado = {
            plan_id: pagos[index].plan_id,
            plan: pagos[index].plan,
            fecha_inicio: pagos[index].fecha_inicio_plan || new Date().toISOString(),
            fecha_expiracion: pagos[index].fecha_fin_plan || new Date(Date.now() + (pagos[index].plan?.duracion_dias || 30) * 24 * 60 * 60 * 1000).toISOString(),
            clases_disponibles: pagos[index].plan?.clases_totales || 0,
            clases_totales: pagos[index].plan?.clases_totales || 0,
            estado: 'activo',
          }
          
          localStorage.setItem('user_plan_ikigai', JSON.stringify(planActivado))
        }
        
        return { data: { success: true } }
      } catch (error) {
        this.error = error.message || 'Error al validar pago'
        throw error
      } finally {
        this.loading = false
      }
    },

    async rechazarPago(pagoId, motivo) {
      this.loading = true
      this.error = null
      try {
        const response = await $api(`/pagos/${pagoId}/rechazar`, {
          method: 'PATCH',
          body: { motivo },
        })
        
        // Actualizar el estado local
        const index = this.pagosPendientes.findIndex(p => p.id === pagoId)
        if (index !== -1) {
          this.pagosPendientes.splice(index, 1)
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al rechazar pago'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchDatosBancarios() {
      this.loading = true
      this.error = null
      try {
        const response = await $api('/configuracion/datos-bancarios')
        this.datosBancarios = response.data
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar datos bancarios'
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadComprobante(pagoId, file) {
      this.loading = true
      this.error = null
      try {
        // Convertir el archivo a base64 para guardarlo en localStorage
        const reader = new FileReader()
        
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            const pagos = JSON.parse(localStorage.getItem('pagos_ikigai') || '[]')
            const index = pagos.findIndex(p => p.id === pagoId)
            
            if (index !== -1) {
              pagos[index].comprobante = reader.result
              pagos[index].comprobante_nombre = file.name
              localStorage.setItem('pagos_ikigai', JSON.stringify(pagos))
              
              // Actualizar en el estado
              const pagoIndex = this.pagos.findIndex(p => p.id === pagoId)
              if (pagoIndex !== -1) {
                this.pagos[pagoIndex].comprobante = reader.result
                this.pagos[pagoIndex].comprobante_nombre = file.name
              }
            }
            
            this.loading = false
            resolve({ data: { success: true } })
          }
          
          reader.onerror = () => {
            this.error = 'Error al leer el archivo'
            this.loading = false
            reject(new Error('Error al leer el archivo'))
          }
          
          reader.readAsDataURL(file)
        })
      } catch (error) {
        this.error = error.message || 'Error al subir comprobante'
        this.loading = false
        throw error
      }
    },

    async fetchMisPagos() {
      this.loading = true
      this.error = null
      try {
        const response = await $api('/mis-pagos')
        this.pagos = response.data
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar mis pagos'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
