export default [
  {
    title: 'Inicio',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Usuarios',
    to: { name: 'users' },
    icon: { icon: 'tabler-users' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Evaluaciones',
    to: { name: 'evaluaciones' },
    icon: { icon: 'tabler-clipboard-check' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Informes',
    to: { name: 'informes' },
    icon: { icon: 'tabler-chart-line' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Mi Perfil',
    to: { name: 'profile' },
    icon: { icon: 'tabler-user' },
  },
]
