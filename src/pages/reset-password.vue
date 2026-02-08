<script setup>
import { useAuthStore } from '@/stores/auth'
import loginImage from '@images/logo.webp'
import ondasImage from '@images/ondas1.svg?url'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = ref({
  password: '',
  password_confirmation: '',
})

const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const token = computed(() => route.query.token)
const email = computed(() => route.query.email)

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!form.value.password) {
    errorMessage.value = 'Por favor ingrese una contraseña'
    
    return
  }

  if (form.value.password.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres'
    
    return
  }

  if (form.value.password !== form.value.password_confirmation) {
    errorMessage.value = 'Las contraseñas no coinciden'
    
    return
  }

  if (!token.value || !email.value) {
    errorMessage.value = 'Token o email inválido'
    
    return
  }

  isLoading.value = true

  const result = await authStore.resetPassword({
    email: email.value,
    token: token.value,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
  })

  isLoading.value = false

  if (result.success) {
    successMessage.value = 'Contraseña restablecida exitosamente. Redirigiendo al login...'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
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
      md="8"
      class="d-none d-md-flex"
    >
      <div 
        class="position-relative w-100 me-0 d-flex align-center justify-center"
        :style="{ 
          backgroundImage: `url(${ondasImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }"
      >
        <VImg
          max-width="613"
          :src="loginImage"
          class="auth-illustration"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <!-- Logo para móvil -->
        <VCardText class="d-flex d-md-none justify-center mb-4">
          <VImg
            :src="loginImage"
            max-width="300"
          />
        </VCardText>
        
        <VCardText>
          <h4
            class="text-h4 mb-1"
            style="color: #616161;"
          >
            Restablecer contraseña 🔐
          </h4>
          <p
            class="mb-0"
            style="color: #616161;"
          >
            Ingresa tu nueva contraseña
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="handleSubmit">
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
                >
                  {{ errorMessage }}
                </VAlert>
              </VCol>

              <!-- Nueva contraseña -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Nueva contraseña"
                  placeholder="Mínimo 8 caracteres"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :disabled="isLoading"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>

              <!-- Confirmar contraseña -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password_confirmation"
                  label="Confirmar contraseña"
                  placeholder="Repite tu contraseña"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  autocomplete="new-password"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :disabled="isLoading"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- submit button -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                  :disabled="isLoading"
                >
                  Restablecer contraseña
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol
                cols="12"
                class="text-center"
              >
                <RouterLink
                  class="text-primary d-inline-block"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    size="20"
                    class="me-1"
                  />
                  <span>Volver al inicio de sesión</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
