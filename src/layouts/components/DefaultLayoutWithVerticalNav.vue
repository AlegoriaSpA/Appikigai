<script setup>
import navItems from '@/navigation/vertical'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

// Filtrar items de navegación según el rol del usuario
const filteredNavItems = computed(() => {
  const userRole = authStore.userRole
  const user = authStore.currentUser
  
  const filterItems = items => {
    return items
      .map(item => {
        // Si el item tiene requiredRole, verificar si el usuario tiene el rol necesario
        if (item.requiredRole) {
          if (!userRole || !item.requiredRole.includes(userRole)) {
            return null
          }
        }
        
        // Si el item requiere categoría validada, verificar
        if (item.requiresValidatedCategory) {
          // Superadmin siempre tiene categoría validada
          if (user?.role === 'superadmin') {
            // Continuar, está validado
          } else if (!user?.categoria_validada) {
            return null
          }
        }
        
        // Si el item tiene children, filtrarlos también
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterItems(item.children)
          
          // Si no quedan children después del filtrado, no mostrar el item padre
          if (filteredChildren.length === 0) {
            return null
          }
          
          return {
            ...item,
            children: filteredChildren,
          }
        }
        
        return item
      })
      .filter(item => item !== null)
  }
  
  return filterItems(navItems)
})

// Components
import Footer from '@/layouts/components/Footer.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
</script>

<template>
  <VerticalNavLayout :nav-items="filteredNavItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        <!-- <NavbarThemeSwitcher /> -->

        <VSpacer />

        <!-- <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
          class="me-2"
        /> -->
        <!-- <NavBarMensajes class="me-2" /> -->
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
