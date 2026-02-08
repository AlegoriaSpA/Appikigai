<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePlanesStore } from '@/stores/planes'

const planesStore = usePlanesStore()

const dialog = ref(false)
const dialogDelete = ref(false)
const editedIndex = ref(-1)
const search = ref('')
const loading = ref(false)

const editedItem = ref({
  nombre: '',
  descripcion: '',
  precio: '',
  clases_totales: 8,
  duracion_dias: 30,
  limite_diario: 1,
  activo: true,
  caracteristicas: '',
})

const defaultItem = {
  nombre: '',
  descripcion: '',
  precio: '',
  clases_totales: 8,
  duracion_dias: 30,
  limite_diario: 1,
  activo: true,
  caracteristicas: '',
}

const headers = [
  { title: 'Nombre', key: 'nombre', sortable: true },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Precio', key: 'precio', sortable: true },
  { title: 'Clases Incluidas', key: 'clases_totales', sortable: true },
  { title: 'Vigencia', key: 'duracion_dias', sortable: true },
  { title: 'Estado', key: 'activo', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const tipoPlanes = [
  { value: 4, title: '4 Clases' },
  { value: 8, title: '8 Clases' },
  { value: 12, title: '12 Clases' },
  { value: 16, title: '16 Clases' },
  { value: 20, title: '20 Clases' },
  { value: 999, title: 'Ilimitado' },
]

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nuevo Plan' : 'Editar Plan'
})

onMounted(async () => {
  await loadPlanes()
})

async function loadPlanes() {
  loading.value = true
  try {
    await planesStore.fetchPlanes()
  } catch (error) {
    console.error('Error al cargar planes:', error)
  } finally {
    loading.value = false
  }
}

function editItem(item) {
  editedIndex.value = planesStore.planes.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

function deleteItem(item) {
  editedIndex.value = planesStore.planes.indexOf(item)
  editedItem.value = { ...item }
  dialogDelete.value = true
}

async function deleteItemConfirm() {
  try {
    await planesStore.deletePlan(editedItem.value.id)
    closeDelete()
  } catch (error) {
    console.error('Error al eliminar plan:', error)
  }
}

function close() {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  }, 300)
}

function closeDelete() {
  dialogDelete.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  }, 300)
}

async function save() {
  try {
    if (editedIndex.value > -1) {
      await planesStore.updatePlan(editedItem.value.id, editedItem.value)
    } else {
      await planesStore.createPlan(editedItem.value)
    }
    close()
  } catch (error) {
    console.error('Error al guardar plan:', error)
  }
}

async function toggleStatus(item) {
  try {
    await planesStore.togglePlanStatus(item.id)
  } catch (error) {
    console.error('Error al cambiar estado:', error)
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price)
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between pa-4">
          <span style="color: #DC2626; font-weight: 600;">Gestión de Planes</span>
          <VBtn
            color="primary"
            prepend-icon="tabler-plus"
            @click="dialog = true"
          >
            Nuevo Plan
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VTextField
            v-model="search"
            prepend-inner-icon="tabler-search"
            label="Buscar plan"
            single-line
            hide-details
            class="mb-4"
          />

          <VDataTable
            :headers="headers"
            :items="planesStore.planes"
            :search="search"
            :loading="loading"
            class="elevation-1"
          >
            <template #item.precio="{ item }">
              <span class="font-weight-medium">{{ formatPrice(item.precio) }}</span>
            </template>

            <template #item.clases_totales="{ item }">
              <VChip
                size="small"
                :color="item.clases_totales >= 999 ? 'success' : 'primary'"
              >
                {{ item.clases_totales >= 999 ? 'Ilimitado' : `${item.clases_totales} clases` }}
              </VChip>
            </template>

            <template #item.duracion_dias="{ item }">
              {{ item.duracion_dias }} días
            </template>

            <template #item.activo="{ item }">
              <VSwitch
                :model-value="item.activo"
                color="success"
                hide-details
                @update:model-value="toggleStatus(item)"
              />
            </template>

            <template #item.actions="{ item }">
              <VIcon
                size="small"
                class="me-2"
                @click="editItem(item)"
              >
                tabler-edit
              </VIcon>
              <VIcon
                size="small"
                @click="deleteItem(item)"
              >
                tabler-trash
              </VIcon>
            </template>
          </VDataTable>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Dialog Crear/Editar -->
    <VDialog
      v-model="dialog"
      max-width="600px"
    >
      <VCard>
        <VCardTitle class="pa-4">
          <span class="text-h5">{{ formTitle }}</span>
        </VCardTitle>

        <VCardText>
          <VContainer>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="editedItem.nombre"
                  label="Nombre del Plan*"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="editedItem.descripcion"
                  label="Descripción"
                  rows="3"
                />
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <VTextField
                  v-model="editedItem.precio"
                  label="Precio*"
                  type="number"
                  prefix="$"
                  required
                />
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <VSelect
                  v-model="editedItem.clases_totales"
                  :items="tipoPlanes"
                  label="Cantidad de Clases*"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VAlert
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  El plan permite tomar <strong>{{ editedItem.clases_totales >= 999 ? 'clases ilimitadas' : editedItem.clases_totales + ' clases' }}</strong> en un período de <strong>30 días</strong>, con un máximo de <strong>1 clase por día</strong>.
                </VAlert>
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="editedItem.caracteristicas"
                  label="Características"
                  rows="3"
                  hint="Una característica por línea"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12">
                <VSwitch
                  v-model="editedItem.activo"
                  label="Plan Activo"
                  color="success"
                />
              </VCol>
            </VRow>
          </VContainer>
        </VCardText>

        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="close"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            variant="elevated"
            @click="save"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog Eliminar -->
    <VDialog
      v-model="dialogDelete"
      max-width="500px"
    >
      <VCard>
        <VCardTitle class="text-h5 pa-4">
          ¿Eliminar Plan?
        </VCardTitle>
        <VCardText class="pa-4">
          ¿Estás seguro de que deseas eliminar el plan "{{ editedItem.nombre }}"? Esta acción no se puede deshacer.
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            color="grey"
            variant="text"
            @click="closeDelete"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="error"
            variant="elevated"
            @click="deleteItemConfirm"
          >
            Eliminar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VRow>
</template>
