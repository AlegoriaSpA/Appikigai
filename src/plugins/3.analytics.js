import VueGtag from 'vue-gtag-next'

export default function (app) {
  // Obtener el router de la instancia de la aplicación
  const router = app.config.globalProperties.$router
  
  // ID de medición de Google Analytics 4
  // IMPORTANTE: Reemplazar 'G-XXXXXXXXXX' con tu ID real de GA4
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
  
  // Solo habilitar en producción si no se proporciona un ID válido
  const isProduction = import.meta.env.PROD
  const hasValidId = measurementId && measurementId !== 'G-XXXXXXXXXX'
  
  // Configurar Google Analytics 4
  app.use(VueGtag, {
    property: {
      id: measurementId,
      params: {
        send_page_view: true, // Enviar vista de página automáticamente
        anonymize_ip: true, // Anonimizar IP para cumplir GDPR
      },
    },
    isEnabled: isProduction && hasValidId, // Solo en producción y con ID válido
    useDebugger: !isProduction, // Debug en desarrollo
    
    // Integración con Vue Router para tracking automático de páginas
    config: {
      id: measurementId,
      params: {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      },
    },
  }, router)
  
  // Log en desarrollo
  if (!isProduction) {
    console.log('📊 Google Analytics configurado en modo DEBUG')
    console.log('   ID de medición:', measurementId)
    console.log('   Estado:', hasValidId ? 'Activo (demo)' : 'Inactivo')
  }
}
