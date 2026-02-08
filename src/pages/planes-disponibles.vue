<script setup>
import { ref, onMounted } from 'vue'
import { usePlanesStore } from '@/stores/planes'
import { useRouter } from 'vue-router'
import logoImage from '@/assets/images/LOGO.png'

definePage({
  meta: {
    subject: 'planes',
    action: 'read',
  },
})

const router = useRouter()
const planesStore = usePlanesStore()

const loading = ref(false)
const selectedPlan = ref(null)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await planesStore.fetchPlanesActivos()
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
</script>

<template>
  <VRow>
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
          <!-- Logo centrado -->
          <div class="text-center mb-4">
            <VImg
              :src="logoImage"
              max-width="150"
              class="mx-auto"
            />
          </div>

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
