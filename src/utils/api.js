import { useCookie } from '@core/composable/useCookie'
import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Accept': 'application/json',
  },
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      // Ensure headers is initialized as an object
      if (!options.headers) {
        options.headers = {}
      }
      
      // Handle both Headers instance and plain object
      if (options.headers instanceof Headers) {
        options.headers.set('Authorization', `Bearer ${accessToken}`)
        options.headers.set('Accept', 'application/json')
      } else {
        options.headers = {
          ...options.headers,
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        }
      }
    }
  },
  async onResponseError({ response }) {
    // Manejar errores de autenticación
    if (response.status === 401) {
      // Token inválido o expirado
      const accessTokenCookie = useCookie('accessToken')
      const refreshTokenCookie = useCookie('refreshToken')
      
      accessTokenCookie.value = null
      refreshTokenCookie.value = null
      
      // Redirigir al login si no estamos ya ahí
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
  },
})
