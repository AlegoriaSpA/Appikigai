# Appikigai - AI Copilot Instructions

## Project Overview
**Appikigai** is a comprehensive fitness/nutrition management system for Chilean gyms (Box Ikigai). Built with Vue 3 + Vuetify 3, it manages users, nutritional evaluations, class bookings, payments, and a kiosk system.

## Core Architecture

### File-Based Routing
- Routes auto-generated from `src/pages/*.vue` via `unplugin-vue-router`
- Use `definePage()` macro to set route meta (auth, permissions): `definePage({ meta: { subject: 'users', action: 'read' } })`
- Route names are auto-generated in kebab-case (e.g., `administrar-clases.vue` → `'administrar-clases'`)
- Router guard checks JWT token in cookies (`src/plugins/1.router/index.js`)

### Auto-Import System
- **Components**: Auto-imported from `src/@core/components`, `src/components`, `src/views/demos`
- **Composables**: From `src/@core/composable/`, `src/composables/`, `src/utils/`
- **Vue APIs**: `ref`, `computed`, `watch`, `onMounted`, etc. - no imports needed
- **Router**: `useRouter()`, `useRoute()` - auto-imported from `unplugin-vue-router`
- Check `auto-imports.d.ts` and `components.d.ts` for available imports

### State Management (Pinia)
**Pattern**: Composition API style with `defineStore(name, setupFunction)`
```javascript
export const useMyStore = defineStore('storeName', () => {
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  async function fetchData() {
    loading.value = true
    try {
      const response = await $api('/api/endpoint')
      data.value = response.data || []
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }
  
  return { data, loading, error, fetchData }
})
```
- All stores in `src/stores/*.js` follow this pattern
- Always return `{ success, data?, error? }` from async actions

### API Integration
- **Client**: `$api` from `src/utils/api.js` (uses `ofetch`)
- **Base URL**: `https://api.geoapp.alegoria.cl` (Laravel backend)
- **Auth**: JWT token auto-injected from cookies (`accessToken`)
- **Error handling**: 401 errors auto-redirect to `/login`
- **Pattern**: `await $api('/api/endpoint', { method: 'POST', body: {...} })`
- See `API-ENDPOINTS.md` for complete endpoint documentation

### Component Structure
- **Pages**: `src/pages/*.vue` - file-based routing, use `<script setup>`
- **Layouts**: `src/layouts/*.vue` - `default.vue` (with nav) and `blank.vue` (login/register)
- **Core components**: `src/@core/components/*` - reusable across projects (DropZone, MathEditor, etc.)
- **App components**: `src/components/*` - project-specific (RutInput, AppPricing, etc.)
- **Navigation**: `src/navigation/vertical/index.js` - menu structure with role-based visibility

### Path Aliases (vite.config.js)
```javascript
'@' → './src'
'@core' → './src/@core'
'@layouts' → './src/@layouts'
'@images' → './src/assets/images/'
'@themeConfig' → './themeConfig.js'
```

## Chilean-Specific Conventions

### RUT Validation
- Use utilities from `src/utils/rut.js`: `validarRut()`, `formatearRut()`, `limpiarRut()`
- RutInput component in `src/components/RutInput.vue` for forms
- API field: `numero_documento` stores formatted RUT (e.g., "12.345.678-9")

### Date/Age Handling
- User model includes: `fecha_nacimiento`, `diaNacimiento`, `mesNacimiento`, `anioNacimiento`, `edad`
- Always send all date fields when updating users

## Authentication Flow
1. Login at `/login` → stores `accessToken` and `refreshToken` in cookies
2. Router guard checks token before each navigation
3. `useAuthStore()` provides: `isAuthenticated`, `currentUser`, `userRole`, `isAdmin`, `isSuperAdmin`
4. Role-based menu items use `requiredRole: ['admin', 'superadmin']` in navigation config

## Key Developer Workflows

### Adding a New Page
1. Create `src/pages/my-new-page.vue` with `<script setup>`
2. Add `definePage({ meta: { ... } })` if auth/permissions needed
3. Add route to `src/navigation/vertical/index.js` for menu visibility
4. Route auto-generated, access via `router.push({ name: 'my-new-page' })`

### Adding a New Store
1. Create `src/stores/myFeature.js`
2. Follow composition API pattern (see State Management section)
3. Export as `useMyFeatureStore`
4. Use in components: `const myStore = useMyFeatureStore()`

### Creating Forms with Validation
- Use Vuetify's `VForm`, `VTextField`, `VSelect` components
- For RUT fields, use `<RutInput v-model="form.numeroDocumento" />`
- Validate before submit: `const valid = await formRef.value?.validate()`

### Working with Roles
```javascript
const authStore = useAuthStore()
const canManageUsers = computed(() => authStore.isAdmin || authStore.isSuperAdmin)
```
**Available role checks**: `isAdmin`, `isSuperAdmin`, `isEditor`, `isSecretaria`, `isUser`, `canManageUsers`

## Data Flow Patterns

### Loading Data on Mount
```vue
<script setup>
const myStore = useMyStore()
onMounted(async () => {
  await myStore.fetchData()
})
</script>
```

### Error Handling
- Stores return `{ success, error }` - check before proceeding
- Display errors with Vuetify's `VSnackbar` or alert dialogs
- Network errors auto-handled by `$api` (see `src/utils/api.js`)

## Important Files
- **API docs**: `API-ENDPOINTS.md` (1403 lines) - complete backend reference
- **Implementation**: `IMPLEMENTACION.md` (2221 lines) - backend models/controllers
- **Theme**: `themeConfig.js` - app branding, logo, default settings
- **Router**: `src/plugins/1.router/index.js` - auth middleware
- **Auth store**: `src/stores/auth.js` - authentication logic
- **Utils**: `src/utils/rut.js` (RUT validation), `src/utils/api.js` (HTTP client)

## Development Commands
```bash
pnpm dev       # Start dev server (Vite)
pnpm build     # Production build
pnpm preview   # Preview production build
pnpm lint      # ESLint with auto-fix
```

## Testing Notes
- No test suite currently configured
- Manual testing workflow: `pnpm dev` → test in browser
- Backend API: `https://api.geoapp.alegoria.cl`

## Avoid These Mistakes
❌ Don't manually import Vue APIs (`ref`, `computed`, etc.) - they're auto-imported  
❌ Don't create routes in router config - use file-based routing in `src/pages/`  
❌ Don't use plain `fetch` - use `$api` for automatic auth headers  
❌ Don't forget Chilean RUT validation - always use `validarRut()` from utils  
❌ Don't create components in `src/@core` - that's for framework-agnostic reusables  
❌ Don't initialize stores in `setup()` if you need them reactive - declare at top level

## When Stuck
1. **Route not working?** Check `typed-router.d.ts` for generated route names
2. **Import errors?** Check `auto-imports.d.ts` - it might be auto-imported
3. **API failing?** See `API-ENDPOINTS.md` for correct endpoint structure
4. **Store not updating?** Ensure you're awaiting async actions
5. **Auth issues?** Check `useCookie('accessToken').value` is set
