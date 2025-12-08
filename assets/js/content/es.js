// assets/js/content/es.js
/**
 * Spanish Content
 */

export const es = {
  // Site metadata
  site: {
    name: 'Template Pro',
    description: 'Sistema modular sin frameworks',
    tagline: 'Desarrollo web moderno y profesional'
  },

  // Navigation
  nav: {
    home: 'Inicio',
    dashboard: 'Dashboard',
    about: 'Acerca',
    contact: 'Contacto',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    profile: 'Perfil'
  },

  // Common actions
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    update: 'Actualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    download: 'Descargar',
    upload: 'Subir',
    close: 'Cerrar',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar'
  },

  // Forms
  forms: {
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    name: 'Nombre',
    firstName: 'Nombre',
    lastName: 'Apellidos',
    phone: 'Teléfono',
    address: 'Dirección',
    city: 'Ciudad',
    country: 'País',
    zipCode: 'Código postal',
    message: 'Mensaje',
    subject: 'Asunto',
    
    placeholders: {
      email: 'tu@email.com',
      password: '********',
      search: 'Buscar...',
      name: 'Tu nombre'
    },

    validation: {
      required: 'Este campo es obligatorio',
      email: 'Email inválido',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      passwordMismatch: 'Las contraseñas no coinciden',
      invalidFormat: 'Formato inválido'
    }
  },

  // Authentication
  auth: {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPassword: 'Restablecer contraseña',
    loginSuccess: 'Sesión iniciada correctamente',
    logoutSuccess: 'Sesión cerrada',
    loginError: 'Error al iniciar sesión',
    registerSuccess: 'Cuenta creada correctamente',
    registerError: 'Error al crear cuenta'
  },

  // Messages
  messages: {
    success: {
      saved: 'Guardado correctamente',
      deleted: 'Eliminado correctamente',
      updated: 'Actualizado correctamente',
      created: 'Creado correctamente'
    },
    error: {
      generic: 'Ha ocurrido un error',
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      forbidden: 'Acceso denegado',
      validation: 'Error de validación',
      network: 'Error de conexión',
      timeout: 'Tiempo de espera agotado'
    },
    confirm: {
      delete: '¿Estás seguro de eliminar este elemento?',
      leave: '¿Estás seguro de salir? Los cambios no guardados se perderán'
    }
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Bienvenido, {name}',
    stats: {
      users: 'Usuarios',
      revenue: 'Ingresos',
      conversions: 'Conversiones',
      sessions: 'Sesiones'
    },
    charts: {
      revenue: 'Ingresos Mensuales',
      users: 'Usuarios Activos',
      devices: 'Usuarios por Dispositivo'
    },
    tables: {
      transactions: 'Transacciones Recientes',
      users: 'Últimos Usuarios'
    }
  },

  // Data table
  table: {
    showing: 'Mostrando {start} a {end} de {total} entradas',
    noData: 'No hay datos disponibles',
    search: 'Buscar...',
    entries: 'entradas',
    previous: 'Anterior',
    next: 'Siguiente',
    export: 'Exportar',
    filters: 'Filtros'
  },

  // Footer
  footer: {
    product: 'Producto',
    company: 'Empresa',
    resources: 'Recursos',
    legal: 'Legal',
    features: 'Características',
    documentation: 'Documentación',
    components: 'Componentes',
    examples: 'Ejemplos',
    about: 'Acerca de',
    blog: 'Blog',
    careers: 'Carreras',
    contact: 'Contacto',
    privacy: 'Privacidad',
    terms: 'Términos',
    cookies: 'Cookies',
    license: 'Licencia',
    copyright: '© {year} Template Pro. Todos los derechos reservados.',
    backToTop: 'Volver arriba'
  },

  // Time
  time: {
    justNow: 'Justo ahora',
    minuteAgo: 'Hace {count} minuto',
    minutesAgo: 'Hace {count} minutos',
    hourAgo: 'Hace {count} hora',
    hoursAgo: 'Hace {count} horas',
    dayAgo: 'Hace {count} día',
    daysAgo: 'Hace {count} días',
    weekAgo: 'Hace {count} semana',
    weeksAgo: 'Hace {count} semanas',
    monthAgo: 'Hace {count} mes',
    monthsAgo: 'Hace {count} meses',
    yearAgo: 'Hace {count} año',
    yearsAgo: 'Hace {count} años'
  }
};