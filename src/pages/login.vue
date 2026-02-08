<script setup>
import { useAuthStore } from '@/stores/auth'
import loginImage from '@images/logo.webp'
import muralImage from '@/assets/images/Mural Ikigai.webp'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  
  if (!form.value.email || !form.value.password) {
    errorMessage.value = 'Por favor ingrese email y contraseña'
    
    return
  }

  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password,
  })

  if (!result.success) {
    errorMessage.value = result.error
  }
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper"
    :style="{
      backgroundImage: `url(${muralImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh'
    }"
  >
    <VCol
      cols="12"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <!-- Logo -->
        <VCardText class="d-flex justify-center mb-4">
          <VImg
            :src="loginImage"
            max-width="300"
          />
        </VCardText>
        
        <VCardText>
          <h4
            class="text-h4 mb-1"
            style="color: #DC2626;"
          >
            Bienvenido IKIGAI BOX
          </h4>
          <p
            class="mb-0"
            style="color: #4B5563;"
          >
            Inicia sesión en tu cuenta para comenzar
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="handleLogin">
            <VRow>
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

              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  :disabled="authStore.isLoading"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Contraseña"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :disabled="authStore.isLoading"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="form.remember"
                    label="Recordarme"
                    :disabled="authStore.isLoading"
                  />
                  <RouterLink
                    class="text-primary"
                    :to="{ name: 'forgot-password' }"
                  >
                    ¿Olvidaste tu contraseña?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="authStore.isLoading"
                  :disabled="authStore.isLoading"
                >
                  Iniciar Sesión
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  ¿Nuevo en nuestra plataforma?
                </span>
                <RouterLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  :to="{ name: 'register' }"
                >
                  Crear una cuenta
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <!-- Footer -->
        <VCardText class="text-center">
          <p style="font-size: 14px; color: #6B7280; margin: 0;">
            Powered by <a href="https://www.alegoria.cl" target="_blank" style="color: #F97316; text-decoration: none; font-weight: 600;">Alegoria</a>
          </p>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
