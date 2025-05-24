export default {
  auth: {
    signIn: {
      title: "Iniciar Sesión",
      email: "Correo Electrónico",
      password: "Contraseña",
      submit: "Iniciar Sesión",
      signUpLink: "¿No tienes cuenta? Regístrate",
      loading: "Iniciando sesión..."
    },
    signUp: {
      title: "Registro",
      username: "Nombre de Usuario",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      bio: "Biografía",
      city: "Ciudad",
      country: "Seleccionar País",
      useLocation: "Usar mi ubicación actual",
      submit: "Registrarse",
      loading: "Registrando...",
      searchCountry: "Buscar país...",
      close: "Cerrar",
      selectCountry: "Seleccionar un País"
    }
  },
  plans: {
    create: {
      title: "Título",
      titlePlaceholder: "Título del plan",
      description: "Descripción",
      descriptionPlaceholder: "Descripción del plan",
      dateTime: "Fecha y Hora",
      dateTimePlaceholder: "Seleccionar fecha y hora",
      location: "Ubicación",
      maxParticipants: "Máximo de Participantes",
      tags: "Etiquetas",
      tagPlaceholder: "Añadir etiqueta...",
      image: "Imagen",
      addImage: "Añadir imagen",
      changeImage: "Cambiar imagen",
      submit: "Crear Plan"
    },
    detail: {
      loading: "Cargando...",
      notFound: "Plan no encontrado",
      join: "Unirse al Plan",
      chat: "Chat",
      location: "Ubicación",
      date: "Fecha",
      description: "Descripción",
      tags: "Etiquetas",
      admins: "Administradores"
    },
    edit: {
      title: "Editar Plan",
      save: "Guardar Cambios"
    },
    searchByName: "Buscar por nombre",
    notFound: "No se encontró ningún plan",
    allPlans: "Todos los Planes",
    createdPlans: "Planes Creados",
    joinedPlans: "Planes Unidos",
    leave: "Abandonar plan",
    leaveTitle: "Abandonar plan",
    leaveConfirm: "¿Seguro que quieres abandonar este plan?",
    filterByCity: "Filtrar por ciudad",
    searchCity: "Buscar ciudad",
    searchCityPlaceholder: "Escribe el nombre de una ciudad..."
  },
  chat: {
    title: "Chat",
    messagePlaceholder: "Escribe un mensaje...",
    joinToChat: "Únete al plan para chatear",
    participants: "participantes"
  },
  profile: {
    edit: {
      title: "Editar Perfil",
      username: "Nombre de Usuario",
      email: "Correo Electrónico",
      bio: "Biografía",
      city: "Ciudad",
      country: "País",
      interests: "Intereses",
      addPhoto: "Añadir Foto",
      save: "Guardar",
      saving: "Guardando...",
      errorLoading: "Error al cargar los datos del usuario"
    }
  },
  location: {
    permission: {
      title: "Permiso de Ubicación Requerido",
      message: "Necesitamos acceso a tu ubicación para mostrarte planes cercanos.",
      settings: "Ir a Configuración",
      cancel: "Cancelar",
      allow: "Permitir acceso a ubicación",
      loading: "Obteniendo ubicación...",
      update: "Actualizar Ubicación"
    },
    permissionTitle: 'Permiso de Ubicación Requerido',
    permissionMessage: 'ApenMeet necesita acceso a tu ubicación para mostrarte planes cerca de ti y habilitar el filtrado por ciudad.',
    goToSettings: 'Abrir Ajustes',
    enableLocation: 'Activar Ubicación',
    locationDisabled: 'Los servicios de ubicación están desactivados. Por favor, actívalos para usar el filtrado por ciudad.',
  },
  common: {
    close: "Cerrar",
    apply: "Aplicar"
  },
  navigation: {
    home: "Eventos",
    plans: "Planes",
    chats: "Chats",
    config: "Config"
  },
  events: {
    empty: {
      title: "No hay eventos",
      message: "Prueba a actualizar o cambia tu ubicación.",
      refresh: "Actualizar"
    },
    showingIn: "Mostrando eventos en {{city}}, {{country}}",
    location: "Ubicación",
    date: "Fecha",
    price: "Precio",
    seeMoreInfo: "Ver más información"
  },
  alerts: {
    location: {
      title: "Permiso de Ubicación",
      message: "Necesitamos acceso a tu ubicación para mostrarte eventos cercanos y conectarte con personas de tu zona. ¿Quieres permitir el acceso?",
      allow: "Sí, permitir",
      deny: "No, gracias"
    },
    deletePlan: {
      title: "Eliminar",
      message: "¿Estás seguro de que quieres eliminar este plan?",
      confirm: "Eliminar",
      cancel: "Cancelar"
    },
    errors: {
      deletePlan: "No se pudo eliminar el plan",
      location: "Error al solicitar permiso de ubicación",
      image: "No se pudo seleccionar la imagen",
      refresh: "Error al actualizar los eventos",
      login: "iniciar sesión"
    }
  },
  api: {
    errors: {
      invalidCredentials: "Credenciales inválidas",
      userNotFound: "Usuario no encontrado",
      invalidOrMissingToken: "Token inválido o no proporcionado",
      planNotFound: "Plan no encontrado",
      notParticipant: "No eres participante de este plan",
      fetchMessages: "Error al obtener los mensajes",
      fileTooLarge: "El archivo es demasiado grande. El tamaño máximo permitido es 10MB",
      invalidPlanId: "ID de plan inválido",
      planFull: "Plan completo, no se permiten más participantes",
      alreadyParticipant: "Ya eres participante de este plan",
      planClosed: "Este plan no está abierto para unirse",
      missingFields: "Faltan campos obligatorios",
      usernameOrEmailInUse: "El nombre de usuario o email ya está en uso",
      noPermission: "No tienes permisos para realizar esta acción",
      noPermissionAddAdmin: "No tienes permisos para añadir administradores",
      alreadyAdmin: "El usuario ya es administrador",
      cannotRemoveCreator: "No se puede eliminar al creador como administrador",
      serverError: "Error interno del servidor",
      invalidEmailFormat: "Formato de email inválido",
      passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
      passwordsDoNotMatch: "Las contraseñas no coinciden"
    },
    success: {
      joined: "Te has unido al plan con éxito",
      userRegistered: "Usuario registrado con éxito",
      login: "Inicio de sesión exitoso",
      adminAdded: "Administrador añadido con éxito",
      adminRemoved: "Administrador eliminado con éxito",
      planUpdated: "Plan actualizado con éxito",
      planDeleted: "Plan eliminado con éxito",
      planCancelled: "Plan cancelado con éxito",
      leftPlan: "Has abandonado el plan con éxito"
    }
  },
  config: {
    settings: "Configuración",
    editProfile: "Editar Perfil",
    notifications: "Notificaciones",
    privacy: "Privacidad",
    help: "Ayuda",
    about: "Acerca de",
    darkMode: "Modo Oscuro",
    logout: "Cerrar sesión",
    language: "Idioma"
  },
  adminManagement: {
    title: "Gestionar administradores",
    addAdmin: "Añadir admin",
    removeAdmin: "Eliminar admin",
    alreadyAdmin: "Ya es admin",
    removeUser: "Eliminar usuario",
    confirmRemoveTitle: "Eliminar usuario",
    confirmRemoveMsg: "¿Seguro que quieres eliminar a este usuario del plan?",
    cancel: "Cancelar",
    remove: "Eliminar",
    you: "Tú",
    confirmAddAdmin: '¿Seguro que quieres hacer admin a {{name}}?',
    confirmRemoveAdmin: '¿Seguro que quieres quitar a {{name}} como admin?',
    adminAdded: '{{name}} ahora es admin',
    adminRemoved: '{{name}} ya no es admin',
    noAdmins: 'Aún no hay admins',
    searchPlaceholder: 'Buscar usuarios...',
    adminList: 'Lista de admins',
    userList: 'Lista de usuarios',
    permissions: {
      title: 'Permisos',
      manageUsers: 'Gestionar usuarios',
      manageContent: 'Gestionar contenido',
      manageSettings: 'Gestionar ajustes',
    },
    role: {
      creator: 'Creador',
      admin: 'Admin',
      user: 'Usuario',
    },
  },
}; 