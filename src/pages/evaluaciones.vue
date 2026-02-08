<script setup>
import { useAuthStore } from '@/stores/auth'
import { useEvaluacionesStore } from '@/stores/evaluaciones'
import { useUsersStore } from '@/stores/users'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    subject: 'evaluaciones',
    action: 'read',
  },
})

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const evaluacionesStore = useEvaluacionesStore()

// Verificar que el usuario sea admin o superadmin
if (authStore.userRole !== 'admin' && authStore.userRole !== 'superadmin') {
  router.push('/')
}

// State
const evaluaciones = ref([])
const allUsers = ref([])
const isLoading = ref(false)
const isDialogVisible = ref(false)
const isViewDialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const selectedUser = ref(null)
const evaluacionAnterior = ref(null)
const viewingEvaluacion = ref(null)

// Form data
const formData = ref({
  usuario_id: null,
  fecha_evaluacion: new Date().toISOString().split('T')[0],
  
  // Antropometría
  peso: '',
  estatura: '',
  circunferencia_cintura: '',
  circunferencia_brazo_relajado: '',
  circunferencia_brazo_contraccion: '',
  circunferencia_muslo: '',
  circunferencia_pantorrilla: '',
  
  // Pliegues
  pliegue_tricipital: '',
  pliegue_bicipital: '',
  pliegue_suprailiaco: '',
  pliegue_subescapular: '',
  pliegue_abdominal: '',
  pliegue_muslo: '',
  pliegue_pantorrilla: '',
  
  // Resultados
  porcentaje_grasa: '',
  imc: '',
  
  // Objetivo
  objetivo_paciente: '',
  fecha_proxima_evaluacion: '',
  
  // Notas de la nutricionista (no se exportan)
  notas: '',
})

const formErrors = ref({})

// Headers para la tabla
const headers = [
  { title: 'Fecha', key: 'fecha_evaluacion', sortable: true },
  { title: 'Usuario', key: 'usuario_nombre', sortable: true },
  { title: 'Peso (kg)', key: 'peso', sortable: true },
  { title: 'Estatura (cm)', key: 'estatura', sortable: true },
  { title: 'IMC', key: 'imc', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false },
]

// Computed
const usuarioSeleccionado = computed(() => {
  if (!formData.value.usuario_id) return null
  return allUsers.value.find(u => u.id === formData.value.usuario_id)
})

const calcularIMC = () => {
  const peso = parseFloat(formData.value.peso)
  const estatura = parseFloat(formData.value.estatura) / 100 // convertir cm a metros
  
  if (peso && estatura && estatura > 0) {
    formData.value.imc = (peso / (estatura * estatura)).toFixed(2)
  } else {
    formData.value.imc = ''
  }
}

const establecerProximaEvaluacion = (meses) => {
  const fecha = new Date()
  fecha.setMonth(fecha.getMonth() + meses)
  formData.value.fecha_proxima_evaluacion = fecha.toISOString().split('T')[0]
}

// Methods
const loadEvaluaciones = async () => {
  isLoading.value = true
  const result = await evaluacionesStore.fetchEvaluaciones()
  if (result.success) {
    evaluaciones.value = evaluacionesStore.evaluaciones
  }
  isLoading.value = false
}

const loadUsers = async () => {
  const result = await usersStore.fetchUsers()
  if (result.success) {
    // Filtrar solo usuarios con rol 'user'
    allUsers.value = usersStore.users.filter(u => u.role === 'user')
  }
}

const buscarEvaluacionAnterior = async (usuarioId) => {
  const result = await evaluacionesStore.fetchEvaluacionAnterior(usuarioId)
  if (result.success && result.data) {
    evaluacionAnterior.value = result.data
  } else {
    evaluacionAnterior.value = null
  }
}

const onUsuarioChange = async () => {
  if (formData.value.usuario_id && !isEditing.value) {
    // Solo buscar evaluación anterior cuando se está creando una nueva (no editando)
    await buscarEvaluacionAnterior(formData.value.usuario_id)
  } else if (!formData.value.usuario_id) {
    evaluacionAnterior.value = null
  }
}

const openCreateDialog = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    usuario_id: null,
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    peso: '',
    estatura: '',
    circunferencia_cintura: '',
    circunferencia_brazo_relajado: '',
    circunferencia_brazo_contraccion: '',
    circunferencia_muslo: '',
    circunferencia_pantorrilla: '',
    pliegue_tricipital: '',
    pliegue_bicipital: '',
    pliegue_suprailiaco: '',
    pliegue_subescapular: '',
    pliegue_abdominal: '',
    porcentaje_grasa: '',
    imc: '',
    objetivo_paciente: '',
    fecha_proxima_evaluacion: '',
  }
  evaluacionAnterior.value = null
  formErrors.value = {}
  isDialogVisible.value = true
}

const openEditDialog = async (evaluacion) => {
  isEditing.value = true
  editingId.value = evaluacion.id
  
  // Cargar datos de la evaluación
  formData.value = {
    usuario_id: evaluacion.usuario_id || null,
    fecha_evaluacion: evaluacion.fecha_evaluacion,
    peso: evaluacion.peso || '',
    estatura: evaluacion.estatura || '',
    circunferencia_cintura: evaluacion.circunferencia_cintura || '',
    circunferencia_brazo_relajado: evaluacion.circunferencia_brazo_relajado || '',
    circunferencia_brazo_contraccion: evaluacion.circunferencia_brazo_contraccion || '',
    circunferencia_muslo: evaluacion.circunferencia_muslo || '',
    circunferencia_pantorrilla: evaluacion.circunferencia_pantorrilla || '',
    pliegue_tricipital: evaluacion.pliegue_tricipital || '',
    pliegue_bicipital: evaluacion.pliegue_bicipital || '',
    pliegue_suprailiaco: evaluacion.pliegue_suprailiaco || '',
    pliegue_subescapular: evaluacion.pliegue_subescapular || '',
    pliegue_abdominal: evaluacion.pliegue_abdominal || '',
    porcentaje_grasa: evaluacion.porcentaje_grasa || '',
    imc: evaluacion.imc || '',
    objetivo_paciente: evaluacion.objetivo_paciente || '',
    fecha_proxima_evaluacion: evaluacion.fecha_proxima_evaluacion || '',
  }
  
  // Buscar evaluación anterior
  if (formData.value.usuario_id) {
    await buscarEvaluacionAnterior(formData.value.usuario_id)
  }
  
  formErrors.value = {}
  isDialogVisible.value = true
}

const validateForm = () => {
  formErrors.value = {}
  let isValid = true

  if (!formData.value.usuario_id) {
    formErrors.value.usuario_id = 'Debe seleccionar un usuario'
    isValid = false
  }

  if (!formData.value.fecha_evaluacion) {
    formErrors.value.fecha_evaluacion = 'La fecha de evaluación es requerida'
    isValid = false
  }

  return isValid
}

const saveEvaluacion = async () => {
  if (!validateForm()) return

  isLoading.value = true
  
  let result
  if (isEditing.value) {
    result = await evaluacionesStore.updateEvaluacion(editingId.value, formData.value)
  } else {
    result = await evaluacionesStore.createEvaluacion(formData.value)
  }
  
  if (result.success) {
    isDialogVisible.value = false
    await loadEvaluaciones()
  } else {
    formErrors.value.general = result.error
  }
  
  isLoading.value = false
}

const deleteEvaluacion = async (id) => {
  if (!confirm('¿Está seguro que desea eliminar esta evaluación?')) return

  isLoading.value = true
  const result = await evaluacionesStore.deleteEvaluacion(id)
  if (result.success) {
    await loadEvaluaciones()
  }
  isLoading.value = false
}

const viewEvaluacion = (evaluacion) => {
  viewingEvaluacion.value = evaluacion
  isViewDialogVisible.value = true
}

// Funciones para calcular métricas nutricionales
const calcularClasificacionIMC = (imc) => {
  if (!imc) return { texto: '-', color: 'secondary' }
  const valor = parseFloat(imc)
  if (valor < 18.5) return { texto: 'Bajo peso', color: 'info' }
  if (valor < 25) return { texto: 'Normal', color: 'success' }
  if (valor < 30) return { texto: 'Sobrepeso', color: 'warning' }
  return { texto: 'Obesidad', color: 'error' }
}

const calcularMasaGrasa = (peso, porcentajeGrasa) => {
  if (!peso || !porcentajeGrasa) return null
  return (parseFloat(peso) * parseFloat(porcentajeGrasa) / 100).toFixed(1)
}

const calcularMasaMagra = (peso, porcentajeGrasa) => {
  if (!peso || !porcentajeGrasa) return null
  const masaGrasa = parseFloat(peso) * parseFloat(porcentajeGrasa) / 100
  return (parseFloat(peso) - masaGrasa).toFixed(1)
}

const calcularIndiceCinturaEstatura = (cintura, estatura) => {
  if (!cintura || !estatura) return null
  const ratio = parseFloat(cintura) / parseFloat(estatura)
  return {
    valor: ratio.toFixed(2),
    clasificacion: ratio < 0.5 ? 'Saludable' : 'Riesgo elevado',
    color: ratio < 0.5 ? 'success' : 'warning'
  }
}

const calcularSumaPliegues = (evaluacion) => {
  const pliegues = [
    evaluacion.pliegue_tricipital,
    evaluacion.pliegue_bicipital,
    evaluacion.pliegue_suprailiaco,
    evaluacion.pliegue_subescapular,
    evaluacion.pliegue_abdominal,
    evaluacion.pliegue_muslo,
    evaluacion.pliegue_pantorrilla
  ]
  const suma = pliegues.reduce((acc, p) => acc + (parseFloat(p) || 0), 0)
  return suma > 0 ? suma.toFixed(1) : null
}

const calcularPesoIdeal = (estatura, sexo = 'neutro') => {
  if (!estatura) return null
  const estaturaM = parseFloat(estatura) / 100
  // Fórmula de Devine (ajustada para neutro)
  const pesoIdeal = 50 + (0.91 * (parseFloat(estatura) - 152.4))
  return pesoIdeal.toFixed(1)
}

const calcularTMB = (peso, estatura, edad, sexo = 'neutro') => {
  if (!peso || !estatura || !edad) return null
  // Fórmula de Harris-Benedict revisada (promedio entre hombre y mujer)
  const pesoNum = parseFloat(peso)
  const estaturaNum = parseFloat(estatura)
  const edadNum = parseFloat(edad)
  
  // Promedio simplificado
  const tmb = 10 * pesoNum + 6.25 * estaturaNum - 5 * edadNum + 5
  return Math.round(tmb)
}

const metricas = computed(() => {
  if (!viewingEvaluacion.value) return null
  
  const ev = viewingEvaluacion.value
  const edad = ev.usuario?.edad || 25 // edad por defecto si no está disponible
  
  return {
    clasificacionIMC: calcularClasificacionIMC(ev.imc),
    masaGrasa: calcularMasaGrasa(ev.peso, ev.porcentaje_grasa),
    masaMagra: calcularMasaMagra(ev.peso, ev.porcentaje_grasa),
    indiceCinturaEstatura: calcularIndiceCinturaEstatura(ev.circunferencia_cintura, ev.estatura),
    sumaPliegues: calcularSumaPliegues(ev),
    pesoIdeal: calcularPesoIdeal(ev.estatura),
    tmb: calcularTMB(ev.peso, ev.estatura, edad),
    caloriasSedentario: calcularTMB(ev.peso, ev.estatura, edad) ? Math.round(calcularTMB(ev.peso, ev.estatura, edad) * 1.2) : null,
    caloriasLigero: calcularTMB(ev.peso, ev.estatura, edad) ? Math.round(calcularTMB(ev.peso, ev.estatura, edad) * 1.375) : null,
    caloriasModerado: calcularTMB(ev.peso, ev.estatura, edad) ? Math.round(calcularTMB(ev.peso, ev.estatura, edad) * 1.55) : null,
    caloriasActivo: calcularTMB(ev.peso, ev.estatura, edad) ? Math.round(calcularTMB(ev.peso, ev.estatura, edad) * 1.725) : null,
  }
})

// Watchers
watch([() => formData.value.peso, () => formData.value.estatura], () => {
  calcularIMC()
})

const formatearFecha = fecha => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(() => {
  loadEvaluaciones()
  loadUsers()
})
</script>

<template>
  <div>
    <!-- Header -->
    <VCard class="mb-6">
      <VCardText>
        <VRow align="center">
          <VCol cols="12" md="8">
            <h2 class="text-h4 mb-1" style="color: #7C3AED;">
              Evaluaciones Nutricionales
            </h2>
            <p class="text-body-1 text-medium-emphasis">
              Gestiona las evaluaciones antropométricas de los usuarios
            </p>
          </VCol>
          <VCol cols="12" md="4" class="text-center text-md-end">
            <VBtn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="tabler-plus"
              @click="openCreateDialog"
            >
              Nueva Evaluación
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Tabla de Evaluaciones -->
    <VCard>
      <VDataTable
        :headers="headers"
        :items="evaluaciones"
        :loading="isLoading"
        :items-per-page="25"
        items-per-page-text="Evaluaciones por página"
        no-data-text="No hay evaluaciones"
      >
        <template #item.fecha_evaluacion="{ item }">
          {{ formatearFecha(item.fecha_evaluacion) }}
        </template>

        <template #item.usuario_nombre="{ item }">
          {{ item.usuario?.name || '-' }}
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            size="small"
            variant="text"
            color="info"
            @click="viewEvaluacion(item)"
          >
            <VIcon icon="tabler-eye" />
          </VBtn>
          <VBtn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="openEditDialog(item)"
          >
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn
            icon
            size="small"
            variant="text"
            color="error"
            @click="deleteEvaluacion(item.id)"
          >
            <VIcon icon="tabler-trash" />
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog Nueva Evaluación -->
    <VDialog
      v-model="isDialogVisible"
      max-width="1200"
      scrollable
      persistent
    >
      <VCard>
        <VCardTitle>
          {{ isEditing ? 'Editar Evaluación Nutricional' : 'Nueva Evaluación Nutricional' }}
        </VCardTitle>

        <VDivider />

        <VCardText style="max-height: 70vh;">
          <VForm>
            <VRow>
              <!-- Selección de Usuario -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2">
                  Seleccionar Usuario
                </h6>
              </VCol>

              <VCol cols="12">
                <VAutocomplete
                  v-model="formData.usuario_id"
                  :items="allUsers"
                  item-title="name"
                  item-value="id"
                  label="Usuario"
                  autocomplete="off"
                  :error-messages="formErrors.usuario_id"
                  required
                  @update:model-value="onUsuarioChange"
                >
                  <template #item="{ props, item }">
                    <VListItem v-bind="props">
                      <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                      <VListItemSubtitle>RUT: {{ item.raw.numero_documento }}</VListItemSubtitle>
                    </VListItem>
                  </template>
                </VAutocomplete>
              </VCol>

              <!-- Información del Usuario -->
              <template v-if="usuarioSeleccionado">
                <VCol cols="12">
                  <VAlert type="info" variant="tonal">
                    <div><strong>Nombre:</strong> {{ usuarioSeleccionado.name }} {{ usuarioSeleccionado.apellidos }}</div>
                    <div v-if="usuarioSeleccionado.edad"><strong>Edad:</strong> {{ usuarioSeleccionado.edad }} años</div>
                    <div v-if="usuarioSeleccionado.fecha_nacimiento">
                      <strong>Fecha de Nacimiento:</strong> {{ formatearFecha(usuarioSeleccionado.fecha_nacimiento) }}
                    </div>
                  </VAlert>
                </VCol>

                <!-- Alerta de evaluación anterior -->
                <VCol v-if="evaluacionAnterior" cols="12">
                  <VAlert type="success" variant="tonal">
                    <strong>Última evaluación:</strong> {{ formatearFecha(evaluacionAnterior.fecha_evaluacion) }}
                  </VAlert>
                </VCol>
              </template>

              <!-- Fecha de Evaluación -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Fecha de Evaluación
                </h6>
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.fecha_evaluacion"
                  label="Fecha de Evaluación"
                  type="date"
                  :error-messages="formErrors.fecha_evaluacion"
                  required
                />
              </VCol>

              <!-- Antropometría -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Antropometría
                </h6>
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.peso"
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.peso ? `Anterior: ${evaluacionAnterior.peso} kg` : ''"
                  persistent-hint
                  @input="calcularIMC"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.estatura"
                  label="Estatura (cm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.estatura ? `Anterior: ${evaluacionAnterior.estatura} cm` : ''"
                  persistent-hint
                  @input="calcularIMC"
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.circunferencia_cintura"
                  label="Circunferencia de Cintura (cm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.circunferencia_cintura ? `Anterior: ${evaluacionAnterior.circunferencia_cintura} cm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.circunferencia_brazo_relajado"
                  label="Circunferencia de Brazo Relajado (cm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.circunferencia_brazo_relajado ? `Anterior: ${evaluacionAnterior.circunferencia_brazo_relajado} cm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.circunferencia_brazo_contraccion"
                  label="Circunferencia de Brazo en Contracción (cm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.circunferencia_brazo_contraccion ? `Anterior: ${evaluacionAnterior.circunferencia_brazo_contraccion} cm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.circunferencia_muslo"
                  label="Circunferencia de Muslo (cm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.circunferencia_muslo ? `Anterior: ${evaluacionAnterior.circunferencia_muslo} cm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.circunferencia_pantorrilla"
                  label="Circunferencia de Pantorrilla (cm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.circunferencia_pantorrilla ? `Anterior: ${evaluacionAnterior.circunferencia_pantorrilla} cm` : ''"
                  persistent-hint
                />
              </VCol>

              <!-- Pliegues -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Pliegues Cutáneos (mm)
                </h6>
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_tricipital"
                  label="Pliegue Tricipital (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_tricipital ? `Anterior: ${evaluacionAnterior.pliegue_tricipital} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_bicipital"
                  label="Pliegue Bicipital (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_bicipital ? `Anterior: ${evaluacionAnterior.pliegue_bicipital} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_suprailiaco"
                  label="Pliegue Suprailiaco (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_suprailiaco ? `Anterior: ${evaluacionAnterior.pliegue_suprailiaco} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_subescapular"
                  label="Pliegue Subescapular (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_subescapular ? `Anterior: ${evaluacionAnterior.pliegue_subescapular} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_abdominal"
                  label="Pliegue Abdominal (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_abdominal ? `Anterior: ${evaluacionAnterior.pliegue_abdominal} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_muslo"
                  label="Pliegue Muslo (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_muslo ? `Anterior: ${evaluacionAnterior.pliegue_muslo} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.pliegue_pantorrilla"
                  label="Pliegue Pantorrilla (mm)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.pliegue_pantorrilla ? `Anterior: ${evaluacionAnterior.pliegue_pantorrilla} mm` : ''"
                  persistent-hint
                />
              </VCol>

              <!-- Resultados -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Resultados
                </h6>
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.porcentaje_grasa"
                  label="Porcentaje de Grasa Corporal (%)"
                  type="number"
                  step="0.1"
                  :hint="evaluacionAnterior?.porcentaje_grasa ? `Anterior: ${evaluacionAnterior.porcentaje_grasa}%` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.imc"
                  label="IMC"
                  type="number"
                  step="0.01"
                  readonly
                  :hint="evaluacionAnterior?.imc ? `Anterior: ${evaluacionAnterior.imc}` : 'Se calcula automáticamente'"
                  persistent-hint
                />
              </VCol>

              <!-- Objetivo -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Objetivo del Paciente
                </h6>
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="formData.objetivo_paciente"
                  label="Objetivo del Paciente"
                  rows="3"
                  :hint="evaluacionAnterior?.objetivo_paciente ? `Anterior: ${evaluacionAnterior.objetivo_paciente}` : ''"
                  persistent-hint
                />
              </VCol>

              <!-- Fecha Próxima Evaluación -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Próxima Evaluación
                </h6>
              </VCol>

              <VCol cols="12" md="6">
                <VTextField
                  v-model="formData.fecha_proxima_evaluacion"
                  label="Fecha de Próxima Evaluación"
                  type="date"
                  :hint="evaluacionAnterior?.fecha_proxima_evaluacion ? `Anterior: ${formatearFecha(evaluacionAnterior.fecha_proxima_evaluacion)}` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12" md="6">
                <div class="d-flex flex-wrap gap-2">
                  <VBtn
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="establecerProximaEvaluacion(1)"
                  >
                    +1 mes
                  </VBtn>
                  <VBtn
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="establecerProximaEvaluacion(2)"
                  >
                    +2 meses
                  </VBtn>
                  <VBtn
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="establecerProximaEvaluacion(3)"
                  >
                    +3 meses
                  </VBtn>
                </div>
              </VCol>

              <!-- Notas de la Evaluación -->
              <VCol cols="12">
                <h6 class="text-h6 mb-2 mt-3">
                  Notas de la Evaluación
                </h6>
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="formData.notas"
                  label="Notas (uso interno de la nutricionista)"
                  placeholder="Ej: Paciente presenta buena adherencia al plan, recomendar ajustes en hidratación..."
                  rows="3"
                  :hint="evaluacionAnterior?.notas ? `Notas anteriores: ${evaluacionAnterior.notas}` : ''"
                  persistent-hint
                />
              </VCol>

              <VCol v-if="formErrors.general" cols="12">
                <VAlert type="error" variant="tonal">
                  {{ formErrors.general }}
                </VAlert>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="isDialogVisible = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="isLoading"
            @click="saveEvaluacion"
          >
            {{ isEditing ? 'Actualizar Evaluación' : 'Guardar Evaluación' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
    <!-- Dialog Ver Evaluación -->
    <VDialog
      v-model="isViewDialogVisible"
      max-width="900"
      scrollable
    >
      <VCard v-if="viewingEvaluacion">
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Detalles de Evaluación</span>
          <VBtn
            icon
            size="small"
            variant="text"
            @click="isViewDialogVisible = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>

        <VDivider />

        <VCardText class="pa-6">
          <VRow>
            <!-- Información del Usuario -->
            <VCol cols="12">
              <h6 class="text-h6 mb-3" style="color: #7C3AED;">
                Información del Usuario
              </h6>
            </VCol>

            <VCol cols="12" md="6">
              <div class="d-flex align-center mb-2">
                <strong class="me-2">Usuario:</strong>
                <span>{{ viewingEvaluacion.usuario?.name || '-' }}</span>
              </div>
            </VCol>

            <VCol cols="12" md="6">
              <div class="d-flex align-center mb-2">
                <strong class="me-2">Fecha:</strong>
                <span>{{ formatearFecha(viewingEvaluacion.fecha_evaluacion) }}</span>
              </div>
            </VCol>

            <!-- Mediciones Básicas -->
            <VCol cols="12" class="mt-4">
              <h6 class="text-h6 mb-3" style="color: #7C3AED;">
                Mediciones Básicas
              </h6>
            </VCol>

            <VCol cols="6" md="3">
              <VCard variant="tonal" color="primary">
                <VCardText>
                  <div class="text-caption">Peso</div>
                  <div class="text-h6">{{ viewingEvaluacion.peso || '-' }} kg</div>
                </VCardText>
              </VCard>
            </VCol>

            <VCol cols="6" md="3">
              <VCard variant="tonal" color="primary">
                <VCardText>
                  <div class="text-caption">Estatura</div>
                  <div class="text-h6">{{ viewingEvaluacion.estatura || '-' }} cm</div>
                </VCardText>
              </VCard>
            </VCol>

            <VCol cols="6" md="3">
              <VCard variant="tonal" color="success">
                <VCardText>
                  <div class="text-caption">IMC</div>
                  <div class="text-h6">{{ viewingEvaluacion.imc || '-' }}</div>
                </VCardText>
              </VCard>
            </VCol>

            <VCol cols="6" md="3">
              <VCard variant="tonal" color="warning">
                <VCardText>
                  <div class="text-caption">% Grasa</div>
                  <div class="text-h6">{{ viewingEvaluacion.porcentaje_grasa || '-' }}%</div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Circunferencias -->
            <VCol cols="12" class="mt-4">
              <h6 class="text-h6 mb-3" style="color: #7C3AED;">
                Circunferencias (cm)
              </h6>
            </VCol>

            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Cintura:</strong> {{ viewingEvaluacion.circunferencia_cintura || '-' }} cm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Brazo Relajado:</strong> {{ viewingEvaluacion.circunferencia_brazo_relajado || '-' }} cm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Brazo Contracción:</strong> {{ viewingEvaluacion.circunferencia_brazo_contraccion || '-' }} cm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Muslo:</strong> {{ viewingEvaluacion.circunferencia_muslo || '-' }} cm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Pantorrilla:</strong> {{ viewingEvaluacion.circunferencia_pantorrilla || '-' }} cm</div>
            </VCol>

            <!-- Pliegues Cutáneos -->
            <VCol cols="12" class="mt-4">
              <h6 class="text-h6 mb-3" style="color: #7C3AED;">
                Pliegues Cutáneos (mm)
              </h6>
            </VCol>

            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Tricipital:</strong> {{ viewingEvaluacion.pliegue_tricipital || '-' }} mm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Bicipital:</strong> {{ viewingEvaluacion.pliegue_bicipital || '-' }} mm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Suprailiaco:</strong> {{ viewingEvaluacion.pliegue_suprailiaco || '-' }} mm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Subescapular:</strong> {{ viewingEvaluacion.pliegue_subescapular || '-' }} mm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Abdominal:</strong> {{ viewingEvaluacion.pliegue_abdominal || '-' }} mm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Muslo:</strong> {{ viewingEvaluacion.pliegue_muslo || '-' }} mm</div>
            </VCol>
            <VCol cols="12" md="4">
              <div class="mb-2"><strong>Pantorrilla:</strong> {{ viewingEvaluacion.pliegue_pantorrilla || '-' }} mm</div>
            </VCol>

            <!-- Objetivo del Paciente -->
            <VCol v-if="viewingEvaluacion.objetivo_paciente" cols="12" class="mt-4">
              <h6 class="text-h6 mb-3" style="color: #7C3AED;">
                Objetivo del Paciente
              </h6>
              <VAlert variant="tonal" color="info">
                {{ viewingEvaluacion.objetivo_paciente }}
              </VAlert>
            </VCol>

            <!-- Próxima Evaluación -->
            <VCol v-if="viewingEvaluacion.fecha_proxima_evaluacion" cols="12">
              <div class="mb-2">
                <strong>Próxima Evaluación:</strong> 
                {{ formatearFecha(viewingEvaluacion.fecha_proxima_evaluacion) }}
              </div>
            </VCol>

            <!-- Notas -->
            <VCol v-if="viewingEvaluacion.notas" cols="12" class="mt-4">
              <h6 class="text-h6 mb-3" style="color: #7C3AED;">
                Notas de la Evaluación
              </h6>
              <VAlert variant="tonal" color="secondary">
                {{ viewingEvaluacion.notas }}
              </VAlert>
            </VCol>

            <!-- Métricas Nutricionales Calculadas -->
            <VCol cols="12" class="mt-6">
              <VDivider class="mb-4" />
              <h6 class="text-h5 mb-4 text-center" style="color: #7C3AED;">
                📊 Métricas Nutricionales
              </h6>
            </VCol>

            <!-- Clasificación IMC -->
            <VCol v-if="metricas?.clasificacionIMC" cols="12" md="6">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard 
                    :color="metricas.clasificacionIMC.color" 
                    variant="tonal"
                    v-bind="props"
                    style="cursor: help;"
                  >
                    <VCardText>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2 mb-1">Clasificación IMC</div>
                          <div class="text-h6">{{ metricas.clasificacionIMC.texto }}</div>
                          <div class="text-caption mt-1">IMC: {{ viewingEvaluacion.imc }}</div>
                        </div>
                        <VIcon icon="tabler-info-circle" size="20" class="text-medium-emphasis" />
                      </div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 300px;">
                  <strong>Índice de Masa Corporal</strong><br>
                  Fórmula: Peso (kg) / Estatura² (m)<br>
                  • < 18.5: Bajo peso<br>
                  • 18.5-24.9: Normal<br>
                  • 25-29.9: Sobrepeso<br>
                  • ≥ 30: Obesidad
                </div>
              </VTooltip>
            </VCol>

            <!-- Índice Cintura-Estatura -->
            <VCol v-if="metricas?.indiceCinturaEstatura" cols="12" md="6">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard 
                    :color="metricas.indiceCinturaEstatura.color" 
                    variant="tonal"
                    v-bind="props"
                    style="cursor: help;"
                  >
                    <VCardText>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2 mb-1">Índice Cintura/Estatura</div>
                          <div class="text-h6">{{ metricas.indiceCinturaEstatura.clasificacion }}</div>
                          <div class="text-caption mt-1">Ratio: {{ metricas.indiceCinturaEstatura.valor }}</div>
                        </div>
                        <VIcon icon="tabler-info-circle" size="20" class="text-medium-emphasis" />
                      </div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 300px;">
                  <strong>Índice Cintura-Estatura</strong><br>
                  Fórmula: Cintura (cm) / Estatura (cm)<br>
                  • < 0.5: Saludable (bajo riesgo)<br>
                  • ≥ 0.5: Riesgo elevado cardiometabólico<br>
                  <em>Mejor predictor de riesgo que el IMC</em>
                </div>
              </VTooltip>
            </VCol>

            <!-- Composición Corporal -->
            <VCol cols="12" class="mt-3">
              <h6 class="text-subtitle-1 mb-2" style="color: #7C3AED;">
                Composición Corporal
              </h6>
            </VCol>

            <VCol cols="6" md="3">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText class="text-center">
                      <VIcon icon="tabler-info-circle" size="16" class="text-medium-emphasis mb-1" />
                      <div class="text-caption">Masa Grasa</div>
                      <div class="text-h6 text-warning">{{ metricas?.masaGrasa || '-' }} kg</div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Masa Grasa</strong><br>
                  Peso × (% Grasa / 100)<br>
                  <em>Tejido adiposo total del cuerpo</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol cols="6" md="3">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText class="text-center">
                      <VIcon icon="tabler-info-circle" size="16" class="text-medium-emphasis mb-1" />
                      <div class="text-caption">Masa Magra</div>
                      <div class="text-h6 text-success">{{ metricas?.masaMagra || '-' }} kg</div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Masa Magra</strong><br>
                  Peso - Masa Grasa<br>
                  <em>Músculos, huesos, órganos y agua</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol cols="6" md="3">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText class="text-center">
                      <VIcon icon="tabler-info-circle" size="16" class="text-medium-emphasis mb-1" />
                      <div class="text-caption">Peso Ideal</div>
                      <div class="text-h6 text-info">{{ metricas?.pesoIdeal || '-' }} kg</div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Peso Ideal (Fórmula de Devine)</strong><br>
                  50 + 0.91 × (Estatura - 152.4)<br>
                  <em>Referencia para objetivos nutricionales</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol cols="6" md="3">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText class="text-center">
                      <VIcon icon="tabler-info-circle" size="16" class="text-medium-emphasis mb-1" />
                      <div class="text-caption">Suma Pliegues</div>
                      <div class="text-h6">{{ metricas?.sumaPliegues || '-' }} mm</div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Suma de Pliegues Cutáneos</strong><br>
                  Total de los 7 pliegues medidos<br>
                  <em>Indicador de grasa subcutánea</em>
                </div>
              </VTooltip>
            </VCol>

            <!-- Necesidades Calóricas -->
            <VCol v-if="metricas?.tmb" cols="12" class="mt-3">
              <h6 class="text-subtitle-1 mb-2" style="color: #7C3AED;">
                Necesidades Calóricas Estimadas
              </h6>
            </VCol>

            <VCol v-if="metricas?.tmb" cols="12">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="tonal" color="primary" v-bind="props" style="cursor: help;">
                    <VCardText>
                      <VRow>
                        <VCol cols="12" md="6">
                          <div class="d-flex align-center mb-3">
                            <VIcon icon="tabler-info-circle" size="20" class="me-2 text-medium-emphasis" />
                            <div>
                              <strong>TMB (Tasa Metabólica Basal):</strong>
                              <span class="text-h6 ms-2">{{ metricas.tmb }} kcal/día</span>
                            </div>
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Calorías necesarias en reposo total
                          </div>
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 350px;">
                  <strong>Tasa Metabólica Basal (Harris-Benedict)</strong><br>
                  Fórmula: 10×Peso + 6.25×Estatura - 5×Edad + 5<br>
                  <em>Energía mínima para funciones vitales: respiración, circulación, temperatura corporal</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol v-if="metricas?.caloriasSedentario" cols="12" md="6">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">Sedentario <VIcon icon="tabler-info-circle" size="16" class="ms-1" /></div>
                          <div class="text-caption">Poco o ningún ejercicio</div>
                        </div>
                        <div class="text-h6 text-primary">{{ metricas.caloriasSedentario }} kcal</div>
                      </div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Nivel Sedentario</strong><br>
                  TMB × 1.2<br>
                  <em>Trabajo de escritorio, poco o ningún ejercicio</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol v-if="metricas?.caloriasLigero" cols="12" md="6">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">Actividad Ligera <VIcon icon="tabler-info-circle" size="16" class="ms-1" /></div>
                          <div class="text-caption">Ejercicio 1-3 días/semana</div>
                        </div>
                        <div class="text-h6 text-success">{{ metricas.caloriasLigero }} kcal</div>
                      </div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Actividad Ligera</strong><br>
                  TMB × 1.375<br>
                  <em>Ejercicio ligero 1-3 días por semana</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol v-if="metricas?.caloriasModerado" cols="12" md="6">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">Actividad Moderada <VIcon icon="tabler-info-circle" size="16" class="ms-1" /></div>
                          <div class="text-caption">Ejercicio 3-5 días/semana</div>
                        </div>
                        <div class="text-h6 text-warning">{{ metricas.caloriasModerado }} kcal</div>
                      </div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Actividad Moderada</strong><br>
                  TMB × 1.55<br>
                  <em>Ejercicio moderado 3-5 días por semana</em>
                </div>
              </VTooltip>
            </VCol>

            <VCol v-if="metricas?.caloriasActivo" cols="12" md="6">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VCard variant="outlined" v-bind="props" style="cursor: help;">
                    <VCardText>
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-2">Muy Activo <VIcon icon="tabler-info-circle" size="16" class="ms-1" /></div>
                          <div class="text-caption">Ejercicio 6-7 días/semana</div>
                        </div>
                        <div class="text-h6 text-error">{{ metricas.caloriasActivo }} kcal</div>
                      </div>
                    </VCardText>
                  </VCard>
                </template>
                <div class="pa-2" style="max-width: 250px;">
                  <strong>Muy Activo</strong><br>
                  TMB × 1.725<br>
                  <em>Ejercicio intenso 6-7 días por semana o trabajo físico</em>
                </div>
              </VTooltip>
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            variant="outlined"
            @click="isViewDialogVisible = false"
          >
            Cerrar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
