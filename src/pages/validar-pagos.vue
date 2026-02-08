<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePagosStore } from '@/stores/pagos'
import { usePlanesStore } from '@/stores/planes'
import { useUsersStore } from '@/stores/users'

const pagosStore = usePagosStore()
const planesStore = usePlanesStore()
const usersStore = useUsersStore()

const loading = ref(false)
const dialogValidar = ref(false)
const dialogRechazar = ref(false)
const dialogPagoManual = ref(false)
const selectedPago = ref(null)
const motivoRechazo = ref('')
const search = ref('')
const tab = ref('pendientes')
const fechaInicioEditable = ref('')
const fechaFinEditable = ref('')

// Datos para pago manual
const pagoManual = ref({
  usuario_id: null,
  plan_id: null,
  monto: 0,
  fecha_pago: new Date().toISOString().split('T')[0],
  fecha_inicio_plan: new Date().toISOString().split('T')[0],
  fecha_fin_plan: '',
})
const comprobanteManual = ref(null)
const comprobantePreviewManual = ref(null)

const headers = [
  { title: 'Usuario', key: 'usuario.name', sortable: true },
  { title: 'Plan', key: 'plan', sortable: false },
  { title: 'Monto', key: 'monto', sortable: true },
  { title: 'Fecha Pago', key: 'fecha_pago', sortable: true },
  { title: 'Comprobante', key: 'comprobante', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const headersValidados = [
  { title: 'Usuario', key: 'usuario.name', sortable: true },
  { title: 'Plan', key: 'plan', sortable: false },
  { title: 'Monto', key: 'monto', sortable: true },
  { title: 'Método', key: 'metodo_pago' },
  { title: 'Fecha Pago', key: 'fecha_pago', sortable: true },
  { title: 'Validado por', key: 'validado_por.name' },
  { title: 'Fecha Validación', key: 'fecha_validacion', sortable: true },
]

onMounted(async () => {
  await loadPagos()
  await planesStore.fetchPlanes()
  await usersStore.fetchUsers()
})

async function loadPagos() {
  loading.value = true
  try {
    if (tab.value === 'pendientes') {
      await pagosStore.fetchPagosPendientes()
    } else {
      await pagosStore.fetchPagos()
    }
  } catch (error) {
    console.error('Error al cargar pagos:', error)
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

function openValidarDialog(pago) {
  selectedPago.value = pago
  fechaInicioEditable.value = pago.fecha_inicio_plan || new Date().toISOString().split('T')[0]
  fechaFinEditable.value = pago.fecha_fin_plan || new Date(Date.now() + (pago.plan?.duracion_dias || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  dialogValidar.value = true
}

function openRechazarDialog(pago) {
  selectedPago.value = pago
  motivoRechazo.value = ''
  dialogRechazar.value = true
}

async function validarPago() {
  loading.value = true
  try {
    await pagosStore.validarPago(selectedPago.value.id, {
      estado: 'validado',
      fecha_inicio_plan: fechaInicioEditable.value,
      fecha_fin_plan: fechaFinEditable.value,
    })
    dialogValidar.value = false
    await loadPagos()
  } catch (error) {
    console.error('Error al validar pago:', error)
    alert('Error al validar el pago')
  } finally {
    loading.value = false
  }
}

async function rechazarPago() {
  if (!motivoRechazo.value.trim()) {
    alert('Por favor, indica el motivo del rechazo')
    return
  }
  
  loading.value = true
  try {
    await pagosStore.rechazarPago(selectedPago.value.id, motivoRechazo.value)
    dialogRechazar.value = false
    await loadPagos()
  } catch (error) {
    console.error('Error al rechazar pago:', error)
    alert('Error al rechazar el pago')
  } finally {
    loading.value = false
  }
}

function verComprobante(pago) {
  if (pago.comprobante) {
    // Abrir en nueva ventana con la imagen base64
    const newWindow = window.open()
    newWindow.document.write(`
      <html>
        <head>
          <title>Comprobante - ${pago.comprobante_nombre || 'comprobante'}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
            img { max-width: 100%; height: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <img src="${pago.comprobante}" alt="Comprobante" />
        </body>
      </html>
    `)
  }
}

function openPagoManualDialog() {
  pagoManual.value = {
    usuario_id: null,
    plan_id: null,
    monto: 0,
    fecha_pago: new Date().toISOString().split('T')[0],
    fecha_inicio_plan: new Date().toISOString().split('T')[0],
    fecha_fin_plan: '',
  }
  comprobanteManual.value = null
  comprobantePreviewManual.value = null
  dialogPagoManual.value = true
}

function onPlanSelected() {
  const plan = planesStore.planes.find(p => p.id === pagoManual.value.plan_id)
  if (plan) {
    pagoManual.value.monto = plan.precio
    calcularFechaFinManual()
  }
}

function calcularFechaFinManual() {
  if (!pagoManual.value.fecha_inicio_plan || !pagoManual.value.plan_id) return
  
  const plan = planesStore.planes.find(p => p.id === pagoManual.value.plan_id)
  if (!plan) return
  
  const inicio = new Date(pagoManual.value.fecha_inicio_plan)
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + plan.duracion_dias)
  pagoManual.value.fecha_fin_plan = fin.toISOString().split('T')[0]
}

function handleComprobanteManual(event) {
  const file = event.target.files[0]
  if (file) {
    comprobanteManual.value = file
    const reader = new FileReader()
    reader.onload = e => {
      comprobantePreviewManual.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function registrarPagoManual() {
  if (!pagoManual.value.usuario_id || !pagoManual.value.plan_id) {
    alert('Por favor, selecciona un usuario y un plan')
    return
  }
  
  loading.value = true
  try {
    const usuario = usersStore.users.find(u => u.id === pagoManual.value.usuario_id)
    const plan = planesStore.planes.find(p => p.id === pagoManual.value.plan_id)
    
    const payload = {
      plan_id: plan.id,
      plan: plan,
      metodo_pago: 'transferencia',
      monto: pagoManual.value.monto,
      fecha_pago: pagoManual.value.fecha_pago,
      fecha_inicio_plan: pagoManual.value.fecha_inicio_plan,
      fecha_fin_plan: pagoManual.value.fecha_fin_plan,
      usuario: usuario,
      manual: true,
    }

    const response = await pagosStore.createPagoTransferencia(payload)
    
    // Si hay comprobante, subirlo
    if (comprobanteManual.value && response.data.id) {
      await pagosStore.uploadComprobante(response.data.id, comprobanteManual.value)
    }
    
    // Validar automáticamente
    await pagosStore.validarPago(response.data.id, {
      estado: 'validado',
      fecha_inicio_plan: pagoManual.value.fecha_inicio_plan,
      fecha_fin_plan: pagoManual.value.fecha_fin_plan,
    })
    
    dialogPagoManual.value = false
    alert('Pago registrado y plan activado exitosamente')
    await loadPagos()
  } catch (error) {
    console.error('Error al registrar pago manual:', error)
    alert('Error al registrar el pago')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="pa-4 d-flex justify-space-between align-center">
          <span style="color: #DC2626; font-weight: 600;">Validar Pagos</span>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="openPagoManualDialog"
          >
            Registrar Pago Manual
          </VBtn>
        </VCardTitle>

        <VTabs
          v-model="tab"
          class="px-4"
          @update:model-value="loadPagos"
        >
          <VTab value="pendientes">
            Pendientes
            <VBadge
              v-if="pagosStore.pagosPendientes.length > 0"
              :content="pagosStore.pagosPendientes.length"
              color="error"
              inline
              class="ms-2"
            />
          </VTab>
          <VTab value="validados">
            Historial
          </VTab>
        </VTabs>

        <VCardText>
          <VTextField
            v-model="search"
            prepend-inner-icon="tabler-search"
            label="Buscar"
            single-line
            hide-details
            class="mb-4"
          />

          <!-- Tabla Pendientes -->
          <VDataTable
            v-if="tab === 'pendientes'"
            :headers="headers"
            :items="pagosStore.pagosPendientes"
            :search="search"
            :loading="loading"
            class="elevation-1"
          >
            <template #item.usuario.name="{ item }">
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  color="primary"
                  class="me-2"
                >
                  <span class="text-caption">{{ item.usuario?.name?.charAt(0) }}</span>
                </VAvatar>
                <div>
                  <div class="font-weight-medium">
                    {{ item.usuario?.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.usuario?.email }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.plan="{ item }">
              <div>
                <div class="font-weight-medium">
                  {{ item.plan?.nombre || '-' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.plan?.clases_totales >= 999 ? 'Ilimitadas' : item.plan?.clases_totales }} clases
                </div>
              </div>
            </template>

            <template #item.monto="{ item }">
              <span class="font-weight-medium">{{ formatPrice(item.monto) }}</span>
            </template>

            <template #item.fecha_pago="{ item }">
              {{ formatDate(item.fecha_pago) }}
            </template>

            <template #item.comprobante="{ item }">
              <VBtn
                v-if="item.comprobante"
                icon="tabler-file-text"
                size="small"
                variant="text"
                color="primary"
                @click="verComprobante(item)"
              />
              <span
                v-else
                class="text-caption text-medium-emphasis"
              >
                Sin comprobante
              </span>
            </template>

            <template #item.actions="{ item }">
              <VBtn
                icon="tabler-check"
                size="small"
                variant="text"
                color="success"
                @click="openValidarDialog(item)"
              />
              <VBtn
                icon="tabler-x"
                size="small"
                variant="text"
                color="error"
                @click="openRechazarDialog(item)"
              />
            </template>

            <template #no-data>
              <div class="text-center py-8">
                <VIcon
                  icon="tabler-inbox"
                  size="64"
                  color="grey"
                  class="mb-4"
                />
                <h3 class="text-h6 mb-2">
                  No hay pagos pendientes
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  Todos los pagos han sido procesados
                </p>
              </div>
            </template>
          </VDataTable>

          <!-- Tabla Validados -->
          <VDataTable
            v-else
            :headers="headersValidados"
            :items="pagosStore.pagos"
            :search="search"
            :loading="loading"
            class="elevation-1"
          >
            <template #item.usuario.name="{ item }">
              {{ item.usuario?.name }}
            </template>

            <template #item.plan="{ item }">
              {{ item.plan?.nombre || '-' }}
            </template>

            <template #item.monto="{ item }">
              <span class="font-weight-medium">{{ formatPrice(item.monto) }}</span>
            </template>

            <template #item.metodo_pago="{ item }">
              <VChip
                size="small"
                :color="item.metodo_pago === 'mercadopago' ? 'primary' : 'secondary'"
              >
                {{ item.metodo_pago === 'mercadopago' ? 'Mercado Pago' : 'Transferencia' }}
              </VChip>
            </template>

            <template #item.fecha_pago="{ item }">
              {{ formatDate(item.fecha_pago) }}
            </template>

            <template #item.validado_por.name="{ item }">
              {{ item.validado_por?.name || '-' }}
            </template>

            <template #item.fecha_validacion="{ item }">
              {{ formatDate(item.fecha_validacion) }}
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Dialog Validar -->
    <VDialog
      v-model="dialogValidar"
      max-width="800px"
    >
      <VCard>
        <VCardTitle class="pa-4">
          <span class="text-h5">Validar Pago</span>
        </VCardTitle>
        <VCardText class="pa-4">
          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Estás a punto de validar el pago y activar el plan para el usuario.
          </VAlert>
          <div v-if="selectedPago">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <h4 class="text-subtitle-1 mb-3">
                  Información del Pago
                </h4>
                <div class="mb-2">
                  <strong>Usuario:</strong> {{ selectedPago.usuario?.name }}
                </div>
                <div class="mb-2">
                  <strong>Email:</strong> {{ selectedPago.usuario?.email }}
                </div>
                <div class="mb-2">
                  <strong>Plan:</strong> {{ selectedPago.plan?.nombre }}
                </div>
                <div class="mb-2">
                  <strong>Clases:</strong> {{ selectedPago.plan?.clases_totales >= 999 ? 'Ilimitadas' : selectedPago.plan?.clases_totales }}
                </div>
                <div class="mb-2">
                  <strong>Monto:</strong> {{ formatPrice(selectedPago.monto) }}
                </div>
                <div class="mb-2">
                  <strong>Fecha de Pago:</strong> {{ formatDate(selectedPago.fecha_pago) }}
                </div>
                
                <VDivider class="my-3" />
                
                <h4 class="text-subtitle-1 mb-3">
                  Fechas del Plan
                  <VChip
                    size="small"
                    color="warning"
                    class="ms-2"
                  >
                    Editable
                  </VChip>
                </h4>
                <VAlert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-3"
                >
                  Puedes ajustar las fechas del plan antes de validar
                </VAlert>
                <VTextField
                  v-model="fechaInicioEditable"
                  label="Fecha de Inicio*"
                  type="date"
                  density="compact"
                  variant="outlined"
                  class="mb-3"
                />
                <VTextField
                  v-model="fechaFinEditable"
                  label="Fecha de Fin*"
                  type="date"
                  density="compact"
                  variant="outlined"
                  class="mb-3"
                />
                <div class="mb-2">
                  <strong>Duración:</strong> {{ selectedPago.plan?.duracion_dias }} días
                </div>
              </VCol>
              
              <VCol
                cols="12"
                md="6"
              >
                <h4 class="text-subtitle-1 mb-3">
                  Comprobante de Pago
                </h4>
                <VCard
                  v-if="selectedPago.comprobante"
                  variant="outlined"
                >
                  <VImg
                    :src="selectedPago.comprobante"
                    max-height="400"
                    contain
                    class="cursor-pointer"
                    @click="verComprobante(selectedPago)"
                  />
                  <VCardText class="text-center">
                    <small class="text-medium-emphasis">
                      {{ selectedPago.comprobante_nombre }}
                    </small>
                    <br>
                    <VBtn
                      size="small"
                      variant="text"
                      prepend-icon="tabler-eye"
                      @click="verComprobante(selectedPago)"
                    >
                      Ver en tamaño completo
                    </VBtn>
                  </VCardText>
                </VCard>
                <VAlert
                  v-else
                  type="warning"
                  variant="tonal"
                >
                  No hay comprobante adjunto
                </VAlert>
              </VCol>
            </VRow>
          </div>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="dialogValidar = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="success"
            variant="elevated"
            :loading="loading"
            @click="validarPago"
          >
            Validar Pago
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog Rechazar -->
    <VDialog
      v-model="dialogRechazar"
      max-width="500px"
    >
      <VCard>
        <VCardTitle class="pa-4">
          <span class="text-h5">Rechazar Pago</span>
        </VCardTitle>
        <VCardText class="pa-4">
          <VAlert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            El usuario será notificado del rechazo del pago.
          </VAlert>
          <div
            v-if="selectedPago"
            class="mb-4"
          >
            <div class="mb-2">
              <strong>Usuario:</strong> {{ selectedPago.usuario?.name }}
            </div>
            <div class="mb-2">
              <strong>Monto:</strong> {{ formatPrice(selectedPago.monto) }}
            </div>
          </div>
          <VTextarea
            v-model="motivoRechazo"
            label="Motivo del rechazo*"
            rows="3"
            required
            hint="Este mensaje será enviado al usuario"
            persistent-hint
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="dialogRechazar = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            :loading="loading"
            @click="rechazarPago"
          >
            Rechazar Pago
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog Pago Manual -->
    <VDialog
      v-model="dialogPagoManual"
      max-width="700px"
    >
      <VCard>
        <VCardTitle class="pa-4">
          <span class="text-h5">Registrar Pago Manual</span>
        </VCardTitle>
        <VCardText class="pa-4">
          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Registra manualmente un pago cuando el usuario envía el comprobante por Instagram u otro canal.
            El plan se activará automáticamente.
          </VAlert>
          
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VAutocomplete
                v-model="pagoManual.usuario_id"
                :items="usersStore.users"
                item-title="name"
                item-value="id"
                label="Seleccionar Usuario*"
                prepend-inner-icon="tabler-user"
                required
              >
                <template #item="{ props, item }">
                  <VListItem
                    v-bind="props"
                    :subtitle="item.raw.email"
                  />
                </template>
              </VAutocomplete>
            </VCol>
            
            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="pagoManual.plan_id"
                :items="planesStore.planesActivos"
                item-title="nombre"
                item-value="id"
                label="Seleccionar Plan*"
                prepend-inner-icon="tabler-package"
                required
                @update:model-value="onPlanSelected"
              >
                <template #item="{ props, item }">
                  <VListItem
                    v-bind="props"
                    :subtitle="`${formatPrice(item.raw.precio)} - ${item.raw.clases_totales >= 999 ? 'Ilimitadas' : item.raw.clases_totales} clases`"
                  />
                </template>
              </VSelect>
            </VCol>
            
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="pagoManual.monto"
                label="Monto*"
                type="number"
                prefix="$"
                readonly
              />
            </VCol>
            
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="pagoManual.fecha_pago"
                label="Fecha de Pago*"
                type="date"
                required
              />
            </VCol>
            
            <VCol
              cols="12"
              md="4"
            />
            
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="pagoManual.fecha_inicio_plan"
                label="Fecha de Inicio del Plan*"
                type="date"
                required
                @update:model-value="calcularFechaFinManual"
              />
            </VCol>
            
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="pagoManual.fecha_fin_plan"
                label="Fecha de Fin del Plan*"
                type="date"
                required
              />
            </VCol>
            
            <VCol cols="12">
              <VFileInput
                label="Comprobante (Opcional)"
                accept=".pdf,.jpg,.jpeg,.png"
                prepend-icon="tabler-paperclip"
                hint="Sube el comprobante si lo tienes"
                persistent-hint
                @change="handleComprobanteManual"
              />
            </VCol>
            
            <VCol
              v-if="comprobantePreviewManual"
              cols="12"
            >
              <VCard variant="outlined">
                <VCardText>
                  <h4 class="text-subtitle-2 mb-2">
                    Vista previa
                  </h4>
                  <VImg
                    :src="comprobantePreviewManual"
                    max-height="200"
                    contain
                  />
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="dialogPagoManual = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="success"
            variant="elevated"
            :loading="loading"
            @click="registrarPagoManual"
          >
            Registrar y Activar Plan
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VRow>
</template>
