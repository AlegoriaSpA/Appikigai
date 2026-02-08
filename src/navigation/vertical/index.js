export default [
  {
    title: 'Inicio',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Mi Plan',
    to: { name: 'mi-plan' },
    icon: { icon: 'tabler-user-check' },
  },
  {
    title: 'Contratar Plan',
    to: { name: 'planes-disponibles' },
    icon: { icon: 'tabler-shopping-cart' },
  },
  {
    title: 'Clases',
    to: { name: 'clases' },
    icon: { icon: 'tabler-calendar' },
  },
  {
    title: 'Clase de Prueba',
    to: { name: 'clase-prueba' },
    icon: { icon: 'tabler-discount-check' },
  },
  {
    title: 'Check In',
    to: { name: 'check-in-clases' },
    icon: { icon: 'tabler-clipboard-check' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Administrar Clases',
    to: { name: 'administrar-clases' },
    icon: { icon: 'tabler-calendar-cog' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Gestionar Pruebas',
    to: { name: 'administrar-clases-prueba' },
    icon: { icon: 'tabler-clipboard-list' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Usuarios',
    to: { name: 'users' },
    icon: { icon: 'tabler-users' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Administrar Planes',
    to: { name: 'planes' },
    icon: { icon: 'tabler-settings' },
    requiredRole: ['admin', 'superadmin'],
  },
  {
    title: 'Pagos',
    icon: { icon: 'tabler-cash' },
    requiredRole: ['admin', 'superadmin'],
    badgeClass: 'bg-error',
    class: 'nav-item-pagos',
    children: [
      {
        title: 'Validar Pagos',
        to: { name: 'validar-pagos' },
        icon: { icon: 'tabler-file-check' },
      },
      {
        title: 'Todos los Pagos',
        to: { name: 'todos-los-pagos' },
        icon: { icon: 'tabler-receipt' },
      },
    ],
  },
  {
    title: 'Mi Perfil',
    to: { name: 'profile' },
    icon: { icon: 'tabler-user' },
  },
]
