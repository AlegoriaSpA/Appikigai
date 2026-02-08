<script setup>
import { ref, computed, watch } from 'vue'
import { useClasesStore } from '@/stores/clases'
import { useReservasStore } from '@/stores/reservas'
import { useUsersStore } from '@/stores/users'

definePage({
  meta: {
    subject: 'check-in',
    action: 'manage',
    requiredRole: ['admin', 'superadmin'],
  },
})

const clasesStore = useClasesStore()
const reservasStore = useReservasStore()
const usersStore = useUsersStore()

// Estado local
const fechaSeleccionada = ref(new Date().toISOString().split('T')[0])
const claseSeleccionada = ref(null)
const busquedaUsuario = ref('')
const dialogAgregarCliente = ref(false)
const usuarioSeleccionado = ref(null)

// Obtener día de la semana para la fecha seleccionada
const obtenerNombreDia = (fecha) => {
  const date = new Date(fecha + 'T00:00:00')
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  return dias[date.getDay()]
}

// Clases disponibles para la fecha seleccionada
const clasesDelDia = computed(() => {
  const nombreDia = obtenerNombreDia(fechaSeleccionada.value)
  const clases = clasesStore.obtenerClasesPorDia(nombreDia, fechaSeleccionada.value)
  
  return clases.map(clase => ({
    ...clase,
    value: clase.id,
    title: `${clase.nombre} ${clase.horaInicio} - ${clase.coach}`
  }))
})

// Información de la clase seleccionada
const infoClaseSeleccionada = computed(() => {
  if (!claseSeleccionada.value) return null
  return clasesDelDia.value.find(c => c.id === claseSeleccionada.value)
})

// Reservas de la clase seleccionada
const reservasClase = computed(() => {
  if (!claseSeleccionada.value || !fechaSeleccionada.value) return []
  
  return reservasStore.reservas.filter(r => 
    r.claseId === claseSeleccionada.value && 
    r.fecha === fechaSeleccionada.value &&
    !r.cancelada
  )
})

// Usuarios filtrados para búsqueda (solo con planes activos)
const usuariosFiltrados = computed(() => {
  if (!busquedaUsuario.value || busquedaUsuario.value.length < 2) return []
  
  const termino = busquedaUsuario.value.toLowerCase()
  
  // Filtrar usuarios que coincidan con el término de búsqueda
  const usuariosCoincidentes = usersStore.users.filter(u => 
    u.fullName?.toLowerCase().includes(termino) ||
    u.username?.toLowerCase().includes(termino) ||
    u.email?.toLowerCase().includes(termino)
  )
  
  // Filtrar solo usuarios con planes activos
  const usuariosConPlanActivo = usuariosCoincidentes.filter(u => {
    const planStr = localStorage.getItem('user_plan_ikigai')
    if (!planStr) return false
    
    try {
      const plan = JSON.parse(planStr)
      // Verificar si el usuario ID coincide y tiene clases disponibles
      if (plan.user_id === u.id) {
        const fechaExpiracion = new Date(plan.fecha_expiracion)
        const ahora = new Date()
        return plan.clases_disponibles > 0 && fechaExpiracion > ahora
      }
    } catch (error) {
      return false
    }
    
    return false
  })
  
  return usuariosConPlanActivo.slice(0, 10)
})

// Resetear clase al cambiar fecha
watch(fechaSeleccionada, () => {
  claseSeleccionada.value = null
})

// Abrir dialog para agregar cliente
const abrirDialogAgregar = () => {
  if (!claseSeleccionada.value) {
    alert('Primero selecciona una clase')
    return
  }
  
  const clase = infoClaseSeleccionada.value
  if (reservasClase.value.length >= clase.cupos) {
    alert('La clase está completa. No hay cupos disponibles.')
    return
  }
  
  busquedaUsuario.value = ''
  usuarioSeleccionado.value = null
  dialogAgregarCliente.value = true
}

// Seleccionar usuario de la búsqueda
const seleccionarUsuario = (usuario) => {
  usuarioSeleccionado.value = usuario
  busquedaUsuario.value = usuario.fullName || usuario.username
}

// Agregar cliente a la clase
const agregarCliente = () => {
  if (!usuarioSeleccionado.value) {
    alert('Selecciona un usuario')
    return
  }

  // Verificar que el usuario tiene un plan activo
  const planStr = localStorage.getItem('user_plan_ikigai')
  if (!planStr) {
    alert('Este usuario no tiene un plan activo')
    return
  }

  try {
    const plan = JSON.parse(planStr)
    
    if (plan.user_id !== usuarioSeleccionado.value.id) {
      alert('Este usuario no tiene un plan activo')
      return
    }

    if (plan.clases_disponibles <= 0) {
      alert('Este usuario no tiene clases disponibles en su plan')
      return
    }

    const fechaExpiracion = new Date(plan.fecha_expiracion)
    const ahora = new Date()
    if (fechaExpiracion <= ahora) {
      alert('El plan de este usuario ha expirado')
      return
    }
  } catch (error) {
    alert('Error al verificar el plan del usuario')
    return
  }

  // Verificar si ya tiene reserva
  const yaReservado = reservasStore.tieneReserva(
    usuarioSeleccionado.value.id,
    claseSeleccionada.value,
    fechaSeleccionada.value
  )

  if (yaReservado) {
    alert('Este usuario ya tiene una reserva para esta clase')
    return
  }

  const clase = infoClaseSeleccionada.value

  // Crear reserva manual por el admin
  reservasStore.crearReserva({
    usuarioId: usuarioSeleccionado.value.id,
    usuarioNombre: usuarioSeleccionado.value.fullName || usuarioSeleccionado.value.username,
    claseId: clase.id,
    claseNombre: clase.nombre,
    fecha: fechaSeleccionada.value,
    horaInicio: clase.horaInicio,
    duracion: clase.duracion,
    coach: clase.coach
  })

  alert('Cliente agregado exitosamente')
  dialogAgregarCliente.value = false
  usuarioSeleccionado.value = null
  busquedaUsuario.value = ''
}

// Marcar asistencia
const marcarAsistencia = (reserva) => {
  const resultado = reservasStore.marcarAsistencia(reserva.id)
  if (resultado.success) {
    // La reserva se actualizó
  } else {
    alert(resultado.message)
  }
}

// Eliminar reserva
const eliminarReserva = (reserva) => {
  if (confirm(`¿Eliminar la reserva de ${reserva.usuarioNombre}?`)) {
    const resultado = reservasStore.cancelarReservaPorAdmin(
      reserva.usuarioId,
      reserva.claseId,
      reserva.fecha
    )
    
    if (resultado.success) {
      alert('Reserva eliminada')
    } else {
      alert(resultado.message)
    }
  }
}

// Formatear fecha para mostrar
const formatearFecha = (fecha) => {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <VRow>
    <!-- Header -->
    <VCol cols="12">
      <VCard class="mb-6">
        <VCardText class="pa-6">
          <div class="d-flex align-center mb-2">
            <VAvatar
              size="56"
              color="primary"
              variant="tonal"
              class="me-4"
            >
              <VIcon
                icon="tabler-clipboard-check"
                size="32"
              />
            </VAvatar>
            <div>
              <h2 class="text-h4 mb-1">
                Check in de clases
              </h2>
              <p class="text-body-1 text-medium-emphasis mb-0">
                Revisa las reservas y asistencias en tus clases
              </p>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Panel de selección -->
    <VCol
      cols="12"
      md="4"
    >
      <VCard border style="border-color: #DC2626; border-width: 2px;">
        <VCardText class="pa-6">
          <!-- Seleccionar fecha -->
          <div class="mb-6">
            <label class="text-body-1 font-weight-medium mb-2 d-block">
              Selecciona una fecha
            </label>
            <VTextField
              v-model="fechaSeleccionada"
              type="date"
              variant="filled"
              hide-details
            />
          </div>

          <!-- Seleccionar clase -->
          <div class="mb-6">
            <label class="text-body-1 font-weight-medium mb-2 d-block">
              Selecciona una clase
            </label>
            <VSelect
              v-model="claseSeleccionada"
              :items="clasesDelDia"
              placeholder="Selecciona una clase"
              variant="filled"
              hide-details
              :disabled="clasesDelDia.length === 0"
            >
              <template #no-data>
                <div class="pa-4 text-center text-medium-emphasis">
                  No hay clases para este día
                </div>
              </template>
            </VSelect>
          </div>

          <!-- Agregar cliente -->
          <VBtn
            color="primary"
            size="large"
            block
            prepend-icon="tabler-user-plus"
            :disabled="!claseSeleccionada"
            @click="abrirDialogAgregar"
          >
            Agregar cliente a la clase
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Panel de reservas -->
    <VCol
      cols="12"
      md="8"
    >
      <VCard>
        <VCardText class="pa-6">
          <!-- Info de la clase -->
          <div v-if="infoClaseSeleccionada" class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-h5">
                Clase: {{ infoClaseSeleccionada.nombre }}
              </h3>
              <VBtn
                variant="outlined"
                color="primary"
                size="small"
                prepend-icon="tabler-refresh"
              >
                Actualizar reservas
              </VBtn>
            </div>
            <div class="d-flex gap-4 text-body-2 text-medium-emphasis">
              <span>
                <VIcon icon="tabler-calendar" size="16" class="me-1" />
                {{ formatearFecha(fechaSeleccionada) }}
              </span>
              <span>
                <VIcon icon="tabler-clock" size="16" class="me-1" />
                {{ infoClaseSeleccionada.horaInicio }} ({{ infoClaseSeleccionada.duracion }} min)
              </span>
              <span>
                <VIcon icon="tabler-user" size="16" class="me-1" />
                {{ infoClaseSeleccionada.coach }}
              </span>
            </div>
          </div>

          <!-- Título de reservas -->
          <div v-if="claseSeleccionada" class="d-flex align-center mb-4">
            <h4 class="text-h6 me-2">
              Reservas En Esta Clase
            </h4>
            <VChip
              :color="reservasClase.length >= infoClaseSeleccionada?.cupos ? 'error' : 'primary'"
              size="small"
            >
              {{ reservasClase.length }} de {{ infoClaseSeleccionada?.cupos }}
            </VChip>
          </div>

          <!-- Sin clase seleccionada -->
          <div v-if="!claseSeleccionada" class="text-center py-12">
            <VIcon
              icon="tabler-calendar-off"
              size="64"
              color="grey"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              Selecciona una fecha y clase
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Elige una fecha y clase del panel izquierdo para ver las reservas
            </p>
          </div>

          <!-- Sin reservas -->
          <div v-else-if="reservasClase.length === 0" class="text-center py-12">
            <VIcon
              icon="tabler-users-off"
              size="64"
              color="grey"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              No hay reservas para esta clase
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              Agrega clientes usando el botón "Agregar cliente a la clase"
            </p>
          </div>

          <!-- Lista de reservas -->
          <div v-else>
            <VCard
              v-for="reserva in reservasClase"
              :key="reserva.id"
              class="mb-3"
              border
            >
              <VCardText>
                <VRow align="center">
                  <VCol cols="12" md="6">
                    <div class="d-flex align-center gap-3">
                      <VAvatar
                        color="primary"
                        size="48"
                      >
                        <span class="text-h6 text-white">
                          {{ reserva.usuarioNombre.charAt(0).toUpperCase() }}
                        </span>
                      </VAvatar>
                      <div>
                        <div class="text-h6 mb-1">
                          {{ reserva.usuarioNombre }}
                        </div>
                        <div class="d-flex align-center gap-2">
                          <VChip
                            :color="reserva.asistio ? 'success' : 'default'"
                            size="small"
                            variant="tonal"
                          >
                            {{ reserva.asistio ? 'Asistió' : 'Activo' }}
                          </VChip>
                          <span class="text-caption text-medium-emphasis">
                            Reservado el {{ new Date(reserva.fechaReserva).toLocaleDateString('es-CL') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </VCol>
                  <VCol cols="12" md="6" class="text-md-end">
                    <div class="d-flex gap-2 justify-end">
                      <VBtn
                        v-if="!reserva.asistio"
                        color="success"
                        variant="tonal"
                        size="small"
                        prepend-icon="tabler-check"
                        @click="marcarAsistencia(reserva)"
                      >
                        Marcar asistencia
                      </VBtn>
                      <VBtn
                        color="error"
                        variant="text"
                        size="small"
                        icon="tabler-trash"
                        @click="eliminarReserva(reserva)"
                      />
                    </div>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
          </div>

          <!-- Botón tomar hora coach -->
          <div v-if="claseSeleccionada" class="mt-6 text-center">
            <VBtn
              color="secondary"
              variant="outlined"
              size="large"
              block
              prepend-icon="tabler-clock"
            >
              Tomar Hora Coach
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Dialog Agregar Cliente -->
    <VDialog
      v-model="dialogAgregarCliente"
      max-width="600"
    >
      <VCard>
        <VCardTitle>Agregar cliente a la clase</VCardTitle>

        <VCardText>
          <p class="text-body-2 mb-4">
            Clase: <strong>{{ infoClaseSeleccionada?.nombre }} - {{ infoClaseSeleccionada?.horaInicio }}</strong>
          </p>

          <VTextField
            v-model="busquedaUsuario"
            label="Buscar por nombre o email"
            placeholder="Escribe al menos 2 caracteres..."
            prepend-inner-icon="tabler-search"
            variant="outlined"
            clearable
          />

          <!-- Lista de usuarios -->
          <div v-if="usuariosFiltrados.length > 0" class="mt-4">
            <VList>
              <VListItem
                v-for="usuario in usuariosFiltrados"
                :key="usuario.id"
                :active="usuarioSeleccionado?.id === usuario.id"
                @click="seleccionarUsuario(usuario)"
              >
                <template #prepend>
                  <VAvatar color="primary" size="40">
                    <span>{{ (usuario.fullName || usuario.username).charAt(0) }}</span>
                  </VAvatar>
                </template>
                <VListItemTitle>{{ usuario.fullName || usuario.username }}</VListItemTitle>
                <VListItemSubtitle>{{ usuario.email }}</VListItemSubtitle>
              </VListItem>
            </VList>
          </div>

          <div v-else-if="busquedaUsuario.length >= 2" class="text-center py-4 text-medium-emphasis">
            No se encontraron usuarios con planes activos
          </div>
          <div v-if="busquedaUsuario.length < 2" class="text-center py-4 text-medium-emphasis">
            Escribe al menos 2 caracteres para buscar usuarios con planes activos
          </div>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogAgregarCliente = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :disabled="!usuarioSeleccionado"
            @click="agregarCliente"
          >
            Agregar a la clase
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VRow>
</template>

<style scoped>
.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
