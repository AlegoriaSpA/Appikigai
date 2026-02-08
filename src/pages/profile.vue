<script setup>
import { useAuthStore } from '@/stores/auth'
import { formatearRutOnInput, validarRut, obtenerErrorRut } from '@/utils/rut'
import { computed, ref, watch } from 'vue'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)

const isEditing = ref(false)
const formErrors = ref({})
const isLoading = ref(false)

const formData = ref({
  name: '',
  apellidos: '',
  numeroDocumento: '',
  telefono: '',
  email: '',
  diaNacimiento: '',
  mesNacimiento: '',
  anioNacimiento: '',
  fechaNacimiento: '',
  edad: null,
})

// Calcular edad automáticamente cuando cambian los campos de fecha
watch([() => formData.value.diaNacimiento, () => formData.value.mesNacimiento, () => formData.value.anioNacimiento], () => {
  calcularEdad()
})

// Formatear RUT automáticamente
watch(() => formData.value.numeroDocumento, (newValue) => {
  if (newValue) {
    const formatted = formatearRutOnInput(newValue)
    if (formatted !== newValue) {
      formData.value.numeroDocumento = formatted
    }
  }
})

const calcularEdad = () => {
  const dia = parseInt(formData.value.diaNacimiento)
  const mes = parseInt(formData.value.mesNacimiento)
  const anio = parseInt(formData.value.anioNacimiento)

  if (dia && mes && anio && anio > 1900 && anio < 2100) {
    const fechaNac = new Date(anio, mes - 1, dia)
    const hoy = new Date()
    let edad = hoy.getFullYear() - fechaNac.getFullYear()
    const mesActual = hoy.getMonth()
    const diaActual = hoy.getDate()

    if (mesActual < (mes - 1) || (mesActual === (mes - 1) && diaActual < dia)) {
      edad--
    }

    formData.value.edad = edad
    formData.value.fechaNacimiento = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  } else {
    formData.value.edad = null
    formData.value.fechaNacimiento = ''
  }
}

const loadUserData = () => {
  if (user.value) {
    // Parsear fecha de nacimiento si existe
    let dia = '', mes = '', anio = ''
    if (user.value.fecha_nacimiento) {
      const partes = user.value.fecha_nacimiento.split('-')
      if (partes.length === 3) {
        anio = partes[0]
        mes = parseInt(partes[1]).toString()
        dia = parseInt(partes[2]).toString()
      }
    }

    formData.value = {
      name: user.value.name || '',
      apellidos: user.value.apellidos || '',
      numeroDocumento: user.value.numero_documento || '',
      telefono: user.value.telefono || '',
      email: user.value.email || '',
      diaNacimiento: dia,
      mesNacimiento: mes,
      anioNacimiento: anio,
      fechaNacimiento: user.value.fecha_nacimiento || '',
      edad: user.value.edad || null,
    }
  }
}

const startEditing = () => {
  loadUserData()
  isEditing.value = true
  formErrors.value = {}
}

const cancelEdit = () => {
  isEditing.value = false
  formErrors.value = {}
}

const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!formData.value.name) {
    formErrors.value.name = 'El nombre es requerido'
    isValid = false
  }

  if (!formData.value.numeroDocumento) {
    formErrors.value.numeroDocumento = 'El RUT es requerido'
    isValid = false
  } else {
    const errorRut = obtenerErrorRut(formData.value.numeroDocumento)
    if (errorRut) {
      formErrors.value.numeroDocumento = errorRut
      isValid = false
    }
  }

  // Email es opcional pero si se ingresa, validar formato
  if (formData.value.email && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formData.value.email)) {
    formErrors.value.email = 'El email no es válido'
    isValid = false
  }

  return isValid
}

const saveProfile = async () => {
  if (!validateForm()) return

  isLoading.value = true
  
  try {
    const result = await authStore.updateProfile(formData.value)
    
    if (result.success) {
      isEditing.value = false
      formErrors.value = {}
    } else {
      formErrors.value.general = result.error || 'Error al actualizar perfil'
    }
  } catch (error) {
    formErrors.value.general = 'Error al actualizar perfil'
  } finally {
    isLoading.value = false
  }
}

const getRoleName = role => {
  const roles = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    user: 'Usuario',
  }
  
  return roles[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : role)
}

loadUserData()
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardText>
            <div class="d-flex align-center mb-6">
              <VAvatar
                size="80"
                color="primary"
                variant="tonal"
                class="me-4"
              >
                <span class="text-h4">{{ user?.name?.charAt(0) || 'U' }}</span>
              </VAvatar>
              <div>
                <h2
                  class="text-h5 mb-1"
                  style="color: #7C3AED;"
                >
                  {{ user?.name || 'Usuario' }}
                </h2>
                <VChip
                  size="small"
                  color="primary"
                >
                  {{ getRoleName(user?.role) }}
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <span style="color: #7C3AED;">Información Personal</span>
            <VBtn
              v-if="!isEditing"
              variant="tonal"
              size="small"
              prepend-icon="tabler-edit"
              @click="startEditing"
            >
              Editar
            </VBtn>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <VForm v-if="isEditing">
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.name"
                    label="Nombre *"
                    :error-messages="formErrors.name"
                    prepend-inner-icon="tabler-user"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.apellidos"
                    label="Apellidos"
                    prepend-inner-icon="tabler-user"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.numeroDocumento"
                    label="RUT *"
                    placeholder="12345678-9"
                    :error-messages="formErrors.numeroDocumento"
                    prepend-inner-icon="tabler-id-badge"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.telefono"
                    label="Teléfono"
                    placeholder="+56912345678"
                    prepend-inner-icon="tabler-phone"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="formData.email"
                    label="Correo Electrónico"
                    type="text"
                    autocomplete="off"
                    :error-messages="formErrors.email"
                    prepend-inner-icon="tabler-mail"
                  />
                </VCol>

                <!-- Fecha de Nacimiento - Solo para usuarios role='user' -->
                <VCol
                  v-if="user?.role === 'user'"
                  cols="12"
                >
                  <div class="text-body-2 mb-2">
                    Fecha de Nacimiento
                  </div>
                  <VRow>
                    <VCol
                      cols="12"
                      sm="4"
                    >
                      <VTextField
                        v-model="formData.diaNacimiento"
                        label="Día"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="DD"
                        prepend-inner-icon="tabler-calendar"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      sm="4"
                    >
                      <VTextField
                        v-model="formData.mesNacimiento"
                        label="Mes"
                        type="number"
                        min="1"
                        max="12"
                        placeholder="MM"
                        prepend-inner-icon="tabler-calendar"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      sm="4"
                    >
                      <VTextField
                        v-model="formData.anioNacimiento"
                        label="Año"
                        type="number"
                        min="1900"
                        :max="new Date().getFullYear()"
                        placeholder="AAAA"
                        prepend-inner-icon="tabler-calendar"
                      />
                    </VCol>
                  </VRow>
                  <div
                    v-if="formData.edad !== null"
                    class="text-caption text-medium-emphasis mt-2"
                  >
                    Edad: {{ formData.edad }} años
                  </div>
                </VCol>

                <VCol
                  v-if="formErrors.general"
                  cols="12"
                >
                  <VAlert
                    type="error"
                    variant="tonal"
                  >
                    {{ formErrors.general }}
                  </VAlert>
                </VCol>

                <VCol
                  cols="12"
                  class="d-flex gap-4 justify-end"
                >
                  <VBtn
                    color="secondary"
                    variant="outlined"
                    @click="cancelEdit"
                  >
                    Cancelar
                  </VBtn>
                  <VBtn
                    color="primary"
                    :loading="isLoading"
                    @click="saveProfile"
                  >
                    Guardar Cambios
                  </VBtn>
                </VCol>
              </VRow>
            </VForm>

            <div v-else>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div
                      class="text-body-2 mb-1"
                      style="color: #7C3AED; font-weight: 500;"
                    >
                      Nombre
                    </div>
                    <div class="text-body-1">
                      {{ user?.name || 'No especificado' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div
                      class="text-body-2 mb-1"
                      style="color: #7C3AED; font-weight: 500;"
                    >
                      Apellidos
                    </div>
                    <div class="text-body-1">
                      {{ user?.apellidos || 'No especificado' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div
                      class="text-body-2 mb-1"
                      style="color: #7C3AED; font-weight: 500;"
                    >
                      RUT
                    </div>
                    <div class="text-body-1">
                      {{ user?.numero_documento || 'No especificado' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div
                      class="text-body-2 mb-1"
                      style="color: #7C3AED; font-weight: 500;"
                    >
                      Teléfono
                    </div>
                    <div class="text-body-1">
                      {{ user?.telefono || 'No especificado' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div
                      class="text-body-2 mb-1"
                      style="color: #7C3AED; font-weight: 500;"
                    >
                      Correo Electrónico
                    </div>
                    <div class="text-body-1">
                      {{ user?.email || 'No especificado' }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  v-if="user?.role === 'user' && user?.fecha_nacimiento"
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div
                      class="text-body-2 mb-1"
                      style="color: #7C3AED; font-weight: 500;"
                    >
                      Fecha de Nacimiento
                    </div>
                    <div class="text-body-1">
                      {{ new Date(user.fecha_nacimiento).toLocaleDateString('es-ES') }}
                      <span
                        v-if="user?.edad"
                        class="text-caption text-medium-emphasis ms-2"
                      >
                        ({{ user.edad }} años)
                      </span>
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-body-2 text-disabled mb-1">
                      Rol
                    </div>
                    <div class="text-body-1">
                      {{ getRoleName(user?.role) }}
                    </div>
                  </div>
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <div class="mb-4">
                    <div class="text-body-2 text-disabled mb-1">
                      Miembro desde
                    </div>
                    <div class="text-body-1">
                      {{ user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible' }}
                    </div>
                  </div>
                </VCol>
              </VRow>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
