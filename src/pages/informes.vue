<script setup>
import { useAuthStore } from '@/stores/auth'
import { useEvaluacionesStore } from '@/stores/evaluaciones'
import { useInformesStore } from '@/stores/informes'
import { useUsersStore } from '@/stores/users'
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { computed, onMounted, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { useRouter } from 'vue-router'

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

definePage({
  meta: {
    subject: 'informes',
    action: 'read',
  },
})

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const evaluacionesStore = useEvaluacionesStore()
const informesStore = useInformesStore()

// Verificar que el usuario sea admin o superadmin
if (authStore.userRole !== 'admin' && authStore.userRole !== 'superadmin') {
  router.push('/')
}

// State
const allUsers = ref([])
const selectedUserId = ref(null)
const evaluaciones = ref([])
const isLoading = ref(false)
const pesoImcChartRef = ref(null)
const grasaChartRef = ref(null)
const circunferenciasChartRef = ref(null)
const plieguesChartRef = ref(null)

// Estado para historial de informes
const mostrarHistorialInformes = ref(false)
const historialInformes = ref([])

// Estado para modal de notas/objetivo
const dialogDetalles = ref(false)
const detalleSeleccionado = ref({
  objetivo: '',
  notas: '',
  fecha: ''
})

// Estado para el plan de alimentación
const planesAlimentacionEjemplo = {
  1: { // Carlos Mendoza Silva
    pautas: [
      { 
        id: 1, 
        nombre: 'Desayuno', 
        horario: '08:00', 
        alimentacion: '2 tazas de avena con 1 scoop de proteína, 1 plátano, 15g de almendras, 1 cucharada de miel' 
      },
      { 
        id: 2, 
        nombre: 'Colación AM', 
        horario: '11:00', 
        alimentacion: '1 yogurt griego natural (200g), 30g de frutos secos mixtos, 1 manzana' 
      },
      { 
        id: 3, 
        nombre: 'Almuerzo', 
        horario: '14:00', 
        alimentacion: '200g de pechuga de pollo a la plancha, 1 taza de arroz integral, ensalada mixta con aceite de oliva, 1 palta pequeña' 
      },
      { 
        id: 4, 
        nombre: 'Colación PM', 
        horario: '17:30', 
        alimentacion: '2 rebanadas de pan integral con palta y huevo, 1 batido de frutas con proteína' 
      },
      { 
        id: 5, 
        nombre: 'Cena', 
        horario: '20:30', 
        alimentacion: '200g de salmón al horno, 200g de papas asadas, verduras al vapor (brócoli y zanahoria), ensalada verde' 
      }
    ],
    macros: {
      carbohidratos: '320g',
      proteinas: '180g',
      grasas: '85g',
      calorias: '2850 kcal'
    },
    hidratacion: 'Consumir mínimo 3 litros de agua al día. Aumentar a 4 litros en días de entrenamiento intenso. Evitar bebidas azucaradas y limitar el café a 2 tazas diarias.',
    sustituciones: 'Reemplazar azúcar blanca por stevia o eritritol. Para endulzar batidos usar dátiles o miel de abeja. Evitar productos procesados con azúcares añadidos.',
    consumoVerduras: 'Incluir al menos 5 porciones de verduras al día. Priorizar verduras de hoja verde (espinaca, lechuga, acelga) y crucíferas (brócoli, coliflor). Consumir en almuerzo y cena.',
    notasAdicionales: 'Plan diseñado para aumento de masa muscular. Ajustar porciones según respuesta. Realizar 5-6 comidas diarias. Pre-entreno: 1 hora antes consumir carbohidratos complejos. Post-entreno: dentro de 30 min consumir proteína + carbohidratos de rápida absorción.',
    suplementos: [
      { id: 1, nombre: 'Proteína Whey', dosis: '30g (1 scoop)', indicaciones: 'Post-entreno inmediato y en desayuno' },
      { id: 2, nombre: 'Creatina Monohidrato', dosis: '5g', indicaciones: 'Diaria, preferentemente post-entreno con carbohidratos' },
      { id: 3, nombre: 'Omega 3', dosis: '2000mg', indicaciones: 'Con almuerzo y cena' },
      { id: 4, nombre: 'Multivitamínico', dosis: '1 cápsula', indicaciones: 'En el desayuno' },
      { id: 5, nombre: 'BCAA', dosis: '10g', indicaciones: 'Durante el entrenamiento, diluido en agua' }
    ]
  }
}

const planAlimentacion = ref({
  pautas: [
    { id: 1, nombre: '', horario: '', alimentacion: '' },
    { id: 2, nombre: '', horario: '', alimentacion: '' },
    { id: 3, nombre: '', horario: '', alimentacion: '' },
    { id: 4, nombre: '', horario: '', alimentacion: '' },
    { id: 5, nombre: '', horario: '', alimentacion: '' }
  ],
  macros: {
    carbohidratos: '',
    proteinas: '',
    grasas: '',
    calorias: ''
  },
  hidratacion: '',
  sustituciones: '',
  consumoVerduras: '',
  notasAdicionales: '',
  suplementos: [
    { id: 1, nombre: '', dosis: '', indicaciones: '' }
  ]
})

const mostrarPlanAlimentacion = ref(false)

// Plan de Alimentación Competitivo
const planCompetitivo = ref({
  pautasPrecompetencia: [
    { id: 1, nombre: '', horario: '', alimentacion: '' },
    { id: 2, nombre: '', horario: '', alimentacion: '' },
    { id: 3, nombre: '', horario: '', alimentacion: '' }
  ],
  pautasDuranteCompetencia: [
    { id: 1, nombre: '', horario: '', alimentacion: '' },
    { id: 2, nombre: '', horario: '', alimentacion: '' }
  ],
  recomendacionesGenerales: ''
})

const mostrarPlanCompetitivo = ref(false)

// Computed para detectar si el plan tiene información
const planTieneInformacion = computed(() => {
  // Verificar si al menos una pauta tiene alimentación
  const tienePautas = planAlimentacion.value.pautas.some(p => p.alimentacion && p.alimentacion.trim() !== '')
  
  // Verificar si tiene macros
  const tieneMacros = Object.values(planAlimentacion.value.macros).some(v => v && v.trim() !== '')
  
  // Verificar si tiene indicaciones
  const tieneIndicaciones = planAlimentacion.value.hidratacion || 
                            planAlimentacion.value.sustituciones || 
                            planAlimentacion.value.consumoVerduras || 
                            planAlimentacion.value.notasAdicionales
  
  // Verificar si tiene suplementos con nombre
  const tieneSuplemento = planAlimentacion.value.suplementos.some(s => s.nombre && s.nombre.trim() !== '')
  
  return tienePautas || tieneMacros || tieneIndicaciones || tieneSuplemento
})

// Computed para detectar si el plan competitivo tiene información
const planCompetitivoTieneInformacion = computed(() => {
  const tienePrecomp = planCompetitivo.value.pautasPrecompetencia.some(p => p.alimentacion && p.alimentacion.trim() !== '')
  const tieneDurante = planCompetitivo.value.pautasDuranteCompetencia.some(p => p.alimentacion && p.alimentacion.trim() !== '')
  const tieneRecomendaciones = planCompetitivo.value.recomendacionesGenerales && planCompetitivo.value.recomendacionesGenerales.trim() !== ''
  
  return tienePrecomp || tieneDurante || tieneRecomendaciones
})

// Computed
const usuarioSeleccionado = computed(() => {
  if (!selectedUserId.value) return null
  return allUsers.value.find(u => u.id === selectedUserId.value)
})

const evaluacionesOrdenadas = computed(() => {
  return [...evaluaciones.value].sort((a, b) => 
    new Date(a.fecha_evaluacion) - new Date(b.fecha_evaluacion)
  )
})

const ultimaEvaluacion = computed(() => {
  if (evaluacionesOrdenadas.value.length === 0) return null
  return evaluacionesOrdenadas.value[evaluacionesOrdenadas.value.length - 1]
})

const primeraEvaluacion = computed(() => {
  if (evaluacionesOrdenadas.value.length === 0) return null
  return evaluacionesOrdenadas.value[0]
})

const chartLabels = computed(() => {
  return evaluacionesOrdenadas.value.map(e => formatearFecha(e.fecha_evaluacion))
})

// Gráfico de Peso e IMC
const pesoImcData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Peso (kg)',
      data: evaluacionesOrdenadas.value.map(e => e.peso),
      borderColor: '#7C3AED',
      backgroundColor: 'rgba(124, 58, 237, 0.1)',
      tension: 0.4,
      yAxisID: 'y',
    },
    {
      label: 'IMC',
      data: evaluacionesOrdenadas.value.map(e => e.imc),
      borderColor: '#EC4899',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      tension: 0.4,
      yAxisID: 'y1',
    }
  ]
}))

// Gráfico de Grasa Corporal
const grasaData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: '% Grasa Corporal',
      data: evaluacionesOrdenadas.value.map(e => e.porcentaje_grasa),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }
  ]
}))

// Gráfico de Circunferencias
const circunferenciasData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Cintura (cm)',
      data: evaluacionesOrdenadas.value.map(e => e.circunferencia_cintura),
      borderColor: '#F59E0B',
      tension: 0.4,
    },
    {
      label: 'Brazo Relajado (cm)',
      data: evaluacionesOrdenadas.value.map(e => e.circunferencia_brazo_relajado),
      borderColor: '#3B82F6',
      tension: 0.4,
    },
    {
      label: 'Brazo Contracción (cm)',
      data: evaluacionesOrdenadas.value.map(e => e.circunferencia_brazo_contraccion),
      borderColor: '#8B5CF6',
      tension: 0.4,
    },
    {
      label: 'Muslo (cm)',
      data: evaluacionesOrdenadas.value.map(e => e.circunferencia_muslo),
      borderColor: '#EC4899',
      tension: 0.4,
    },
    {
      label: 'Pantorrilla (cm)',
      data: evaluacionesOrdenadas.value.map(e => e.circunferencia_pantorrilla),
      borderColor: '#14B8A6',
      tension: 0.4,
    },
  ]
}))

// Gráfico de Pliegues
const plieguesData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Tricipital (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_tricipital),
      borderColor: '#EF4444',
      tension: 0.4,
    },
    {
      label: 'Bicipital (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_bicipital),
      borderColor: '#F59E0B',
      tension: 0.4,
    },
    {
      label: 'Suprailiaco (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_suprailiaco),
      borderColor: '#10B981',
      tension: 0.4,
    },
    {
      label: 'Subescapular (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_subescapular),
      borderColor: '#3B82F6',
      tension: 0.4,
    },
    {
      label: 'Abdominal (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_abdominal),
      borderColor: '#8B5CF6',
      tension: 0.4,
    },
    {
      label: 'Muslo (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_muslo),
      borderColor: '#EC4899',
      tension: 0.4,
    },
    {
      label: 'Pantorrilla (mm)',
      data: evaluacionesOrdenadas.value.map(e => e.pliegue_pantorrilla),
      borderColor: '#14B8A6',
      tension: 0.4,
    },
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#fff'
      }
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        color: '#fff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    x: {
      ticks: {
        color: '#fff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
}

const pesoImcOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#fff'
      }
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Peso (kg)',
        color: '#fff'
      },
      ticks: {
        color: '#fff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'IMC',
        color: '#fff'
      },
      ticks: {
        color: '#fff'
      },
      grid: {
        drawOnChartArea: false,
        color: 'rgba(255, 255, 255, 0.1)'
      },
    },
    x: {
      ticks: {
        color: '#fff'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
}

// Methods
const loadUsers = async () => {
  const result = await usersStore.fetchUsers()
  if (result.success) {
    allUsers.value = usersStore.users.filter(u => u.role === 'user')
  }
}

const loadEvaluaciones = async () => {
  if (!selectedUserId.value) return
  
  isLoading.value = true
  const result = await evaluacionesStore.fetchEvaluacionesPorUsuario(selectedUserId.value, 'asc')
  if (result.success) {
    evaluaciones.value = result.data
  }
  isLoading.value = false
}

const formatearFecha = fecha => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatearFechaHora = fecha => {
  if (!fecha) return '-'
  try {
    return new Date(fecha).toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return fecha
  }
}

const abrirDetalles = (objetivo, notas, fecha) => {
  detalleSeleccionado.value = {
    objetivo,
    notas,
    fecha: formatearFecha(fecha)
  }
  dialogDetalles.value = true
}

const calcularCambio = (actual, inicial) => {
  if (!actual || !inicial) return null
  const cambio = actual - inicial
  const porcentaje = ((cambio / inicial) * 100).toFixed(1)
  return { cambio: cambio.toFixed(1), porcentaje }
}

// Funciones para plan de alimentación
const agregarPauta = () => {
  const nuevoId = Math.max(...planAlimentacion.value.pautas.map(p => p.id)) + 1
  planAlimentacion.value.pautas.push({
    id: nuevoId,
    nombre: '',
    horario: '',
    alimentacion: ''
  })
}

const eliminarPauta = (id) => {
  planAlimentacion.value.pautas = planAlimentacion.value.pautas.filter(p => p.id !== id)
}

const agregarSuplemento = () => {
  const nuevoId = Math.max(...planAlimentacion.value.suplementos.map(s => s.id)) + 1
  planAlimentacion.value.suplementos.push({
    id: nuevoId,
    nombre: '',
    dosis: '',
    indicaciones: ''
  })
}

const eliminarSuplemento = (id) => {
  if (planAlimentacion.value.suplementos.length > 1) {
    planAlimentacion.value.suplementos = planAlimentacion.value.suplementos.filter(s => s.id !== id)
  }
}

// Funciones para plan competitivo
const agregarPautaPrecompetencia = () => {
  const nuevoId = Math.max(...planCompetitivo.value.pautasPrecompetencia.map(p => p.id)) + 1
  planCompetitivo.value.pautasPrecompetencia.push({
    id: nuevoId,
    nombre: '',
    horario: '',
    alimentacion: ''
  })
}

const eliminarPautaPrecompetencia = (id) => {
  planCompetitivo.value.pautasPrecompetencia = planCompetitivo.value.pautasPrecompetencia.filter(p => p.id !== id)
}

const agregarPautaDuranteCompetencia = () => {
  const nuevoId = Math.max(...planCompetitivo.value.pautasDuranteCompetencia.map(p => p.id)) + 1
  planCompetitivo.value.pautasDuranteCompetencia.push({
    id: nuevoId,
    nombre: '',
    horario: '',
    alimentacion: ''
  })
}

const eliminarPautaDuranteCompetencia = (id) => {
  planCompetitivo.value.pautasDuranteCompetencia = planCompetitivo.value.pautasDuranteCompetencia.filter(p => p.id !== id)
}

// Guardar plan de alimentación en localStorage
const guardarPlanAlimentacion = () => {
  if (!selectedUserId.value) return
  
  const key = `plan_alimentacion_${selectedUserId.value}`
  localStorage.setItem(key, JSON.stringify(planAlimentacion.value))
}

// Guardar plan competitivo en localStorage
const guardarPlanCompetitivo = () => {
  if (!selectedUserId.value) return
  
  const key = `plan_competitivo_${selectedUserId.value}`
  localStorage.setItem(key, JSON.stringify(planCompetitivo.value))
}

// Cargar plan de alimentación desde localStorage o datos de ejemplo
const cargarPlanAlimentacion = () => {
  if (!selectedUserId.value) {
    // Resetear plan si no hay usuario seleccionado
    planAlimentacion.value = {
      pautas: [
        { id: 1, nombre: '', horario: '', alimentacion: '' },
        { id: 2, nombre: '', horario: '', alimentacion: '' },
        { id: 3, nombre: '', horario: '', alimentacion: '' },
        { id: 4, nombre: '', horario: '', alimentacion: '' },
        { id: 5, nombre: '', horario: '', alimentacion: '' }
      ],
      macros: { carbohidratos: '', proteinas: '', grasas: '', calorias: '' },
      hidratacion: '',
      sustituciones: '',
      consumoVerduras: '',
      notasAdicionales: '',
      suplementos: [{ id: 1, nombre: '', dosis: '', indicaciones: '' }]
    }
    return
  }
  
  // Intentar cargar desde localStorage
  const key = `plan_alimentacion_${selectedUserId.value}`
  const planGuardado = localStorage.getItem(key)
  
  if (planGuardado) {
    planAlimentacion.value = JSON.parse(planGuardado)
    // Mostrar automáticamente si tiene información
    mostrarPlanAlimentacion.value = planTieneInformacion.value
  } else if (planesAlimentacionEjemplo[selectedUserId.value]) {
    // Si no hay plan guardado, usar datos de ejemplo
    planAlimentacion.value = JSON.parse(JSON.stringify(planesAlimentacionEjemplo[selectedUserId.value]))
    // Mostrar automáticamente ya que tiene datos de ejemplo
    mostrarPlanAlimentacion.value = true
  } else {
    // Resetear a valores vacíos
    planAlimentacion.value = {
      pautas: [
        { id: 1, nombre: '', horario: '', alimentacion: '' },
        { id: 2, nombre: '', horario: '', alimentacion: '' },
        { id: 3, nombre: '', horario: '', alimentacion: '' },
        { id: 4, nombre: '', horario: '', alimentacion: '' },
        { id: 5, nombre: '', horario: '', alimentacion: '' }
      ],
      macros: { carbohidratos: '', proteinas: '', grasas: '', calorias: '' },
      hidratacion: '',
      sustituciones: '',
      consumoVerduras: '',
      notasAdicionales: '',
      suplementos: [{ id: 1, nombre: '', dosis: '', indicaciones: '' }]
    }
  }
  
  // Cargar plan competitivo
  const keyCompetitivo = `plan_competitivo_${selectedUserId.value}`
  const planCompetitivoGuardado = localStorage.getItem(keyCompetitivo)
  
  if (planCompetitivoGuardado) {
    planCompetitivo.value = JSON.parse(planCompetitivoGuardado)
    // Mostrar automáticamente si tiene información
    if (planCompetitivoTieneInformacion.value) {
      mostrarPlanCompetitivo.value = true
      mostrarPlanAlimentacion.value = false // Desactivar el otro
    }
  } else {
    // Resetear plan competitivo
    planCompetitivo.value = {
      pautasPrecompetencia: [
        { id: 1, nombre: '', horario: '', alimentacion: '' },
        { id: 2, nombre: '', horario: '', alimentacion: '' },
        { id: 3, nombre: '', horario: '', alimentacion: '' }
      ],
      pautasDuranteCompetencia: [
        { id: 1, nombre: '', horario: '', alimentacion: '' },
        { id: 2, nombre: '', horario: '', alimentacion: '' }
      ],
      recomendacionesGenerales: ''
    }
  }
}

const exportarPDF = async () => {
  if (!usuarioSeleccionado.value || evaluaciones.value.length === 0) {
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Fondo de encabezado
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Título
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('Informe de Evolución Nutricional', pageWidth / 2, 15, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${formatearFecha(new Date().toISOString())}`, pageWidth / 2, 25, { align: 'center' })
  
  yPosition = 45

  // Información del profesional (Admin) al principio
  if (authStore.currentUser) {
    doc.setFillColor(124, 58, 237)
    doc.rect(14, yPosition - 5, pageWidth - 28, 28, 'F')
    
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Profesional', 18, yPosition)
    yPosition += 7
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${authStore.currentUser.name} ${authStore.currentUser.apellidos || ''}`, 18, yPosition)
    
    // Agregar profesión y universidad si existen
    if (authStore.currentUser.profesion || authStore.currentUser.universidad) {
      yPosition += 5
      const infoProfesional = []
      if (authStore.currentUser.profesion) infoProfesional.push(authStore.currentUser.profesion)
      if (authStore.currentUser.universidad) infoProfesional.push(authStore.currentUser.universidad)
      doc.text(infoProfesional.join(' - '), 18, yPosition)
    }
    
    if (authStore.currentUser.numero_documento) {
      doc.text(`RUT: ${authStore.currentUser.numero_documento}`, pageWidth / 2, yPosition - 5)
    }
    
    yPosition += 12
  }

  // Información del paciente - Card estilo
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, yPosition - 5, pageWidth - 28, 35, 3, 3, 'F')
  
  doc.setFontSize(14)
  doc.setTextColor(124, 58, 237)
  doc.setFont('helvetica', 'bold')
  doc.text('Información del Paciente', 18, yPosition)
  yPosition += 8

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nombre: ${usuarioSeleccionado.value.name} ${usuarioSeleccionado.value.apellidos}`, 18, yPosition)
  yPosition += 6
  doc.text(`RUT: ${usuarioSeleccionado.value.numero_documento}`, 18, yPosition)
  if (usuarioSeleccionado.value.edad) {
    doc.text(`Edad: ${usuarioSeleccionado.value.edad} años`, pageWidth / 2, yPosition)
  }
  yPosition += 6
  doc.text(`Total de Evaluaciones: ${evaluaciones.value.length}`, 18, yPosition)
  doc.text(`Primera: ${formatearFecha(primeraEvaluacion.value.fecha_evaluacion)}`, pageWidth / 2, yPosition)
  yPosition += 6
  doc.text(`Última: ${formatearFecha(ultimaEvaluacion.value.fecha_evaluacion)}`, 18, yPosition)
  
  // Agregar próxima evaluación si existe
  if (ultimaEvaluacion.value.fecha_proxima_evaluacion) {
    doc.setTextColor(245, 158, 11) // Color naranja
    doc.text(`Próxima: ${formatearFecha(ultimaEvaluacion.value.fecha_proxima_evaluacion)}`, pageWidth / 2, yPosition)
    doc.setTextColor(0, 0, 0) // Volver a negro
  }
  
  yPosition += 15

  // Resumen de cambios - Tabla bonita
  if (primeraEvaluacion.value && ultimaEvaluacion.value) {
    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen de Cambios', 14, yPosition)
    yPosition += 5

    const cambiosData = [
      [
        'Peso',
        `${primeraEvaluacion.value.peso} kg`,
        `${ultimaEvaluacion.value.peso} kg`,
        `${calcularCambio(ultimaEvaluacion.value.peso, primeraEvaluacion.value.peso).cambio} kg (${calcularCambio(ultimaEvaluacion.value.peso, primeraEvaluacion.value.peso).porcentaje}%)`
      ],
      [
        'IMC',
        primeraEvaluacion.value.imc,
        ultimaEvaluacion.value.imc,
        `${calcularCambio(ultimaEvaluacion.value.imc, primeraEvaluacion.value.imc).cambio} (${calcularCambio(ultimaEvaluacion.value.imc, primeraEvaluacion.value.imc).porcentaje}%)`
      ],
      [
        '% Grasa Corporal',
        `${primeraEvaluacion.value.porcentaje_grasa}%`,
        `${ultimaEvaluacion.value.porcentaje_grasa}%`,
        `${calcularCambio(ultimaEvaluacion.value.porcentaje_grasa, primeraEvaluacion.value.porcentaje_grasa).cambio}% (${calcularCambio(ultimaEvaluacion.value.porcentaje_grasa, primeraEvaluacion.value.porcentaje_grasa).porcentaje}%)`
      ],
      [
        'Cintura',
        `${primeraEvaluacion.value.circunferencia_cintura} cm`,
        `${ultimaEvaluacion.value.circunferencia_cintura} cm`,
        `${calcularCambio(ultimaEvaluacion.value.circunferencia_cintura, primeraEvaluacion.value.circunferencia_cintura).cambio} cm`
      ]
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Inicial', 'Actual', 'Cambio']],
      body: cambiosData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        3: { fontStyle: 'bold' }
      }
    })

    yPosition = doc.lastAutoTable.finalY + 12
  }

  // Verificar si hay espacio en la página actual, si no, agregar nueva página
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = 20
  }

  // Tabla detallada de evaluaciones
  doc.setFontSize(14)
  doc.setTextColor(124, 58, 237)
  doc.setFont('helvetica', 'bold')
  doc.text('Historial Detallado de Evaluaciones', 14, yPosition)
  yPosition += 5

  const tableData = evaluacionesOrdenadas.value.map(e => [
    formatearFecha(e.fecha_evaluacion),
    e.peso,
    e.estatura,
    e.imc,
    `${e.porcentaje_grasa}%`,
    e.circunferencia_cintura,
    e.circunferencia_brazo_relajado,
    e.circunferencia_brazo_contraccion,
    e.circunferencia_muslo,
    e.circunferencia_pantorrilla,
    e.pliegue_tricipital,
    e.pliegue_bicipital,
    e.pliegue_suprailiaco,
    e.pliegue_subescapular,
    e.pliegue_abdominal,
    e.pliegue_muslo,
    e.pliegue_pantorrilla
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [[
      'Fecha',
      'Peso',
      'Est.',
      'IMC',
      'Grasa',
      'Cint.',
      'Br.R',
      'Br.C',
      'Musl',
      'Pant',
      'Tri',
      'Bic',
      'Sup',
      'Sub',
      'Abd',
      'PMu',
      'PPa'
    ]],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 6, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 7, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 10, left: 10, right: 10 }
  })

  // Plan de Alimentación
  if (mostrarPlanAlimentacion.value) {
    doc.addPage()
    yPosition = 20

    // Título del Plan
    doc.setFillColor(124, 58, 237)
    doc.rect(0, 0, pageWidth, 25, 'F')
    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Plan de Alimentación', pageWidth / 2, 15, { align: 'center' })
    yPosition = 35

    // Pautas de Alimentación
    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Pautas de Alimentación', 14, yPosition)
    yPosition += 5

    const pautasData = planAlimentacion.value.pautas
      .filter(p => p.nombre || p.horario || p.alimentacion)
      .map(p => [p.nombre, p.horario, p.alimentacion])

    if (pautasData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Comida', 'Horario', 'Alimentación']],
        body: pautasData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 125 }
        }
      })
      yPosition = doc.lastAutoTable.finalY + 10
    }

    // Macros Totales
    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Distribución de Macronutrientes', 14, yPosition)
    yPosition += 5

    const macrosData = [
      ['Carbohidratos', planAlimentacion.value.macros.carbohidratos || '-'],
      ['Proteínas', planAlimentacion.value.macros.proteinas || '-'],
      ['Grasas', planAlimentacion.value.macros.grasas || '-'],
      ['Calorías Totales', planAlimentacion.value.macros.calorias || '-']
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Macronutriente', 'Cantidad']],
      body: macrosData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'center', cellWidth: 50 }
      }
    })
    yPosition = doc.lastAutoTable.finalY + 10

    // Información Adicional
    doc.setFontSize(14)
    doc.setTextColor(124, 58, 237)
    doc.text('Indicaciones y Recomendaciones', 14, yPosition)
    yPosition += 7

    // Hidratación
    if (planAlimentacion.value.hidratacion) {
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('¿Cómo me hidrato?', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const hidratacionLines = doc.splitTextToSize(planAlimentacion.value.hidratacion, pageWidth - 28)
      doc.text(hidratacionLines, 14, yPosition)
      yPosition += hidratacionLines.length * 5 + 5
    }

    // Sustituciones
    if (planAlimentacion.value.sustituciones) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('¿Cómo sustituir el azúcar?', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const sustLines = doc.splitTextToSize(planAlimentacion.value.sustituciones, pageWidth - 28)
      doc.text(sustLines, 14, yPosition)
      yPosition += sustLines.length * 5 + 5
    }

    // Consumo de Verduras
    if (planAlimentacion.value.consumoVerduras) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Consumo de Verduras', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const verdurasLines = doc.splitTextToSize(planAlimentacion.value.consumoVerduras, pageWidth - 28)
      doc.text(verdurasLines, 14, yPosition)
      yPosition += verdurasLines.length * 5 + 5
    }

    // Notas Adicionales
    if (planAlimentacion.value.notasAdicionales) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Notas Adicionales', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const notasLines = doc.splitTextToSize(planAlimentacion.value.notasAdicionales, pageWidth - 28)
      doc.text(notasLines, 14, yPosition)
      yPosition += notasLines.length * 5 + 5
    }

    // Suplementos
    const suplementosConDatos = planAlimentacion.value.suplementos.filter(s => s.nombre)
    if (suplementosConDatos.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(124, 58, 237)
      doc.setFont('helvetica', 'bold')
      doc.text('Suplementación', 14, yPosition)
      yPosition += 5

      const suplementosData = suplementosConDatos.map(s => [
        s.nombre,
        s.dosis || '-',
        s.indicaciones || '-'
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Suplemento', 'Dosis', 'Indicaciones']],
        body: suplementosData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 30 },
          2: { cellWidth: 110 }
        }
      })
    }
  }

  // Plan de Alimentación Competitivo
  if (mostrarPlanCompetitivo.value) {
    doc.addPage()
    yPosition = 20

    // Título del Plan Competitivo
    doc.setFillColor(16, 185, 129) // Verde para competitivo
    doc.rect(0, 0, pageWidth, 25, 'F')
    doc.setFontSize(20)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('Plan de Alimentación Competitivo', pageWidth / 2, 15, { align: 'center' })
    yPosition = 35

    // Pautas Pre-competencia
    const pautasPrecompConDatos = planCompetitivo.value.pautasPrecompetencia.filter(p => p.alimentacion)
    if (pautasPrecompConDatos.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text('Pautas Pre-competencia', 14, yPosition)
      yPosition += 5

      const pautasPreData = pautasPrecompConDatos.map(p => [
        p.nombre || '-',
        p.horario || '-',
        p.alimentacion || '-'
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Comida', 'Horario', 'Alimentación']],
        body: pautasPreData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 125 }
        }
      })

      yPosition = doc.lastAutoTable.finalY + 10
    }

    // Pautas Durante Competencia
    const pautasDuranteConDatos = planCompetitivo.value.pautasDuranteCompetencia.filter(p => p.alimentacion)
    if (pautasDuranteConDatos.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text('Pautas Durante Competencia', 14, yPosition)
      yPosition += 5

      const pautasDuranteData = pautasDuranteConDatos.map(p => [
        p.nombre || '-',
        p.horario || '-',
        p.alimentacion || '-'
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Comida', 'Horario', 'Alimentación']],
        body: pautasDuranteData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 125 }
        }
      })

      yPosition = doc.lastAutoTable.finalY + 10
    }

    // Recomendaciones Generales
    if (planCompetitivo.value.recomendacionesGenerales) {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text('Recomendaciones Generales', 14, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      const recomendacionesLines = doc.splitTextToSize(planCompetitivo.value.recomendacionesGenerales, pageWidth - 28)
      doc.text(recomendacionesLines, 14, yPosition)
    }
  }

  // Footer en todas las páginas
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Guardar PDF
  const nombreArchivo = `Informe_${usuarioSeleccionado.value.name}_${usuarioSeleccionado.value.apellidos}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)

  // Registrar el informe generado
  await registrarInformeGenerado(nombreArchivo)
}

// Registrar informe en el historial
const registrarInformeGenerado = async (nombreArchivo) => {
  try {
    const informeData = {
      usuario_id: selectedUserId.value,
      tipo_informe: 'evolucion',
      nombre_archivo: nombreArchivo,
      fecha_generacion: new Date().toISOString(),
      total_evaluaciones: evaluaciones.value.length,
      periodo: {
        desde: evaluacionesOrdenadas.value[0]?.fecha_evaluacion,
        hasta: evaluacionesOrdenadas.value[evaluacionesOrdenadas.value.length - 1]?.fecha_evaluacion
      },
      incluye_plan_alimentacion: mostrarPlanAlimentacion.value || false,
      incluye_plan_competitivo: mostrarPlanCompetitivo.value || false,
      generado_por: authStore.currentUser.name + ' ' + (authStore.currentUser.apellidos || ''),
      metadata: {
        primera_evaluacion: primeraEvaluacion.value,
        ultima_evaluacion: ultimaEvaluacion.value,
        graficos_incluidos: ['peso_imc', 'grasa', 'circunferencias', 'pliegues']
      }
    }

    const result = await informesStore.registrarInforme(informeData)
    if (result.success) {
      // Recargar historial si está visible
      if (mostrarHistorialInformes.value && selectedUserId.value) {
        await cargarHistorialInformes()
      }
    } else {
      console.error('Error al registrar informe:', result.error)
    }
  } catch (error) {
    console.error('Error al registrar informe:', error)
  }
}

// Cargar historial de informes
const cargarHistorialInformes = async () => {
  if (!selectedUserId.value) return
  
  const result = await informesStore.fetchInformesPorUsuario(selectedUserId.value)
  if (result.success) {
    historialInformes.value = result.data || []
  } else {
    historialInformes.value = []
    console.error('Error al cargar historial:', result.error)
  }
}

// Alternar vista de historial
const toggleHistorialInformes = async () => {
  mostrarHistorialInformes.value = !mostrarHistorialInformes.value
  if (mostrarHistorialInformes.value && selectedUserId.value) {
    await cargarHistorialInformes()
  }
}

// Eliminar informe del historial
const eliminarInforme = async (informeId) => {
  if (!confirm('¿Está seguro que desea eliminar este registro de informe?')) return
  
  const result = await informesStore.deleteInforme(informeId)
  if (result.success) {
    // Actualizar lista local
    historialInformes.value = historialInformes.value.filter(inf => inf.id !== informeId)
  } else {
    console.error('Error al eliminar informe:', result.error)
    alert('Error al eliminar el informe. Inténtelo nuevamente.')
  }
}

// Watch
watch(selectedUserId, () => {
  if (selectedUserId.value) {
    loadEvaluaciones()
    cargarPlanAlimentacion()
    // Si el historial está visible, recargar para el nuevo usuario
    if (mostrarHistorialInformes.value) {
      cargarHistorialInformes()
    }
  } else {
    evaluaciones.value = []
    historialInformes.value = []
    mostrarHistorialInformes.value = false
  }
})

// Auto-guardar plan de alimentación cuando cambie
watch(planAlimentacion, () => {
  guardarPlanAlimentacion()
}, { deep: true })

// Auto-guardar plan competitivo cuando cambie
watch(planCompetitivo, () => {
  guardarPlanCompetitivo()
}, { deep: true })

// Funciones para alternar entre planes
const togglePlanAlimentacion = () => {
  mostrarPlanAlimentacion.value = !mostrarPlanAlimentacion.value
  if (mostrarPlanAlimentacion.value) {
    mostrarPlanCompetitivo.value = false
  }
}

const togglePlanCompetitivo = () => {
  mostrarPlanCompetitivo.value = !mostrarPlanCompetitivo.value
  if (mostrarPlanCompetitivo.value) {
    mostrarPlanAlimentacion.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div>
    <!-- Header -->
    <VCard class="mb-4">
      <VCardText class="pa-4">
        <VRow align="center">
          <VCol cols="12" sm="8">
            <h2 class="text-h5 text-sm-h4 mb-1" style="color: #7C3AED;">
              Informes de Evolución
            </h2>
            <p class="text-body-2 text-sm-body-1 text-medium-emphasis">
              Visualiza el progreso y evolución de los pacientes
            </p>
          </VCol>
          <VCol cols="12" sm="4" class="text-sm-end">
            <VRow dense>
              <VCol cols="12" md="6">
                <VBtn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="tabler-history"
                  :disabled="!selectedUserId"
                  @click="toggleHistorialInformes"
                  block
                  class="text-none mb-2 mb-md-0"
                >
                  Historial
                </VBtn>
              </VCol>
              <VCol cols="12" md="6">
                <VBtn
                  color="primary"
                  prepend-icon="tabler-file-type-pdf"
                  :disabled="!selectedUserId || evaluaciones.length === 0"
                  @click="exportarPDF"
                  block
                  class="text-none"
                >
                  Exportar Informe
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Selector de Usuario -->
    <VCard class="mb-4">
      <VCardText class="pa-4">
        <VRow>
          <VCol cols="12">
            <VAutocomplete
              v-model="selectedUserId"
              :items="allUsers"
              item-title="name"
              item-value="id"
              label="Seleccionar Usuario"
              placeholder="Buscar usuario..."
              clearable
              autocomplete="new-password"
            >
              <template #item="{ props, item }">
                <VListItem v-bind="props">
                  <VListItemTitle>{{ item.raw.name }} {{ item.raw.apellidos }}</VListItemTitle>
                  <VListItemSubtitle>RUT: {{ item.raw.numero_documento }}</VListItemSubtitle>
                </VListItem>
              </template>
            </VAutocomplete>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Historial de Informes Generados -->
    <VExpandTransition>
      <VCard v-if="mostrarHistorialInformes && selectedUserId" class="mb-4">
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Historial de Informes Generados</span>
          <VBtn
            icon
            size="small"
            variant="text"
            @click="mostrarHistorialInformes = false"
          >
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>
        <VDivider />
        <VCardText>
          <div v-if="informesStore.isLoading" class="text-center py-6">
            <VProgressCircular indeterminate color="primary" />
            <p class="text-medium-emphasis mt-3">Cargando historial...</p>
          </div>
          
          <div v-else-if="historialInformes.length === 0" class="text-center py-6 text-medium-emphasis">
            <VIcon icon="tabler-file-off" size="48" class="mb-3" />
            <p>No hay informes generados para este usuario</p>
          </div>
          
          <VList v-else>
            <VListItem
              v-for="informe in historialInformes"
              :key="informe.id"
              class="mb-2"
            >
              <template #prepend>
                <VAvatar color="primary" variant="tonal">
                  <VIcon icon="tabler-file-text" />
                </VAvatar>
              </template>

              <VListItemTitle>{{ informe.nombre_archivo }}</VListItemTitle>
              <VListItemSubtitle>
                <div class="d-flex flex-wrap gap-2 mt-1">
                  <VChip size="x-small" color="info">
                    {{ formatearFechaHora(informe.fecha_generacion) }}
                  </VChip>
                  <VChip v-if="informe.total_evaluaciones" size="x-small" color="success">
                    {{ informe.total_evaluaciones }} evaluaciones
                  </VChip>
                  <VChip v-if="informe.periodo?.desde" size="x-small">
                    {{ formatearFecha(informe.periodo.desde) }} - {{ formatearFecha(informe.periodo.hasta) }}
                  </VChip>
                  <VChip v-if="informe.incluye_plan_alimentacion" size="x-small" color="warning">
                    Plan alimentación
                  </VChip>
                  <VChip v-if="informe.incluye_plan_competitivo" size="x-small" color="secondary">
                    Plan competitivo
                  </VChip>
                </div>
                <div v-if="informe.generado_por" class="text-caption mt-1">
                  Generado por: {{ informe.generado_por }}
                </div>
              </VListItemSubtitle>

              <template #append>
                <VBtn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="eliminarInforme(informe.id)"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VExpandTransition>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <VProgressCircular indeterminate color="primary" size="64" />
    </div>

    <!-- Sin usuario seleccionado -->
    <VCard v-if="!selectedUserId && !isLoading">
      <VCardText class="text-center py-12">
        <VIcon icon="tabler-user-search" size="64" color="grey" class="mb-4" />
        <p class="text-h6 text-medium-emphasis">
          Selecciona un usuario para ver su informe de evolución
        </p>
      </VCardText>
    </VCard>

    <!-- Contenido del informe -->
    <div v-if="selectedUserId && !isLoading && evaluaciones.length > 0">
      <!-- Información del Usuario y Resumen -->
      <VRow>
        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle class="d-flex align-center text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
              <VIcon icon="tabler-user" class="me-2" size="20" />
              Información del Paciente
            </VCardTitle>
            <VCardText class="pa-3 pa-sm-4">
              <div class="mb-2">
                <strong>Nombre:</strong> {{ usuarioSeleccionado.name }} {{ usuarioSeleccionado.apellidos }}
              </div>
              <div class="mb-2">
                <strong>RUT:</strong> {{ usuarioSeleccionado.numero_documento }}
              </div>
              <div v-if="usuarioSeleccionado.edad" class="mb-2">
                <strong>Edad:</strong> {{ usuarioSeleccionado.edad }} años
              </div>
              <div class="mb-2">
                <strong>Total de Evaluaciones:</strong> {{ evaluaciones.length }}
              </div>
              <div class="mb-2">
                <strong>Primera Evaluación:</strong> {{ formatearFecha(primeraEvaluacion.fecha_evaluacion) }}
              </div>
              <div>
                <strong>Última Evaluación:</strong> {{ formatearFecha(ultimaEvaluacion.fecha_evaluacion) }}
              </div>
              <div v-if="ultimaEvaluacion.fecha_proxima_evaluacion" class="mt-2">
                <strong style="color: #F59E0B;">Próxima Evaluación:</strong> 
                <span style="color: #F59E0B;">{{ formatearFecha(ultimaEvaluacion.fecha_proxima_evaluacion) }}</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" md="6">
          <VCard>
            <VCardTitle class="d-flex align-center text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
              <VIcon icon="tabler-chart-dots" class="me-2" size="20" />
              Resumen de Cambios
            </VCardTitle>
            <VCardText class="pa-3 pa-sm-4">
              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span><strong>Peso:</strong></span>
                  <div class="text-end">
                    <div>{{ primeraEvaluacion.peso }} kg → {{ ultimaEvaluacion.peso }} kg</div>
                    <div 
                      :class="calcularCambio(ultimaEvaluacion.peso, primeraEvaluacion.peso).cambio > 0 ? 'text-warning' : 'text-success'"
                      class="text-caption"
                    >
                      {{ calcularCambio(ultimaEvaluacion.peso, primeraEvaluacion.peso).cambio > 0 ? '+' : '' }}{{ calcularCambio(ultimaEvaluacion.peso, primeraEvaluacion.peso).cambio }} kg
                      ({{ calcularCambio(ultimaEvaluacion.peso, primeraEvaluacion.peso).porcentaje }}%)
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span><strong>IMC:</strong></span>
                  <div class="text-end">
                    <div>{{ primeraEvaluacion.imc }} → {{ ultimaEvaluacion.imc }}</div>
                    <div 
                      :class="calcularCambio(ultimaEvaluacion.imc, primeraEvaluacion.imc).cambio > 0 ? 'text-warning' : 'text-success'"
                      class="text-caption"
                    >
                      {{ calcularCambio(ultimaEvaluacion.imc, primeraEvaluacion.imc).cambio > 0 ? '+' : '' }}{{ calcularCambio(ultimaEvaluacion.imc, primeraEvaluacion.imc).cambio }}
                      ({{ calcularCambio(ultimaEvaluacion.imc, primeraEvaluacion.imc).porcentaje }}%)
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span><strong>Grasa Corporal:</strong></span>
                  <div class="text-end">
                    <div>{{ primeraEvaluacion.porcentaje_grasa }}% → {{ ultimaEvaluacion.porcentaje_grasa }}%</div>
                    <div 
                      :class="calcularCambio(ultimaEvaluacion.porcentaje_grasa, primeraEvaluacion.porcentaje_grasa).cambio < 0 ? 'text-success' : 'text-warning'"
                      class="text-caption"
                    >
                      {{ calcularCambio(ultimaEvaluacion.porcentaje_grasa, primeraEvaluacion.porcentaje_grasa).cambio > 0 ? '+' : '' }}{{ calcularCambio(ultimaEvaluacion.porcentaje_grasa, primeraEvaluacion.porcentaje_grasa).cambio }}%
                      ({{ calcularCambio(ultimaEvaluacion.porcentaje_grasa, primeraEvaluacion.porcentaje_grasa).porcentaje }}%)
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-space-between align-center mb-1">
                  <span><strong>Cintura:</strong></span>
                  <div class="text-end">
                    <div>{{ primeraEvaluacion.circunferencia_cintura }} cm → {{ ultimaEvaluacion.circunferencia_cintura }} cm</div>
                    <div 
                      :class="calcularCambio(ultimaEvaluacion.circunferencia_cintura, primeraEvaluacion.circunferencia_cintura).cambio < 0 ? 'text-success' : 'text-warning'"
                      class="text-caption"
                    >
                      {{ calcularCambio(ultimaEvaluacion.circunferencia_cintura, primeraEvaluacion.circunferencia_cintura).cambio > 0 ? '+' : '' }}{{ calcularCambio(ultimaEvaluacion.circunferencia_cintura, primeraEvaluacion.circunferencia_cintura).cambio }} cm
                    </div>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Gráficos -->
      <VRow class="mt-4">
        <!-- Peso e IMC -->
        <VCol cols="12" lg="6">
          <VCard>
            <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
              <VIcon icon="tabler-scale" class="me-2" size="20" />
              Evolución de Peso e IMC
            </VCardTitle>
            <VCardText class="pa-3 pa-sm-4">
              <div class="chart-container">
                <Line :data="pesoImcData" :options="pesoImcOptions" />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Grasa Corporal -->
        <VCol cols="12" lg="6">
          <VCard>
            <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
              <VIcon icon="tabler-heart-rate-monitor" class="me-2" size="20" />
              Evolución de Grasa Corporal
            </VCardTitle>
            <VCardText class="pa-3 pa-sm-4">
              <div class="chart-container">
                <Line :data="grasaData" :options="chartOptions" />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Circunferencias -->
        <VCol cols="12" lg="6">
          <VCard>
            <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
              <VIcon icon="tabler-ruler" class="me-2" size="20" />
              Evolución de Circunferencias
            </VCardTitle>
            <VCardText class="pa-3 pa-sm-4">
              <div class="chart-container">
                <Line :data="circunferenciasData" :options="chartOptions" />
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Pliegues -->
        <VCol cols="12" lg="6">
          <VCard>
            <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
              <VIcon icon="tabler-device-analytics" class="me-2" size="20" />
              Evolución de Pliegues Cutáneos
            </VCardTitle>
            <VCardText class="pa-3 pa-sm-4">
              <div class="chart-container">
                <Line :data="plieguesData" :options="chartOptions" />
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Historial Completo de Evaluaciones -->
      <VCard class="mt-4">
        <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4">
          <VIcon icon="tabler-clipboard-list" class="me-2" size="20" />
          Historial Completo de Evaluaciones
        </VCardTitle>

        <!-- Vista Desktop: Tabla completa -->
        <div class="d-none d-sm-block table-responsive">
          <VDataTable
            :items="evaluacionesOrdenadas"
            :headers="[
              { title: 'Fecha', key: 'fecha_evaluacion', width: '100px' },
              { title: 'Peso (kg)', key: 'peso' },
              { title: 'Estatura (cm)', key: 'estatura' },
              { title: 'IMC', key: 'imc' },
              { title: '% Grasa', key: 'porcentaje_grasa' },
              { title: 'Cintura', key: 'circunferencia_cintura' },
              { title: 'Brazo Rel.', key: 'circunferencia_brazo_relajado' },
              { title: 'Brazo Cont.', key: 'circunferencia_brazo_contraccion' },
              { title: 'Muslo', key: 'circunferencia_muslo' },
              { title: 'Pantorrilla', key: 'circunferencia_pantorrilla' },
              { title: 'P. Tricipital', key: 'pliegue_tricipital' },
              { title: 'P. Bicipital', key: 'pliegue_bicipital' },
              { title: 'P. Suprailiaco', key: 'pliegue_suprailiaco' },
              { title: 'P. Subescapular', key: 'pliegue_subescapular' },
              { title: 'P. Abdominal', key: 'pliegue_abdominal' },
              { title: 'P. Muslo', key: 'pliegue_muslo' },
              { title: 'P. Pantorrilla', key: 'pliegue_pantorrilla' },
              { title: 'Próxima Eval.', key: 'fecha_proxima_evaluacion' },
              { title: 'Acciones', key: 'actions', sortable: false },
            ]"
            items-per-page="10"
            density="compact"
          >
            <template #item.fecha_evaluacion="{ item }">
              {{ formatearFecha(item.fecha_evaluacion) }}
            </template>
            <template #item.fecha_proxima_evaluacion="{ item }">
              <span v-if="item.fecha_proxima_evaluacion" style="color: #F59E0B;">
                {{ formatearFecha(item.fecha_proxima_evaluacion) }}
              </span>
              <span v-else class="text-medium-emphasis">-</span>
            </template>
            <template #item.actions="{ item }">
              <VBtn
                v-if="item.objetivo_paciente || item.notas"
                size="x-small"
                color="primary"
                variant="tonal"
                icon="tabler-file-text"
                @click="abrirDetalles(item.objetivo_paciente, item.notas, item.fecha_evaluacion)"
              />
            </template>
          </VDataTable>
        </div>

        <!-- Vista Mobile: Cards por evaluación -->
        <div class="d-sm-none pa-3">
          <VCard
            v-for="(evaluacion, index) in evaluacionesOrdenadas"
            :key="evaluacion.id"
            class="mb-3"
            variant="tonal"
          >
            <VCardTitle class="text-subtitle-2 pa-3 d-flex justify-space-between align-center">
              <span>Evaluación {{ evaluacionesOrdenadas.length - index }}</span>
              <VChip size="small" color="primary">
                {{ formatearFecha(evaluacion.fecha_evaluacion) }}
              </VChip>
            </VCardTitle>
            <VCardText class="pa-3">
              <!-- Métricas Principales -->
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Métricas Principales</div>
                <VRow dense>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Peso:</span>
                      <span class="font-weight-medium">{{ evaluacion.peso }} kg</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Estatura:</span>
                      <span class="font-weight-medium">{{ evaluacion.estatura }} cm</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">IMC:</span>
                      <span class="font-weight-medium">{{ evaluacion.imc }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">% Grasa:</span>
                      <span class="font-weight-medium">{{ evaluacion.porcentaje_grasa }}%</span>
                    </div>
                  </VCol>
                </VRow>
              </div>

              <VDivider class="my-2" />

              <!-- Circunferencias -->
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Circunferencias (cm)</div>
                <VRow dense>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Cintura:</span>
                      <span class="font-weight-medium">{{ evaluacion.circunferencia_cintura }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Brazo Rel.:</span>
                      <span class="font-weight-medium">{{ evaluacion.circunferencia_brazo_relajado }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Brazo Cont.:</span>
                      <span class="font-weight-medium">{{ evaluacion.circunferencia_brazo_contraccion }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Muslo:</span>
                      <span class="font-weight-medium">{{ evaluacion.circunferencia_muslo }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Pantorrilla:</span>
                      <span class="font-weight-medium">{{ evaluacion.circunferencia_pantorrilla }}</span>
                    </div>
                  </VCol>
                </VRow>
              </div>

              <VDivider class="my-2" />

              <!-- Pliegues Cutáneos -->
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Pliegues Cutáneos (mm)</div>
                <VRow dense>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Tricipital:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_tricipital }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Bicipital:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_bicipital }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Suprailiaco:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_suprailiaco }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Subescapular:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_subescapular }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Abdominal:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_abdominal }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Muslo:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_muslo }}</span>
                    </div>
                  </VCol>
                  <VCol cols="6">
                    <div class="metric-item">
                      <span class="text-caption">Pantorrilla:</span>
                      <span class="font-weight-medium">{{ evaluacion.pliegue_pantorrilla }}</span>
                    </div>
                  </VCol>
                </VRow>
              </div>

              <VDivider class="my-2" />
              
              <!-- Próxima Evaluación -->
              <div v-if="evaluacion.fecha_proxima_evaluacion" class="mb-2">
                <div class="text-caption text-medium-emphasis mb-1">Próxima Evaluación</div>
                <div class="text-body-2" style="color: #F59E0B;">
                  {{ formatearFecha(evaluacion.fecha_proxima_evaluacion) }}
                </div>
              </div>

              <!-- Botón para ver detalles -->
              <div v-if="evaluacion.objetivo_paciente || evaluacion.notas" class="d-flex gap-2 mt-3">
                <VBtn
                  size="small"
                  color="primary"
                  variant="tonal"
                  prepend-icon="tabler-file-text"
                  block
                  @click="abrirDetalles(evaluacion.objetivo_paciente, evaluacion.notas, evaluacion.fecha_evaluacion)"
                >
                  Ver Objetivo y Notas
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </div>
      </VCard>

      <!-- Plan de Alimentación -->
      <VCard class="mt-4">
        <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4 d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <VIcon icon="tabler-chef-hat" class="me-2" size="20" />
            Plan de Alimentación
          </div>
          <VBtn
            size="small"
            :color="mostrarPlanAlimentacion ? 'primary' : 'default'"
            @click="togglePlanAlimentacion"
          >
            {{ mostrarPlanAlimentacion ? 'Ocultar' : 'Mostrar' }}
          </VBtn>
        </VCardTitle>

        <VCardText v-if="mostrarPlanAlimentacion" class="pa-3 pa-sm-4">
          <!-- Pautas de Alimentación -->
          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-3">
              <h6 class="text-h6">Pautas de Alimentación</h6>
              <VBtn
                size="small"
                color="primary"
                prepend-icon="tabler-plus"
                @click="agregarPauta"
              >
                Agregar Comida
              </VBtn>
            </div>

            <VRow
              v-for="pauta in planAlimentacion.pautas"
              :key="pauta.id"
              class="mb-3"
            >
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="pauta.nombre"
                  label="Nombre de la Comida"
                  placeholder="Ej: Desayuno"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="2">
                <VTextField
                  v-model="pauta.horario"
                  label="Horario"
                  placeholder="08:00"
                  density="compact"
                  type="time"
                />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextarea
                  v-model="pauta.alimentacion"
                  label="Alimentación"
                  placeholder="Describe los alimentos..."
                  density="compact"
                  rows="2"
                />
              </VCol>
              <VCol cols="12" sm="1" class="d-flex align-center">
                <VBtn
                  icon="tabler-trash"
                  size="small"
                  color="error"
                  variant="text"
                  @click="eliminarPauta(pauta.id)"
                  :disabled="planAlimentacion.pautas.length <= 1"
                />
              </VCol>
            </VRow>
          </div>

          <VDivider class="my-6" />

          <!-- Macros Totales -->
          <div class="mb-6">
            <h6 class="text-h6 mb-3">Distribución de Macronutrientes</h6>
            <VRow>
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="planAlimentacion.macros.carbohidratos"
                  label="Carbohidratos"
                  placeholder="Ej: 250g"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="planAlimentacion.macros.proteinas"
                  label="Proteínas"
                  placeholder="Ej: 120g"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="planAlimentacion.macros.grasas"
                  label="Grasas"
                  placeholder="Ej: 60g"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="planAlimentacion.macros.calorias"
                  label="Calorías Totales"
                  placeholder="Ej: 2000 kcal"
                  density="compact"
                />
              </VCol>
            </VRow>
          </div>

          <VDivider class="my-6" />

          <!-- Información Adicional -->
          <div class="mb-6">
            <h6 class="text-h6 mb-3">Indicaciones y Recomendaciones</h6>
            <VRow>
              <VCol cols="12" md="6">
                <VTextarea
                  v-model="planAlimentacion.hidratacion"
                  label="¿Cómo me hidrato?"
                  placeholder="Recomendaciones sobre consumo de agua..."
                  rows="3"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextarea
                  v-model="planAlimentacion.sustituciones"
                  label="¿Cómo sustituir el azúcar?"
                  placeholder="Alternativas saludables al azúcar..."
                  rows="3"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextarea
                  v-model="planAlimentacion.consumoVerduras"
                  label="Consumo de Verduras"
                  placeholder="Recomendaciones sobre verduras..."
                  rows="3"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextarea
                  v-model="planAlimentacion.notasAdicionales"
                  label="Notas Adicionales"
                  placeholder="Otras recomendaciones importantes..."
                  rows="3"
                  density="compact"
                />
              </VCol>
            </VRow>
          </div>

          <VDivider class="my-6" />

          <!-- Suplementos -->
          <div>
            <div class="d-flex justify-space-between align-center mb-3">
              <h6 class="text-h6">Suplementación</h6>
              <VBtn
                size="small"
                color="primary"
                prepend-icon="tabler-plus"
                @click="agregarSuplemento"
              >
                Agregar Suplemento
              </VBtn>
            </div>

            <VRow
              v-for="suplemento in planAlimentacion.suplementos"
              :key="suplemento.id"
              class="mb-3"
            >
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="suplemento.nombre"
                  label="Suplemento"
                  placeholder="Ej: Omega 3"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="2">
                <VTextField
                  v-model="suplemento.dosis"
                  label="Dosis"
                  placeholder="Ej: 1000mg"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextField
                  v-model="suplemento.indicaciones"
                  label="Indicaciones"
                  placeholder="Tomar con las comidas..."
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="1" class="d-flex align-center">
                <VBtn
                  icon="tabler-trash"
                  size="small"
                  color="error"
                  variant="text"
                  @click="eliminarSuplemento(suplemento.id)"
                />
              </VCol>
            </VRow>
          </div>
        </VCardText>
      </VCard>

      <!-- Plan de Alimentación Competitivo -->
      <VCard class="mt-4">
        <VCardTitle class="text-subtitle-1 text-sm-h6 pa-3 pa-sm-4 d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <VIcon icon="tabler-trophy" class="me-2" size="20" />
            Plan de Alimentación Competitivo
          </div>
          <VBtn
            size="small"
            :color="mostrarPlanCompetitivo ? 'success' : 'default'"
            @click="togglePlanCompetitivo"
          >
            {{ mostrarPlanCompetitivo ? 'Ocultar' : 'Mostrar' }}
          </VBtn>
        </VCardTitle>

        <VCardText v-if="mostrarPlanCompetitivo" class="pa-3 pa-sm-4">
          <!-- Pautas Pre-competencia -->
          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-3">
              <h6 class="text-h6">Pautas Pre-competencia</h6>
              <VBtn
                size="small"
                color="success"
                prepend-icon="tabler-plus"
                @click="agregarPautaPrecompetencia"
              >
                Agregar
              </VBtn>
            </div>

            <VRow
              v-for="pauta in planCompetitivo.pautasPrecompetencia"
              :key="pauta.id"
              class="mb-3"
            >
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="pauta.nombre"
                  label="Comida"
                  density="compact"
                  placeholder="Ej: Desayuno"
                />
              </VCol>
              <VCol cols="12" sm="2">
                <VTextField
                  v-model="pauta.horario"
                  label="Horario"
                  type="time"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextarea
                  v-model="pauta.alimentacion"
                  label="Alimentación"
                  rows="2"
                  density="compact"
                  placeholder="Detalle de la alimentación..."
                />
              </VCol>
              <VCol cols="12" sm="1" class="d-flex align-center">
                <VBtn
                  icon="tabler-trash"
                  size="small"
                  color="error"
                  variant="text"
                  @click="eliminarPautaPrecompetencia(pauta.id)"
                />
              </VCol>
            </VRow>
          </div>

          <!-- Pautas Durante Competencia -->
          <div class="mb-6">
            <div class="d-flex justify-space-between align-center mb-3">
              <h6 class="text-h6">Pautas Durante Competencia</h6>
              <VBtn
                size="small"
                color="success"
                prepend-icon="tabler-plus"
                @click="agregarPautaDuranteCompetencia"
              >
                Agregar
              </VBtn>
            </div>

            <VRow
              v-for="pauta in planCompetitivo.pautasDuranteCompetencia"
              :key="pauta.id"
              class="mb-3"
            >
              <VCol cols="12" sm="3">
                <VTextField
                  v-model="pauta.nombre"
                  label="Comida"
                  density="compact"
                  placeholder="Ej: Durante carrera"
                />
              </VCol>
              <VCol cols="12" sm="2">
                <VTextField
                  v-model="pauta.horario"
                  label="Horario"
                  type="time"
                  density="compact"
                />
              </VCol>
              <VCol cols="12" sm="6">
                <VTextarea
                  v-model="pauta.alimentacion"
                  label="Alimentación"
                  rows="2"
                  density="compact"
                  placeholder="Detalle de la alimentación..."
                />
              </VCol>
              <VCol cols="12" sm="1" class="d-flex align-center">
                <VBtn
                  icon="tabler-trash"
                  size="small"
                  color="error"
                  variant="text"
                  @click="eliminarPautaDuranteCompetencia(pauta.id)"
                />
              </VCol>
            </VRow>
          </div>

          <!-- Recomendaciones Generales -->
          <div class="mb-4">
            <h6 class="text-h6 mb-3">Recomendaciones Generales</h6>
            <VTextarea
              v-model="planCompetitivo.recomendacionesGenerales"
              label="Recomendaciones"
              rows="4"
              density="compact"
              placeholder="Ingrese recomendaciones generales para el atleta..."
            />
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Sin evaluaciones -->
    <VCard v-if="selectedUserId && !isLoading && evaluaciones.length === 0">
      <VCardText class="text-center py-12">
        <VIcon icon="tabler-clipboard-off" size="64" color="grey" class="mb-4" />
        <p class="text-h6 text-medium-emphasis">
          Este usuario no tiene evaluaciones registradas
        </p>
      </VCardText>
    </VCard>

    <!-- Modal para ver Objetivo/Notas -->
    <VDialog v-model="dialogDetalles" max-width="700">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <VIcon 
              icon="tabler-file-text" 
              color="primary"
              class="me-2" 
              size="24" 
            />
            <span>Detalles de la Evaluación</span>
          </div>
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="dialogDetalles = false"
          />
        </VCardTitle>
        <VCardText>
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis">Fecha de evaluación</div>
            <div class="text-body-1 font-weight-medium">{{ detalleSeleccionado.fecha }}</div>
          </div>
          
          <!-- Objetivo del Paciente -->
          <div v-if="detalleSeleccionado.objetivo" class="mb-4">
            <div class="d-flex align-center mb-2">
              <VIcon icon="tabler-target" color="primary" size="20" class="me-2" />
              <h6 class="text-h6 mb-0">Objetivo del Paciente</h6>
            </div>
            <VCard variant="tonal" color="primary">
              <VCardText class="text-body-1" style="color: white;">
                {{ detalleSeleccionado.objetivo }}
              </VCardText>
            </VCard>
          </div>

          <!-- Notas de la Nutricionista -->
          <div v-if="detalleSeleccionado.notas">
            <div class="d-flex align-center mb-2">
              <VIcon icon="tabler-notes" color="purple" size="20" class="me-2" />
              <h6 class="text-h6 mb-0">Notas de la Nutricionista</h6>
            </div>
            <VCard variant="tonal" color="purple">
              <VCardText class="text-body-1" style="font-style: italic; color: white;">
                {{ detalleSeleccionado.notas }}
              </VCardText>
            </VCard>
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            variant="text"
            @click="dialogDetalles = false"
          >
            Cerrar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.text-success {
  color: #10B981;
}

.text-warning {
  color: #F59E0B;
}

.chart-container {
  height: 250px;
}

@media (min-width: 600px) {
  .chart-container {
    height: 300px;
  }
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

@media (max-width: 600px) {
  .d-flex.justify-space-between {
    font-size: 0.875rem;
  }
}
</style>
