<script setup>
import { ref, computed } from 'vue'
import { useKioskoStore } from '@/stores/kiosko'
import { useUsersStore } from '@/stores/users'

definePage({
  meta: {
    subject: 'kiosko',
    action: 'manage',
    requiredRole: ['admin', 'superadmin'],
  },
})

const kioskoStore = useKioskoStore()
const usersStore = useUsersStore()

// Estado local
const busquedaProducto = ref('')
const busquedaUsuario = ref('')
const productoSeleccionado = ref(null)
const usuarioSeleccionado = ref(null)
const cantidad = ref(1)
const metodoPago = ref('Efectivo')
const mostrarExito = ref(false)
const dialogEditar = ref(false)
const ventaEditando = ref(null)
const cantidadEditar = ref(1)
const metodoPagoEditar = ref('Efectivo')

const metodosPago = [
  'Efectivo',
  'Transferencia',
  'Otro',
]

// Productos filtrados para búsqueda
const productosFiltrados = computed(() => {
  if (!busquedaProducto.value || busquedaProducto.value.length < 2) {
    return []
  }
  return kioskoStore.buscarProductos(busquedaProducto.value).slice(0, 10)
})

// Usuarios filtrados para búsqueda
const usuariosFiltrados = computed(() => {
  if (!busquedaUsuario.value || busquedaUsuario.value.length < 2) {
    return []
  }
  
  const termino = busquedaUsuario.value.toLowerCase()
  return usersStore.users
    .filter(u => 
      u.fullName?.toLowerCase().includes(termino) ||
      u.username?.toLowerCase().includes(termino) ||
      u.email?.toLowerCase().includes(termino)
    )
    .slice(0, 10)
})

// Total de la venta
const totalVenta = computed(() => {
  if (!productoSeleccionado.value) return 0
  return productoSeleccionado.value.precio * cantidad.value
})

// Stock disponible
const stockDisponible = computed(() => {
  if (!productoSeleccionado.value) return 0
  return productoSeleccionado.value.stock
})

// Seleccionar producto
const seleccionarProducto = (producto) => {
  productoSeleccionado.value = producto
  busquedaProducto.value = producto.nombre
  cantidad.value = 1
}

// Seleccionar usuario
const seleccionarUsuario = (usuario) => {
  usuarioSeleccionado.value = usuario
  busquedaUsuario.value = usuario.fullName || usuario.username
}

// Limpiar selección de producto
const limpiarProducto = () => {
  productoSeleccionado.value = null
  busquedaProducto.value = ''
  cantidad.value = 1
}

// Limpiar selección de usuario
const limpiarUsuario = () => {
  usuarioSeleccionado.value = null
  busquedaUsuario.value = ''
}

// Registrar venta
const registrarVenta = () => {
  if (!usuarioSeleccionado.value) {
    alert('Por favor selecciona un usuario')
    return
  }

  if (!productoSeleccionado.value) {
    alert('Por favor selecciona un producto')
    return
  }

  if (cantidad.value <= 0) {
    alert('La cantidad debe ser mayor a 0')
    return
  }

  if (cantidad.value > stockDisponible.value) {
    alert(`Stock insuficiente. Disponible: ${stockDisponible.value}`)
    return
  }

  try {
    kioskoStore.registrarVenta({
      productoId: productoSeleccionado.value.id,
      usuarioId: usuarioSeleccionado.value.id,
      usuarioNombre: usuarioSeleccionado.value.fullName || usuarioSeleccionado.value.username,
      cantidad: cantidad.value,
      metodoPago: metodoPago.value,
    })

    // Mostrar mensaje de éxito
    mostrarExito.value = true
    setTimeout(() => {
      mostrarExito.value = false
    }, 3000)

    // Limpiar formulario
    limpiarProducto()
    limpiarUsuario()
    metodoPago.value = 'Efectivo'
  } catch (error) {
    alert(error.message)
  }
}

// Formatear precio
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(precio)
}

// Eliminar venta
const eliminarVenta = (ventaId) => {
  if (confirm('¿Estás seguro de eliminar esta venta? Se devolverá el stock al inventario.')) {
    kioskoStore.eliminarVenta(ventaId)
  }
}

// Abrir diálogo para editar venta
const abrirDialogEditar = (venta) => {
  ventaEditando.value = venta
  cantidadEditar.value = venta.cantidad
  metodoPagoEditar.value = venta.metodoPago
  dialogEditar.value = true
}

// Guardar edición de venta
const guardarEdicion = () => {
  if (cantidadEditar.value <= 0) {
    alert('La cantidad debe ser mayor a 0')
    return
  }

  const resultado = kioskoStore.actualizarVenta(ventaEditando.value.id, {
    cantidad: cantidadEditar.value,
    metodoPago: metodoPagoEditar.value,
  })

  if (resultado.success) {
    dialogEditar.value = false
    ventaEditando.value = null
  } else {
    alert(resultado.error)
  }
}

// Cargar usuarios al montar
usersStore.fetchUsers()
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- Alerta de éxito -->
      <VAlert
        v-if="mostrarExito"
        type="success"
        variant="tonal"
        class="mb-4"
        closable
      >
        <strong>¡Venta registrada exitosamente!</strong>
      </VAlert>

      <VCard>
        <VCardTitle>
          <VIcon
            start
            icon="tabler-shopping-cart"
          />
          Registrar Venta
        </VCardTitle>

        <VCardText>
          <VRow>
            <!-- Selección de Usuario -->
            <VCol
              cols="12"
              md="6"
            >
              <VCard
                variant="outlined"
                class="mb-4"
              >
                <VCardTitle class="text-body-1">
                  1. Seleccionar Cliente
                </VCardTitle>
                <VCardText>
                  <VTextField
                    v-model="busquedaUsuario"
                    label="Buscar por nombre, usuario o email"
                    prepend-inner-icon="tabler-search"
                    autocomplete="off"
                    clearable
                    @click:clear="limpiarUsuario"
                  />

                  <!-- Lista de usuarios -->
                  <VList
                    v-if="usuariosFiltrados.length > 0"
                    class="mt-2"
                  >
                    <VListItem
                      v-for="usuario in usuariosFiltrados"
                      :key="usuario.id"
                      @click="seleccionarUsuario(usuario)"
                    >
                      <template #prepend>
                        <VAvatar
                          color="primary"
                          size="40"
                        >
                          <span class="text-white">
                            {{ (usuario.fullName || usuario.username || '?').charAt(0).toUpperCase() }}
                          </span>
                        </VAvatar>
                      </template>

                      <VListItemTitle>{{ usuario.fullName || usuario.username }}</VListItemTitle>
                      <VListItemSubtitle>{{ usuario.email }}</VListItemSubtitle>
                    </VListItem>
                  </VList>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Selección de Producto -->
            <VCol
              cols="12"
              md="6"
            >
              <VCard
                variant="outlined"
                class="mb-4"
              >
                <VCardTitle class="text-body-1">
                  2. Seleccionar Producto
                </VCardTitle>
                <VCardText>
                  <VTextField
                    v-model="busquedaProducto"
                    label="Buscar producto"
                    prepend-inner-icon="tabler-search"
                    autocomplete="off"
                    clearable
                    @click:clear="limpiarProducto"
                  />

                  <!-- Búsquedas rápidas -->
                  <div class="d-flex gap-2 mt-2 flex-wrap">
                    <VChip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="busquedaProducto = 'Monster'"
                    >
                      Monster
                    </VChip>
                    <VChip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="busquedaProducto = 'Gatorade'"
                    >
                      Gatorade
                    </VChip>
                    <VChip
                      size="small"
                      color="primary"
                      variant="outlined"
                      @click="busquedaProducto = 'Powerade'"
                    >
                      Powerade
                    </VChip>
                  </div>

                  <!-- Lista de productos -->
                  <VList
                    v-if="productosFiltrados.length > 0"
                    class="mt-2"
                  >
                    <VListItem
                      v-for="producto in productosFiltrados"
                      :key="producto.id"
                      @click="seleccionarProducto(producto)"
                    >
                      <VListItemTitle>{{ producto.nombre }}</VListItemTitle>
                      <VListItemSubtitle>
                        {{ formatearPrecio(producto.precio) }} | Stock: {{ producto.stock }}
                      </VListItemSubtitle>
                    </VListItem>
                  </VList>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Detalles de la venta -->
            <VCol cols="12">
              <VCard
                variant="outlined"
                :disabled="!usuarioSeleccionado || !productoSeleccionado"
              >
                <VCardTitle class="text-h6 text-center pa-4">
                  3. Detalles de la Venta
                </VCardTitle>
                <VDivider />
                <VCardText class="pa-6">
                  <VRow class="align-center">
                    <!-- Cantidad -->
                    <VCol
                      cols="12"
                      sm="6"
                      md="3"
                    >
                      <div class="text-center">
                        <div class="text-subtitle-2 mb-3">
                          Cantidad
                        </div>
                        <VTextField
                          v-model.number="cantidad"
                          type="number"
                          min="1"
                          :max="stockDisponible"
                          suffix="unidades"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                        />
                      </div>
                    </VCol>

                    <!-- Método de Pago -->
                    <VCol
                      cols="12"
                      sm="6"
                      md="6"
                    >
                      <div class="text-center">
                        <div class="text-subtitle-2 mb-3">
                          Método de Pago
                        </div>
                        <div class="d-flex gap-2 flex-wrap justify-center">
                          <VChip
                            v-for="metodo in metodosPago"
                            :key="metodo"
                            :color="metodoPago === metodo ? 'primary' : 'default'"
                            :variant="metodoPago === metodo ? 'flat' : 'outlined'"
                            size="large"
                            @click="metodoPago = metodo"
                          >
                            {{ metodo }}
                          </VChip>
                        </div>
                      </div>
                    </VCol>

                    <!-- Total -->
                    <VCol
                      cols="12"
                      md="3"
                    >
                      <div class="text-center">
                        <div class="text-subtitle-2 mb-3">
                          Total a Pagar
                        </div>
                        <div class="text-h4 text-primary font-weight-bold">
                          {{ formatearPrecio(totalVenta) }}
                        </div>
                      </div>
                    </VCol>
                  </VRow>
                </VCardText>

                <VDivider />
                <VCardActions class="justify-center pa-6">
                  <VBtn
                    color="error"
                    size="x-large"
                    variant="flat"
                    min-width="250"
                    :disabled="!usuarioSeleccionado || !productoSeleccionado"
                    @click="registrarVenta"
                  >
                    <VIcon
                      start
                      icon="tabler-check"
                    />
                    Registrar Venta
                  </VBtn>
                </VCardActions>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Historial reciente -->
    <VCol cols="12">
      <VCard>
        <VCardTitle>Últimas Ventas</VCardTitle>
        <VCardText>
          <VTable>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Método Pago</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="venta in kioskoStore.ventas.slice().reverse().slice(0, 10)"
                :key="venta.id"
              >
                <td>{{ new Date(venta.fecha).toLocaleString('es-CL') }}</td>
                <td>{{ venta.usuarioNombre }}</td>
                <td>{{ venta.productoNombre }}</td>
                <td>{{ venta.cantidad }}</td>
                <td>
                  <VChip
                    size="small"
                    variant="tonal"
                  >
                    {{ venta.metodoPago }}
                  </VChip>
                </td>
                <td class="font-weight-bold">
                  {{ formatearPrecio(venta.total) }}
                </td>
                <td>
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    @click="abrirDialogEditar(venta)"
                  >
                    <VIcon icon="tabler-edit" />
                  </VBtn>
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="eliminarVenta(venta.id)"
                  >
                    <VIcon icon="tabler-trash" />
                  </VBtn>
                </td>
              </tr>
              <tr v-if="kioskoStore.ventas.length === 0">
                <td
                  colspan="7"
                  class="text-center text-medium-emphasis py-8"
                >
                  No hay ventas registradas
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Diálogo Editar Venta -->
  <VDialog
    v-model="dialogEditar"
    max-width="600"
  >
    <VCard>
      <VCardTitle>Editar Venta</VCardTitle>

      <VCardText>
        <VRow>
          <VCol cols="12">
            <VAlert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <div><strong>Producto:</strong> {{ ventaEditando?.productoNombre }}</div>
              <div><strong>Cliente:</strong> {{ ventaEditando?.usuarioNombre }}</div>
              <div><strong>Precio unitario:</strong> {{ formatearPrecio(ventaEditando?.precioUnitario || 0) }}</div>
            </VAlert>
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model.number="cantidadEditar"
              label="Cantidad"
              type="number"
              min="1"
              suffix="unidades"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect
              v-model="metodoPagoEditar"
              label="Método de Pago"
              :items="metodosPago"
            />
          </VCol>

          <VCol cols="12">
            <VAlert
              type="success"
              variant="tonal"
            >
              <strong>Nuevo Total:</strong> {{ formatearPrecio((ventaEditando?.precioUnitario || 0) * cantidadEditar) }}
            </VAlert>
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="dialogEditar = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          @click="guardarEdicion"
        >
          Guardar Cambios
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
