<script setup>
import { useAuthStore } from '@/stores/auth'
import { useMensajesStore } from '@/stores/mensajes'
import { usePlanesStore } from '@/stores/planes'
import { useUsersStore } from '@/stores/users'
import { useReservasStore } from '@/stores/reservas'
import { useClasesStore } from '@/stores/clases'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    subject: 'dashboard',
    action: 'read',
  },
})

const authStore = useAuthStore()
const mensajesStore = useMensajesStore()
const planesStore = usePlanesStore()
const usersStore = useUsersStore()
const reservasStore = useReservasStore()
const clasesStore = useClasesStore()
const router = useRouter()

const currentUser = computed(() => authStore.currentUser)
const userRole = computed(() => authStore.userRole)

// Estadísticas del usuario
const estadisticas = ref({
  mensajes: {
    total: 0,
    noLeidos: 0,
  },
})

// Usuarios recientes
const usuarios = ref([])

// Plan actual del usuario
const miPlan = ref(null)

// Próximas reservas
const proximasReservas = ref([])

// Cargar datos
onMounted(async () => {
  await cargarEstadisticas()
  await cargarPlanActual()
  await cargarProximasReservas()
})

const cargarPlanActual = async () => {
  try {
    // Cargar desde localStorage
    const planStr = localStorage.getItem('user_plan_ikigai')
    if (planStr) {
      miPlan.value = JSON.parse(planStr)
    }
  } catch (error) {
    console.error('Error al cargar plan:', error)
  }
}

const cargarProximasReservas = async () => {
  try {
    if (currentUser.value) {
      proximasReservas.value = reservasStore.obtenerProximasReservas(currentUser.value.id)
    }
  } catch (error) {
    console.error('Error al cargar reservas:', error)
  }
}

const getDiasRestantes = () => {
  if (!miPlan.value?.fecha_expiracion) return 0
  const ahora = new Date()
  const vencimiento = new Date(miPlan.value.fecha_expiracion)
  const diferencia = vencimiento - ahora
  return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)))
}

const getClasesUsadas = () => {
  if (!miPlan.value) return 0
  const total = miPlan.value.clases_totales || 0
  const disponibles = miPlan.value.clases_disponibles || 0
  return total - disponibles
}

const formatearFecha = fecha => {
  if (!fecha) return 'Sin fecha'
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Cargar datos
onMounted(async () => {
  await cargarEstadisticas()
})

const cargarEstadisticas = async () => {
  try {
    // Cargar mensajes
    await mensajesStore.fetchMensajes()
    estadisticas.value.mensajes.total = mensajesStore.mensajes.length
    estadisticas.value.mensajes.noLeidos = mensajesStore.mensajes.filter(m => !m.leido).length
    
    // Cargar usuarios
    await usersStore.fetchUsers()
    usuarios.value = usersStore.users
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

// Obtener usuarios recientes (últimos 10)
const usuariosRecientes = computed(() => {
  return [...usuarios.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
})

// Obtener mensajes recientes
const mensajesRecientes = computed(() => {
  return mensajesStore.mensajes
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    .slice(0, 3)
})

const getEstadoColor = estado => {
  const colores = {
    pendiente: 'warning',
    aprobado: 'success',
    rechazado: 'error',
    'en revisión': 'info',
  }
  return colores[estado] || 'default'
}

const navegarA = ruta => {
  router.push(ruta)
}

const abrirCongreso = () => {
  window.open('https://www.congresogeologicochileno.cl/', '_blank')
}
</script>

<template>
  <div>
    <!-- Bienvenida -->
    <VCard class="mb-6 overflow-visible">
      <VCardText>
        <VRow align="center">
          <VCol
            cols="12"
            md="8"
          >
            <div class="d-flex align-center mb-2">
              <VAvatar
                size="56"
                color="primary"
                variant="tonal"
                class="me-4"
              >
                <span class="text-h5">{{ currentUser?.name?.charAt(0) || 'U' }}</span>
              </VAvatar>
              <div>
                <h3
                  class="text-h4 mb-1"
                  style="color: #DC2626;"
                >
                  ¡Bienvenido, {{ currentUser?.name || 'Usuario' }}! 👋
                </h3>
                <p class="text-body-1 mb-0 text-medium-emphasis">
                  APP IKIGAI BOX - Panel de Control
                </p>
              </div>
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
            class="text-center text-md-end"
          >
            <VBtn
              color="primary"
              size="large"
              prepend-icon="tabler-plus"
              @click="navegarA('/users')"
            >
              Nuevo Usuario
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Mi Plan Actual -->
    <VCard
      v-if="miPlan"
      class="mb-6"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center mb-4">
              <VAvatar
                size="56"
                color="primary"
                variant="tonal"
                class="me-4"
              >
                <VIcon
                  icon="tabler-package"
                  size="32"
                />
              </VAvatar>
              <div>
                <h3
                  class="text-h5 mb-1"
                  style="color: #DC2626;"
                >
                  Mi Plan Actual
                </h3>
                <p class="text-h6 mb-0">
                  {{ miPlan.plan?.nombre || 'Plan Activo' }}
                </p>
              </div>
            </div>
          </VCol>
        </VRow>

        <VRow>
          <!-- Clases Disponibles -->
          <VCol
            cols="12"
            sm="6"
            md="3"
          >
            <VCard
              variant="tonal"
              color="success"
            >
              <VCardText class="text-center">
                <VIcon
                  icon="tabler-circle-check"
                  size="40"
                  color="success"
                  class="mb-2"
                />
                <div class="text-h4 font-weight-bold">
                  {{ miPlan.clases_disponibles || 0 }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Clases Disponibles
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Clases Usadas -->
          <VCol
            cols="12"
            sm="6"
            md="3"
          >
            <VCard
              variant="tonal"
              color="primary"
            >
              <VCardText class="text-center">
                <VIcon
                  icon="tabler-fitness"
                  size="40"
                  color="primary"
                  class="mb-2"
                />
                <div class="text-h4 font-weight-bold">
                  {{ getClasesUsadas() }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Clases Usadas
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Total de Clases -->
          <VCol
            cols="12"
            sm="6"
            md="3"
          >
            <VCard
              variant="tonal"
              color="info"
            >
              <VCardText class="text-center">
                <VIcon
                  icon="tabler-ticket"
                  size="40"
                  color="info"
                  class="mb-2"
                />
                <div class="text-h4 font-weight-bold">
                  {{ miPlan.plan?.clases_totales >= 999 ? '∞' : miPlan.clases_totales }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Total de Clases
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Días Restantes -->
          <VCol
            cols="12"
            sm="6"
            md="3"
          >
            <VCard
              variant="tonal"
              color="warning"
            >
              <VCardText class="text-center">
                <VIcon
                  icon="tabler-calendar-time"
                  size="40"
                  color="warning"
                  class="mb-2"
                />
                <div class="text-h4 font-weight-bold">
                  {{ getDiasRestantes() }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Días Restantes
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Fechas del Plan -->
        <VRow class="mt-4">
          <VCol
            cols="12"
            md="6"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardText>
                <div class="d-flex align-center mb-2">
                  <VIcon
                    icon="tabler-calendar-event"
                    size="24"
                    color="success"
                    class="me-2"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Fecha de Inicio
                    </div>
                    <div class="text-h6">
                      {{ formatearFecha(miPlan.fecha_inicio) }}
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VCard
              variant="outlined"
              class="h-100"
            >
              <VCardText>
                <div class="d-flex align-center mb-2">
                  <VIcon
                    icon="tabler-calendar-x"
                    size="24"
                    color="error"
                    class="me-2"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Fecha de Vencimiento
                    </div>
                    <div class="text-h6">
                      {{ formatearFecha(miPlan.fecha_expiracion) }}
                    </div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Acciones -->
        <VRow class="mt-4">
          <VCol
            cols="12"
            class="text-center"
          >
            <VBtn
              color="primary"
              size="large"
              prepend-icon="tabler-calendar-event"
              class="me-2"
              @click="navegarA('/clases')"
            >
              Reservar Clase
            </VBtn>
            <VBtn
              color="primary"
              size="large"
              variant="outlined"
              prepend-icon="tabler-package"
              @click="navegarA('/mi-plan')"
            >
              Ver Mi Plan
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Próximas Reservas -->
    <VCard
      v-if="proximasReservas.length > 0"
      class="mb-6"
    >
      <VCardText>
        <div class="d-flex align-center mb-4">
          <VAvatar
            size="56"
            color="success"
            variant="tonal"
            class="me-4"
          >
            <VIcon
              icon="tabler-calendar-check"
              size="32"
            />
          </VAvatar>
          <div>
            <h3
              class="text-h5 mb-1"
              style="color: #DC2626;"
            >
              Mis Próximas Clases
            </h3>
            <p class="text-body-2 mb-0 text-medium-emphasis">
              Tienes {{ proximasReservas.length }} {{ proximasReservas.length === 1 ? 'clase reservada' : 'clases reservadas' }}
            </p>
          </div>
        </div>

        <VRow>
          <VCol
            v-for="reserva in proximasReservas.slice(0, 3)"
            :key="reserva.id"
            cols="12"
            md="4"
          >
            <VCard
              border
              class="h-100"
            >
              <VCardText>
                <div class="d-flex justify-space-between align-center mb-3">
                  <VChip
                    color="success"
                    size="small"
                    variant="tonal"
                  >
                    Confirmada
                  </VChip>
                  <VIcon
                    icon="tabler-circle-check"
                    color="success"
                  />
                </div>

                <h4 class="text-h6 mb-2">
                  {{ reserva.claseNombre }}
                </h4>

                <div class="d-flex flex-column gap-2">
                  <div class="d-flex align-center gap-2">
                    <VIcon
                      icon="tabler-calendar"
                      size="18"
                      color="grey"
                    />
                    <span class="text-body-2">
                      {{ new Date(reserva.fecha).toLocaleDateString('es-CL', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      }) }}
                    </span>
                  </div>

                  <div class="d-flex align-center gap-2">
                    <VIcon
                      icon="tabler-clock"
                      size="18"
                      color="grey"
                    />
                    <span class="text-body-2">
                      {{ reserva.horaInicio }} ({{ reserva.duracion }} min)
                    </span>
                  </div>

                  <div class="d-flex align-center gap-2">
                    <VIcon
                      icon="tabler-user"
                      size="18"
                      color="grey"
                    />
                    <span class="text-body-2">
                      Coach: {{ reserva.coach }}
                    </span>
                  </div>
                </div>
              </VCardText>

              <VCardActions>
                <VBtn
                  variant="text"
                  color="primary"
                  size="small"
                  block
                  @click="navegarA('/clases')"
                >
                  Ver todas mis clases
                </VBtn>
              </VCardActions>
            </VCard>
          </VCol>
        </VRow>

        <VRow v-if="proximasReservas.length > 3" class="mt-2">
          <VCol cols="12" class="text-center">
            <VBtn
              variant="outlined"
              color="primary"
              prepend-icon="tabler-calendar"
              @click="navegarA('/clases')"
            >
              Ver todas ({{ proximasReservas.length }})
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Sin Plan Activo -->
    <VCard
      v-else
      class="mb-6"
      color="warning"
    >
      <VCardText>
        <VRow align="center">
          <VCol
            cols="12"
            md="8"
          >
            <div class="d-flex align-center">
              <VAvatar
                size="56"
                color="white"
                variant="elevated"
                class="me-4"
              >
                <VIcon
                  icon="tabler-alert-circle"
                  size="32"
                  color="warning"
                />
              </VAvatar>
              <div>
                <h3 class="text-h5 mb-1 text-white">
                  No tienes un plan activo
                </h3>
                <p class="text-white mb-0">
                  Adquiere un plan para comenzar a reservar tus clases en el box
                </p>
              </div>
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
            class="text-center text-md-end"
          >
            <VBtn
              color="white"
              variant="elevated"
              prepend-icon="tabler-package"
              @click="navegarA('/mi-plan')"
            >
              Ver Planes Disponibles
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Usuarios Recientes -->
    <VRow class="mt-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <span class="d-flex align-center">
              <VIcon
                icon="tabler-users"
                class="me-2"
                color="primary"
              />
              Nuevos Usuarios
            </span>
            <VBtn
              variant="text"
              size="small"
              @click="navegarA('/users')"
            >
              Ver todos
            </VBtn>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <VList
              v-if="usuariosRecientes.length > 0"
              density="compact"
              class="pa-0"
            >
              <VListItem
                v-for="(usuario, index) in usuariosRecientes"
                :key="usuario.id"
                :class="{ 'border-b': index < usuariosRecientes.length - 1 }"
                @click="navegarA('/users')"
                style="cursor: pointer;"
              >
                <template #prepend>
                  <VAvatar
                    size="40"
                    color="primary"
                    variant="tonal"
                  >
                    <span class="text-sm font-weight-medium">
                      {{ usuario.name?.charAt(0) || 'U' }}
                    </span>
                  </VAvatar>
                </template>

                <VListItemTitle class="text-body-1 font-weight-medium mb-1">
                  {{ usuario.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-body-2">
                  {{ usuario.email }}
                </VListItemSubtitle>

                <template #append>
                  <div class="d-flex flex-column align-end">
                    <VChip
                      size="small"
                      :color="usuario.role === 'admin' ? 'error' : 'primary'"
                      class="mb-1"
                    >
                      {{ usuario.role === 'admin' ? 'Admin' : 'Usuario' }}
                    </VChip>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatearFecha(usuario.created_at) }}
                    </div>
                  </div>
                </template>
              </VListItem>
            </VList>

            <div
              v-else
              class="text-center py-8"
            >
              <VIcon
                icon="tabler-users"
                size="48"
                class="mb-4 text-medium-emphasis"
              />
              <p class="text-body-1 text-medium-emphasis mb-2">
                No hay usuarios aún
              </p>
              <VBtn
                color="primary"
                variant="tonal"
                @click="navegarA('/users')"
              >
                <VIcon
                  start
                  icon="tabler-plus"
                />
                Crear Primer Usuario
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.congress-banner {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.congress-banner:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
</style>
