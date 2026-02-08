<script setup>
import { ref, computed } from 'vue'
import { useClasesStore } from '@/stores/clases'
import { useReservasStore } from '@/stores/reservas'
import { useAuthStore } from '@/stores/auth'

const clasesStore = useClasesStore()
const reservasStore = useReservasStore()
const authStore = useAuthStore()

const currentUser = computed(() => authStore.currentUser)

definePage({
  meta: {
    subject: 'clases',
    action: 'read',
  },
})

// Generar los próximos 7 días desde hoy
const generarProximos7Dias = () => {
  const dias = []
  const hoy = new Date()
  const nombresDias = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA']
  const nombresCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    
    const diaSemana = fecha.getDay()
    const nombreDiaKey = nombresCompletos[diaSemana].toLowerCase()
    
    dias.push({
      value: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`,
      text: nombresDias[diaSemana],
      numero: fecha.getDate(),
      mes: fecha.toLocaleString('es-CL', { month: 'long' }),
      nombreCompleto: nombresCompletos[diaSemana],
      nombreDiaKey: nombreDiaKey,
      fecha: fecha,
    })
  }
  
  return dias
}

const diasSemana = ref(generarProximos7Dias())
const diaSeleccionado = ref(diasSemana.value[0].value)
const loading = ref(false)

// Obtener clases dinámicamente del store
const clasesDelDia = computed(() => {
  const diaActualData = diasSemana.value.find(d => d.value === diaSeleccionado.value)
  if (!diaActualData) return []
  
  // Obtener clases del store para este día y fecha
  const clases = clasesStore.obtenerClasesPorDia(diaActualData.nombreDiaKey, diaActualData.value)
  
  // Agregar conteo real de reservas a cada clase
  return clases.map(clase => ({
    ...clase,
    reservas: reservasStore.contarReservas(clase.id, diaActualData.value),
    tieneReserva: currentUser.value ? reservasStore.tieneReserva(currentUser.value.id, clase.id, diaActualData.value) : false,
    puedeCancelar: reservasStore.puedeCancelar(diaActualData.value, clase.horaInicio)
  }))
})

const diaActual = computed(() => {
  return diasSemana.value.find(d => d.value === diaSeleccionado.value)
})

function reservarClase(clase) {
  if (!currentUser.value) {
    alert('Debes iniciar sesión para reservar clases')
    return
  }

  const diaActualData = diasSemana.value.find(d => d.value === diaSeleccionado.value)
  
  // Si ya tiene reserva, intentar cancelar
  if (clase.tieneReserva) {
    cancelarReserva(clase)
    return
  }

  // Verificar si hay cupos disponibles
  if (clase.reservas >= clase.cupos) {
    alert('No hay cupos disponibles para esta clase')
    return
  }

  // Crear la reserva
  const nuevaReserva = reservasStore.crearReserva({
    usuarioId: currentUser.value.id,
    usuarioNombre: currentUser.value.fullName || currentUser.value.username,
    claseId: clase.id,
    claseNombre: clase.nombre,
    fecha: diaActualData.value,
    horaInicio: clase.horaInicio,
    duracion: clase.duracion,
    coach: clase.coach
  })

  if (nuevaReserva) {
    alert(`¡Reserva exitosa! ${clase.titulo} - ${diaActualData.nombreCompleto} ${diaActualData.numero}`)
  }
}

function cancelarReserva(clase) {
  const diaActualData = diasSemana.value.find(d => d.value === diaSeleccionado.value)
  
  if (!clase.puedeCancelar) {
    alert('Solo puedes cancelar hasta 90 minutos antes de la clase')
    return
  }

  if (confirm('¿Estás seguro de cancelar esta reserva?')) {
    const resultado = reservasStore.cancelarReserva(
      currentUser.value.id,
      clase.id,
      diaActualData.value
    )

    if (resultado.success) {
      alert(resultado.message)
    } else {
      alert(resultado.message)
    }
  }
}

function getCuposColor(reservas, cupos) {
  const porcentaje = (reservas / cupos) * 100
  if (porcentaje >= 80) return 'error'
  if (porcentaje >= 50) return 'warning'
  return 'success'
}

function getHoraMostrar(horaInicio) {
  const hora = horaInicio.split(':')[0]
  const periodo = parseInt(hora) >= 12 ? 'PM' : 'AM'
  return `Mañana a las ${horaInicio}`
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
        Clases
      </h2>
      <p class="text-body-1 text-medium-emphasis">
        Selecciona un día y reserva tu clase
      </p>
    </VCol>

    <!-- Selector de días -->
    <VCol cols="12">
      <VCard class="overflow-hidden">
        <VCardText class="pa-4">
          <div class="d-flex gap-3 overflow-x-auto py-2 px-1">
            <div
              v-for="dia in diasSemana"
              :key="dia.value"
              class="dia-selector"
              :class="{ 'dia-seleccionado': diaSeleccionado === dia.value }"
              @click="diaSeleccionado = dia.value"
            >
              <div class="dia-contenido">
                <div class="dia-texto">{{ dia.text }}</div>
                <div class="dia-numero">{{ dia.numero }}</div>
                <div
                  v-if="diaSeleccionado === dia.value"
                  class="dia-indicador"
                />
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Fecha seleccionada -->
    <VCol cols="12">
      <div class="d-flex justify-space-between align-center">
        <h3 class="text-h5">
          {{ diaActual?.nombreCompleto }} {{ diaActual?.numero }} de {{ diaActual?.mes }}
        </h3>
        <VBtn
          variant="text"
          color="primary"
          prepend-icon="tabler-calendar"
        >
          Mis reservas
        </VBtn>
      </div>
    </VCol>

    <!-- Lista de clases -->
    <VCol cols="12">
      <VRow>
        <VCol
          v-for="clase in clasesDelDia"
          :key="clase.id"
          cols="12"
        >
          <VCard>
            <VCardText>
              <VRow align="center">
                <!-- Información de la clase -->
                <VCol
                  cols="12"
                  md="8"
                >
                  <div class="mb-3">
                    <VChip
                      size="small"
                      color="primary"
                      variant="tonal"
                      class="mb-2"
                    >
                      Presencial
                    </VChip>
                    <h3 class="text-h5 mb-1">
                      {{ clase.titulo }}
                    </h3>
                    <p
                      v-if="clase.coach"
                      class="text-body-2 text-medium-emphasis mb-2"
                    >
                      Coach: {{ clase.coach }}
                    </p>
                    <div class="text-primary font-weight-medium">
                      {{ getHoraMostrar(clase.horaInicio) }}
                    </div>
                  </div>

                  <!-- Iconos de información -->
                  <div class="d-flex gap-4 flex-wrap">
                    <div class="d-flex align-center">
                      <VIcon
                        icon="tabler-clock"
                        size="20"
                        class="me-2"
                        color="grey"
                      />
                      <span class="text-body-2">{{ clase.duracion }} min</span>
                    </div>
                    <div class="d-flex align-center">
                      <VIcon
                        icon="tabler-users"
                        size="20"
                        class="me-2"
                        color="grey"
                      />
                      <span class="text-body-2">{{ clase.cupos }} Personas</span>
                    </div>
                    <div class="d-flex align-center">
                      <VIcon
                        icon="tabler-ticket"
                        size="20"
                        class="me-2"
                        :color="getCuposColor(clase.reservas, clase.cupos)"
                      />
                      <span class="text-body-2">
                        <span :class="`text-${getCuposColor(clase.reservas, clase.cupos)}`">
                          {{ clase.reservas }} reservas
                        </span>
                        / {{ clase.cupos }} cupos
                      </span>
                    </div>
                  </div>
                </VCol>

                <!-- Botón de reserva -->
                <VCol
                  cols="12"
                  md="4"
                  class="text-center text-md-end"
                >
                  <VBtn
                    v-if="!clase.tieneReserva"
                    color="primary"
                    size="large"
                    block
                    :disabled="clase.reservas >= clase.cupos"
                    @click="reservarClase(clase)"
                  >
                    {{ clase.reservas >= clase.cupos ? 'Completo' : 'Reservar' }}
                  </VBtn>
                  <VBtn
                    v-else
                    color="error"
                    size="large"
                    block
                    variant="tonal"
                    :disabled="!clase.puedeCancelar"
                    @click="cancelarReserva(clase)"
                  >
                    {{ clase.puedeCancelar ? 'Cancelar Reserva' : 'No se puede cancelar' }}
                  </VBtn>
                  <div class="text-caption text-medium-emphasis mt-2">
                    <span v-if="!clase.tieneReserva">
                      {{ clase.cupos - clase.reservas }} cupos disponibles
                    </span>
                    <span v-else-if="!clase.puedeCancelar" class="text-error">
                      Solo puedes cancelar hasta 90 min antes
                    </span>
                    <span v-else class="text-success">
                      ¡Ya tienes reserva!
                    </span>
                  </div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Sin clases -->
        <VCol
          v-if="clasesDelDia.length === 0"
          cols="12"
        >
          <VCard>
            <VCardText class="text-center py-12">
              <VIcon
                icon="tabler-calendar-off"
                size="64"
                class="mb-4"
                color="grey"
              />
              <h3 class="text-h5 mb-2">
                No hay clases programadas
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                Selecciona otro día para ver las clases disponibles
              </p>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  scrollbar-width: thin;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dia-selector {
  min-width: 64px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.dia-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 16px;
  background: #F5F5F5;
  transition: all 0.3s ease;
  position: relative;
}

.dia-selector:hover .dia-contenido {
  background: #EEEEEE;
  transform: translateY(-2px);
}

.dia-seleccionado .dia-contenido {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  transform: scale(1.05);
}

.dia-texto {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #666;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.dia-seleccionado .dia-texto {
  color: rgba(255, 255, 255, 0.9);
}

.dia-numero {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  transition: color 0.3s ease;
  line-height: 1;
}

.dia-seleccionado .dia-numero {
  color: #FFFFFF;
}

.dia-indicador {
  position: absolute;
  bottom: 4px;
  width: 6px;
  height: 6px;
  background: #FFFFFF;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}
</style>
