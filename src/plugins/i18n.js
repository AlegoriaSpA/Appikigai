import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    dashboard: 'Dashboard',
    users: 'Users',

    // Menú de navegación
    Inicio: 'Home',
    Comunicaciones: 'Communications',
    'Crear Mensaje': 'Create Message',
    Mensajes: 'Messages',
    Auspiciadores: 'Sponsors',
    Usuarios: 'Users',
    auth: {
      welcome: 'Welcome to the Chilean Geology Congress Platform',
      loginSubtitle: 'Sign in to your account to get started',
      email: 'Email',
      emailPlaceholder: 'user@example.com',
      password: 'Password',
      passwordPlaceholder: '············',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      signIn: 'Sign In',
      newUser: 'New on our platform?',
      createAccount: 'Create an account',
      enterEmailAndPassword: 'Please enter email and password',
      forgotPasswordTitle: 'Forgot Password?',
      forgotPasswordSubtitle: 'Enter your email and we will send you instructions to reset your password',
      sendResetLink: 'Send reset link',
      backToLogin: 'Back to login',
      enterEmail: 'Please enter your email',
      resetLinkSent: 'A recovery link has been sent to your email',
      
      // Register page
      registerTitle: 'Register on the Geological Congress platform',
      registerSubtitle: 'Complete the following data to create your account',
      name: 'Name',
      namePlaceholder: 'John',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Doe Smith',
      documentType: 'Document Type',
      rut: 'RUT',
      passport: 'Passport',
      documentNumber: 'Document Number',
      documentNumberPlaceholder: '12.345.678-9',
      passportPlaceholder: 'AB123456',
      documentFormat: 'Format: 12.345.678-9',
      phone: 'Phone',
      phonePlaceholder: '+56 9 1234 5678',
      nationality: 'Nationality',
      nationalityPlaceholder: 'Chile',
      areasOfInterest: 'Areas of Domain or Interest (Optional)',
      areasOfInterestSubtitle: 'Click on the areas to select or deselect',
      confirmPassword: 'Validate Password',
      acceptTerms: 'I accept the',
      termsAndConditions: 'terms and conditions',
      createAccountButton: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      signInLink: 'Sign in',
      
      // Validation messages
      completeAllFields: 'Please complete all required fields',
      invalidEmailFormat: 'Invalid email format',
      passwordsNotMatch: 'Passwords do not match',
      passwordMinLength: 'Password must be at least 8 characters',
      mustAcceptTerms: 'You must accept the terms and conditions',
      accountCreatedSuccess: 'Account created successfully. Redirecting...',
      
      // Terms and Conditions
      termsTitle: 'Terms and Conditions of Use',
      lastUpdate: 'Last update date:',
      termsAcceptButton: 'Accept Terms',
      close: 'Close',
      
      // Terms content
      terms1Title: '1. Acceptance of Terms',
      terms1Content: 'By registering on this platform, you accept these terms and conditions of use. If you do not agree with these terms, please do not use our platform.',
      
      terms2Title: '2. Collection and Use of Personal Information',
      terms2Content: 'To provide our services, we collect and process the following personal information:',
      terms2Item1: 'Name and Last Name: To identify you on the platform',
      terms2Item2: 'RUT or Passport: To verify your identity (optional)',
      terms2Item3: 'Email: For communications, notifications and account recovery',
      terms2Item4: 'Phone: For direct contact if necessary (optional)',
      terms2Item5: 'Nationality: For statistical purposes (optional)',
      terms2Item6: 'Password: Stored encrypted to protect your account',
      
      terms3Title: '3. Protection of Personal Data',
      terms3Content: 'We are committed to protecting your personal information in accordance with current Chilean legislation, including Law No. 19,628 on Protection of Privacy. Your data will be:',
      terms3Item1: 'Stored securely on protected servers',
      terms3Item2: 'Used only for the purposes indicated in these terms',
      terms3Item3: 'Not shared with third parties without your express consent',
      terms3Item4: 'Accessible only by authorized personnel',
      
      terms4Title: '4. Use of Information',
      terms4Content: 'We use your personal information to:',
      terms4Item1: 'Create and manage your user account',
      terms4Item2: 'Provide access to platform services',
      terms4Item3: 'Send system-related notifications',
      terms4Item4: 'Communicate with you about important updates or changes',
      terms4Item5: 'Improve our services and user experience',
      terms4Item6: 'Comply with legal and regulatory requirements',
      
      terms5Title: '5. User Rights',
      terms5Content: 'As a user, you have the right to:',
      terms5Item1: 'Access your stored personal information',
      terms5Item2: 'Request correction of inaccurate data',
      terms5Item3: 'Request deletion of your account and associated data',
      terms5Item4: 'Object to the processing of your personal data',
      terms5Item5: 'Request portability of your data',
      
      terms6Title: '6. Account Security',
      terms6Content: 'You are responsible for maintaining the confidentiality of your password and all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
      
      terms7Title: '7. Cookies and Similar Technologies',
      terms7Content: 'We use cookies to improve your experience on the platform, keep your session active and remember your preferences. You can configure your browser to reject cookies, but this may affect the functionality of the platform.',
      
      terms8Title: '8. Modifications to Terms',
      terms8Content: 'We reserve the right to modify these terms and conditions at any time. We will notify you of significant changes via email or through a notice on the platform.',
      
      terms9Title: '9. Contact',
      terms9Content: 'If you have questions about these terms and conditions or about the processing of your personal data, you can contact us through the platform or by sending an email.',
      
      terms10Title: '10. Applicable Law',
      terms10Content: 'These terms are governed by the laws of the Republic of Chile. Any dispute related to these terms will be subject to the exclusive jurisdiction of Chilean courts.',
      
      // Areas of Interest
      at1: 'AT1: Geosciences and Society',
      at2: 'AT2: Water Resources, Energy and Exploration',
      at3: 'AT3: Environmental Geology, Geological Hazards and Engineering Geology',
      at4: 'AT4: Mineral Resources and Mining Exploration',
      at5: 'AT5: Quaternary Geology and Climate Change',
      at6: 'AT6: Stratigraphy, Sedimentology and Paleontology',
      at7: 'AT7: Geodynamics, Tectonics and Seismology',
      at8: 'AT8: Volcanism, Magmatism and Metamorphism',
      at9: 'AT9: Marine Geology, Planetary Sciences, Geoarchaeology and Transversal Areas',
    },
  },
  es: {
    dashboard: 'Inicio',
    users: 'Usuarios',

    // Menú de navegación
    Inicio: 'Inicio',
    Comunicaciones: 'Comunicaciones',
    'Crear Mensaje': 'Crear Mensaje',
    Mensajes: 'Mensajes',
    Auspiciadores: 'Auspiciadores',
    Usuarios: 'Usuarios',
    auth: {
      welcome: 'Bienvenido a la Plataforma del Congreso Chileno de Geología',
      loginSubtitle: 'Inicia sesión en tu cuenta para comenzar',
      email: 'Email',
      emailPlaceholder: 'usuario@ejemplo.com',
      password: 'Contraseña',
      passwordPlaceholder: '············',
      rememberMe: 'Recordarme',
      forgotPassword: '¿Olvidaste tu contraseña?',
      signIn: 'Iniciar Sesión',
      newUser: '¿Nuevo en nuestra plataforma?',
      createAccount: 'Crear una cuenta',
      enterEmailAndPassword: 'Por favor ingrese email y contraseña',
      forgotPasswordTitle: '¿Olvidaste tu contraseña?',
      forgotPasswordSubtitle: 'Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña',
      sendResetLink: 'Enviar enlace de recuperación',
      backToLogin: 'Volver al inicio de sesión',
      enterEmail: 'Por favor ingrese su email',
      resetLinkSent: 'Se ha enviado un enlace de recuperación a su email',
      
      // Register page
      registerTitle: 'Regístrate en la plataforma del Congreso Geológico',
      registerSubtitle: 'Completa los siguientes datos para crear tu cuenta',
      name: 'Nombre',
      namePlaceholder: 'Juan',
      lastName: 'Apellidos',
      lastNamePlaceholder: 'Pérez García',
      documentType: 'Tipo de Documento',
      rut: 'RUT',
      passport: 'Pasaporte',
      documentNumber: 'Número de Documento',
      documentNumberPlaceholder: '12.345.678-9',
      passportPlaceholder: 'AB123456',
      documentFormat: 'Formato: 12.345.678-9',
      phone: 'Teléfono',
      phonePlaceholder: '+56 9 1234 5678',
      nationality: 'Nacionalidad',
      nationalityPlaceholder: 'Chile',
      areasOfInterest: 'Áreas de Dominio o Interés (Opcional)',
      areasOfInterestSubtitle: 'Click en las áreas para seleccionar o deseleccionar',
      confirmPassword: 'Validar Contraseña',
      acceptTerms: 'Acepto estas',
      termsAndConditions: 'condiciones',
      createAccountButton: 'Crear Cuenta',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      signInLink: 'Iniciar sesión',
      
      // Validation messages
      completeAllFields: 'Por favor complete todos los campos requeridos',
      invalidEmailFormat: 'El formato del email no es válido',
      passwordsNotMatch: 'Las contraseñas no coinciden',
      passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
      mustAcceptTerms: 'Debe aceptar los términos y condiciones',
      accountCreatedSuccess: 'Cuenta creada exitosamente. Redirigiendo...',
      
      // Terms and Conditions
      termsTitle: 'Consentimiento informado para participación en el XVII Congreso Geológico Chileno',
      termsIntro: 'Para inscribirse como participante, es obligatorio otorgar el siguiente consentimiento informado.',
      lastUpdate: 'Fecha de última actualización:',
      termsAcceptButton: 'Acepto estas condiciones',
      close: 'Cerrar',
      
      // Terms content
      terms1Title: 'Código de geoética',
      terms1Content: 'El Congreso Geológico Chileno se realizará bajo los principios y valores del Código de Geoética de Chile. Al registrarse, el participante se compromete a respetarlo. En caso de ser objeto de, o enterarse de, cualquier comportamiento no ético de un participante, se informará al Comité Organizador para que tome las medidas necesarias, oportunas y apropiadas.',
      terms1Download: 'descárgalo aquí',
      
      terms2Title: 'Participación voluntaria',
      terms2Content: 'La participación en el Congreso es voluntaria, por lo cual: i) nadie está obligado a asistir; y ii) las personas inscritas pueden elegir participar o no hacerlo.',
      
      terms3Title: 'Riesgos',
      terms3Content: 'Los riesgos asociados a la participación son aquellos comunes y frecuentes de cualquier actividad social y/o académica. La organización del Congreso empleará estándares de diligencia y cuidado necesarios para prevenir cualquier daño a los asistentes. En caso de ocurrencia de un siniestro, y dependiendo de la naturaleza del mismo y de la determinación de las responsabilidades concurrentes, la Sociedad Geológica de Chile se eximirá de responsabilidades frente a los asistentes por los eventuales daños que pudieran sufrir. La Universidad Austral de Chile no será en ningún caso responsable de la ocurrencia de cualquier siniestro durante el desarrollo del Congreso, con excepción de aquellos que pudieran deberse a dolo o negligencia grave de dicha institución.',
      
      terms4Title: 'Beneficios',
      terms4Content: 'Los participantes tendrán acceso a todos los beneficios del evento tales como sesiones académicas, cóctel de bienvenida, coffee breaks, sesiones de pósteres, kit del Congreso, certificado de participación digital y otras actividades que se informen con antelación. Se incluye la participación en las Ceremonias de Inauguración y de Clausura.',
      
      terms5Title: 'Confidencialidad',
      terms5Content: 'La Sociedad Geológica de Chile guardará estricta reserva y confidencialidad sobre todos los datos personales proporcionados por los asistentes al Congreso, tanto en su ficha de inscripción como en cualquier otra instancia o documento en el que consten, de acuerdo con la Ley 19628. A su vez, los participantes no podrán grabar ni difundir, por ningún medio, el contenido de las exposiciones que se realicen en el marco del Congreso.',
      
      terms6Title: 'Renuncia de acciones',
      terms6Content: 'La Universidad Austral de Chile no será responsable ni responderá por ningún siniestro durante el desarrollo del Congreso, con excepción de aquellos que pudieran ocurrir por causa de dolo o negligencia grave de dicha institución. De esta forma, en este acto el participante declara que renuncia expresamente y de forma total, completa, definitiva e irrevocable a ejercer, y se desiste si ya lo hubiera ejercido, de cualquier reclamo, acción o derecho que tenga o pudiere hacer valer en contra de Universidad Austral de Chile, o de sus personas relacionadas, sean de carácter civil, laboral, precontractual, contractual o extracontractual, penal, administrativo, o de cualquier otra naturaleza que se derive o relacione directa o indirectamente de la participación en el XVII Congreso Geológico Chileno.',
      
      terms7Title: 'Derecho a negarse o retirarse',
      terms7Content: 'La participación en el Congreso es voluntaria e incluye el derecho a retirarse. Por lo mismo, usted puede dejar de participar en el Congreso en cualquier momento, sin que se vea afectado de ninguna forma. Independientemente de la forma en que se retire, los aportes por inscripción no serán devueltos.',
      
      terms8Title: 'Contacto',
      terms8Content: 'Si requiere más información o desea comunicarse por cualquier motivo relacionado con este consentimiento informado, puede contactar al Comité Organizador al correo cgch2026@gmail.com.',
      
      terms9Title: 'Consentimiento',
      terms9Content: 'Declaro que he leído la información proporcionada. He tenido la oportunidad de preguntar sobre ella y se me han respondido satisfactoriamente las preguntas que he realizado. Consiento voluntariamente participar en este Congreso y entiendo que tengo derecho a retirarme del mismo en cualquier momento.',
      
      // Areas of Interest
      at1: 'AT1: Geociencias y Sociedad',
      at2: 'AT2: Recursos Hídricos, Energéticos y su Exploración',
      at3: 'AT3: Geología Ambiental, Peligros Geológicos e Ingeniería Geológica',
      at4: 'AT4: Recursos Minerales y Exploración Minera',
      at5: 'AT5: Geología del Cuaternario y Cambio Climático',
      at6: 'AT6: Estratigrafía, Sedimentología y Paleontología',
      at7: 'AT7: Geodinámica, Tectónica y Sismología',
      at8: 'AT8: Volcanismo, Magmatismo y Metamorfismo',
      at9: 'AT9: Geología Marina, Ciencias Planetarias, Geoarqueología y Áreas Transversales',
    },
  },
}

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'en',
  messages,
})

export default function (app) {
  app.use(i18n)
}
