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

// Estado local
const fechaInicio = ref('')
const fechaFin = ref('')

// Inicializar fechas (último mes)
const inicializarFechas = () => {
  const hoy = new Date()
  const haceUnMes = new Date()
  haceUnMes.setMonth(haceUnMes.getMonth() - 1)
  
  fechaFin.value = hoy.toISOString().split('T')[0]
  fechaInicio.value = haceUnMes.toISOString().split('T')[0]
}

inicializarFechas()

// Ventas filtradas
const ventasFiltradas = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) {
    return kioskoStore.ventas
  }
  
  const inicio = new Date(fechaInicio.value + 'T00:00:00')
  const fin = new Date(fechaFin.value + 'T23:59:59')
  
  return kioskoStore.ventas.filter(venta => {
    const fechaVenta = new Date(venta.fecha)
    return fechaVenta >= inicio && fechaVenta <= fin
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Estadísticas
const estadisticas = computed(() => {
  const ventas = ventasFiltradas.value
  
  return {
    totalVentas: ventas.length,
    totalMonto: ventas.reduce((sum, v) => sum + v.total, 0),
    totalDeuda: ventas.filter(v => !v.pagado).reduce((sum, v) => sum + v.total, 0),
    porMetodoPago: {
      efectivo: ventas.filter(v => v.metodoPago === 'Efectivo').length,
      transferencia: ventas.filter(v => v.metodoPago === 'Transferencia').length,
      otro: ventas.filter(v => v.metodoPago === 'Otro').length,
    },
  }
})

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
}
</script>

<template>
  <VRow>
    <!-- Filtros -->
    <VCol cols="12">
      <VCard>
        <VCardTitle>Filtrar Compras</VCardTitle>
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="fechaInicio"
                label="Fecha Inicio"
                type="date"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="fechaFin"
                label="Fecha Fin"
                type="date"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
              class="d-flex align-center"
            >
              <VBtn
                variant="outlined"
                @click="limpiarFiltros"
              >
                <VIcon
                  start
                  icon="tabler-refresh"
                />
                Último Mes
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Estadísticas -->
    <VCol
      cols="12"
      md="3"
    >
      <VCard>
        <VCardText>
          <div class="d-flex align-center gap-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="42"
            >
              <VIcon
                icon="tabler-shopping-cart"
                size="24"
              />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">
                Total Ventas
              </div>
              <div class="text-h6">
                {{ estadisticas.totalVentas }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="3"
    >
      <VCard>
        <VCardText>
          <div class="d-flex align-center gap-3">
            <VAvatar
              color="success"
              variant="tonal"
              size="42"
            >
              <VIcon
                icon="tabler-cash"
                size="24"
              />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">
                Total Compras
              </div>
              <div class="text-h6">
                {{ formatearPrecio(estadisticas.totalMonto) }}
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="2"
    >
      <VCard>
        <VCardText>
          <div class="text-center">
            <div class="text-caption text-medium-emphasis">
              Efectivo
            </div>
            <div class="text-h6">
              {{ estadisticas.porMetodoPago.efectivo }}
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="2"
    >
      <VCard>
        <VCardText>
          <div class="text-center">
            <div class="text-caption text-medium-emphasis">
              Transferencia
            </div>
            <div class="text-h6">
              {{ estadisticas.porMetodoPago.transferencia }}
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="2"
    >
      <VCard>
        <VCardText>
          <div class="text-center">
            <div class="text-caption text-medium-emphasis">
              Otro
            </div>
            <div class="text-h6">
              {{ estadisticas.porMetodoPago.otro }}
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Tabla de ventas -->
    <VCol cols="12">
      <VCard>
        <VCardTitle>Historial de Compras</VCardTitle>
        <VCardText>
          <VTable>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
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
                <td>{{ venta.productoNombre }}</td>
                <td class="text-center">
                  {{ venta.cantidad }}
                </td>
                <td>{{ formatearPrecio(venta.precioUnitario) }}</td>
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
                  No hay compras registradas en este periodo
                </td>
              </tr>
            </tbody>
            <tfoot v-if="ventasFiltradas.length > 0">
              <tr>
                <td
                  colspan="5"
                  class="text-end font-weight-bold"
                >
                  TOTAL:
                </td>
                <td class="font-weight-bold text-h6">
                  {{ formatearPrecio(estadisticas.totalMonto) }}
                </td>
                <td></td>
              </tr>
              <tr class="bg-error-lighten">
                <td
                  colspan="5"
                  class="text-end font-weight-bold text-error"
                >
                  TOTAL DEUDA (No Pagado):
                </td>
                <td class="font-weight-bold text-h6 text-error">
                  {{ formatearPrecio(estadisticas.totalDeuda) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </VTable>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
