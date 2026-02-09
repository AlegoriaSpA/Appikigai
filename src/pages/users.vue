<script setup>
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { formatearRutOnInput, validarRut, obtenerErrorRut } from '@/utils/rut'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    subject: 'users',
    action: 'read',
  },
})

const router = useRouter()
const authStore = useAuthStore()

// Verificar que el usuario sea admin o superadmin (NO editor)
if (authStore.userRole !== 'admin' && authStore.userRole !== 'superadmin') {
  router.push('/')
}

const usersStore = useUsersStore()

// State
const searchQuery = ref('')
const selectedRole = ref('')
const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const editedUser = ref(null)
const userToDelete = ref(null)
const allUsers = ref([])
const filteredUsers = ref([])

const tableOptions = ref({
  sortBy: [],
})

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const roles = [
  { title: 'Todos', value: '' },
  { title: 'Super Admin', value: 'superadmin' },
  { title: 'Coach', value: 'coach' },
  { title: 'Cliente', value: 'cliente' },
  { title: 'Prueba', value: 'prueba' },
]

// Roles disponibles para crear según el rol del usuario actual
const rolesDisponibles = computed(() => {
  if (authStore.userRole === 'superadmin') {
    return [
      { title: 'Super Admin', value: 'superadmin' },
      { title: 'Coach', value: 'coach' },
      { title: 'Cliente', value: 'cliente' },
      { title: 'Prueba', value: 'prueba' },
    ]
  } else if (authStore.userRole === 'coach') {
    return [
      { title: 'Cliente', value: 'cliente' },
      { title: 'Prueba', value: 'prueba' },
    ]
  }
  return [{ title: 'Cliente', value: 'cliente' }]
})

// Form data
const formData = ref({
  name: '',
  apellidos: '',
  email: '',
  password: '',
  role: 'cliente',
  numeroDocumento: '',
  telefono: '',
  profesion: '',
  universidad: '',
  diaNacimiento: '',
  mesNacimiento: '',
  anioNacimiento: '',
  fechaNacimiento: '',
  edad: null,
})

const formErrors = ref({})

// Calcular edad automáticamente
const calcularEdad = () => {
  const dia = parseInt(formData.value.diaNacimiento)
  const mes = parseInt(formData.value.mesNacimiento)
  const anio = parseInt(formData.value.anioNacimiento)
  
  if (!dia || !mes || !anio || dia < 1 || dia > 31 || mes < 1 || mes > 12 || anio < 1900) {
    formData.value.edad = null
    formData.value.fechaNacimiento = ''
    return
  }
  
  // Construir fecha en formato YYYY-MM-DD
  const diaStr = dia.toString().padStart(2, '0')
  const mesStr = mes.toString().padStart(2, '0')
  formData.value.fechaNacimiento = `${anio}-${mesStr}-${diaStr}`
  
  const hoy = new Date()
  const fechaNac = new Date(anio, mes - 1, dia)
  let edad = hoy.getFullYear() - fechaNac.getFullYear()
  const mesDiff = hoy.getMonth() - fechaNac.getMonth()
  
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--
  }
  
  formData.value.edad = edad >= 0 ? edad : null
}

// Watch para calcular edad cuando cambian los campos de fecha
watch([() => formData.value.diaNacimiento, () => formData.value.mesNacimiento, () => formData.value.anioNacimiento], () => {
  calcularEdad()
})

// Watch para formatear RUT automáticamente
watch(() => formData.value.numeroDocumento, (newValue) => {
  if (newValue) {
    const formatted = formatearRutOnInput(newValue)
    if (formatted !== newValue) {
      formData.value.numeroDocumento = formatted
    }
  }
})

// Methods
const loadUsers = async () => {
  // El store ya trae todos los usuarios (per_page: 9999)
  const result = await usersStore.fetchUsers()
  if (result.success) {
    allUsers.value = [...usersStore.users]
    calcularEstadisticasCategorias()
    applyFilters()
  }
}

const applyFilters = () => {
  let filtered = [...allUsers.value]

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()

    filtered = filtered.filter(user => 
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search),
    )
  }

  // Filtrar por rol
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  filteredUsers.value = filtered
}

const openCreateDialog = () => {
  editedUser.value = null
  formData.value = {
    name: '',
    apellidos: '',
    email: '',
    password: '',
    role: 'user',
    numeroDocumento: '',
    telefono: '',
    profesion: '',
    universidad: '',
    diaNacimiento: '',
    mesNacimiento: '',
    anioNacimiento: '',
    fechaNacimiento: '',
    edad: null,
  }
  formErrors.value = {}
  isDialogVisible.value = true
}

const openEditDialog = user => {
  editedUser.value = user
  
  // Parsear fecha de nacimiento si existe
  let dia = '', mes = '', anio = ''
  if (user.fecha_nacimiento) {
    const partes = user.fecha_nacimiento.split('-')
    if (partes.length === 3) {
      anio = partes[0]
      mes = parseInt(partes[1]).toString()
      dia = parseInt(partes[2]).toString()
    }
  }
  
  formData.value = {
    name: user.name,
    apellidos: user.apellidos || '',
    email: user.email,
    password: '',
    role: user.role,
    numeroDocumento: user.numero_documento || '',
    telefono: user.telefono || '',
    profesion: user.profesion || '',
    universidad: user.universidad || '',
    diaNacimiento: dia,
    mesNacimiento: mes,
    anioNacimiento: anio,
    fechaNacimiento: user.fecha_nacimiento || '',
    edad: user.edad || null,
  }
  formErrors.value = {}
  isDialogVisible.value = true
}

const openDeleteDialog = user => {
  userToDelete.value = user
  isDeleteDialogVisible.value = true
}

const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!formData.value.name) {
    formErrors.value.name = 'El nombre es requerido'
    isValid = false
  }

  // Email es opcional pero si se ingresa, validar formato
  if (formData.value.email && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formData.value.email)) {
    formErrors.value.email = 'El email no es válido'
    isValid = false
  }

  // RUT es obligatorio para todos
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

  // Validar contraseña (requerida al crear nuevo usuario, opcional al editar)
  if (!editedUser.value && !formData.value.password) {
    formErrors.value.password = 'La contraseña es requerida'
    isValid = false
  } else if (formData.value.password && formData.value.password.length < 6) {
    formErrors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  // Los campos adicionales de usuarios son opcionales

  return isValid
}

const saveUser = async () => {
  if (!validateForm()) return

  const userData = { ...formData.value }
  
  // Si estamos editando y no hay contraseña, no la enviamos
  if (editedUser.value && !userData.password) {
    delete userData.password
  }

  let result
  
  if (editedUser.value) {
    result = await usersStore.updateUser(editedUser.value.id, userData)
  } else {
    result = await usersStore.createUser(userData)
  }

  if (result.success) {
    isDialogVisible.value = false
    await loadUsers()
  } else {
    formErrors.value.general = result.error
  }
}

const confirmDelete = async () => {
  const result = await usersStore.deleteUser(userToDelete.value.id)
  
  if (result.success) {
    isDeleteDialogVisible.value = false
    await loadUsers()
  }
}

const getRoleBadgeColor = role => {
  const colors = {
    superadmin: 'error',
    coach: 'warning',
    cliente: 'info',
    prueba: 'success',
  }
  
  return colors[role] || 'secondary'
}

const getRoleLabel = role => {
  const labels = {
    superadmin: 'Super Admin',
    coach: 'Coach',
    cliente: 'Cliente',
    prueba: 'Prueba',
  }
  
  // Si el rol no está en el mapa, mostrarlo capitalizado
  return labels[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : role)
}

// Estadísticas por categoría de participación
const estadisticasCategorias = ref({
  profesional: 0,
  academico: 0,
  mayor_65: 0,
  postdoctorado: 0,
  joven_profesional: 0,
  estudiante_pregrado: 0,
  estudiante_magister: 0,
  estudiante_doctorado: 0,
  acompanante: 0,
})

const calcularEstadisticasCategorias = () => {
  // Resetear contadores
  Object.keys(estadisticasCategorias.value).forEach(key => {
    estadisticasCategorias.value[key] = 0
  })
  
  // Contar usuarios por categoría
  allUsers.value.forEach(user => {
    if (user.categoria_participacion && estadisticasCategorias.value.hasOwnProperty(user.categoria_participacion)) {
      estadisticasCategorias.value[user.categoria_participacion]++
    }
  })
}

// Watchers
watch([searchQuery, selectedRole], () => {
  applyFilters()
})

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div>
    <!-- Tabla de Usuarios -->
    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              v-model="searchQuery"
              label="Buscar"
              placeholder="Buscar usuarios..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <VSelect
              v-model="selectedRole"
              :items="roles"
              label="Filtrar por rol"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="5"
            class="d-flex justify-end align-center"
          >
            <VBtn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="tabler-plus"
              @click="openCreateDialog"
            >
              Nuevo Usuario
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <!-- NOTA: Paginación del lado del cliente - todos los usuarios se cargan de una vez -->
      <VDataTable
        v-model:sort-by="tableOptions.sortBy"
        :headers="headers"
        :items="filteredUsers"
        :loading="usersStore.isLoading"
        :items-per-page="25"
        :items-per-page-options="[10, 25, 50, { value: -1, title: 'Todos' }]"
        items-per-page-text="Usuarios por página"
        :hide-default-footer="false"
        no-data-text="No hay usuarios"
      >
        <template #item.fullName="{ item }">
          <div class="d-flex align-center">
            <VAvatar
              :color="item.avatar ? '' : 'primary'"
              :variant="item.avatar ? undefined : 'tonal'"
              size="34"
              class="me-3"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span v-else>{{ item.fullName?.charAt(0) || 'U' }}</span>
            </VAvatar>
            <span>{{ item.fullName }}</span>
          </div>
        </template>

        <template #item.role="{ item }">
          <VChip
            :color="getRoleBadgeColor(item.role)"
            size="small"
          >
            {{ getRoleLabel(item.role) }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            size="small"
            @click="openEditDialog(item)"
          >
            <VIcon icon="tabler-edit" />
            <VTooltip
              activator="parent"
              location="top"
            >
              Editar
            </VTooltip>
          </VBtn>

          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            @click="openDeleteDialog(item)"
          >
            <VIcon icon="tabler-trash" />
            <VTooltip
              activator="parent"
              location="top"
            >
              Eliminar
            </VTooltip>
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog
      v-model="isDialogVisible"
      max-width="900"
      scrollable
    >
      <VCard>
        <VCardTitle>
          {{ editedUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </VCardTitle>

        <VCardText>
          <VForm>
            <VRow>
              <!-- Rol (primero) -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2">
                  Tipo de Usuario
                </h6>
              </VCol>

              <VCol cols="12">
                <VSelect
                  v-model="formData.role"
                  :items="rolesDisponibles"
                  label="Rol"
                  autocomplete="off"
                  required
                  :error-messages="formErrors.role"
                />
              </VCol>

              <!-- Información Personal -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Información Personal
                </h6>
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.name"
                  label="Nombre"
                  :error-messages="formErrors.name"
                  required
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.apellidos"
                  label="Apellidos"
                  :error-messages="formErrors.apellidos"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.email"
                  label="Email"
                  type="text"
                  autocomplete="off"
                  :error-messages="formErrors.email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="formData.telefono"
                  label="Teléfono"
                  :error-messages="formErrors.telefono"
                />
              </VCol>

              <!-- Campos adicionales para admin y superadmin -->
              <template v-if="formData.role === 'admin' || formData.role === 'superadmin'">
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.profesion"
                    label="Profesión"
                    :error-messages="formErrors.profesion"
                  />
                </VCol>

                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="formData.universidad"
                    label="Universidad"
                    :error-messages="formErrors.universidad"
                  />
                </VCol>
              </template>

              <!-- Contraseña (requerida al crear, opcional al editar) -->
              <VCol cols="12">
                <VTextField
                  v-model="formData.password"
                  label="Contraseña"
                  type="password"
                  :error-messages="formErrors.password"
                  :hint="editedUser ? 'Dejar en blanco para mantener la contraseña actual' : 'Mínimo 6 caracteres'"
                  :persistent-hint="true"
                  :required="!editedUser"
                />
              </VCol>

              <!-- RUT obligatorio para todos -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Documento de Identidad
                </h6>
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="formData.numeroDocumento"
                  label="RUT"
                  :error-messages="formErrors.numeroDocumento"
                  required
                />
              </VCol>

              <!-- Campos adicionales para usuarios -->
              <template v-if="formData.role === 'user'">
                <VCol cols="12">
                  <h6 class="text-h6 mb-2 mt-3">
                    Información Adicional
                  </h6>
                </VCol>

                <VCol
                  cols="4"
                  sm="2"
                >
                  <VTextField
                    v-model="formData.diaNacimiento"
                    label="Día"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="DD"
                  />
                </VCol>

                <VCol
                  cols="4"
                  sm="2"
                >
                  <VTextField
                    v-model="formData.mesNacimiento"
                    label="Mes"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="MM"
                  />
                </VCol>

                <VCol
                  cols="4"
                  sm="2"
                >
                  <VTextField
                    v-model="formData.anioNacimiento"
                    label="Año"
                    type="number"
                    min="1900"
                    :max="new Date().getFullYear()"
                    placeholder="AAAA"
                  />
                </VCol>

                <VCol
                  cols="12"
                  sm="6"
                >
                  <VTextField
                    v-model="formData.edad"
                    label="Edad"
                    readonly
                    disabled
                    hint="Se calcula automáticamente"
                    persistent-hint
                  />
                </VCol>
              </template>

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
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="isDialogVisible = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="usersStore.isLoading"
            @click="saveUser"
          >
            {{ editedUser ? 'Actualizar' : 'Crear' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle>
          Confirmar Eliminación
        </VCardTitle>

        <VCardText>
          ¿Está seguro que desea eliminar al usuario <strong>{{ userToDelete?.fullName }}</strong>?
          Esta acción no se puede deshacer.
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="isDeleteDialogVisible = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="error"
            :loading="usersStore.isLoading"
            @click="confirmDelete"
          >
            Eliminar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
