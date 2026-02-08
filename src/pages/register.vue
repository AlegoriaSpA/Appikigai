<script setup>
import { useAuthStore } from '@/stores/auth'
import { formatearRutOnInput, validarRut, obtenerErrorRut } from '@/utils/rut'
import I18n from '@core/components/I18n.vue'
import loginImage from '@images/logo.webp'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const languages = [
  { i18nLang: 'es', label: 'Español' },
  { i18nLang: 'en', label: 'English' },
]

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authStore = useAuthStore()
const { t } = useI18n()

const areasInteres = computed(() => [
  { value: 'at1', label: t('auth.at1') },
  { value: 'at2', label: t('auth.at2') },
  { value: 'at3', label: t('auth.at3') },
  { value: 'at4', label: t('auth.at4') },
  { value: 'at5', label: t('auth.at5') },
  { value: 'at6', label: t('auth.at6') },
  { value: 'at7', label: t('auth.at7') },
  { value: 'at8', label: t('auth.at8') },
  { value: 'at9', label: t('auth.at9') },
])

const categoriasParticipacion = [
  {
    value: 'profesional',
    label: 'Profesional',
    descripcion: 'Profesional, nacional o extranjero, a quien se desempeña en la industria, empresas consultoras y otras instituciones públicas y privadas.',
    documento: null,
  },
  {
    value: 'academico',
    label: 'Académico',
    descripcion: 'Académico, nacional o extranjero, a quien se desempeña como docente y/o investigador y/o técnico en establecimientos educacionales, centros de investigación e instituciones afines.',
    documento: null,
  },
  {
    value: 'mayor_65',
    label: 'Mayores de 65 años',
    descripcion: '',
    documento: 'copia de la cédula de identidad',
  },
  {
    value: 'postdoctorado',
    label: 'Postdoctorado',
    descripcion: 'Quien se encuentra cursando su postdoctorado al momento de la inscripción',
    documento: 'copia del contrato postdoctoral.',
  },
  {
    value: 'joven_profesional',
    label: 'Joven Profesional',
    descripcion: 'Se define como joven profesional, nacional o extranjero, a quien se tituló hace menos de 2 años',
    documento: 'certificado válido de titulación.',
  },
  {
    value: 'estudiante_pregrado',
    label: 'Estudiante de Pregrado',
    descripcion: '',
    documento: 'certificado de alumno regular válido al momento de la inscripción en la plataforma',
  },
  {
    value: 'estudiante_magister',
    label: 'Estudiante de Magister',
    descripcion: '',
    documento: 'certificado de alumno regular válido al momento de la inscripción en la plataforma',
  },
  {
    value: 'estudiante_doctorado',
    label: 'Estudiante de Doctorado',
    descripcion: '',
    documento: 'certificado de alumno regular válido al momento de la inscripción en la plataforma',
  },
  {
    value: 'acompanante',
    label: 'Acompañante',
    descripcion: 'Quien participa solamente en las actividades sociales del Congreso (ceremonias de inauguración y de clausura, etc.), estando asociado a un participante de una de las categorías anteriormente descritas. El acompañante no tendrá acceso ni participación en las actividades académicas del congreso.',
    documento: null,
  },
]

const form = ref({
  name: '',
  apellidos: '',
  email: '',
  password: '',
  password_confirmation: '',
  tipoDocumento: 'rut',
  numeroDocumento: '',
  telefono: '',
  nacionalidad: '',
  afiliacion: '',
  categoriaParticipacion: '',
  documentoAdjunto: null,
  terms: false,
})

const isPasswordVisible = ref(false)
const isPasswordConfirmationVisible = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailErrors = ref([])
const rutErrors = ref([])
const showTermsDialog = ref(false)
const documentoPreview = ref(null)
const documentoError = ref('')
const sinAfiliacion = ref(false)

// Watch para limpiar afiliación cuando se marca "sin afiliación"
watch(sinAfiliacion, (newVal) => {
  if (newVal) {
    form.value.afiliacion = ''
  }
})

const categoriaSeleccionada = computed(() => {
  return categoriasParticipacion.find(c => c.value === form.value.categoriaParticipacion)
})

const handleDocumentoChange = event => {
  const file = event.target.files[0]
  documentoError.value = ''
  
  if (!file) {
    form.value.documentoAdjunto = null
    documentoPreview.value = null
    return
  }
  
  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    documentoError.value = 'Solo se permiten archivos JPG, PNG o PDF'
    event.target.value = ''
    return
  }
  
  // Validar tamaño (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    documentoError.value = 'El archivo no debe superar los 5MB'
    event.target.value = ''
    return
  }
  
  form.value.documentoAdjunto = file
  
  // Crear preview si es imagen
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = e => {
      documentoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    documentoPreview.value = null
  }
}

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
watch(() => form.value.numeroDocumento, (newValue, oldValue) => {
  if (form.value.tipoDocumento === 'rut' && newValue) {
    // Formatear RUT mientras se escribe
    const formatted = formatearRutOnInput(newValue)
    
    if (formatted !== newValue) {
      nextTick(() => {
        form.value.numeroDocumento = formatted
      })
    }
    
    // Validar RUT usando la nueva utilidad
    rutErrors.value = validateRutField(newValue)
  } else if (form.value.tipoDocumento === 'pasaporte') {
    rutErrors.value = []
  }
})

// Limpiar errores de RUT al cambiar tipo de documento
watch(() => form.value.tipoDocumento, () => {
  rutErrors.value = []
})

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validaciones básicas
  if (!form.value.name || !form.value.apellidos || !form.value.email || !form.value.password) {
    errorMessage.value = t('auth.completeAllFields')
    
    return
  }
  
  // Validar formato de email
  const emailValidationErrors = validateEmail(form.value.email)
  if (emailValidationErrors.length > 0) {
    errorMessage.value = emailValidationErrors.join('. ')
    
    return
  }
  
  // Validar RUT chileno si es tipo RUT
  if (form.value.tipoDocumento === 'rut' && form.value.numeroDocumento) {
    const rutValidationErrors = validateRutField(form.value.numeroDocumento)
    if (rutValidationErrors.length > 0) {
      errorMessage.value = rutValidationErrors.join('. ')
      
      return
    }
  }
  
  if (form.value.password !== form.value.password_confirmation) {
    errorMessage.value = t('auth.passwordsNotMatch')
    
    return
  }
  
  if (form.value.password.length < 8) {
    errorMessage.value = t('auth.passwordMinLength')
    
    return
  }
  
  if (!form.value.terms) {
    errorMessage.value = t('auth.mustAcceptTerms')
    
    return
  }

  const result = await authStore.register(form.value)

  if (result.success) {
    successMessage.value = t('auth.accountCreatedSuccess')

    // El authStore ya maneja la redirección
  } else {
    errorMessage.value = result.error
  }
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
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
        <!-- Selector de idioma -->
        <div class="d-flex justify-end mb-4">
          <I18n :languages="languages" />
        </div>

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
            {{ t('auth.registerTitle') }}
          </h4>
          <p
            class="mb-0"
            style="color: #616161;"
          >
            {{ t('auth.registerSubtitle') }}
          </p>
        </VCardText>
        
        <VCardText>
          <VForm @submit.prevent="handleRegister">
            <VRow>
              <!-- Mensaje de éxito -->
              <VCol 
                v-if="successMessage"
                cols="12"
              >
                <VAlert
                  type="success"
                  variant="tonal"
                >
                  {{ successMessage }}
                </VAlert>
              </VCol>

              <!-- Mensaje de error -->
              <VCol 
                v-if="errorMessage"
                cols="12"
              >
                <VAlert
                  type="error"
                  variant="tonal"
                  closable
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <!-- Nombre -->
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.name"
                  autofocus
                  :label="t('auth.name') + ' *'"
                  :placeholder="t('auth.namePlaceholder')"
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
                  :label="t('auth.lastName') + ' *'"
                  :placeholder="t('auth.lastNamePlaceholder')"
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
                  :label="t('auth.email') + ' *'"
                  type="email"
                  :placeholder="t('auth.emailPlaceholder')"
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
                  :label="t('auth.phone')"
                  :placeholder="t('auth.phonePlaceholder')"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- Tipo de Documento -->
              <VCol cols="12">
                <VSelect
                  v-model="form.tipoDocumento"
                  :label="t('auth.documentType')"
                  :items="[
                    { title: t('auth.rut'), value: 'rut' },
                    { title: t('auth.passport'), value: 'pasaporte' }
                  ]"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- Número de Documento -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.numeroDocumento"
                  :label="t('auth.documentNumber')"
                  :placeholder="form.tipoDocumento === 'rut' ? t('auth.documentNumberPlaceholder') : t('auth.passportPlaceholder')"
                  :disabled="authStore.isLoading"
                  :error-messages="form.tipoDocumento === 'rut' ? rutErrors : []"
                  :hint="form.tipoDocumento === 'rut' ? t('auth.documentFormat') : ''"
                  persistent-hint
                />
              </VCol>

              <!-- Nacionalidad -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.nacionalidad"
                  :label="t('auth.nationality')"
                  :placeholder="t('auth.nationalityPlaceholder')"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- Checkbox Sin Afiliación -->
              <VCol cols="12">
                <VCheckbox
                  v-model="sinAfiliacion"
                  label="Sin afiliación"
                  :disabled="authStore.isLoading"
                  density="compact"
                />
              </VCol>

              <!-- Afiliación -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.afiliacion"
                  :label="sinAfiliacion ? 'Afiliación' : 'Afiliación *'"
                  placeholder="Ingrese su institución o empresa"
                  :disabled="authStore.isLoading || sinAfiliacion"
                />
              </VCol>

              <!-- Categoría de Participación -->
              <VCol cols="12">
                <AppSelect
                  v-model="form.categoriaParticipacion"
                  label="Categoría de Participación *"
                  :items="categoriasParticipacion"
                  item-title="label"
                  item-value="value"
                  placeholder="Seleccione una categoría"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- Descripción de la categoría seleccionada -->
              <VCol
                v-if="categoriaSeleccionada && categoriaSeleccionada.descripcion"
                cols="12"
              >
                <VAlert
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  {{ categoriaSeleccionada.descripcion }}
                </VAlert>
              </VCol>

              <!-- Documento Adjunto (solo si la categoría lo requiere) -->
              <VCol
                v-if="categoriaSeleccionada && categoriaSeleccionada.documento"
                cols="12"
              >
                <div class="mb-2">
                  <label class="text-body-1 font-weight-medium d-block mb-2">
                    Documento Requerido *
                  </label>
                  <p class="text-body-2 text-medium-emphasis mb-3">
                    Por favor adjunte: {{ categoriaSeleccionada.documento }}
                  </p>
                  <p class="text-caption text-medium-emphasis mb-3">
                    Formatos aceptados: JPG, PNG, PDF (máximo 5MB)
                  </p>
                </div>

                <VFileInput
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  label="Adjuntar documento"
                  prepend-icon=""
                  prepend-inner-icon="tabler-paperclip"
                  variant="outlined"
                  :disabled="authStore.isLoading"
                  :error-messages="documentoError"
                  @change="handleDocumentoChange"
                />

                <!-- Preview de imagen -->
                <div
                  v-if="documentoPreview"
                  class="mt-3"
                >
                  <VImg
                    :src="documentoPreview"
                    max-height="200"
                    contain
                    class="rounded"
                  />
                </div>

                <!-- Nombre del archivo PDF -->
                <div
                  v-if="form.documentoAdjunto && form.documentoAdjunto.type === 'application/pdf'"
                  class="mt-3"
                >
                  <VChip
                    color="primary"
                    variant="tonal"
                  >
                    <VIcon
                      start
                      icon="tabler-file-type-pdf"
                    />
                    {{ form.documentoAdjunto.name }}
                  </VChip>
                </div>
              </VCol>

              <!-- Password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :label="t('auth.password') + ' *'"
                  :placeholder="t('auth.passwordPlaceholder')"
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
                  :label="t('auth.confirmPassword') + ' *'"
                  :placeholder="t('auth.passwordPlaceholder')"
                  :type="isPasswordConfirmationVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="isPasswordConfirmationVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :disabled="authStore.isLoading"
                  @click:append-inner="isPasswordConfirmationVisible = !isPasswordConfirmationVisible"
                />
              </VCol>

              <!-- Terms -->
              <VCol cols="12">
                <VCheckbox
                  v-model="form.terms"
                  :disabled="authStore.isLoading"
                >
                  <template #label>
                    <span class="text-body-2">
                      {{ t('auth.acceptTerms') }}
                      <a
                        href="javascript:void(0)"
                        class="text-primary"
                        @click.prevent="showTermsDialog = true"
                      >{{ t('auth.termsAndConditions') }}</a>
                    </span>
                  </template>
                </VCheckbox>
              </VCol>

              <!-- Aviso Importante -->
              <VCol cols="12">
                <VAlert
                  type="warning"
                  variant="tonal"
                  density="comfortable"
                >
                  <template #prepend>
                    <VIcon icon="tabler-alert-circle" />
                  </template>
                  <VAlertTitle class="mb-2">
                    Información Importante
                  </VAlertTitle>
                  <div class="text-body-2">
                    <p class="mb-2">
                      Por favor, <strong>revise cuidadosamente</strong> toda la información antes de registrarse:
                    </p>
                    <ul class="mb-0 ps-4">
                      <li class="mb-1">Su documentación será verificada por el equipo organizador.</li>
                      <li class="mb-1">La categoría de participación y datos ingresados determinarán el <strong>valor de su entrada</strong>.</li>
                      <li class="mb-0">Esta información se utilizará para emitir su <strong>credencial oficial del congreso</strong>, donde se verá reflejado el <strong>nombre completo y la afiliación</strong> que usted consigne.</li>
                    </ul>
                  </div>
                </VAlert>
              </VCol>

              <!-- Submit Button -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="authStore.isLoading"
                  :disabled="authStore.isLoading"
                >
                  {{ t('auth.createAccountButton') }}
                </VBtn>
              </VCol>

              <!-- Login link -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  {{ t('auth.alreadyHaveAccount') }}
                </span>
                <RouterLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  :to="{ name: 'login' }"
                >
                  {{ t('auth.signInLink') }}
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
    max-width="1000"
    scrollable
  >
    <VCard class="terms-dialog">
      <VCardTitle class="text-h6 pa-6 bg-primary text-white d-flex align-center">
        <VIcon icon="tabler-file-text" class="me-2" />
        {{ t('auth.termsTitle') }}
      </VCardTitle>
      
      <VDivider />
      
      <VCardText class="pa-0">
        <VContainer class="pa-6">
          <VAlert
            type="info"
            variant="tonal"
            class="mb-6"
            icon="tabler-info-circle"
          >
            {{ t('auth.termsIntro') }}
          </VAlert>

          <!-- Sección 1: Código de geoética -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-book" size="20" class="me-2" />
              {{ t('auth.terms1Title') }}
            </h3>
            <p class="text-body-1 mb-2">
              {{ t('auth.terms1Content') }}
            </p>
            <p class="text-body-2 mb-0">
              <a 
                href="/src/assets/images/CODIGO DE GEOETICA DE CHILE 2024 (1).pdf" 
                download 
                class="text-primary font-weight-medium"
              >
                <VIcon icon="tabler-download" size="16" class="me-1" />
                {{ t('auth.terms1Download') }}
              </a>
            </p>
          </div>

          <!-- Sección 2: Participación voluntaria -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-user-check" size="20" class="me-2" />
              {{ t('auth.terms2Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms2Content') }}
            </p>
          </div>

          <!-- Sección 3: Riesgos -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-alert-triangle" size="20" class="me-2" />
              {{ t('auth.terms3Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms3Content') }}
            </p>
          </div>

          <!-- Sección 4: Beneficios -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-gift" size="20" class="me-2" />
              {{ t('auth.terms4Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms4Content') }}
            </p>
          </div>

          <!-- Sección 5: Confidencialidad -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-shield-lock" size="20" class="me-2" />
              {{ t('auth.terms5Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms5Content') }}
            </p>
          </div>

          <!-- Sección 6: Renuncia de acciones -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-file-x" size="20" class="me-2" />
              {{ t('auth.terms6Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms6Content') }}
            </p>
          </div>

          <!-- Sección 7: Derecho a negarse o retirarse -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-logout" size="20" class="me-2" />
              {{ t('auth.terms7Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms7Content') }}
            </p>
          </div>

          <!-- Sección 8: Contacto -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-primary d-flex align-center">
              <VIcon icon="tabler-mail" size="20" class="me-2" />
              {{ t('auth.terms8Title') }}
            </h3>
            <p class="text-body-1 mb-0">
              {{ t('auth.terms8Content') }}
            </p>
          </div>

          <!-- Sección 9: Consentimiento -->
          <div>
            <VAlert
              type="success"
              variant="tonal"
              icon="tabler-check"
            >
              <h3 class="text-h6 mb-2">
                {{ t('auth.terms9Title') }}
              </h3>
              <p class="text-body-1 mb-0">
                {{ t('auth.terms9Content') }}
              </p>
            </VAlert>
          </div>
        </VContainer>
      </VCardText>
      
      <VDivider />
      
      <VCardActions class="pa-4 bg-grey-lighten-4">
        <VSpacer />
        <VBtn
          color="grey-darken-1"
          variant="outlined"
          @click="showTermsDialog = false"
        >
          <VIcon icon="tabler-x" start />
          {{ t('auth.close') }}
        </VBtn>
        <VBtn
          color="primary"
          @click="form.terms = true; showTermsDialog = false"
        >
          <VIcon icon="tabler-check" start />
          {{ t('auth.termsAcceptButton') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
