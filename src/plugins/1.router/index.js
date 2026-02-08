import { useCookie } from '@core/composable/useCookie'
import { setupLayouts } from 'virtual:meta-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])
    
    return route
  }
  
  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }
    
    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages].map(route => recursiveLayouts(route)),
  ],
})

// Middleware de autenticación
router.beforeEach(async (to, from, next) => {
  const accessToken = useCookie('accessToken').value
  const isPublicRoute = to.meta.public === true

  console.log('Router guard:', {
    to: to.path,
    from: from.path,
    hasToken: !!accessToken,
    isPublic: isPublicRoute,
  })

  // Si la ruta es pública (solo /login), permitir acceso
  if (isPublicRoute || to.path === '/login') {
    // Si ya está autenticado y intenta ir al login, redirigir al dashboard
    if (to.path === '/login' && accessToken) {
      console.log('Usuario autenticado en login, redirigiendo a /')
      next('/')
      
      return
    }
    next()
    
    return
  }

  // Si no hay token, redirigir al login
  if (!accessToken) {
    console.log('Sin token, redirigiendo a /login')
    next('/login')
    
    return
  }

  // Si hay token, verificar que los datos del usuario estén cargados
  try {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    
    // Si no hay datos de usuario pero hay token, cargarlos
    if (!authStore.user && accessToken) {
      console.log('Cargando datos del usuario...')
      await authStore.checkAuth()
    }
    
    // Verificar que el usuario esté cargado correctamente
    if (!authStore.user) {
      console.log('No se pudo cargar el usuario, redirigiendo a /login')
      next('/login')
      
      return
    }
    
    console.log('Usuario autenticado y datos cargados:', {
      name: authStore.user.name,
      email: authStore.user.email,
      role: authStore.user.role,
    })
    next()
  } catch (error) {
    console.error('Error en el guard de autenticación:', error)
    next('/login')
  }
})

export { router }
export default function (app) {
  app.use(router)
}
