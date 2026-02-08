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
    title: 'Mi Perfil',
    to: { name: 'profile' },
    icon: { icon: 'tabler-user' },
  },
]
