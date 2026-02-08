export default [
  {
    title: 'Inicio',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Mi Plan',
    to: { name: 'mi-plan' },
    icon: { icon: 'tabler-package' },
  },
  {
    title: 'Usuarios',
    to: { name: 'users' },
    icon: { icon: 'tabler-users' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Planes',
    to: { name: 'planes' },
    icon: { icon: 'tabler-credit-card' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Validar Pagos',
    to: { name: 'validar-pagos' },
    icon: { icon: 'tabler-file-check' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Mi Perfil',
    to: { name: 'profile' },
    icon: { icon: 'tabler-user' },
  },
]
