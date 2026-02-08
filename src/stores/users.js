import { $api } from '@/utils/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const pagination = ref({
    page: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  })

  // Actions
  async function fetchUsers(params = {}) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $api('/api/users', {
        params: {
          per_page: 9999,
        },
      })

      console.log('API Response completa:', response)
      console.log('response.data:', response.data)

      // La API devuelve { data: [...], current_page, per_page, ... }
      const usersList = response.data || []
      
      // Normalizar los datos
      users.value = usersList.map(user => ({
        ...user,
        fullName: user.name,
      }))
      
      console.log('users.value después del map:', users.value)
      
      // Usar metadatos de paginación de la respuesta
      pagination.value = {
        page: response.current_page || 1,
        perPage: response.per_page || 9999,
        total: response.total || users.value.length,
        lastPage: response.last_page || 1,
      }

      return { success: true }
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = err.data?.message || err.message || 'Error al obtener usuarios'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser(id) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $api(`/api/users/${id}`, {
        method: 'GET',
      })

      currentUser.value = response.data || response.user || response
      
      return { success: true, user: currentUser.value }
    } catch (err) {
      console.error('Error fetching user:', err)
      error.value = err.data?.message || err.message || 'Error al obtener usuario'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(userData) {
    isLoading.value = true
    error.value = null
    
    try {
      // La API espera 'name' en lugar de 'fullName'
      const apiData = {
        name: userData.fullName || userData.name,
        apellidos: userData.apellidos,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password,
        role: userData.role,
        numero_documento: userData.numeroDocumento,
        telefono: userData.telefono,
        profesion: userData.profesion,
        universidad: userData.universidad,
        fecha_nacimiento: userData.fechaNacimiento,
        edad: userData.edad,
      }

      const response = await $api('/api/users', {
        method: 'POST',
        body: apiData,
      })

      // La API devuelve { message, user }
      const newUser = response.user || response
      
      // Normalizar el usuario para el frontend (name -> fullName)
      const normalizedUser = {
        ...newUser,
        fullName: newUser.name || newUser.fullName,
        username: newUser.username || newUser.email?.split('@')[0],
      }

      users.value.unshift(normalizedUser)
      
      return { success: true, user: normalizedUser }
    } catch (err) {
      console.error('Error creating user:', err)
      error.value = err.data?.message || err.message || 'Error al crear usuario'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(id, userData) {
    isLoading.value = true
    error.value = null
    
    try {
      // La API espera 'name' en lugar de 'fullName'
      const apiData = {
        ...(userData.fullName || userData.name ? { name: userData.fullName || userData.name } : {}),
        ...(userData.apellidos !== undefined ? { apellidos: userData.apellidos } : {}),
        ...(userData.email ? { email: userData.email } : {}),
        ...(userData.password ? { 
          password: userData.password,
          password_confirmation: userData.password, 
        } : {}),
        ...(userData.role ? { role: userData.role } : {}),
        ...(userData.numeroDocumento !== undefined ? { numero_documento: userData.numeroDocumento } : {}),
        ...(userData.telefono !== undefined ? { telefono: userData.telefono } : {}),
        ...(userData.profesion !== undefined ? { profesion: userData.profesion } : {}),
        ...(userData.universidad !== undefined ? { universidad: userData.universidad } : {}),
        ...(userData.fechaNacimiento !== undefined ? { fecha_nacimiento: userData.fechaNacimiento } : {}),
        ...(userData.edad !== undefined ? { edad: userData.edad } : {}),
      }

      const response = await $api(`/api/users/${id}`, {
        method: 'PUT',
        body: apiData,
      })

      // La API devuelve { message, user }
      const updatedUser = response.user || response
      
      // Normalizar el usuario para el frontend
      const normalizedUser = {
        ...updatedUser,
        fullName: updatedUser.name || updatedUser.fullName,
        username: updatedUser.username || updatedUser.email?.split('@')[0],
      }
      
      const index = users.value.findIndex(u => u.id === id)
      
      if (index !== -1) {
        users.value[index] = normalizedUser
      }
      
      return { success: true, user: normalizedUser }
    } catch (err) {
      console.error('Error updating user:', err)
      error.value = err.data?.message || err.message || 'Error al actualizar usuario'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteUser(id) {
    isLoading.value = true
    error.value = null
    
    try {
      await $api(`/api/users/${id}`, {
        method: 'DELETE',
      })

      users.value = users.value.filter(u => u.id !== id)
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting user:', err)
      error.value = err.data?.message || err.message || 'Error al eliminar usuario'
      
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    users,
    currentUser,
    isLoading,
    error,
    pagination,
    
    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  }
})
