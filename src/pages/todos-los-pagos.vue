<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePagosStore } from '@/stores/pagos'

definePage({
  meta: {
    subject: 'pagos',
    action: 'read',
    requiredRole: ['admin', 'superadmin'],
  },
})

const pagosStore = usePagosStore()

const loading = ref(false)
const search = ref('')
const selectedEstado = ref('todos')
const selectedMetodo = ref('todos')
const dialogDetalle = ref(false)
const selectedPago = ref(null)

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Usuario', key: 'usuario.name', sortable: true },
  { title: 'Plan', key: 'plan.nombre', sortable: true },
  { title: 'Monto', key: 'monto', sortable: true },
  { title: 'Método', key: 'metodo_pago', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
  { title: 'Fecha Pago', key: 'fecha_pago', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const estadosOptions = [
  { value: 'todos', title: 'Todos' },
  { value: 'pendiente', title: 'Pendiente' },
  { value: 'validado', title: 'Validado' },
  { value: 'rechazado', title: 'Rechazado' },
]

const metodosOptions = [
  { value: 'todos', title: 'Todos' },
  { value: 'transferencia', title: 'Transferencia' },
  { value: 'mercadopago', title: 'Mercado Pago' },
  { value: 'manual', title: 'Registro Manual' },
]

onMounted(async () => {
  await loadPagos()
})

async function loadPagos() {
  loading.value = true
  try {
    await pagosStore.fetchPagos()
  } catch (error) {
    console.error('Error al cargar pagos:', error)
  } finally {
    loading.value = false
  }
}

const pagosFiltrados = computed(() => {
  let pagos = [...pagosStore.pagos]
  
  // Filtrar por estado
  if (selectedEstado.value !== 'todos') {
    pagos = pagos.filter(p => p.estado === selectedEstado.value)
  }
  
  // Filtrar por método
  if (selectedMetodo.value !== 'todos') {
    pagos = pagos.filter(p => p.metodo_pago === selectedMetodo.value)
  }
  
  // Filtrar por búsqueda
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    pagos = pagos.filter(p => 
      p.usuario?.name?.toLowerCase().includes(searchLower) ||
      p.plan?.nombre?.toLowerCase().includes(searchLower) ||
      p.id?.toString().includes(searchLower)
    )
  }
  
  return pagos
})

const totalMonto = computed(() => {
  return pagosFiltrados.value
    .filter(p => p.estado === 'validado')
    .reduce((sum, p) => sum + (p.monto || 0), 0)
})

const estadisticas = computed(() => {
  const todos = pagosFiltrados.value.length
  const validados = pagosFiltrados.value.filter(p => p.estado === 'validado').length
  const pendientes = pagosFiltrados.value.filter(p => p.estado === 'pendiente').length
  const rechazados = pagosFiltrados.value.filter(p => p.estado === 'rechazado').length
  
  return { todos, validados, pendientes, rechazados }
})

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

function getEstadoColor(estado) {
  const colors = {
    pendiente: 'warning',
    validado: 'success',
    rechazado: 'error',
  }
  return colors[estado] || 'default'
}

function getMetodoColor(metodo) {
  const colors = {
    transferencia: 'info',
    mercadopago: 'success',
    manual: 'secondary',
  }
  return colors[metodo] || 'default'
}

function verDetalle(pago) {
  selectedPago.value = pago
  dialogDetalle.value = true
}

function verComprobante(pago) {
  if (pago.comprobante_url) {
    window.open(pago.comprobante_url, '_blank')
  }
}

async function descargarReporte() {
  // Implementar descarga de reporte CSV/Excel
  console.log('Descargar reporte')
}
</script>

<template>
  <VRow>
    <!-- Título y botones -->
    <VCol cols="12">
      <div class="d-flex justify-space-between align-center flex-wrap gap-4">
        <div>
          <h2
            class="text-h4 mb-2"
            style="color: #DC2626;"
          >
            Todos los Pagos
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Historial completo de pagos realizados
          </p>
        </div>
        <VBtn
          color="primary"
          prepend-icon="tabler-download"
          @click="descargarReporte"
        >
          Descargar Reporte
        </VBtn>
      </div>
    </VCol>

    <!-- Estadísticas -->
    <VCol
      cols="12"
      sm="6"
      md="3"
    >
      <VCard>
        <VCardText>
          <div class="d-flex align-center">
            <VAvatar
              color="primary"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                icon="tabler-receipt"
                size="24"
              />
            </VAvatar>
            <div>
              <p class="text-caption mb-0">
                Total Pagos
              </p>
              <h4 class="text-h5">
                {{ estadisticas.todos }}
              </h4>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      sm="6"
      md="3"
    >
      <VCard>
        <VCardText>
          <div class="d-flex align-center">
            <VAvatar
              color="success"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                icon="tabler-check"
                size="24"
              />
            </VAvatar>
            <div>
              <p class="text-caption mb-0">
                Validados
              </p>
              <h4 class="text-h5">
                {{ estadisticas.validados }}
              </h4>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      sm="6"
      md="3"
    >
      <VCard>
        <VCardText>
          <div class="d-flex align-center">
            <VAvatar
              color="warning"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                icon="tabler-clock"
                size="24"
              />
            </VAvatar>
            <div>
              <p class="text-caption mb-0">
                Pendientes
              </p>
              <h4 class="text-h5">
                {{ estadisticas.pendientes }}
              </h4>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      sm="6"
      md="3"
    >
      <VCard>
        <VCardText>
          <div class="d-flex align-center">
            <VAvatar
              color="primary"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                icon="tabler-currency-dollar"
                size="24"
              />
            </VAvatar>
            <div>
              <p class="text-caption mb-0">
                Total Validado
              </p>
              <h4 class="text-h6">
                {{ formatPrice(totalMonto) }}
              </h4>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Filtros y búsqueda -->
    <VCol cols="12">
      <VCard>
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <AppTextField
                v-model="search"
                placeholder="Buscar por usuario, plan o ID..."
                prepend-inner-icon="tabler-search"
                clearable
              />
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="4"
            >
              <VSelect
                v-model="selectedEstado"
                :items="estadosOptions"
                item-title="title"
                item-value="value"
                label="Estado"
                prepend-inner-icon="tabler-filter"
              />
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="4"
            >
              <VSelect
                v-model="selectedMetodo"
                :items="metodosOptions"
                item-title="title"
                item-value="value"
                label="Método de Pago"
                prepend-inner-icon="tabler-credit-card"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Tabla de pagos -->
    <VCol cols="12">
      <VCard>
        <VDataTable
          :headers="headers"
          :items="pagosFiltrados"
          :loading="loading"
          :search="search"
          class="text-no-wrap"
        >
          <!-- Usuario -->
          <template #item.usuario.name="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                size="32"
                color="primary"
                variant="tonal"
                class="me-2"
              >
                {{ item.usuario?.name?.charAt(0) || 'U' }}
              </VAvatar>
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ item.usuario?.name || 'Usuario' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.usuario?.email }}
                </div>
              </div>
            </div>
          </template>

          <!-- Plan -->
          <template #item.plan.nombre="{ item }">
            <div>
              <div class="text-body-2 font-weight-medium">
                {{ item.plan?.nombre || 'Plan' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.plan?.clases_totales }} clases
              </div>
            </div>
          </template>

          <!-- Monto -->
          <template #item.monto="{ item }">
            <span class="font-weight-bold">{{ formatPrice(item.monto) }}</span>
          </template>

          <!-- Método -->
          <template #item.metodo_pago="{ item }">
            <VChip
              :color="getMetodoColor(item.metodo_pago)"
              size="small"
            >
              {{ item.metodo_pago }}
            </VChip>
          </template>

          <!-- Estado -->
          <template #item.estado="{ item }">
            <VChip
              :color="getEstadoColor(item.estado)"
              size="small"
            >
              {{ item.estado }}
            </VChip>
          </template>

          <!-- Fecha -->
          <template #item.fecha_pago="{ item }">
            {{ formatDate(item.fecha_pago) }}
          </template>

          <!-- Acciones -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <VBtn
                icon
                size="small"
                variant="text"
                @click="verDetalle(item)"
              >
                <VIcon
                  icon="tabler-eye"
                  size="20"
                />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  Ver Detalle
                </VTooltip>
              </VBtn>
              <VBtn
                v-if="item.comprobante_url"
                icon
                size="small"
                variant="text"
                @click="verComprobante(item)"
              >
                <VIcon
                  icon="tabler-file"
                  size="20"
                />
                <VTooltip
                  activator="parent"
                  location="top"
                >
                  Ver Comprobante
                </VTooltip>
              </VBtn>
            </div>
          </template>
        </VDataTable>
      </VCard>
    </VCol>
  </VRow>

  <!-- Dialog Detalle -->
  <VDialog
    v-model="dialogDetalle"
    max-width="600"
  >
    <VCard v-if="selectedPago">
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>Detalle del Pago #{{ selectedPago.id }}</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="dialogDetalle = false"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Estado
              </div>
              <VChip
                :color="getEstadoColor(selectedPago.estado)"
                size="small"
              >
                {{ selectedPago.estado }}
              </VChip>
            </div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Usuario
              </div>
              <div class="font-weight-medium">
                {{ selectedPago.usuario?.name }}
              </div>
              <div class="text-caption">
                {{ selectedPago.usuario?.email }}
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Plan
              </div>
              <div class="font-weight-medium">
                {{ selectedPago.plan?.nombre }}
              </div>
              <div class="text-caption">
                {{ selectedPago.plan?.clases_totales }} clases - {{ selectedPago.plan?.duracion_dias }} días
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Monto
              </div>
              <div class="text-h6 font-weight-bold">
                {{ formatPrice(selectedPago.monto) }}
              </div>
            </div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Método de Pago
              </div>
              <VChip
                :color="getMetodoColor(selectedPago.metodo_pago)"
                size="small"
              >
                {{ selectedPago.metodo_pago }}
              </VChip>
            </div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Fecha de Pago
              </div>
              <div class="font-weight-medium">
                {{ formatDate(selectedPago.fecha_pago) }}
              </div>
            </div>
          </VCol>

          <VCol
            v-if="selectedPago.fecha_validacion"
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Fecha de Validación
              </div>
              <div class="font-weight-medium">
                {{ formatDate(selectedPago.fecha_validacion) }}
              </div>
            </div>
          </VCol>

          <VCol
            v-if="selectedPago.validado_por"
            cols="12"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Validado por
              </div>
              <div class="font-weight-medium">
                {{ selectedPago.validado_por?.name }}
              </div>
            </div>
          </VCol>

          <VCol
            v-if="selectedPago.fecha_inicio_plan || selectedPago.fecha_fin_plan"
            cols="12"
          >
            <VDivider class="my-2" />
            <div class="text-caption text-medium-emphasis mb-2">
              Vigencia del Plan
            </div>
          </VCol>

          <VCol
            v-if="selectedPago.fecha_inicio_plan"
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Fecha Inicio
              </div>
              <div class="font-weight-medium">
                {{ formatDate(selectedPago.fecha_inicio_plan) }}
              </div>
            </div>
          </VCol>

          <VCol
            v-if="selectedPago.fecha_fin_plan"
            cols="12"
            md="6"
          >
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Fecha Fin
              </div>
              <div class="font-weight-medium">
                {{ formatDate(selectedPago.fecha_fin_plan) }}
              </div>
            </div>
          </VCol>

          <VCol
            v-if="selectedPago.notas"
            cols="12"
          >
            <VDivider class="my-2" />
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">
                Notas
              </div>
              <div class="text-body-2">
                {{ selectedPago.notas }}
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          v-if="selectedPago.comprobante_url"
          variant="outlined"
          @click="verComprobante(selectedPago)"
        >
          Ver Comprobante
        </VBtn>
        <VBtn
          color="primary"
          @click="dialogDetalle = false"
        >
          Cerrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.text-caption {
  font-size: 0.75rem;
}
</style>
