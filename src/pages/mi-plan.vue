<script setup>
import { ref, onMounted } from 'vue'
import { usePlanesStore } from '@/stores/planes'
import { usePagosStore } from '@/stores/pagos'
import { useRouter } from 'vue-router'

const router = useRouter()
const planesStore = usePlanesStore()
const pagosStore = usePagosStore()

const loading = ref(false)
const miPlan = ref(null)
const selectedPlan = ref(null)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await planesStore.fetchPlanesActivos()
    await planesStore.fetchCurrentUserPlan()
    miPlan.value = planesStore.currentPlan
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

function selectPlan(plan) {
  selectedPlan.value = plan
  // Guardar el plan seleccionado temporalmente
  localStorage.setItem('plan_seleccionado_ikigai', JSON.stringify(plan))
  router.push({ name: 'pagar', params: { planId: plan.id } })
}

function getDiasRestantes(fechaVencimiento) {
  if (!fechaVencimiento) return 0
  const ahora = new Date()
  const vencimiento = new Date(fechaVencimiento)
  const diferencia = vencimiento - ahora
  return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)))
}
</script>

<template>
  <VRow>
    <!-- Mi Plan Actual -->
    <VCol
      v-if="miPlan"
      cols="12"
    >
      <VCard color="primary">
        <VCardText>
          <VRow align="center">
            <VCol
              cols="12"
              md="8"
            >
              <h3 class="text-h5 mb-2 text-white">
                Mi Plan Actual: {{ miPlan.plan.nombre }}
              </h3>
              <div class="d-flex gap-4 flex-wrap">
                <div class="d-flex align-center">
                  <VIcon
                    icon="tabler-calendar"
                    class="me-2"
                    color="white"
                  />
                  <span class="text-white">{{ getDiasRestantes(miPlan.fecha_vencimiento) }} días restantes</span>
                </div>
                <div class="d-flex align-center">
                  <VIcon
                    icon="tabler-ticket"
                    class="me-2"
                    color="white"
                  />
                  <span class="text-white">{{ miPlan.clases_restantes }} / {{ miPlan.plan.clases_totales >= 999 ? 'Ilimitadas' : miPlan.plan.clases_totales }} clases</span>
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
                prepend-icon="tabler-calendar-event"
                :to="{ name: 'reservas' }"
              >
                Reservar Clase
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Título -->
    <VCol cols="12">
      <h2
        class="text-h4 mb-2"
        style="color: #DC2626;"
      >
        Planes Disponibles
      </h2>
      <p class="text-body-1 text-medium-emphasis">
        Elige el plan que mejor se adapte a tus necesidades
      </p>
    </VCol>

    <!-- Grid de Planes -->
    <VCol
      v-for="plan in planesStore.planesActivos"
      :key="plan.id"
      cols="12"
      sm="6"
      md="4"
    >
      <VCard
        class="h-100"
        :class="{ 'border-primary': plan.destacado }"
        :elevation="plan.destacado ? 8 : 2"
      >
        <VCardTitle class="pa-4 pb-2">
          <div class="d-flex justify-space-between align-center">
            <span class="text-h5">{{ plan.nombre }}</span>
            <VChip
              v-if="plan.destacado"
              color="primary"
              size="small"
            >
              Popular
            </VChip>
          </div>
        </VCardTitle>

        <VCardText class="pa-4">
          <!-- Precio -->
          <div class="text-center py-4">
            <div
              class="text-h3 mb-1"
              style="color: #DC2626; font-weight: 700;"
            >
              {{ formatPrice(plan.precio) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Por {{ plan.duracion_dias }} días
            </div>
          </div>

          <!-- Descripción -->
          <p
            v-if="plan.descripcion"
            class="text-body-2 mb-4"
          >
            {{ plan.descripcion }}
          </p>

          <VDivider class="my-4" />

          <!-- Características Principales -->
          <div class="mb-4">
            <div class="d-flex align-center mb-3">
              <VIcon
                icon="tabler-ticket"
                color="primary"
                size="20"
                class="me-2"
              />
              <span class="text-body-1 font-weight-medium">
                {{ plan.clases_totales >= 999 ? 'Clases Ilimitadas' : `${plan.clases_totales} Clases` }}
              </span>
            </div>
            <div class="d-flex align-center mb-3">
              <VIcon
                icon="tabler-calendar"
                color="primary"
                size="20"
                class="me-2"
              />
              <span class="text-body-1">
                Vigencia de {{ plan.duracion_dias }} días
              </span>
            </div>
            <div class="d-flex align-center mb-3">
              <VIcon
                icon="tabler-clock"
                color="primary"
                size="20"
                class="me-2"
              />
              <span class="text-body-1">
                Máximo {{ plan.limite_diario || 1 }} clase por día
              </span>
            </div>
          </div>

          <!-- Características adicionales -->
          <div
            v-if="plan.caracteristicas"
            class="mb-4"
          >
            <VDivider class="mb-3" />
            <div
              v-for="(caracteristica, index) in plan.caracteristicas.split('\n').filter(c => c.trim())"
              :key="index"
              class="d-flex align-start mb-2"
            >
              <VIcon
                icon="tabler-check"
                color="success"
                size="18"
                class="me-2 mt-1"
              />
              <span class="text-body-2">{{ caracteristica }}</span>
            </div>
          </div>
        </VCardText>

        <VCardActions class="pa-4 pt-0">
          <VBtn
            block
            color="primary"
            variant="elevated"
            size="large"
            @click="selectPlan(plan)"
          >
            Seleccionar Plan
          </VBtn>
        </VCardActions>
      </VCard>
    </VCol>

    <!-- Sin planes disponibles -->
    <VCol
      v-if="!loading && planesStore.planesActivos.length === 0"
      cols="12"
    >
      <VCard>
        <VCardText class="text-center py-8">
          <VIcon
            icon="tabler-package"
            size="64"
            class="mb-4"
            color="grey"
          />
          <h3 class="text-h5 mb-2">
            No hay planes disponibles
          </h3>
          <p class="text-body-2 text-medium-emphasis">
            Por favor, contacta con el administrador
          </p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
