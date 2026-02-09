<script setup>
import { useAuthStore } from '@/stores/auth'
import I18n from '@core/components/I18n.vue'
import loginImage from '@images/logo.webp'

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
const router = useRouter()
const { t } = useI18n()

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!email.value) {
    errorMessage.value = t('auth.enterEmail')
    
    return
  }

  isLoading.value = true

  const result = await authStore.forgotPassword(email.value)

  isLoading.value = false

  if (result.success) {
    successMessage.value = t('auth.resetLinkSent')
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
        style="background-color: #7C3AED;"
      >
        <VImg
          max-width="400"
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
        <!-- Selector de idioma -->
        <div class="d-flex justify-end mb-4">
          <I18n :languages="languages" />
        </div>
        
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
            style="color: #FFFFFF;"
          >
            {{ t('auth.forgotPasswordTitle') }}
          </h4>
          <p
            class="mb-0"
            style="color: #FFFFFF;"
          >
            {{ t('auth.forgotPasswordSubtitle') }}
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

              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  :label="t('auth.email')"
                  :placeholder="t('auth.emailPlaceholder')"
                  type="email"
                  autocomplete="off"
                  :disabled="isLoading"
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
                  {{ t('auth.sendResetLink') }}
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
                  <span>{{ t('auth.backToLogin') }}</span>
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
