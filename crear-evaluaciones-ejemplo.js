/**
 * Script para crear usuario con evaluaciones de ejemplo
 * Ejecutar con: node crear-evaluaciones-ejemplo.js
 */

import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// Credenciales de admin para crear el usuario
const ADMIN_EMAIL = 'superadmin@alegoria.cl'
const ADMIN_PASSWORD = 'password'

// Datos del usuario de ejemplo
const usuarioEjemplo = {
  name: 'Carlos',
  apellidos: 'Mendoza Silva',
  email: 'carlos.mendoza@ejemplo.cl',
  password: 'password123',
  numero_documento: '18.456.789-2',
  telefono: '+56987654321',
  diaNacimiento: 15,
  mesNacimiento: 8,
  anioNacimiento: 1988,
  edad: 37,
  fecha_nacimiento: '1988-08-15',
  role: 'user'
}

// Datos de las 4 evaluaciones
const evaluaciones = [
  {
    fecha_evaluacion: '2024-12-03',
    peso: 83.8,
    estatura: 179,
    circunferencia_cintura: 85,
    circunferencia_brazo_relajado: 36,
    circunferencia_brazo_contraccion: 38,
    circunferencia_muslo: 60,
    circunferencia_pantorrilla: 39.5,
    pliegue_tricipital: 9,
    pliegue_bicipital: 2,
    pliegue_suprailiaco: 18.5,
    pliegue_subescapular: 9.5,
    pliegue_abdominal: 10,
    porcentaje_grasa: 18.9,
    imc: 26.1,
    objetivo_paciente: 'Reducir grasa corporal y mejorar composición corporal'
  },
  {
    fecha_evaluacion: '2025-03-12',
    peso: 82,
    estatura: 179,
    circunferencia_cintura: 85,
    circunferencia_brazo_relajado: 35,
    circunferencia_brazo_contraccion: 37.5,
    circunferencia_muslo: 58.5,
    circunferencia_pantorrilla: 39,
    pliegue_tricipital: 7.5,
    pliegue_bicipital: 3,
    pliegue_suprailiaco: 18,
    pliegue_subescapular: 11,
    pliegue_abdominal: 10.5,
    porcentaje_grasa: 19,
    imc: 25.5,
    objetivo_paciente: 'Mantener peso y aumentar masa muscular'
  },
  {
    fecha_evaluacion: '2025-06-28',
    peso: 83.2,
    estatura: 179,
    circunferencia_cintura: 88.6,
    circunferencia_brazo_relajado: 36,
    circunferencia_brazo_contraccion: 38,
    circunferencia_muslo: 59.7,
    circunferencia_pantorrilla: 39.5,
    pliegue_tricipital: 7.5,
    pliegue_bicipital: 1.5,
    pliegue_suprailiaco: 17,
    pliegue_subescapular: 10,
    pliegue_abdominal: 10,
    porcentaje_grasa: 18,
    imc: 25.9,
    objetivo_paciente: 'Reducir circunferencia de cintura'
  },
  {
    fecha_evaluacion: '2025-10-04',
    peso: 84.9,
    estatura: 179,
    circunferencia_cintura: 84.2,
    circunferencia_brazo_relajado: 36.6,
    circunferencia_brazo_contraccion: 39.2,
    circunferencia_muslo: 59.8,
    circunferencia_pantorrilla: 39.8,
    pliegue_tricipital: 7.5,
    pliegue_bicipital: 2,
    pliegue_suprailiaco: 17,
    pliegue_subescapular: 8,
    pliegue_abdominal: 9,
    porcentaje_grasa: 17.5,
    imc: 26.5,
    objetivo_paciente: 'Aumentar masa muscular manteniendo bajo porcentaje de grasa'
  }
]

async function main() {
  try {
    console.log('🔐 Iniciando sesión como administrador...')
    
    // Login como admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    const token = loginResponse.data.token
    console.log('✅ Login exitoso')

    // Configurar headers con token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    console.log('\n👤 Creando usuario de ejemplo...')
    console.log(`   Nombre: ${usuarioEjemplo.name} ${usuarioEjemplo.apellidos}`)
    console.log(`   RUT: ${usuarioEjemplo.numero_documento}`)
    console.log(`   Email: ${usuarioEjemplo.email}`)
    
    // Crear usuario
    const userResponse = await axios.post(
      `${API_URL}/users`,
      usuarioEjemplo,
      config
    )

    const usuarioId = userResponse.data.user.id
    console.log(`✅ Usuario creado con ID: ${usuarioId}`)

    console.log('\n📊 Creando evaluaciones...')
    
    // Crear cada evaluación
    for (let i = 0; i < evaluaciones.length; i++) {
      const evaluacion = {
        ...evaluaciones[i],
        usuario_id: usuarioId
      }

      await axios.post(
        `${API_URL}/evaluaciones`,
        evaluacion,
        config
      )

      console.log(`   ✅ Evaluación ${i + 1}/4 creada (${evaluacion.fecha_evaluacion})`)
      console.log(`      Peso: ${evaluacion.peso} kg | IMC: ${evaluacion.imc} | Grasa: ${evaluacion.porcentaje_grasa}%`)
    }

    console.log('\n✨ ¡Proceso completado exitosamente!')
    console.log('\n📋 Resumen:')
    console.log(`   - Usuario creado: ${usuarioEjemplo.name} ${usuarioEjemplo.apellidos}`)
    console.log(`   - RUT: ${usuarioEjemplo.numero_documento}`)
    console.log(`   - Email: ${usuarioEjemplo.email}`)
    console.log(`   - Password: ${usuarioEjemplo.password}`)
    console.log(`   - Evaluaciones: 4`)
    console.log(`   - Rango de fechas: 03/12/2024 - 04/10/2025`)
    console.log('\n💡 Progreso del paciente:')
    console.log(`   - Peso inicial: 83.8 kg → Peso final: 84.9 kg (+1.1 kg)`)
    console.log(`   - IMC inicial: 26.1 → IMC final: 26.5 (+0.4)`)
    console.log(`   - Grasa corporal: 18.9% → 17.5% (-1.4%)`)
    console.log(`   - Cintura: 85 cm → 84.2 cm (-0.8 cm)`)
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message)
    console.error('\n📋 Detalles completos del error:')
    console.error('   Code:', error.code)
    console.error('   Status:', error.response?.status)
    console.error('   URL:', error.config?.url)
    
    if (error.response?.status === 422) {
      console.error('\n📝 Detalles de validación:', JSON.stringify(error.response.data.errors, null, 2))
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 El backend no está corriendo. Asegúrate de que Laravel esté en ejecución en http://localhost:8000')
    }
    
    process.exit(1)
  }
}

// Ejecutar
main()
