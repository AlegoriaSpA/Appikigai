import { $api } from '@/utils/api'
import { useCookie } from '@core/composable/useCookie'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // State
  const user = ref(null)
  const accessToken = useCookie('accessToken')
  const refreshToken = useCookie('refreshToken')
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const currentUser = computed(() => user.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin')
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isEditor = computed(() => user.value?.role === 'editor')
  const isSecretaria = computed(() => user.value?.role === 'secretaria')
  const isUser = computed(() => user.value?.role === 'user')
  const canManageUsers = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin')

  // Actions
  async function login(credentials) {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Iniciando login...')
      
      // Llamada a la API de login
      const response = await $api('/api/auth/login', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      })

      console.log('Respuesta del login:', response)

      // Guardar tokens (el backend usa accessToken en camelCase)
      if (response.accessToken || response.access_token || response.token) {
        const token = response.accessToken || response.access_token || response.token

        accessToken.value = token
        console.log('Token guardado:', token)
        
        if (response.refreshToken || response.refresh_token) {
          refreshToken.value = response.refreshToken || response.refresh_token
        }

        // Si el backend ya envió los datos del usuario, guardarlos
        if (response.userData || response.user) {
          user.value = response.userData || response.user
          console.log('Usuario obtenido de la respuesta:', user.value)
        } else {
          // Si no, obtener datos del usuario
          console.log('Obteniendo datos del usuario...')
          await fetchUser()
          console.log('Usuario obtenido:', user.value)
        }

        // Redirigir al dashboard
        console.log('Redirigiendo a /')
        await router.push('/')
        
        return { success: true }
      } else {
        throw new Error('No se recibió token de acceso')
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.data?.message || err.message || 'Error al iniciar sesión'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    try {
      console.log('Llamando a /api/auth/me...')

      const response = await $api('/api/auth/me', {
        method: 'GET',
      })
      
      console.log('Respuesta de /api/auth/me:', response)
      user.value = response.user || response
      console.log('Usuario asignado:', user.value)
    } catch (err) {
      console.error('Error fetching user:', err)
      
      // Si falla obtener el usuario, limpiar tokens
      logout()
      throw err
    }
  }

  async function logout() {
    try {
      // Intentar hacer logout en el servidor
      await $api('/api/auth/logout', {
        method: 'POST',
      }).catch(() => {
        // Ignorar errores del logout en el servidor
      })
    } finally {
      // Limpiar estado local
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      
      // Redirigir al login
      router.push('/login')
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      
      return false
    }

    try {
      const response = await $api('/api/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: refreshToken.value,
        },
      })

      if (response.access_token || response.token) {
        accessToken.value = response.access_token || response.token
        
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error refreshing token:', err)
      logout()
      
      return false
    }
  }

  async function checkAuth() {
    if (accessToken.value && !user.value) {
      try {
        await fetchUser()
      } catch (err) {
        console.error('Error checking auth:', err)
      }
    }
  }

  async function updateProfile(profileData) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/auth/perfil', {
        method: 'PUT',
        body: profileData,
      })

      // La API devuelve { message, user }
      const updatedUser = response.user || response

      user.value = updatedUser
      
      return { success: true, user: updatedUser }
    } catch (err) {
      console.error('Error updating profile:', err)
      error.value = err.data?.message || err.message || 'Error al actualizar perfil'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(passwordData) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/auth/cambiar-password', {
        method: 'POST',
        body: {
          current_password: passwordData.current_password,
          new_password: passwordData.password,
          new_password_confirmation: passwordData.password_confirmation,
        },
      })

      return { success: true }
    } catch (err) {
      console.error('Error changing password:', err)
      error.value = err.data?.message || err.message || 'Error al cambiar contraseña'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function forgotPassword(email) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/auth/forgot-password', {
        method: 'POST',
        body: {
          email,
        },
      })

      return { success: true, message: response.message }
    } catch (err) {
      console.error('Error sending password reset email:', err)
      
      // Manejar errores de validación de Laravel
      if (err.data?.errors) {
        // Si hay errores de validación, tomar el primer error
        const firstError = Object.values(err.data.errors)[0]

        error.value = Array.isArray(firstError) ? firstError[0] : firstError
      } else {
        error.value = err.data?.message || err.message || 'Error al enviar email de recuperación'
      }
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(data) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/auth/reset-password', {
        method: 'POST',
        body: {
          email: data.email,
          token: data.token,
          password: data.password,
          password_confirmation: data.password_confirmation,
        },
      })

      return { success: true, message: response.message }
    } catch (err) {
      console.error('Error resetting password:', err)
      error.value = err.data?.message || err.message || 'Error al restablecer contraseña'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function register(data) {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Iniciando registro...')
      
      // Llamada a la API de registro
      const response = await $api('/api/auth/register', {
        method: 'POST',
        body: {
          name: data.name,
          apellidos: data.apellidos,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          tipo_documento: data.tipoDocumento,
          numero_documento: data.numeroDocumento,
          telefono: data.telefono,
          nacionalidad: data.nacionalidad,
        },
      })

      console.log('Respuesta del registro:', response)

      // Guardar tokens si el backend los devuelve al registrar
      if (response.accessToken || response.access_token || response.token) {
        const token = response.accessToken || response.access_token || response.token

        accessToken.value = token
        console.log('Token guardado:', token)
        
        if (response.refreshToken || response.refresh_token) {
          refreshToken.value = response.refreshToken || response.refresh_token
        }

        // Si el backend ya envió los datos del usuario, guardarlos
        if (response.userData || response.user) {
          user.value = response.userData || response.user
          console.log('Usuario registrado:', user.value)
        } else {
          // Si no, obtener datos del usuario
          console.log('Obteniendo datos del usuario...')
          await fetchUser()
        }

        // Redirigir al dashboard
        console.log('Redirigiendo a /')
        await router.push('/')
        
        return { success: true }
      } else {
        // Si no devuelve token, significa que el usuario debe verificar email o iniciar sesión
        return { 
          success: true, 
          message: 'Cuenta creada exitosamente. Por favor inicia sesión.',
          redirectToLogin: true,
        }
      }
    } catch (err) {
      console.error('Register error:', err)
      
      // Manejar errores de validación de Laravel
      if (err.data?.errors) {
        // Si hay errores de validación, concatenar todos los errores
        const errors = Object.values(err.data.errors).flat()

        error.value = errors.join(', ')
      } else {
        error.value = err.data?.message || err.message || 'Error al crear la cuenta'
      }
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    currentUser,
    userRole,
    isAdmin,
    isSuperAdmin,
    isUser,
    isSecretaria,
    isEditor,
    canManageUsers,
    
    // Actions
    login,
    logout,
    fetchUser,
    refreshAccessToken,
    checkAuth,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    register,
  }
})
