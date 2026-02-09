import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useKioskoStore = defineStore('kiosko', () => {
  // Estado
  const productos = ref([])
  const ventas = ref([])

  // Cargar datos del localStorage al inicializar
  const cargarDatos = () => {
    const productosGuardados = localStorage.getItem('productos_kiosko_ikigai')
    const ventasGuardadas = localStorage.getItem('ventas_kiosko_ikigai')
    
    if (productosGuardados) {
      productos.value = JSON.parse(productosGuardados)
    }
    
    if (ventasGuardadas) {
      ventas.value = JSON.parse(ventasGuardadas)
    }
  }

  // Guardar productos en localStorage
  const guardarProductos = () => {
    localStorage.setItem('productos_kiosko_ikigai', JSON.stringify(productos.value))
  }

  // Guardar ventas en localStorage
  const guardarVentas = () => {
    localStorage.setItem('ventas_kiosko_ikigai', JSON.stringify(ventas.value))
  }

  // Agregar producto
  const agregarProducto = (producto) => {
    const nuevoProducto = {
      id: Date.now(),
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: parseFloat(producto.precio),
      stock: parseInt(producto.stock),
      categoria: producto.categoria || 'General',
      fechaCreacion: new Date().toISOString(),
    }
    
    productos.value.push(nuevoProducto)
    guardarProductos()
    return nuevoProducto
  }

  // Actualizar producto
  const actualizarProducto = (id, datos) => {
    const index = productos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      productos.value[index] = {
        ...productos.value[index],
        ...datos,
        precio: parseFloat(datos.precio),
        stock: parseInt(datos.stock),
      }
      guardarProductos()
      return productos.value[index]
    }
    return null
  }

  // Eliminar producto
  const eliminarProducto = (id) => {
    const index = productos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      productos.value.splice(index, 1)
      guardarProductos()
      return true
    }
    return false
  }

  // Registrar venta
  const registrarVenta = (venta) => {
    // Validar stock disponible
    const producto = productos.value.find(p => p.id === venta.productoId)
    if (!producto) {
      throw new Error('Producto no encontrado')
    }
    
    if (producto.stock < venta.cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`)
    }

    // Crear venta
    const nuevaVenta = {
      id: Date.now(),
      productoId: venta.productoId,
      productoNombre: producto.nombre,
      usuarioId: venta.usuarioId,
      usuarioNombre: venta.usuarioNombre,
      cantidad: parseInt(venta.cantidad),
      precioUnitario: producto.precio,
      total: producto.precio * parseInt(venta.cantidad),
      metodoPago: venta.metodoPago,
      pagado: venta.metodoPago === 'Efectivo',
      fecha: new Date().toISOString(),
    }

    // Descontar del stock
    producto.stock -= parseInt(venta.cantidad)
    
    // Guardar venta
    ventas.value.push(nuevaVenta)
    
    // Guardar en localStorage
    guardarProductos()
    guardarVentas()
    
    return nuevaVenta
  }

  // Obtener productos con bajo stock
  const productosBajoStock = computed(() => {
    return productos.value.filter(p => p.stock <= 5)
  })

  // Obtener ventas por periodo
  const obtenerVentasPorPeriodo = (fechaInicio, fechaFin) => {
    return ventas.value.filter(v => {
      const fechaVenta = new Date(v.fecha)
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      return fechaVenta >= inicio && fechaVenta <= fin
    })
  }

  // Obtener total de ventas
  const totalVentas = computed(() => {
    return ventas.value.reduce((total, venta) => total + venta.total, 0)
  })

  // Buscar productos
  const buscarProductos = (termino) => {
    const term = termino.toLowerCase()
    return productos.value.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.descripcion.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term)
    )
  }

  // Obtener producto por ID
  const obtenerProductoPorId = (id) => {
    return productos.value.find(p => p.id === id)
  }

  // Marcar venta como pagada/no pagada
  const togglePagado = (ventaId) => {
    const venta = ventas.value.find(v => v.id === ventaId)
    if (venta) {
      venta.pagado = !venta.pagado
      guardarVentas()
    }
  }

  // Eliminar venta
  const eliminarVenta = (ventaId) => {
    const index = ventas.value.findIndex(v => v.id === ventaId)
    if (index !== -1) {
      // Devolver stock al producto
      const venta = ventas.value[index]
      const producto = productos.value.find(p => p.id === venta.productoId)
      if (producto) {
        producto.stock += venta.cantidad
        guardarProductos()
      }
      
      // Eliminar venta
      ventas.value.splice(index, 1)
      guardarVentas()
      return true
    }
    return false
  }

  // Actualizar venta
  const actualizarVenta = (ventaId, datos) => {
    const venta = ventas.value.find(v => v.id === ventaId)
    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    const producto = productos.value.find(p => p.id === venta.productoId)
    if (!producto) {
      return { success: false, error: 'Producto no encontrado' }
    }

    // Calcular diferencia de stock
    const diferenciaCantidad = datos.cantidad - venta.cantidad
    
    // Validar stock disponible si se aumenta la cantidad
    if (diferenciaCantidad > 0 && producto.stock < diferenciaCantidad) {
      return { success: false, error: `Stock insuficiente. Disponible: ${producto.stock}` }
    }

    // Actualizar stock del producto
    producto.stock -= diferenciaCantidad

    // Actualizar venta
    venta.cantidad = datos.cantidad
    venta.metodoPago = datos.metodoPago
    venta.total = venta.precioUnitario * datos.cantidad
    venta.pagado = datos.metodoPago === 'Efectivo'

    // Guardar cambios
    guardarProductos()
    guardarVentas()

    return { success: true }
  }

  // Inicializar store
  cargarDatos()

  return {
    // Estado
    productos,
    ventas,
    productosBajoStock,
    totalVentas,
    togglePagado,
    
    // Acciones
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    registrarVenta,
    obtenerVentasPorPeriodo,
    buscarProductos,
    obtenerProductoPorId,
    cargarDatos,
    eliminarVenta,
    actualizarVenta,
  }
})
