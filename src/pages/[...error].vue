<script setup>
definePage({
  alias: '/pages/misc/not-found/:error(.*)',
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="error-page">
    <VContainer class="fill-height">
      <VRow
        align="center"
        justify="center"
      >
        <VCol
          cols="12"
          md="8"
          lg="6"
        >
          <VCard
            class="text-center pa-8"
            elevation="0"
          >
            <!-- Logo -->
            <div class="mb-6">
              <img
                src="/src/assets/images/logo.webp"
                alt="Logo APP IKIGAI BOX"
                style="max-width: 150px; height: auto;"
                class="mx-auto d-block"
              />
            </div>

            <!-- Error 404 -->
            <div class="error-code mb-4">
              404
            </div>

            <h1 class="text-h4 font-weight-bold mb-4">
              Página No Encontrada
            </h1>

            <p class="text-body-1 text-medium-emphasis mb-8">
              Lo sentimos, no pudimos encontrar la página que estás buscando.
              Es posible que haya sido movida o eliminada.
            </p>

            <!-- Botón de acción -->
            <VBtn
              to="/"
              color="primary"
              size="large"
              variant="elevated"
            >
              <VIcon
                start
                icon="tabler-home"
              />
              Volver al Inicio
            </VBtn>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  color: rgb(var(--v-theme-primary));
  opacity: 0.3;
  letter-spacing: -0.02em;
}

@media (max-width: 600px) {
  .error-code {
    font-size: 5rem;
  }
}
</style>

