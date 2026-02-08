<script setup>
import { ref, computed } from 'vue'
import { useClasesStore } from '@/stores/clases'
import { useClasesPruebaStore } from '@/stores/clasesPrueba'

const clasesStore = useClasesStore()
const clasesPruebaStore = useClasesPruebaStore()

// Estado del formulario
const formulario = ref({
  nombre: '',
  email: '',
  telefono: '',
  claseId: null,
  fechaPreferida: '',
  mensaje: '',
})

const errores = ref({})
const enviando = ref(false)
const exitoDialog = ref(false)

// Clases que permiten prueba
const clasesDisponibles = computed(() => {
  return clasesStore.clases.filter(c => c.activa && c.permitePrueba)
})

// Clase seleccionada
const claseSeleccionada = computed(() => {
  if (!formulario.value.claseId) return null
  return clasesStore.clases.find(c => c.id === formulario.value.claseId)
})

// Días disponibles para la clase seleccionada
const diasDisponibles = computed(() => {
  if (!claseSeleccionada.value) return []
  
  const dias = []
  const hoy = new Date()
  
  const nombresDias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  
  // Generar próximos 14 días
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)
    
    const nombreDia = nombresDias[fecha.getDay()]
    
    // Verificar si la clase se da este día
    if (claseSeleccionada.value.dias.includes(nombreDia)) {
      const fechaStr = fecha.toISOString().split('T')[0]
      
      // Verificar que no haya excepción de cancelación
      const excepcion = claseSeleccionada.value.excepciones?.find(e => e.fecha === fechaStr)
      if (!excepcion || !excepcion.cancelada) {
        dias.push({
          value: fechaStr,
          text: `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${fecha.getDate()}/${fecha.getMonth() + 1}`,
        })
      }
    }
  }
  
  return dias
})

const validarFormulario = () => {
  errores.value = {}
  
  if (!formulario.value.nombre) {
    errores.value.nombre = 'El nombre es requerido'
  }
  
  if (!formulario.value.email) {
    errores.value.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.value.email)) {
    errores.value.email = 'Email no válido'
  }
  
  if (!formulario.value.telefono) {
    errores.value.telefono = 'El teléfono es requerido'
  }
  
  if (!formulario.value.claseId) {
    errores.value.claseId = 'Debes seleccionar una clase'
  }
  
  if (!formulario.value.fechaPreferida) {
    errores.value.fechaPreferida = 'Debes seleccionar una fecha'
  }
  
  return Object.keys(errores.value).length === 0
}

const enviarSolicitud = async () => {
  if (!validarFormulario()) {
    return
  }
  
  try {
    enviando.value = true
    
    // Verificar si ya tiene solicitud pendiente
    if (clasesPruebaStore.tieneSolicitudPendiente(formulario.value.email)) {
      errores.value.email = 'Ya tienes una solicitud de clase de prueba pendiente'
      return
    }
    
    const clase = claseSeleccionada.value
    
    const datosSolicitud = {
      nombre: formulario.value.nombre,
      email: formulario.value.email,
      telefono: formulario.value.telefono,
      claseId: clase.id,
      claseNombre: clase.nombre,
      fechaPreferida: formulario.value.fechaPreferida,
      horaInicio: clase.horaInicio,
      coach: clase.coachPorDefecto,
      mensaje: formulario.value.mensaje,
    }
    
    clasesPruebaStore.crearSolicitud(datosSolicitud)
    
    exitoDialog.value = true
    
    // Limpiar formulario
    formulario.value = {
      nombre: '',
      email: '',
      telefono: '',
      claseId: null,
      fechaPreferida: '',
      mensaje: '',
    }
  } catch (error) {
    errores.value.general = error.message
  } finally {
    enviando.value = false
  }
}

const cerrarExitoDialog = () => {
  exitoDialog.value = false
}
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="text-h4 pa-6">
            🏋️ Solicitar Clase de Prueba
          </VCardTitle>
          
          <VCardText>
            <VRow>
              <VCol cols="12" md="8">
                <VAlert
                  type="info"
                  variant="tonal"
                  class="mb-6"
                >
                  <strong>¡Prueba nuestras clases gratis!</strong><br>
                  Completa el formulario y nos contactaremos contigo para coordinar tu clase de prueba.
                </VAlert>

                <VForm @submit.prevent="enviarSolicitud">
                  <VRow>
                    <!-- Nombre -->
                    <VCol cols="12" md="6">
                      <VTextField
                        v-model="formulario.nombre"
                        label="Nombre completo *"
                        placeholder="Ingresa tu nombre"
                        :error-messages="errores.nombre"
                        prepend-inner-icon="tabler-user"
                      />
                    </VCol>

                    <!-- Email -->
                    <VCol cols="12" md="6">
                      <VTextField
                        v-model="formulario.email"
                        label="Email *"
                        type="email"
                        placeholder="tu@email.com"
                        :error-messages="errores.email"
                        prepend-inner-icon="tabler-mail"
                      />
                    </VCol>

                    <!-- Teléfono -->
                    <VCol cols="12" md="6">
                      <VTextField
                        v-model="formulario.telefono"
                        label="Teléfono *"
                        placeholder="+56 9 1234 5678"
                        :error-messages="errores.telefono"
                        prepend-inner-icon="tabler-phone"
                      />
                    </VCol>

                    <!-- Clase -->
                    <VCol cols="12" md="6">
                      <VSelect
                        v-model="formulario.claseId"
                        label="Clase que te interesa *"
                        :items="clasesDisponibles"
                        item-title="nombre"
                        item-value="id"
                        placeholder="Selecciona una clase"
                        :error-messages="errores.claseId"
                        prepend-inner-icon="tabler-barbell"
                      >
                        <template #item="{ props, item }">
                          <VListItem v-bind="props">
                            <template #subtitle>
                              {{ item.raw.horaInicio }} • {{ item.raw.duracion }} min • {{ item.raw.coachPorDefecto }}
                            </template>
                          </VListItem>
                        </template>
                      </VSelect>
                    </VCol>

                    <!-- Fecha preferida -->
                    <VCol cols="12" md="6">
                      <VSelect
                        v-model="formulario.fechaPreferida"
                        label="Fecha preferida *"
                        :items="diasDisponibles"
                        :disabled="!formulario.claseId"
                        placeholder="Selecciona un día"
                        :error-messages="errores.fechaPreferida"
                        prepend-inner-icon="tabler-calendar"
                      />
                    </VCol>

                    <!-- Mensaje -->
                    <VCol cols="12">
                      <VTextarea
                        v-model="formulario.mensaje"
                        label="Mensaje adicional (opcional)"
                        placeholder="Cuéntanos un poco más sobre ti o tus objetivos..."
                        rows="3"
                        prepend-inner-icon="tabler-message"
                      />
                    </VCol>

                    <!-- Error general -->
                    <VCol v-if="errores.general" cols="12">
                      <VAlert type="error" variant="tonal">
                        {{ errores.general }}
                      </VAlert>
                    </VCol>

                    <!-- Botón enviar -->
                    <VCol cols="12">
                      <VBtn
                        type="submit"
                        color="primary"
                        size="large"
                        :loading="enviando"
                        :disabled="enviando"
                        block
                      >
                        Enviar Solicitud
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCol>

              <!-- Información lateral -->
              <VCol cols="12" md="4">
                <VCard variant="tonal" color="primary">
                  <VCardText>
                    <div class="text-h6 mb-4">
                      📋 ¿Qué incluye?
                    </div>
                    
                    <VList density="compact">
                      <VListItem prepend-icon="tabler-check">
                        <VListItemTitle>1 clase gratis</VListItemTitle>
                      </VListItem>
                      
                      <VListItem prepend-icon="tabler-check">
                        <VListItemTitle>Asesoría personalizada</VListItemTitle>
                      </VListItem>
                      
                      <VListItem prepend-icon="tabler-check">
                        <VListItemTitle>Sin compromiso</VListItemTitle>
                      </VListItem>
                      
                      <VListItem prepend-icon="tabler-check">
                        <VListItemTitle>Conoce nuestro box</VListItemTitle>
                      </VListItem>
                    </VList>

                    <VDivider class="my-4" />

                    <div class="text-body-2">
                      <strong>Importante:</strong> Te contactaremos dentro de las próximas 24 horas para confirmar tu clase de prueba.
                    </div>
                  </VCardText>
                </VCard>

                <!-- Clases disponibles -->
                <VCard class="mt-4" v-if="clasesDisponibles.length > 0">
                  <VCardText>
                    <div class="text-h6 mb-3">
                      🏋️ Clases Disponibles
                    </div>
                    
                    <VList density="compact">
                      <VListItem
                        v-for="clase in clasesDisponibles"
                        :key="clase.id"
                        :title="clase.nombre"
                        :subtitle="`${clase.horaInicio} • ${clase.duracion} min`"
                        prepend-icon="tabler-circle-dot"
                      />
                    </VList>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dialog de éxito -->
    <VDialog v-model="exitoDialog" max-width="500">
      <VCard>
        <VCardText class="text-center pa-8">
          <VIcon
            icon="tabler-circle-check"
            size="80"
            color="success"
            class="mb-4"
          />
          
          <div class="text-h5 mb-2">
            ¡Solicitud Enviada!
          </div>
          
          <div class="text-body-1 mb-4">
            Hemos recibido tu solicitud de clase de prueba. Nos contactaremos contigo pronto para confirmar tu reserva.
          </div>
          
          <VBtn
            color="primary"
            @click="cerrarExitoDialog"
          >
            Entendido
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
.v-list-item {
  padding-inline-start: 0 !important;
}
</style>
