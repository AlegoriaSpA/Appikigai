<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

const user = computed(() => authStore.currentUser)

const userName = computed(() => {
  if (!user.value) return 'Cargando...'
  
  return user.value.name || user.value.email || 'Usuario'
})

const userInitials = computed(() => {
  if (!user.value) return 'U'
  
  // Si no hay nombre, usar las iniciales del email
  if (!user.value.name) {
    const email = user.value.email || ''
    
    return email.substring(0, 2).toUpperCase() || 'U'
  }
  
  const names = user.value.name.trim().split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  
  return names[0].substring(0, 2).toUpperCase()
})

const userRole = computed(() => {
  if (!user.value) return ''
  
  // Mapear roles a nombres legibles
  const roleMap = {
    superadmin: 'Super Admin',
    admin: 'Administrador',
    editor: 'Editor',
    secretaria: 'Secretaria',
    user: 'Usuario',

    // Agregar más roles aquí según se requieran
  }
  
  const role = user.value.role || user.value.tipo || ''
  
  // Si el rol no está en el mapa, mostrarlo capitalizado
  return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1) || 'Usuario'
})

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="#DC2626"
      style="background-color: #fee2e2;"
    >
      <span style="color: #DC2626; font-weight: 600;">{{ userInitials }}</span>

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="#DC2626"
                    style="background-color: #fee2e2;"
                  >
                    <span style="color: #DC2626; font-weight: 600;">{{ userInitials }}</span>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userName }}
            </VListItemTitle>
            <VListItemSubtitle>{{ userRole }}</VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem 
            link
            to="/profile"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-user"
                size="22"
              />
            </template>

            <VListItemTitle>Perfil</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem 
            link
            to="/settings"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-settings"
                size="22"
              />
            </template>

            <VListItemTitle>Configuración</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem 
            link
            @click="handleLogout"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Cerrar Sesión</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
