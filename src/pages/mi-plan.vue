<script setup>
import { ref, onMounted } from 'vue'
import { usePlanesStore } from '@/stores/planes'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    subject: 'mi-plan',
    action: 'read',
  },
})

const router = useRouter()
const planesStore = usePlanesStore()

const loading = ref(false)
const miPlan = ref(null)
const historialClases = ref([])

const headersHistorial = [
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Tipo de Clase', key: 'tipo' },
  { title: 'Instructor', key: 'instructor' },
  { title: 'Estado', key: 'estado' },
]

// Inicializar datos inmediatamente
const initData = () => {
  // Plan de ejemplo
  miPlan.value = {
    id: 1,
    plan: {
      id: 1,
      nombre: '8 Clases',
      descripcion: 'Plan de 8 clases mensuales',
      precio: 45000,
      clases_totales: 8,
      duracion_dias: 30,
    },
    fecha_inicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    fecha_expiracion: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    clases_totales: 8,
    clases_disponibles: 5,
  }
  
  // Historial de ejemplo
  historialClases.value = [
    {
      id: 1,
      fecha: '2026-02-05',
      hora: '18:00',
      tipo: 'CrossFit',
      instructor: 'Juan Pérez',
      estado: 'Asistió',
    },
    {
      id: 2,
      fecha: '2026-02-03',
      hora: '19:00',
      tipo: 'Funcional',
      instructor: 'María González',
      estado: 'Asistió',
    },
    {
      id: 3,
      fecha: '2026-02-01',
      hora: '18:00',
      tipo: 'CrossFit',
      instructor: 'Juan Pérez',
      estado: 'Ausente',
    },
  ]
}

// Inicializar datos antes del mount
initData()

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    // Cargar plan actual
    const planStr = localStorage.getItem('user_plan_ikigai')
    if (planStr) {
      miPlan.value = JSON.parse(planStr)
    } else {
      // Datos de ejemplo si no hay plan guardado
      miPlan.value = {
        id: 1,
        plan: {
          id: 1,
          nombre: '8 Clases',
          descripcion: 'Plan de 8 clases mensuales',
          precio: 45000,
          clases_totales: 8,
          duracion_dias: 30,
        },
        fecha_inicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
        fecha_expiracion: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // En 25 días
        clases_totales: 8,
        clases_disponibles: 5,
      }
      localStorage.setItem('user_plan_ikigai', JSON.stringify(miPlan.value))
    }
    
    // Cargar historial de clases
    const historialStr = localStorage.getItem('historial_clases_ikigai')
    if (historialStr) {
      historialClases.value = JSON.parse(historialStr)
    } else {
      // Datos de ejemplo
      historialClases.value = [
        {
          id: 1,
          fecha: '2026-02-05',
          hora: '18:00',
          tipo: 'CrossFit',
          instructor: 'Juan Pérez',
          estado: 'Asistió',
        },
        {
          id: 2,
          fecha: '2026-02-03',
          hora: '19:00',
          tipo: 'Funcional',
          instructor: 'María González',
          estado: 'Asistió',
        },
        {
          id: 3,
          fecha: '2026-02-01',
          hora: '18:00',
          tipo: 'CrossFit',
          instructor: 'Juan Pérez',
          estado: 'Ausente',
        },
      ]
      localStorage.setItem('historial_clases_ikigai', JSON.stringify(historialClases.value))
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-CL')
}

function getDiasRestantes(fechaVencimiento) {
  if (!fechaVencimiento) return 0
  const ahora = new Date()
  const vencimiento = new Date(fechaVencimiento)
  const diferencia = vencimiento - ahora
  return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)))
}

function getEstadoColor(estado) {
  const colors = {
    'Asistió': 'success',
    'Ausente': 'error',
    'Cancelado': 'warning',
  }
  return colors[estado] || 'default'
}

function navegarAPlanes() {
  router.push({ name: 'planes-disponibles' })
}
</script>

<template>
  <VRow>
    <!-- Título -->
    <VCol cols="12">
      <div class="d-flex justify-space-between align-center flex-wrap gap-4 mb-4">
        <div>
          <h2
            class="text-h4 mb-2"
            style="color: #DC2626;"
          >
            Mi Plan
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Información de tu plan actual y historial de clases
          </p>
        </div>
        <VBtn
          v-if="!miPlan"
          color="primary"
          prepend-icon="tabler-plus"
          @click="navegarAPlanes"
        >
          Contratar Plan
        </VBtn>
      </div>
    </VCol>

    <!-- Mi Plan Actual -->
    <VCol
      v-if="miPlan"
      cols="12"
    >
      <VCard>
        <VCardText>
          <VRow>
            <!-- Información del Plan -->
            <VCol
              cols="12"
              md="8"
            >
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
                    {{ miPlan.plan?.nombre || 'Mi Plan Actual' }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ miPlan.plan?.descripcion }}
                  </p>
                </div>
              </div>

              <!-- Estadísticas del Plan -->
              <VRow>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <div class="text-center pa-4 bg-surface rounded">
                    <VIcon
                      icon="tabler-ticket"
                      size="32"
                      color="primary"
                      class="mb-2"
                    />
                    <div class="text-h5 font-weight-bold">
                      {{ miPlan.clases_disponibles || 0 }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Clases Disponibles
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <div class="text-center pa-4 bg-surface rounded">
                    <VIcon
                      icon="tabler-check"
                      size="32"
                      color="success"
                      class="mb-2"
                    />
                    <div class="text-h5 font-weight-bold">
                      {{ (miPlan.clases_totales || 0) - (miPlan.clases_disponibles || 0) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Clases Usadas
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <div class="text-center pa-4 bg-surface rounded">
                    <VIcon
                      icon="tabler-calendar"
                      size="32"
                      color="warning"
                      class="mb-2"
                    />
                    <div class="text-h5 font-weight-bold">
                      {{ getDiasRestantes(miPlan.fecha_expiracion) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Días Restantes
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCol>

            <!-- Acciones Rápidas -->
            <VCol
              cols="12"
              md="4"
            >
              <VCard
                variant="tonal"
                color="primary"
                class="h-100"
              >
                <VCardText class="d-flex flex-column justify-center align-center h-100 text-center">
                  <VIcon
                    icon="tabler-calendar-event"
                    size="48"
                    class="mb-4"
                  />
                  <h4 class="text-h6 mb-2">
                    ¿Listo para entrenar?
                  </h4>
                  <p class="text-body-2 mb-4">
                    Gestiona tu plan y clases
                  </p>
                  <VBtn
                    color="primary"
                    variant="elevated"
                    block
                    prepend-icon="tabler-shopping-cart"
                    @click="navegarAPlanes"
                  >
                    Ver Planes
                  </VBtn>
                  <VBtn
                    variant="text"
                    block
                    class="mt-2"
                    @click="navegarAPlanes"
                  >
                    Ver Otros Planes
                  </VBtn>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Información de Vigencia y Detalles -->
            <VCol cols="12">
              <VDivider class="my-4" />
              <h4 class="text-h6 mb-4">
                Información General del Plan
              </h4>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="pa-3 rounded border">
                    <div class="d-flex align-center mb-2">
                      <VIcon
                        icon="tabler-calendar-check"
                        color="primary"
                        size="20"
                        class="me-2"
                      />
                      <span class="text-caption text-medium-emphasis">
                        Fecha de Inicio
                      </span>
                    </div>
                    <div class="text-h6 font-weight-medium">
                      {{ formatDate(miPlan.fecha_inicio) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="pa-3 rounded border">
                    <div class="d-flex align-center mb-2">
                      <VIcon
                        icon="tabler-calendar-x"
                        color="error"
                        size="20"
                        class="me-2"
                      />
                      <span class="text-caption text-medium-emphasis">
                        Fecha de Expiración
                      </span>
                    </div>
                    <div class="text-h6 font-weight-medium">
                      {{ formatDate(miPlan.fecha_expiracion) }}
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="pa-3 rounded border">
                    <div class="d-flex align-center mb-2">
                      <VIcon
                        icon="tabler-ticket"
                        color="success"
                        size="20"
                        class="me-2"
                      />
                      <span class="text-caption text-medium-emphasis">
                        Clases Totales
                      </span>
                    </div>
                    <div class="text-h6 font-weight-medium">
                      {{ miPlan.clases_totales || miPlan.plan?.clases_totales || 0 }} clases
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <div class="pa-3 rounded border">
                    <div class="d-flex align-center mb-2">
                      <VIcon
                        icon="tabler-hourglass"
                        color="warning"
                        size="20"
                        class="me-2"
                      />
                      <span class="text-caption text-medium-emphasis">
                        Clases Restantes
                      </span>
                    </div>
                    <div class="text-h6 font-weight-medium">
                      {{ miPlan.clases_disponibles || 0 }} clases
                    </div>
                  </div>
                </VCol>
              </VRow>
              
              <!-- Información adicional -->
              <VRow class="mt-4">
                <VCol
                  v-if="miPlan.plan?.precio"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="d-flex align-center">
                    <VIcon
                      icon="tabler-currency-dollar"
                      color="primary"
                      size="20"
                      class="me-2"
                    />
                    <div>
                      <div class="text-caption text-medium-emphasis">
                        Valor del Plan
                      </div>
                      <div class="font-weight-medium">
                        {{ formatPrice(miPlan.plan.precio) }}
                      </div>
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="d-flex align-center">
                    <VIcon
                      icon="tabler-clock"
                      color="primary"
                      size="20"
                      class="me-2"
                    />
                    <div>
                      <div class="text-caption text-medium-emphasis">
                        Vigencia del Plan
                      </div>
                      <div class="font-weight-medium">
                        {{ miPlan.plan?.duracion_dias || 30 }} días
                      </div>
                    </div>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="d-flex align-center">
                    <VIcon
                      icon="tabler-percentage"
                      color="success"
                      size="20"
                      class="me-2"
                    />
                    <div>
                      <div class="text-caption text-medium-emphasis">
                        Progreso de Uso
                      </div>
                      <div class="font-weight-medium">
                        {{ Math.round(((miPlan.clases_totales - miPlan.clases_disponibles) / miPlan.clases_totales) * 100) }}%
                      </div>
                    </div>
                  </div>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Sin Plan Activo -->
    <VCol
      v-if="!miPlan && !loading"
      cols="12"
    >
      <VCard>
        <VCardText class="text-center py-12">
          <VIcon
            icon="tabler-package-off"
            size="64"
            class="mb-4"
            color="grey"
          />
          <h3 class="text-h5 mb-2">
            No tienes un plan activo
          </h3>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Contrata un plan para comenzar a disfrutar de nuestras clases
          </p>
          <VBtn
            color="primary"
            size="large"
            prepend-icon="tabler-shopping-cart"
            @click="navegarAPlanes"
          >
            Ver Planes Disponibles
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Historial de Clases -->
    <VCol
      v-if="miPlan"
      cols="12"
    >
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center pa-4">
          <div class="d-flex align-center">
            <VIcon
              icon="tabler-history"
              class="me-2"
              color="primary"
            />
            <span>Historial de Clases</span>
          </div>
        </VCardTitle>

        <VCardText v-if="historialClases && historialClases.length > 0">
          <VTable>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo de Clase</th>
                <th>Instructor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="clase in historialClases"
                :key="clase.id"
              >
                <td>{{ formatDate(clase.fecha) }}</td>
                <td>{{ clase.hora }}</td>
                <td>{{ clase.tipo }}</td>
                <td>{{ clase.instructor }}</td>
                <td>
                  <VChip
                    :color="getEstadoColor(clase.estado)"
                    size="small"
                  >
                    {{ clase.estado }}
                  </VChip>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>

        <VCardText
          v-else
          class="text-center py-8"
        >
          <VIcon
            icon="tabler-clipboard-off"
            size="48"
            class="mb-4"
            color="grey"
          />
          <div class="text-body-1 text-medium-emphasis">
            No hay clases registradas aún
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
