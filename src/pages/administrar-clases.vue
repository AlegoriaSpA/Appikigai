<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClasesStore } from '@/stores/clases'

const clasesStore = useClasesStore()

// Estado local
const dialogClase = ref(false)
const dialogCoach = ref(false)
const dialogExcepcion = ref(false)
const modoEdicion = ref(false)
const claseSeleccionada = ref(null)
const vistaActual = ref('lista') // 'lista' o 'calendario'

// Errores de validación
const errores = ref({
  nombre: '',
  horaInicio: '',
  coachPorDefecto: '',
  dias: ''
})

// Formulario de clase
const formClase = ref({
  nombre: '',
  horaInicio: '06:00',
  duracion: 60,
  cuposMaximos: 10,
  dias: [],
  coachPorDefecto: ''
})

// Formulario de coach
const formCoach = ref({
  nombre: ''
})

// Formulario de excepción
const formExcepcion = ref({
  fecha: '',
  cancelada: false,
  coachReemplazo: ''
})

// Opciones de días de la semana
const diasSemanaOpciones = [
  { text: 'Lunes', value: 'lunes' },
  { text: 'Martes', value: 'martes' },
  { text: 'Miércoles', value: 'miércoles' },
  { text: 'Jueves', value: 'jueves' },
  { text: 'Viernes', value: 'viernes' },
  { text: 'Sábado', value: 'sábado' },
  { text: 'Domingo', value: 'domingo' }
]

// Opciones de duración
const duracionOpciones = [
  { title: '30 minutos', value: 30 },
  { title: '45 minutos', value: 45 },
  { title: '60 minutos', value: 60 },
  { title: '90 minutos', value: 90 },
  { title: '120 minutos', value: 120 }
]

// Computed
const calendarioSemanal = computed(() => clasesStore.obtenerCalendarioSemanal())

// Métodos para clases
const abrirDialogNuevaClase = () => {
  modoEdicion.value = false
  formClase.value = {
    nombre: '',
    horaInicio: '06:00',
    duracion: 60,
    cuposMaximos: 10,
    dias: [],
    coachPorDefecto: ''
  }
  // Limpiar errores
  errores.value = {
    nombre: '',
    horaInicio: '',
    coachPorDefecto: '',
    dias: ''
  }
  dialogClase.value = true
}

const abrirDialogEditarClase = (clase) => {
  modoEdicion.value = true
  claseSeleccionada.value = clase
  formClase.value = {
    nombre: clase.nombre,
    horaInicio: clase.horaInicio,
    duracion: clase.duracion,
    cuposMaximos: clase.cuposMaximos,
    dias: [...clase.dias],
    coachPorDefecto: clase.coachPorDefecto
  }
  // Limpiar errores
  errores.value = {
    nombre: '',
    horaInicio: '',
    coachPorDefecto: '',
    dias: ''
  }
  dialogClase.value = true
}

const guardarClase = () => {
  // Limpiar errores previos
  errores.value = {
    nombre: '',
    horaInicio: '',
    coachPorDefecto: '',
    dias: ''
  }

  // Validar campos
  let tieneErrores = false

  if (!formClase.value.nombre || formClase.value.nombre.trim() === '') {
    errores.value.nombre = 'El nombre de la clase es requerido'
    tieneErrores = true
  }

  if (!formClase.value.horaInicio) {
    errores.value.horaInicio = 'La hora de inicio es requerida'
    tieneErrores = true
  }

  if (!formClase.value.coachPorDefecto) {
    errores.value.coachPorDefecto = 'Debes seleccionar un coach'
    tieneErrores = true
  }

  if (formClase.value.dias.length === 0) {
    errores.value.dias = 'Debes seleccionar al menos un día'
    tieneErrores = true
  }

  if (tieneErrores) {
    return
  }

  console.log('Guardando clase:', formClase.value)
  
  if (modoEdicion.value && claseSeleccionada.value) {
    clasesStore.actualizarClase(claseSeleccionada.value.id, formClase.value)
  } else {
    clasesStore.crearClase(formClase.value)
  }
  dialogClase.value = false
}

const eliminarClase = (id) => {
  if (confirm('¿Estás seguro de eliminar esta clase?')) {
    clasesStore.eliminarClase(id)
  }
}

const toggleClase = (id) => {
  clasesStore.toggleActivarClase(id)
}

// Métodos para coaches
const abrirDialogNuevoCoach = () => {
  formCoach.value = { nombre: '' }
  dialogCoach.value = true
}

const guardarCoach = () => {
  clasesStore.crearCoach(formCoach.value)
  dialogCoach.value = false
}

const eliminarCoach = (id) => {
  if (confirm('¿Estás seguro de eliminar este coach?')) {
    clasesStore.eliminarCoach(id)
  }
}

// Métodos para excepciones
const abrirDialogExcepcion = (clase) => {
  claseSeleccionada.value = clase
  formExcepcion.value = {
    fecha: '',
    cancelada: false,
    coachReemplazo: ''
  }
  dialogExcepcion.value = true
}

const guardarExcepcion = () => {
  clasesStore.agregarExcepcion(
    claseSeleccionada.value.id,
    formExcepcion.value.fecha,
    {
      cancelada: formExcepcion.value.cancelada,
      coachReemplazo: formExcepcion.value.coachReemplazo
    }
  )
  dialogExcepcion.value = false
}

// Utilidades
const formatearDias = (dias) => {
  return dias.map(dia => dia.charAt(0).toUpperCase() + dia.slice(1)).join(', ')
}

const getDiaColor = (dia) => {
  const colores = {
    'lunes': 'primary',
    'martes': 'secondary',
    'miércoles': 'success',
    'jueves': 'info',
    'viernes': 'warning',
    'sábado': 'error',
    'domingo': 'purple'
  }
  return colores[dia] || 'default'
}
</script>

<template>
  <VRow>
    <!-- Header -->
    <VCol cols="12">
      <VCard>
        <VCardText class="pa-6">
          <div class="d-flex justify-space-between align-center flex-wrap gap-4 mb-4">
            <div>
              <h2 class="text-h4 mb-1">
                Administrar Clases
              </h2>
              <p class="text-body-1 text-medium-emphasis mb-0">
                Configura las clases, horarios y coaches del box
              </p>
            </div>
            <div class="d-flex align-center gap-3 flex-wrap">
              <!-- Toggle de vista -->
              <VBtnToggle
                v-model="vistaActual"
                mandatory
                variant="outlined"
                divided
                color="primary"
              >
                <VBtn value="lista" prepend-icon="tabler-list">
                  Lista
                </VBtn>
                <VBtn value="calendario" prepend-icon="tabler-calendar-week">
                  Calendario
                </VBtn>
              </VBtnToggle>

              <!-- Divider vertical -->
              <VDivider vertical inset class="mx-2" style="height: 40px;" />

              <!-- Botones de acción -->
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                size="large"
                @click="abrirDialogNuevaClase"
              >
                Nueva Clase
              </VBtn>
              <VBtn
                color="secondary"
                prepend-icon="tabler-user-plus"
                variant="tonal"
                size="large"
                @click="abrirDialogNuevoCoach"
              >
                Nuevo Coach
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Vista Lista -->
    <VCol v-if="vistaActual === 'lista'" cols="12">
      <VCard>
        <VCardText class="pa-6">
          <h3 class="text-h5 mb-4">
            Clases Configuradas
          </h3>

          <VRow>
            <VCol
              v-for="clase in clasesStore.clases"
              :key="clase.id"
              cols="12"
              md="6"
              lg="4"
            >
              <VCard
                :class="clase.activa ? '' : 'opacity-50'"
                border
              >
                <VCardText>
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h4 class="text-h6">
                      {{ clase.nombre }}
                    </h4>
                    <VSwitch
                      :model-value="clase.activa"
                      color="success"
                      density="compact"
                      hide-details
                      @update:model-value="toggleClase(clase.id)"
                    />
                  </div>

                  <VDivider class="mb-3" />

                  <div class="d-flex flex-column gap-2">
                    <div class="d-flex align-center gap-2">
                      <VIcon icon="tabler-clock" size="20" />
                      <span class="text-body-2">{{ clase.horaInicio }} ({{ clase.duracion }} min)</span>
                    </div>

                    <div class="d-flex align-center gap-2">
                      <VIcon icon="tabler-users" size="20" />
                      <span class="text-body-2">{{ clase.cuposMaximos }} cupos</span>
                    </div>

                    <div class="d-flex align-center gap-2">
                      <VIcon icon="tabler-user" size="20" />
                      <span class="text-body-2">{{ clase.coachPorDefecto }}</span>
                    </div>

                    <div class="d-flex align-center gap-2 flex-wrap mt-2">
                      <VChip
                        v-for="dia in clase.dias"
                        :key="dia"
                        :color="getDiaColor(dia)"
                        size="small"
                        variant="tonal"
                      >
                        {{ dia.substring(0, 3).toUpperCase() }}
                      </VChip>
                    </div>

                    <div
                      v-if="clase.excepciones && clase.excepciones.length > 0"
                      class="mt-2"
                    >
                      <VChip
                        color="warning"
                        size="small"
                        prepend-icon="tabler-alert-circle"
                      >
                        {{ clase.excepciones.length }} excepción(es)
                      </VChip>
                    </div>
                  </div>
                </VCardText>

                <VCardActions>
                  <VBtn
                    variant="text"
                    color="primary"
                    size="small"
                    @click="abrirDialogEditarClase(clase)"
                  >
                    Editar
                  </VBtn>
                  <VBtn
                    variant="text"
                    color="warning"
                    size="small"
                    @click="abrirDialogExcepcion(clase)"
                  >
                    Excepción
                  </VBtn>
                  <VBtn
                    variant="text"
                    color="error"
                    size="small"
                    @click="eliminarClase(clase.id)"
                  >
                    Eliminar
                  </VBtn>
                </VCardActions>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Vista Calendario -->
    <VCol v-if="vistaActual === 'calendario'" cols="12">
      <VCard>
        <VCardText class="pa-6">
          <h3 class="text-h5 mb-4">
            Calendario Semanal
          </h3>

          <VRow>
            <VCol
              v-for="(dia, index) in diasSemanaOpciones"
              :key="dia.value"
              cols="12"
              md="6"
              lg="3"
            >
              <VCard :color="getDiaColor(dia.value)" variant="tonal">
                <VCardText>
                  <h5 class="text-h6 mb-3">
                    {{ dia.text }}
                  </h5>

                  <div
                    v-if="calendarioSemanal[dia.value] && calendarioSemanal[dia.value].length > 0"
                    class="d-flex flex-column gap-2"
                  >
                    <VCard
                      v-for="clase in calendarioSemanal[dia.value]"
                      :key="clase.id"
                      variant="outlined"
                    >
                      <VCardText class="pa-2">
                        <div class="text-body-2 font-weight-bold">
                          {{ clase.nombre }}
                        </div>
                        <div class="text-caption">
                          {{ clase.horaInicio }} - {{ clase.duracion }}min
                        </div>
                        <div class="text-caption">
                          Coach: {{ clase.coachPorDefecto }}
                        </div>
                        <div class="text-caption">
                          Cupos: {{ clase.cuposMaximos }}
                        </div>
                      </VCardText>
                    </VCard>
                  </div>

                  <div v-else class="text-center text-caption text-medium-emphasis py-4">
                    Sin clases
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Lista de Coaches - Solo visible en vista Lista -->
    <VCol v-if="vistaActual === 'lista'" cols="12">
      <VCard>
        <VCardText class="pa-6">
          <h3 class="text-h5 mb-4">
            Coaches
          </h3>

          <VRow>
            <VCol
              v-for="coach in clasesStore.coaches"
              :key="coach.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <VCard border>
                <VCardText class="d-flex justify-space-between align-center">
                  <div class="d-flex align-center gap-2">
                    <VAvatar color="primary" size="40">
                      <VIcon icon="tabler-user" />
                    </VAvatar>
                    <div>
                      <div class="text-body-1 font-weight-medium">
                        {{ coach.nombre }}
                      </div>
                      <VChip
                        :color="coach.activo ? 'success' : 'error'"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ coach.activo ? 'Activo' : 'Inactivo' }}
                      </VChip>
                    </div>
                  </div>
                  <VBtn
                    icon="tabler-trash"
                    size="small"
                    variant="text"
                    color="error"
                    @click="eliminarCoach(coach.id)"
                  />
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Dialog Nueva/Editar Clase -->
    <VDialog
      v-model="dialogClase"
      max-width="600"
    >
      <VCard>
        <VCardTitle>
          {{ modoEdicion ? 'Editar Clase' : 'Nueva Clase' }}
        </VCardTitle>

        <VCardText>
          <VForm @submit.prevent="guardarClase">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formClase.nombre"
                  label="Nombre de la clase"
                  placeholder="Ej: Crossfit, Yoga, Funcional"
                  :error-messages="errores.nombre"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model="formClase.horaInicio"
                  label="Hora de inicio"
                  type="time"
                  placeholder="06:00"
                  :hint="errores.horaInicio || 'Formato: 24 horas (ej: 06:00, 19:00)'"
                  :error-messages="errores.horaInicio"
                  persistent-hint
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="formClase.duracion"
                  :items="duracionOpciones"
                  label="Duración"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VTextField
                  v-model.number="formClase.cuposMaximos"
                  label="Cupos máximos"
                  type="number"
                  min="1"
                  required
                />
              </VCol>

              <VCol cols="12" sm="6">
                <VSelect
                  v-model="formClase.coachPorDefecto"
                  :items="clasesStore.coachesActivos.map(c => c.nombre)"
                  label="Coach por defecto"
                  :error-messages="errores.coachPorDefecto"
                  required
                />
              </VCol>

              <VCol cols="12">
                <p class="text-body-2 mb-2">
                  Días de la semana
                </p>
                <div class="d-flex flex-wrap gap-2">
                  <VCheckbox
                    v-for="dia in diasSemanaOpciones"
                    :key="dia.value"
                    v-model="formClase.dias"
                    :label="dia.text"
                    :value="dia.value"
                    hide-details
                    density="compact"
                  />
                </div>
                <div v-if="errores.dias" class="text-error text-caption mt-2">
                  {{ errores.dias }}
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogClase = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            @click="guardarClase"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog Nuevo Coach -->
    <VDialog
      v-model="dialogCoach"
      max-width="400"
    >
      <VCard>
        <VCardTitle>Nuevo Coach</VCardTitle>

        <VCardText>
          <VTextField
            v-model="formCoach.nombre"
            label="Nombre completo"
            placeholder="Ej: Juan Pérez"
            required
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogCoach = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            @click="guardarCoach"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog Excepción -->
    <VDialog
      v-model="dialogExcepcion"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Agregar Excepción</VCardTitle>
        <VCardText>
          <p class="text-body-2 mb-4">
            Clase: <strong>{{ claseSeleccionada?.nombre }}</strong>
          </p>

          <VForm @submit.prevent="guardarExcepcion">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="formExcepcion.fecha"
                  label="Fecha"
                  type="date"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VCheckbox
                  v-model="formExcepcion.cancelada"
                  label="Cancelar esta clase en esta fecha"
                  hide-details
                />
              </VCol>

              <VCol v-if="!formExcepcion.cancelada" cols="12">
                <VSelect
                  v-model="formExcepcion.coachReemplazo"
                  :items="clasesStore.coachesActivos.map(c => c.nombre)"
                  label="Coach de reemplazo (opcional)"
                  clearable
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogExcepcion = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            @click="guardarExcepcion"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VRow>
</template>

<style scoped>
.opacity-50 {
  opacity: 0.5;
}
</style>
