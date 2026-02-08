<script setup>
import { useAuthStore } from '@/stores/auth'
import { formatearRutOnInput, validarRut, obtenerErrorRut } from '@/utils/rut'
import loginImage from '@images/logo.webp'
import { nextTick, ref, watch } from 'vue'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authStore = useAuthStore()

const form = ref({
  name: '',
  apellidos: '',
  email: '',
  telefono: '',
  numeroDocumento: '',
  password: '',
  password_confirmation: '',
  terms: false,
})

const isPasswordVisible = ref(false)
const isPasswordConfirmationVisible = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailErrors = ref([])
const rutErrors = ref([])
const showTermsDialog = ref(false)

// Validación de email en tiempo real
const validateEmail = email => {
  const errors = []
  
  if (!email) {
    return errors
  }
  
  // Expresión regular para validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    errors.push('El formato del email no es válido')
  }
  
  // Validar que tenga un dominio válido
  const domainRegex = /\.[a-z]{2,}$/i
  if (!domainRegex.test(email)) {
    errors.push('El dominio del email debe ser válido')
  }
  
  // Validar longitud
  if (email.length > 255) {
    errors.push('El email es demasiado largo')
  }
  
  // Validar que no tenga espacios
  if (/\s/.test(email)) {
    errors.push('El email no debe contener espacios')
  }
  
  return errors
}

// Validación de RUT chileno usando utilidades
const validateRutField = rut => {
  const errors = []
  
  if (!rut) {
    return errors
  }
  
  const errorRut = obtenerErrorRut(rut)
  if (errorRut) {
    errors.push(errorRut)
  }
  
  return errors
}

// Watcher para validar email mientras se escribe
watch(() => form.value.email, newEmail => {
  emailErrors.value = validateEmail(newEmail)
})

// Watcher para formatear y validar RUT automáticamente
watch(() => form.value.numeroDocumento, (newValue) => {
  if (newValue) {
    // Formatear RUT mientras se escribe
    const formatted = formatearRutOnInput(newValue)
    
    if (formatted !== newValue) {
      nextTick(() => {
        form.value.numeroDocumento = formatted
      })
    }
    
    // Validar RUT
    rutErrors.value = validateRutField(formatted)
  } else {
    rutErrors.value = []
  }
})

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validaciones básicas
  if (!form.value.name || !form.value.apellidos || !form.value.email || 
      !form.value.telefono || !form.value.numeroDocumento || 
      !form.value.password || !form.value.password_confirmation) {
    errorMessage.value = 'Por favor complete todos los campos obligatorios'
    
    return
  }
  
  // Validar email
  const emailValidationErrors = validateEmail(form.value.email)
  if (emailValidationErrors.length > 0) {
    errorMessage.value = emailValidationErrors[0]
    
    return
  }
  
  // Validar RUT
  const rutValidationErrors = validateRutField(form.value.numeroDocumento)
  if (rutValidationErrors.length > 0) {
    errorMessage.value = rutValidationErrors[0]
    
    return
  }
  
  // Validar contraseñas
  if (form.value.password.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    
    return
  }
  
  if (form.value.password !== form.value.password_confirmation) {
    errorMessage.value = 'Las contraseñas no coinciden'
    
    return
  }
  
  // Validar términos
  if (!form.value.terms) {
    errorMessage.value = 'Debe aceptar los términos y condiciones'
    
    return
  }
  
  try {
    const result = await authStore.register({
      name: form.value.name,
      apellidos: form.value.apellidos,
      email: form.value.email,
      telefono: form.value.telefono,
      numeroDocumento: form.value.numeroDocumento,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    
    if (result.success) {
      successMessage.value = 'Cuenta creada exitosamente'
    } else {
      errorMessage.value = result.message || 'Error al crear la cuenta'
    }
  } catch (error) {
    console.error('Error en registro:', error)
    errorMessage.value = 'Error al procesar el registro'
  }
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper"
    style="background-color: #fafafa;"
  >
    <VCol
      cols="12"
      class="d-flex align-center justify-center"
      style="min-block-size: 100vh; overflow-y: auto;"
    >
      <VCard
        flat
        :max-width="600"
        class="pa-6"
      >
        <!-- Logo centrado arriba en pequeño -->
        <VCardText class="d-flex justify-center mb-6">
          <VImg
            :src="loginImage"
            max-width="200"
          />
        </VCardText>
        
        <VCardText class="text-center">
          <h4
            class="text-h4 mb-1"
            style="color: #616161;"
          >
            Crear Cuenta
          </h4>
          <p
            class="mb-0"
            style="color: #616161;"
          >
            Únete a APP IKIGAI BOX
          </p>
        </VCardText>
        
        <VCardText>
          <VForm @submit.prevent="handleRegister">
            <!-- Mensajes de error y éxito -->
            <VAlert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </VAlert>

            <VAlert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="successMessage = ''"
            >
              {{ successMessage }}
            </VAlert>

            <VRow>
              <!-- Nombre -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.name"
                  autofocus
                  label="Nombre *"
                  placeholder="Ingrese su nombre"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- Apellidos -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.apellidos"
                  label="Apellido *"
                  placeholder="Ingrese su apellido"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- Email -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.email"
                  label="Email *"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  autocomplete="email"
                  name="email"
                  :disabled="authStore.isLoading"
                  :error-messages="emailErrors"
                />
              </VCol>

              <!-- Teléfono -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.telefono"
                  label="Teléfono *"
                  placeholder="+56 9 1234 5678"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- RUT -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.numeroDocumento"
                  label="RUT *"
                  placeholder="12.345.678-9"
                  :disabled="authStore.isLoading"
                  :error-messages="rutErrors"
                  hint="Ingrese RUT con puntos y guión"
                  persistent-hint
                />
              </VCol>

              <!-- Password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Contraseña *"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :disabled="authStore.isLoading"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- Password Confirmation -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password_confirmation"
                  label="Confirmar Contraseña *"
                  placeholder="············"
                  :type="isPasswordConfirmationVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="isPasswordConfirmationVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :disabled="authStore.isLoading"
                  @click:append-inner="isPasswordConfirmationVisible = !isPasswordConfirmationVisible"
                />
              </VCol>

              <VCol cols="12">
                <div class="d-flex align-center">
                  <VCheckbox
                    id="privacy-policy"
                    v-model="form.terms"
                    inline
                    :disabled="authStore.isLoading"
                  >
                    <template #label>
                      <span class="me-1 text-body-2">Acepto los</span>
                      <a
                        href="javascript:void(0)"
                        class="text-primary text-body-2"
                        @click.prevent="showTermsDialog = true"
                      >términos y condiciones</a>
                    </template>
                  </VCheckbox>
                </div>
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="authStore.isLoading"
                  :disabled="authStore.isLoading"
                >
                  Crear Cuenta
                </VBtn>
              </VCol>

              <!-- Login link -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  ¿Ya tienes una cuenta?
                </span>
                <RouterLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  :to="{ name: 'login' }"
                >
                  Iniciar Sesión
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Modal de Términos y Condiciones -->
  <VDialog
    v-model="showTermsDialog"
    max-width="600"
    scrollable
  >
    <VCard>
      <VCardTitle class="pa-4">
        <span class="text-h5">Términos y Condiciones</span>
      </VCardTitle>
      
      <VDivider />
      
      <VCardText class="pa-6">
        <div class="mb-4">
          <h3 class="text-h6 mb-2">
            1. Aceptación de Términos
          </h3>
          <p class="text-body-1">
            Al crear una cuenta en APP IKIGAI BOX, usted acepta estos términos y condiciones.
          </p>
        </div>

        <div class="mb-4">
          <h3 class="text-h6 mb-2">
            2. Uso de la Plataforma
          </h3>
          <p class="text-body-1">
            El usuario se compromete a usar la plataforma de manera responsable y para los fines establecidos.
          </p>
        </div>

        <div class="mb-4">
          <h3 class="text-h6 mb-2">
            3. Privacidad
          </h3>
          <p class="text-body-1">
            Sus datos personales serán tratados de acuerdo con nuestra política de privacidad y solo serán utilizados para la gestión de su cuenta y reservas.
          </p>
        </div>

        <div>
          <h3 class="text-h6 mb-2">
            4. Responsabilidad
          </h3>
          <p class="text-body-1 mb-0">
            El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña.
          </p>
        </div>
      </VCardText>
      
      <VDivider />
      
      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          color="grey"
          variant="text"
          @click="showTermsDialog = false"
        >
          Cerrar
        </VBtn>
        <VBtn
          color="primary"
          @click="form.terms = true; showTermsDialog = false"
        >
          Aceptar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
