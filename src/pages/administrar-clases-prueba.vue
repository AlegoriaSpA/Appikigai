<script setup>
import { ref, computed } from 'vue'
import { useClasesStore } from '@/stores/clases'
import { useClasesPruebaStore } from '@/stores/clasesPrueba'

const clasesStore = useClasesStore()
const clasesPruebaStore = useClasesPruebaStore()

// Estado
const tabActual = ref('solicitudes')
const dialogConfigurar = ref(false)
const dialogResponder = ref(false)
const solicitudSeleccionada = ref(null)
const accionSeleccionada = ref(null)
const notasAdmin = ref('')

// Configurar clases que permiten prueba
const togglePermitePrueba = (claseId) => {
  const clase = clasesStore.clases.find(c => c.id === claseId)
  if (clase) {
    clase.permitePrueba = !clase.permitePrueba
    clasesStore.guardarEnLocalStorage()
  }
}

// Estadísticas
const estadisticas = computed(() => ({
  pendientes: clasesPruebaStore.solicitudesPendientes.length,
  aprobadas: clasesPruebaStore.solicitudesAprobadas.length,
  rechazadas: clasesPruebaStore.solicitudesRechazadas.length,
  total: clasesPruebaStore.solicitudes.length,
}))

// Formatear fecha
const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatearFechaSolo = (fechaStr) => {
  const [year, month, day] = fechaStr.split('-')
  return `${day}/${month}/${year}`
}

// Abrir dialog de respuesta
const abrirDialogResponder = (solicitud, accion) => {
  solicitudSeleccionada.value = solicitud
  accionSeleccionada.value = accion
  notasAdmin.value = ''
  dialogResponder.value = true
}

// Responder solicitud
const responderSolicitud = () => {
  try {
    if (accionSeleccionada.value === 'aprobar') {
      clasesPruebaStore.aprobarSolicitud(solicitudSeleccionada.value.id, notasAdmin.value)
    } else {
      clasesPruebaStore.rechazarSolicitud(solicitudSeleccionada.value.id, notasAdmin.value)
    }
    dialogResponder.value = false
    solicitudSeleccionada.value = null
    accionSeleccionada.value = null
    notasAdmin.value = ''
  } catch (error) {
    console.error(error)
  }
}

// Eliminar solicitud
const eliminarSolicitud = (id) => {
  if (confirm('¿Estás seguro de eliminar esta solicitud?')) {
    clasesPruebaStore.eliminarSolicitud(id)
  }
}

// Color del chip de estado
const colorEstado = (estado) => {
  return {
    'pendiente': 'warning',
    'aprobada': 'success',
    'rechazada': 'error',
  }[estado]
}
</script>

<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="12">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h2 class="text-h4 mb-2">
              📋 Gestión de Clases de Prueba
            </h2>
            <p class="text-body-1">
              Administra las solicitudes y configura qué clases permiten pruebas
            </p>
          </div>
          
          <VBtn
            color="primary"
            prepend-icon="tabler-settings"
            @click="dialogConfigurar = true"
          >
            Configurar Clases
          </VBtn>
        </div>

        <!-- Estadísticas -->
        <VRow class="mb-4">
          <VCol cols="12" sm="6" md="3">
            <VCard color="warning" variant="tonal">
              <VCardText>
                <div class="d-flex align-center">
                  <VIcon icon="tabler-clock" size="40" class="me-4" />
                  <div>
                    <div class="text-h4">{{ estadisticas.pendientes }}</div>
                    <div class="text-body-2">Pendientes</div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VCard color="success" variant="tonal">
              <VCardText>
                <div class="d-flex align-center">
                  <VIcon icon="tabler-circle-check" size="40" class="me-4" />
                  <div>
                    <div class="text-h4">{{ estadisticas.aprobadas }}</div>
                    <div class="text-body-2">Aprobadas</div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VCard color="error" variant="tonal">
              <VCardText>
                <div class="d-flex align-center">
                  <VIcon icon="tabler-circle-x" size="40" class="me-4" />
                  <div>
                    <div class="text-h4">{{ estadisticas.rechazadas }}</div>
                    <div class="text-body-2">Rechazadas</div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <VCol cols="12" sm="6" md="3">
            <VCard color="primary" variant="tonal">
              <VCardText>
                <div class="d-flex align-center">
                  <VIcon icon="tabler-list" size="40" class="me-4" />
                  <div>
                    <div class="text-h4">{{ estadisticas.total }}</div>
                    <div class="text-body-2">Total</div>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Tabs -->
        <VCard>
          <VTabs v-model="tabActual" bg-color="primary">
            <VTab value="solicitudes">
              <VIcon icon="tabler-inbox" class="me-2" />
              Solicitudes Pendientes
              <VChip
                v-if="estadisticas.pendientes > 0"
                color="warning"
                size="small"
                class="ms-2"
              >
                {{ estadisticas.pendientes }}
              </VChip>
            </VTab>
            <VTab value="historial">
              <VIcon icon="tabler-history" class="me-2" />
              Historial
            </VTab>
          </VTabs>

          <VCardText>
            <VWindow v-model="tabActual">
              <!-- Tab: Solicitudes Pendientes -->
              <VWindowItem value="solicitudes">
                <VRow v-if="clasesPruebaStore.solicitudesPendientes.length === 0">
                  <VCol cols="12">
                    <VAlert type="info" variant="tonal">
                      No hay solicitudes pendientes
                    </VAlert>
                  </VCol>
                </VRow>

                <VRow v-else>
                  <VCol
                    v-for="solicitud in clasesPruebaStore.solicitudesPendientes"
                    :key="solicitud.id"
                    cols="12"
                    md="6"
                    lg="4"
                  >
                    <VCard>
                      <VCardText>
                        <div class="d-flex justify-space-between align-center mb-3">
                          <VChip :color="colorEstado(solicitud.estado)" size="small">
                            {{ solicitud.estado.toUpperCase() }}
                          </VChip>
                          <VIcon
                            icon="tabler-trash"
                            size="20"
                            class="cursor-pointer"
                            @click="eliminarSolicitud(solicitud.id)"
                          />
                        </div>

                        <div class="mb-3">
                          <div class="text-h6">{{ solicitud.nombre }}</div>
                          <div class="text-body-2 text-medium-emphasis">
                            <VIcon icon="tabler-mail" size="16" class="me-1" />
                            {{ solicitud.email }}
                          </div>
                          <div class="text-body-2 text-medium-emphasis">
                            <VIcon icon="tabler-phone" size="16" class="me-1" />
                            {{ solicitud.telefono }}
                          </div>
                        </div>

                        <VDivider class="my-3" />

                        <div class="mb-3">
                          <div class="text-body-2 mb-1">
                            <strong>Clase:</strong> {{ solicitud.claseNombre }}
                          </div>
                          <div class="text-body-2 mb-1">
                            <strong>Fecha:</strong> {{ formatearFechaSolo(solicitud.fechaPreferida) }}
                          </div>
                          <div class="text-body-2 mb-1">
                            <strong>Hora:</strong> {{ solicitud.horaInicio }}
                          </div>
                          <div class="text-body-2 mb-1">
                            <strong>Coach:</strong> {{ solicitud.coach }}
                          </div>
                        </div>

                        <div v-if="solicitud.mensaje" class="mb-3">
                          <div class="text-body-2">
                            <strong>Mensaje:</strong>
                          </div>
                          <div class="text-body-2 text-medium-emphasis">
                            {{ solicitud.mensaje }}
                          </div>
                        </div>

                        <div class="text-caption text-medium-emphasis mb-3">
                          Solicitado: {{ formatearFecha(solicitud.fechaSolicitud) }}
                        </div>

                        <div class="d-flex gap-2">
                          <VBtn
                            color="success"
                            size="small"
                            block
                            @click="abrirDialogResponder(solicitud, 'aprobar')"
                          >
                            <VIcon icon="tabler-check" class="me-1" />
                            Aprobar
                          </VBtn>
                          <VBtn
                            color="error"
                            size="small"
                            block
                            @click="abrirDialogResponder(solicitud, 'rechazar')"
                          >
                            <VIcon icon="tabler-x" class="me-1" />
                            Rechazar
                          </VBtn>
                        </div>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>
              </VWindowItem>

              <!-- Tab: Historial -->
              <VWindowItem value="historial">
                <VDataTable
                  :items="[...clasesPruebaStore.solicitudesAprobadas, ...clasesPruebaStore.solicitudesRechazadas]"
                  :headers="[
                    { title: 'Nombre', key: 'nombre' },
                    { title: 'Email', key: 'email' },
                    { title: 'Clase', key: 'claseNombre' },
                    { title: 'Fecha', key: 'fechaPreferida' },
                    { title: 'Estado', key: 'estado' },
                    { title: 'Respuesta', key: 'fechaRespuesta' },
                    { title: 'Acciones', key: 'acciones', sortable: false },
                  ]"
                  items-per-page="10"
                >
                  <template #item.fechaPreferida="{ item }">
                    {{ formatearFechaSolo(item.fechaPreferida) }}
                  </template>

                  <template #item.estado="{ item }">
                    <VChip :color="colorEstado(item.estado)" size="small">
                      {{ item.estado.toUpperCase() }}
                    </VChip>
                  </template>

                  <template #item.fechaRespuesta="{ item }">
                    {{ formatearFecha(item.fechaRespuesta) }}
                  </template>

                  <template #item.acciones="{ item }">
                    <VBtn
                      icon
                      size="small"
                      variant="text"
                      @click="eliminarSolicitud(item.id)"
                    >
                      <VIcon icon="tabler-trash" />
                    </VBtn>
                  </template>
                </VDataTable>
              </VWindowItem>
            </VWindow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dialog: Configurar Clases -->
    <VDialog v-model="dialogConfigurar" max-width="800">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>⚙️ Configurar Clases de Prueba</span>
          <VBtn
            icon
            variant="text"
            @click="dialogConfigurar = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VAlert type="info" variant="tonal" class="mb-4">
            Activa las clases que permiten clases de prueba gratuitas
          </VAlert>

          <VList>
            <VListItem
              v-for="clase in clasesStore.clases"
              :key="clase.id"
              :disabled="!clase.activa"
            >
              <template #prepend>
                <VSwitch
                  :model-value="clase.permitePrueba"
                  :disabled="!clase.activa"
                  color="primary"
                  @update:model-value="togglePermitePrueba(clase.id)"
                />
              </template>

              <VListItemTitle>
                {{ clase.nombre }}
                <VChip v-if="!clase.activa" size="x-small" color="error" class="ms-2">
                  Inactiva
                </VChip>
              </VListItemTitle>

              <VListItemSubtitle>
                {{ clase.horaInicio }} • {{ clase.duracion }} min • {{ clase.cuposMaximos }} cupos
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn color="primary" @click="dialogConfigurar = false">
            Cerrar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog: Responder Solicitud -->
    <VDialog v-model="dialogResponder" max-width="500">
      <VCard v-if="solicitudSeleccionada">
        <VCardTitle>
          {{ accionSeleccionada === 'aprobar' ? '✅ Aprobar' : '❌ Rechazar' }} Solicitud
        </VCardTitle>

        <VCardText>
          <div class="mb-4">
            <div class="text-body-1 mb-2">
              <strong>Cliente:</strong> {{ solicitudSeleccionada.nombre }}
            </div>
            <div class="text-body-2 mb-2">
              <strong>Clase:</strong> {{ solicitudSeleccionada.claseNombre }}
            </div>
            <div class="text-body-2 mb-2">
              <strong>Fecha:</strong> {{ formatearFechaSolo(solicitudSeleccionada.fechaPreferida) }} a las {{ solicitudSeleccionada.horaInicio }}
            </div>
          </div>

          <VTextarea
            v-model="notasAdmin"
            label="Notas para el administrador (opcional)"
            placeholder="Agrega notas internas sobre esta solicitud..."
            rows="3"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn @click="dialogResponder = false">
            Cancelar
          </VBtn>
          <VBtn
            :color="accionSeleccionada === 'aprobar' ? 'success' : 'error'"
            @click="responderSolicitud"
          >
            Confirmar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
