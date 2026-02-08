<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePagosStore } from '@/stores/pagos'
import { usePlanesStore } from '@/stores/planes'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const pagosStore = usePagosStore()
const planesStore = usePlanesStore()
const authStore = useAuthStore()

const loading = ref(false)
const plan = ref(null)
const metodoPago = ref('transferencia')
const showComprobante = ref(false)
const comprobanteFile = ref(null)
const comprobantePreview = ref(null)
const planActivo = ref(null)
const fechaInicio = ref('')
const fechaFin = ref('')
const errorFechas = ref('')

const pagoData = ref({
  numero_operacion: '',
  fecha_pago: new Date().toISOString().split('T')[0],
  monto: 0,
  banco: '',
  notas: '',
})

const bancos = [
  'Banco de Chile',
  'Banco Estado',
  'Banco Santander',
  'Banco BCI',
  'Banco Scotiabank',
  'Banco Itaú',
  'Banco Security',
  'Banco Falabella',
  'Banco Ripley',
  'Otro',
]

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const planId = route.params.planId
    
    // Primero intentar desde localStorage si está disponible
    const planGuardado = localStorage.getItem('plan_seleccionado_ikigai')
    if (planGuardado) {
      plan.value = JSON.parse(planGuardado)
    } else {
      // Si no, buscar en el store
      await planesStore.fetchPlanes()
      plan.value = planesStore.getPlanById(parseInt(planId))
    }
    
    if (plan.value) {
      pagoData.value.monto = plan.value.precio
    }
    
    // Cargar plan activo del usuario
    const planActivoStr = localStorage.getItem('user_plan_ikigai')
    if (planActivoStr) {
      planActivo.value = JSON.parse(planActivoStr)
    }
    
    // Establecer fecha de inicio por defecto
    if (planActivo.value && planActivo.value.fecha_expiracion) {
      // Si hay plan activo, establecer fecha de inicio al día siguiente de la expiración
      const fechaExpiracion = new Date(planActivo.value.fecha_expiracion)
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 1)
      fechaInicio.value = fechaExpiracion.toISOString().split('T')[0]
    } else {
      // Si no hay plan activo, puede iniciar desde hoy
      fechaInicio.value = new Date().toISOString().split('T')[0]
    }
    
    // Calcular fecha fin basado en la duración del plan
    if (plan.value && fechaInicio.value) {
      calcularFechaFin()
    }
    
    // Cargar datos bancarios (simulados localmente)
    const datosBancariosLocal = localStorage.getItem('datos_bancarios_ikigai')
    if (datosBancariosLocal) {
      pagosStore.datosBancarios = JSON.parse(datosBancariosLocal)
    } else {
      // Datos por defecto
      pagosStore.datosBancarios = {
        nombre_titular: 'Ikigai valdivia spa',
        rut_titular: '77.458.779-9',
        tipo_cuenta: 'Cuenta corriente',
        banco: 'Banco Itaú',
        numero_cuenta: '223331041',
        email: 'boxikigaivaldivia@gmail.com',
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
}

const datosBancarios = computed(() => pagosStore.datosBancarios || {
  nombre_titular: 'Ikigai valdivia spa',
  rut_titular: '77.458.779-9',
  tipo_cuenta: 'Cuenta corriente',
  banco: 'Banco Itaú',
  numero_cuenta: '223331041',
  email: 'boxikigaivaldivia@gmail.com',
})

const minFechaInicio = computed(() => {
  if (planActivo.value && planActivo.value.fecha_expiracion) {
    // Si hay plan activo, puede iniciar al día siguiente de la expiración
    const fechaExpiracion = new Date(planActivo.value.fecha_expiracion)
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 1)
    return fechaExpiracion.toISOString().split('T')[0]
  }
  // Si no hay plan activo, puede iniciar desde hoy
  return new Date().toISOString().split('T')[0]
})

const maxFechaInicio = computed(() => {
  // Máximo 30 días de anticipación
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  return maxDate.toISOString().split('T')[0]
})

function calcularFechaFin() {
  if (!fechaInicio.value || !plan.value) return
  
  const inicio = new Date(fechaInicio.value)
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + (plan.value.duracion_dias || 30))
  fechaFin.value = fin.toISOString().split('T')[0]
}

function validarFechas() {
  errorFechas.value = ''
  
  if (!fechaInicio.value) {
    errorFechas.value = 'Debes seleccionar una fecha de inicio'
    return false
  }
  
  const inicio = new Date(fechaInicio.value)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  // No puede ser en el pasado
  if (inicio < hoy) {
    errorFechas.value = 'La fecha de inicio no puede ser en el pasado'
    return false
  }
  
  // No más de 30 días de anticipación
  const maxAnticipacion = new Date()
  maxAnticipacion.setDate(maxAnticipacion.getDate() + 30)
  if (inicio > maxAnticipacion) {
    errorFechas.value = 'No puedes comprar un plan con más de 30 días de anticipación'
    return false
  }
  
  // Si hay plan activo, verificar que no se solape
  if (planActivo.value && planActivo.value.fecha_expiracion) {
    const expiracion = new Date(planActivo.value.fecha_expiracion)
    expiracion.setHours(0, 0, 0, 0)
    
    if (inicio <= expiracion) {
      errorFechas.value = 'Ya tienes un plan activo. El nuevo plan debe iniciar al día siguiente de la expiración de tu plan actual'
      return false
    }
  }
  
  return true
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price)
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    comprobanteFile.value = file
    const reader = new FileReader()
    reader.onload = e => {
      comprobantePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function procesarPago() {
  if (metodoPago.value === 'transferencia') {
    await procesarTransferencia()
  } else {
    await procesarMercadoPago()
  }
}

async function procesarTransferencia() {
  if (!comprobanteFile.value) {
    alert('Por favor, sube el comprobante de transferencia')
    return
  }
  
  if (!validarFechas()) {
    alert(errorFechas.value)
    return
  }

  loading.value = true
  try {
    const payload = {
      plan_id: plan.value.id,
      plan: plan.value,
      metodo_pago: 'transferencia',
      monto: plan.value.precio,
      fecha_pago: new Date().toISOString().split('T')[0],
      fecha_inicio_plan: fechaInicio.value,
      fecha_fin_plan: fechaFin.value,
    }

    const response = await pagosStore.createPagoTransferencia(payload)
    
    // Si hay comprobante, subirlo
    if (comprobanteFile.value && response.data.id) {
      await pagosStore.uploadComprobante(response.data.id, comprobanteFile.value)
    }

    // Mostrar mensaje de éxito
    showSuccessDialog()
  } catch (error) {
    console.error('Error al procesar pago:', error)
    alert('Error al procesar el pago. Por favor, intenta nuevamente.')
  } finally {
    loading.value = false
  }
}

async function procesarMercadoPago() {
  loading.value = true
  try {
    const payload = {
      plan_id: plan.value.id,
      metodo_pago: 'mercadopago',
    }

    const response = await pagosStore.createPagoMercadoPago(payload)
    
    // Redirigir a Mercado Pago
    if (response.data.init_point) {
      window.location.href = response.data.init_point
    }
  } catch (error) {
    console.error('Error al procesar pago:', error)
    alert('Error al procesar el pago. Por favor, intenta nuevamente.')
  } finally {
    loading.value = false
  }
}

function showSuccessDialog() {
  alert('¡Pago registrado exitosamente!\n\nTu pago está en proceso de validación.\nTe notificaremos cuando sea aprobado y tu plan se activará automáticamente.')
  router.push({ name: 'index' })
}

function copiarTexto(texto) {
  navigator.clipboard.writeText(texto)
  // Aquí podrías mostrar un toast/snackbar
}

function copiarTodosDatos() {
  const datosCompletos = `${datosBancarios.value.nombre_titular}
${datosBancarios.value.rut_titular}
${datosBancarios.value.tipo_cuenta}
${datosBancarios.value.banco}
${datosBancarios.value.numero_cuenta}
${datosBancarios.value.email}`
  
  navigator.clipboard.writeText(datosCompletos)
  // Aquí podrías mostrar un toast/snackbar confirmando que se copió
  alert('Datos bancarios copiados al portapapeles')
}
</script>

<template>
  <VRow v-if="plan">
    <VCol cols="12">
      <VBtn
        variant="text"
        prepend-icon="tabler-arrow-left"
        @click="router.back()"
      >
        Volver
      </VBtn>
    </VCol>

    <VCol cols="12">
      <h2
        class="text-h4 mb-2"
        style="color: #DC2626;"
      >
        Proceso de Pago
      </h2>
    </VCol>

    <!-- Resumen del Plan -->
    <VCol
      cols="12"
      md="4"
    >
      <VCard>
        <VCardTitle class="pa-4">
          Resumen del Plan
        </VCardTitle>
        <VCardText>
          <div class="mb-4">
            <h3 class="text-h5 mb-2">
              {{ plan.nombre }}
            </h3>
            <p class="text-body-2 text-medium-emphasis">
              {{ plan.descripcion }}
            </p>
          </div>

          <VDivider class="my-4" />

          <div class="d-flex justify-space-between mb-2">
            <span>Clases incluidas:</span>
            <span class="font-weight-bold">{{ plan.clases_totales >= 999 ? 'Ilimitadas' : plan.clases_totales }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span>Vigencia:</span>
            <span class="font-weight-bold">{{ plan.duracion_dias }} días</span>
          </div>

          <VDivider class="my-4" />

          <div class="d-flex justify-space-between align-center">
            <span class="text-h6">Total:</span>
            <span
              class="text-h5"
              style="color: #DC2626; font-weight: 700;"
            >
              {{ formatPrice(plan.precio) }}
            </span>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Formulario de Pago -->
    <VCol
      cols="12"
      md="8"
    >
      <VCard>
        <VCardTitle class="pa-4">
          Método de Pago
        </VCardTitle>
        <VCardText>
          <!-- Selector de Método -->
          <VRadioGroup
            v-model="metodoPago"
            inline
          >
            <VRadio
              label="Transferencia Bancaria"
              value="transferencia"
            />
            <VRadio
              label="Mercado Pago (Tarjetas)"
              value="mercadopago"
            />
          </VRadioGroup>

          <VDivider class="my-4" />

          <!-- Formulario Transferencia -->
          <div v-if="metodoPago === 'transferencia'">
            <VAlert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <strong>Importante:</strong> Realiza la transferencia con los datos bancarios proporcionados y luego completa este formulario.
            </VAlert>

            <!-- Datos Bancarios -->
            <VCard
              variant="tonal"
              class="mb-4"
            >
              <VCardText>
                <div class="d-flex justify-space-between align-center mb-3">
                  <h4 class="text-h6">
                    Datos Bancarios
                  </h4>
                  <VBtn
                    size="small"
                    color="primary"
                    prepend-icon="tabler-copy"
                    @click="copiarTodosDatos"
                  >
                    Copiar Todo
                  </VBtn>
                </div>
                
                <div class="datos-bancarios-box pa-4 rounded" style="background-color: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.2);">
                  <div class="text-center">
                    <div class="mb-1">
                      <strong style="font-size: 1.1rem;">{{ datosBancarios.nombre_titular }}</strong>
                    </div>
                    <div class="mb-1">
                      <strong>{{ datosBancarios.rut_titular }}</strong>
                    </div>
                    <div class="mb-1">
                      {{ datosBancarios.tipo_cuenta }}
                    </div>
                    <div class="mb-1">
                      <strong>{{ datosBancarios.banco }}</strong>
                    </div>
                    <div class="mb-1">
                      <strong style="font-size: 1.1rem;">{{ datosBancarios.numero_cuenta }}</strong>
                    </div>
                    <div>
                      {{ datosBancarios.email }}
                    </div>
                  </div>
                </div>

                <div class="text-caption text-medium-emphasis text-center mt-2">
                  Haz clic en "Copiar Todo" para copiar todos los datos bancarios
                </div>
              </VCardText>
            </VCard>

            <!-- Fechas del Plan -->
            <VCard
              variant="outlined"
              class="mb-4"
            >
              <VCardText>
                <h4 class="text-h6 mb-3">
                  Fechas del Plan
                </h4>
                
                <VAlert
                  v-if="planActivo"
                  type="warning"
                  variant="tonal"
                  class="mb-4"
                >
                  <strong>Tienes un plan activo</strong><br>
                  Tu plan actual vence el {{ new Date(planActivo.fecha_expiracion).toLocaleDateString('es-CL') }}.<br>
                  El nuevo plan debe iniciar al día siguiente.
                </VAlert>
                
                <VRow>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="fechaInicio"
                      label="Fecha de Inicio*"
                      type="date"
                      :min="minFechaInicio"
                      :max="maxFechaInicio"
                      required
                      hint="Fecha en que iniciará tu plan"
                      persistent-hint
                      @update:model-value="calcularFechaFin"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    md="6"
                  >
                    <VTextField
                      v-model="fechaFin"
                      label="Fecha de Finalización"
                      type="date"
                      readonly
                      hint="Se calcula automáticamente"
                      persistent-hint
                    />
                  </VCol>
                </VRow>
                
                <VAlert
                  v-if="errorFechas"
                  type="error"
                  variant="tonal"
                  class="mt-3"
                >
                  {{ errorFechas }}
                </VAlert>
              </VCardText>
            </VCard>

            <!-- Formulario de Comprobante -->
            <VForm>
              <VRow>
                <VCol cols="12">
                  <VFileInput
                    label="Comprobante de Transferencia*"
                    accept=".pdf,.jpg,.jpeg,.png"
                    prepend-icon="tabler-paperclip"
                    hint="Sube una foto (JPG, JPEG, PNG) o PDF del comprobante de transferencia"
                    persistent-hint
                    required
                    @change="handleFileChange"
                  />
                </VCol>
                <VCol
                  v-if="comprobantePreview"
                  cols="12"
                >
                  <VCard variant="outlined">
                    <VCardText>
                      <h4 class="text-subtitle-2 mb-2">
                        Vista previa
                      </h4>
                      <VImg
                        :src="comprobantePreview"
                        max-height="300"
                        contain
                      />
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VForm>
          </div>

          <!-- Mercado Pago -->
          <div v-else>
            <VAlert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              Serás redirigido a Mercado Pago para completar el pago de forma segura con tu tarjeta de crédito o débito.
            </VAlert>
            <div class="text-center py-8">
              <VIcon
                icon="tabler-credit-card"
                size="64"
                color="primary"
                class="mb-4"
              />
              <p class="text-body-1">
                Al hacer clic en "Proceder al Pago", serás redirigido a Mercado Pago
              </p>
            </div>
          </div>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="router.back()"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            :loading="loading"
            @click="procesarPago"
          >
            {{ metodoPago === 'transferencia' ? 'Registrar Pago' : 'Proceder al Pago' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VCol>
  </VRow>
</template>
