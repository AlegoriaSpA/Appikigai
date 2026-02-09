<script setup>
import { ref, computed } from 'vue'
import { useKioskoStore } from '@/stores/kiosko'

definePage({
  meta: {
    subject: 'kiosko',
    action: 'manage',
    requiredRole: ['admin', 'superadmin'],
  },
})

const kioskoStore = useKioskoStore()

// Estado local - Inventario
const dialog = ref(false)
const dialogEliminar = ref(false)
const busqueda = ref('')
const productoEditando = ref(null)
const productoEliminar = ref(null)

// Estado local - Compras
const fechaInicio = ref('')
const fechaFin = ref('')
const busquedaUsuario = ref('')

// Inicializar fechas (último mes)
const inicializarFechas = () => {
  const hoy = new Date()
  const haceUnMes = new Date()
  haceUnMes.setMonth(haceUnMes.getMonth() - 1)
  
  fechaFin.value = hoy.toISOString().split('T')[0]
  fechaInicio.value = haceUnMes.toISOString().split('T')[0]
}

inicializarFechas()

// Formulario
const formProducto = ref({
  nombre: '',
  precio: 0,
  stock: 0,
  categoria: 'General',
})

const categorias = [
  'General',
  'Bebidas',
  'Snacks',
  'Suplementos',
  'Accesorios',
  'Otros',
]

// Productos filtrados
const productosFiltrados = computed(() => {
  if (!busqueda.value) {
    return kioskoStore.productos
  }
  return kioskoStore.buscarProductos(busqueda.value)
})

// Ventas filtradas
const ventasFiltradas = computed(() => {
  let ventas = kioskoStore.ventas
  
  // Filtrar por fechas
  if (fechaInicio.value && fechaFin.value) {
    const inicio = new Date(fechaInicio.value + 'T00:00:00')
    const fin = new Date(fechaFin.value + 'T23:59:59')
    
    ventas = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha)
      return fechaVenta >= inicio && fechaVenta <= fin
    })
  }
  
  // Filtrar por usuario
  if (busquedaUsuario.value) {
    const termino = busquedaUsuario.value.toLowerCase()
    ventas = ventas.filter(venta => 
      venta.usuarioNombre?.toLowerCase().includes(termino)
    )
  }
  
  return ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Estadísticas de compras
const estadisticasCompras = computed(() => {
  const ventas = ventasFiltradas.value
  
  return {
    totalVentas: ventas.length,
    totalMonto: ventas.reduce((sum, v) => sum + v.total, 0),
    totalDeuda: ventas.filter(v => !v.pagado).reduce((sum, v) => sum + v.total, 0),
  }
})

// Abrir dialog para agregar
const abrirDialogAgregar = () => {
  productoEditando.value = null
  formProducto.value = {
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: 'General',
  }
  dialog.value = true
}

// Abrir dialog para editar
const abrirDialogEditar = (producto) => {
  productoEditando.value = producto
  formProducto.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    stock: producto.stock,
    categoria: producto.categoria,
  }
  dialog.value = true
}

// Guardar producto
const guardarProducto = () => {
  if (!formProducto.value.nombre || formProducto.value.precio <= 0) {
    alert('Por favor completa los campos requeridos')
    return
  }

  if (productoEditando.value) {
    kioskoStore.actualizarProducto(productoEditando.value.id, formProducto.value)
  } else {
    kioskoStore.agregarProducto(formProducto.value)
  }

  dialog.value = false
}

// Confirmar eliminación
const confirmarEliminar = (producto) => {
  productoEliminar.value = producto
  dialogEliminar.value = true
}

// Eliminar producto
const eliminarProducto = () => {
  if (productoEliminar.value) {
    kioskoStore.eliminarProducto(productoEliminar.value.id)
    dialogEliminar.value = false
    productoEliminar.value = null
  }
}

// Formatear precio
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(precio)
}

// Formatear fecha
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Limpiar filtros
const limpiarFiltros = () => {
  inicializarFechas()
  busquedaUsuario.value = ''
}

// Color del chip de stock
const colorStock = (stock) => {
  if (stock <= 5) return 'error'
  if (stock <= 10) return 'warning'
  return 'success'
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Inventario de Productos</span>
          <VBtn
            color="primary"
            @click="abrirDialogAgregar"
          >
            <VIcon
              start
              icon="tabler-plus"
            />
            Agregar Producto
          </VBtn>
        </VCardTitle>

        <VCardText>
          <!-- Alertas de stock bajo -->
          <VAlert
            v-if="kioskoStore.productosBajoStock.length > 0"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <strong>{{ kioskoStore.productosBajoStock.length }}</strong> producto(s) con stock bajo
          </VAlert>

          <!-- Buscador -->
          <VTextField
            v-model="busqueda"
            label="Buscar productos..."
            prepend-inner-icon="tabler-search"
            autocomplete="off"
            clearable
            class="mb-4"
          />

          <!-- Tabla de productos -->
          <VTable>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="producto in productosFiltrados"
                :key="producto.id"
              >
                <td>
                  <div>
                    <div class="font-weight-medium">
                      {{ producto.nombre }}
                    </div>
                    <div
                      v-if="producto.descripcion"
                      class="text-caption text-medium-emphasis"
                    >
                      {{ producto.descripcion }}
                    </div>
                  </div>
                </td>
                <td>
                  <VChip
                    size="small"
                    variant="tonal"
                  >
                    {{ producto.categoria }}
                  </VChip>
                </td>
                <td class="font-weight-bold">
                  {{ formatearPrecio(producto.precio) }}
                </td>
                <td>
                  <VChip
                    :color="colorStock(producto.stock)"
                    size="small"
                  >
                    {{ producto.stock }} unidades
                  </VChip>
                </td>
                <td>
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    @click="abrirDialogEditar(producto)"
                  >
                    <VIcon icon="tabler-edit" />
                  </VBtn>
                </td>
              </tr>
              <tr v-if="productosFiltrados.length === 0">
                <td
                  colspan="5"
                  class="text-center text-medium-emphasis py-8"
                >
                  No hay productos en el inventario
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Historial de Compras -->
    <VCol cols="12">
      <VCard>
        <VCardTitle>Historial de Compras General</VCardTitle>
        <VCardText>
          <!-- Filtros -->
          <VRow class="mb-4">
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model="fechaInicio"
                label="Fecha Inicio"
                type="date"
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VTextField
                v-model="fechaFin"
                label="Fecha Fin"
                type="date"
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="busquedaUsuario"
                label="Buscar por usuario"
                prepend-inner-icon="tabler-search"
                autocomplete="off"
                clearable
                density="compact"
              />
            </VCol>
            <VCol
              cols="12"
              md="2"
              class="d-flex align-center"
            >
              <VBtn
                variant="outlined"
                size="small"
                @click="limpiarFiltros"
              >
                <VIcon
                  start
                  icon="tabler-refresh"
                />
                Limpiar
              </VBtn>
            </VCol>
          </VRow>

          <!-- Estadísticas rápidas -->
          <VRow class="mb-4">
            <VCol cols="12" md="4">
              <VCard variant="tonal" color="primary">
                <VCardText class="d-flex align-center gap-3">
                  <VIcon icon="tabler-shopping-cart" size="32" />
                  <div>
                    <div class="text-caption">Total Ventas</div>
                    <div class="text-h6">{{ estadisticasCompras.totalVentas }}</div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" md="4">
              <VCard variant="tonal" color="success">
                <VCardText class="d-flex align-center gap-3">
                  <VIcon icon="tabler-cash" size="32" />
                  <div>
                    <div class="text-caption">Total Compras</div>
                    <div class="text-h6">{{ formatearPrecio(estadisticasCompras.totalMonto) }}</div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" md="4">
              <VCard variant="tonal" color="error">
                <VCardText class="d-flex align-center gap-3">
                  <VIcon icon="tabler-alert-circle" size="32" />
                  <div>
                    <div class="text-caption">Deuda Pendiente</div>
                    <div class="text-h6">{{ formatearPrecio(estadisticasCompras.totalDeuda) }}</div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- Tabla de compras -->
          <VTable>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Método Pago</th>
                <th>Total</th>
                <th>Pagado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="venta in ventasFiltradas"
                :key="venta.id"
              >
                <td>{{ formatearFecha(venta.fecha) }}</td>
                <td>{{ venta.usuarioNombre }}</td>
                <td>{{ venta.productoNombre }}</td>
                <td class="text-center">{{ venta.cantidad }}</td>
                <td>
                  <VChip
                    size="small"
                    variant="tonal"
                    :color="venta.metodoPago === 'Efectivo' ? 'success' : venta.metodoPago === 'Transferencia' ? 'info' : 'default'"
                  >
                    {{ venta.metodoPago }}
                  </VChip>
                </td>
                <td class="font-weight-bold">
                  {{ formatearPrecio(venta.total) }}
                </td>
                <td>
                  <VCheckbox
                    :model-value="venta.pagado"
                    hide-details
                    color="success"
                    @update:model-value="kioskoStore.togglePagado(venta.id)"
                  />
                </td>
              </tr>
              <tr v-if="ventasFiltradas.length === 0">
                <td
                  colspan="7"
                  class="text-center text-medium-emphasis py-8"
                >
                  No hay compras registradas
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Dialog Agregar/Editar Producto -->
  <VDialog
    v-model="dialog"
    max-width="600"
  >
    <VCard>
      <VCardTitle>
        {{ productoEditando ? 'Editar Producto' : 'Agregar Producto' }}
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="guardarProducto">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="formProducto.nombre"
                label="Nombre del producto *"
                required
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VSelect
                v-model="formProducto.categoria"
                label="Categoría"
                :items="categorias"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model.number="formProducto.precio"
                label="Precio *"
                type="number"
                min="0"
                prefix="$"
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model.number="formProducto.stock"
                label="Stock *"
                type="number"
                min="0"
                suffix="unidades"
                required
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="dialog = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          @click="guardarProducto"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Dialog Confirmar Eliminación -->
  <VDialog
    v-model="dialogEliminar"
    max-width="400"
  >
    <VCard>
      <VCardTitle>Confirmar Eliminación</VCardTitle>

      <VCardText>
        ¿Estás seguro de eliminar el producto <strong>{{ productoEliminar?.nombre }}</strong>?
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="dialogEliminar = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="error"
          @click="eliminarProducto"
        >
          Eliminar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
