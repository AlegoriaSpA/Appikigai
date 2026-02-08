<script setup>
import { useAuthStore } from '@/stores/auth'
import { useEvaluacionesStore } from '@/stores/evaluaciones'
import { useMensajesStore } from '@/stores/mensajes'
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
const evaluacionesStore = useEvaluacionesStore()
const router = useRouter()

const currentUser = computed(() => authStore.currentUser)
const userRole = computed(() => authStore.userRole)

// Estadísticas del usuario
const estadisticas = ref({
  mensajes: {
    total: 0,
    noLeidos: 0,
  },
  evaluaciones: {
    total: 0,
  },
})

// Evaluaciones
const evaluaciones = ref([])

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
    
    // Cargar evaluaciones
    const result = await evaluacionesStore.fetchEvaluaciones({ limit: 10 })
    if (result.success) {
      evaluaciones.value = evaluacionesStore.evaluaciones
      estadisticas.value.evaluaciones.total = evaluaciones.value.length
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}

// Obtener evaluaciones recientes (últimas 5)
const evaluacionesRecientes = computed(() => {
  return [...evaluaciones.value]
    .sort((a, b) => new Date(b.fecha_evaluacion) - new Date(a.fecha_evaluacion))
    .slice(0, 5)
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

const formatearFecha = fecha => {
  if (!fecha) return 'Sin fecha'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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
                  style="color: #FFFFFF;"
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
              prepend-icon="tabler-plus"
              class="me-2"
              @click="navegarA('/users')"
            >
              Nuevo Usuario
            </VBtn>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="navegarA('/evaluaciones')"
            >
              Nueva Evaluación
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Estadísticas principales -->
    <VRow>
      <!-- Card Resúmenes -->
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="h-100">
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar
                size="44"
                color="primary"
                variant="tonal"
              >
                <VIcon
                  icon="tabler-file-text"
                  size="24"
                />
              </VAvatar>
              <div class="ms-3">
                <p class="text-body-2 mb-0 text-medium-emphasis">
                  Total de Evaluaciones
                </p>
                <h3 class="text-h3">
                  {{ estadisticas.evaluaciones.total }}
                </h3>
              </div>
            </div>
            <VBtn
              variant="text"
              size="small"
              color="primary"
              @click="navegarA('/evaluaciones')"
            >
              VER TODOS
              <VIcon
                end
                icon="tabler-arrow-right"
                size="16"
              />
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Card Mensajes -->
      <!-- <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="h-100">
          <VCardText>
            <div class="d-flex align-center mb-4">
              <VAvatar
                size="44"
                color="info"
                variant="tonal"
              >
                <VIcon
                  icon="tabler-mail"
                  size="24"
                />
              </VAvatar>
              <div class="ms-3">
                <p class="text-body-2 mb-0 text-medium-emphasis">
                  Mensajes
                </p>
                <h3 class="text-h3">
                  {{ estadisticas.mensajes.noLeidos }}
                </h3>
              </div>
            </div>
            <VBtn
              variant="text"
              size="small"
              color="info"
              @click="navegarA('/mensajes')"
            >
              VER MENSAJES
              <VIcon
                end
                icon="tabler-arrow-right"
                size="16"
              />
            </VBtn>
          </VCardText>
        </VCard>
      </VCol> -->
    </VRow>

    <!-- Secciones principales -->
    <VRow class="mt-6">
      <!-- Resúmenes Recientes -->
      <VCol cols="12">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between">
            <span class="d-flex align-center">
              <VIcon
                icon="tabler-clipboard-list"
                class="me-2"
                color="primary"
              />
              Evaluaciones Recientes
            </span>
            <VBtn
              variant="text"
              size="small"
              @click="navegarA('/evaluaciones')"
            >
              Ver todos
            </VBtn>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <VList
              v-if="evaluacionesRecientes.length > 0"
              density="compact"
              class="pa-0"
            >
              <VListItem
                v-for="(evaluacion, index) in evaluacionesRecientes"
                :key="evaluacion.id"
                :class="{ 'border-b': index < evaluacionesRecientes.length - 1 }"
                @click="navegarA('/evaluaciones')"
                style="cursor: pointer;"
              >
                <template #prepend>
                  <VAvatar
                    size="40"
                    color="primary"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-user"
                      size="20"
                    />
                  </VAvatar>
                </template>

                <VListItemTitle class="text-body-1 font-weight-medium mb-1">
                  {{ evaluacion.usuario.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-body-2">
                  Peso: {{ evaluacion.peso }} kg • IMC: {{ evaluacion.imc }} • Grasa: {{ evaluacion.porcentaje_grasa }}%
                </VListItemSubtitle>

                <template #append>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatearFecha(evaluacion.fecha_evaluacion) }}
                  </div>
                </template>
              </VListItem>
            </VList>

            <div
              v-else
              class="text-center py-8"
            >
              <VIcon
                icon="tabler-clipboard-list"
                size="48"
                class="mb-4 text-medium-emphasis"
              />
              <p class="text-body-1 text-medium-emphasis mb-2">
                No hay evaluaciones aún
              </p>
              <VBtn
                color="primary"
                variant="tonal"
                @click="navegarA('/evaluaciones')"
              >
                <VIcon
                  start
                  icon="tabler-plus"
                />
                Crear Primera Evaluación
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
