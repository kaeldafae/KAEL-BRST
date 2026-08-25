/* KAEL — sistema de idiomas (ES/EN).
   getLang()/setLang() persisten el idioma elegido en localStorage. t(key)
   busca la cadena en el idioma activo, con fallback a español si falta.
   applyI18n() traduce el marcado estático marcado con data-i18n /
   data-i18n-html (para bloques con etiquetas anidadas, p.ej. textos
   legales) / data-i18n-placeholder / data-i18n-aria-label. El contenido
   generado por JS (home.js, catalog.js, etc.) llama a t() directamente
   al construir sus plantillas, así que no necesita estos atributos. */

const I18N_LANG_KEY = 'kael-aut-lang';

const I18N = {
  es: {
    nav: { barcos: 'Barcos', comoFunciona: 'Cómo funciona', empresas: 'Empresas náuticas', asistente: 'No sé qué barco elegir', solicitarBarco: 'Solicitar barco', menu: 'Menú' },
    header: { destinosSuffix: ' destinos' },
    footer: {
      note: 'KAEL es una plataforma de intermediación. No presta el servicio náutico ni cobra el alquiler. Las embarcaciones son ofrecidas por empresas náuticas verificadas en varios destinos.',
      destinosTitle: 'Destinos',
      empresasTitle: 'Empresas',
      legalTitle: 'Legal',
      publicarFlota: 'Publicar tus embarcaciones',
      procesoVerificacion: 'Proceso de verificación',
      accesoPanel: 'Acceso al panel',
      rightsReserved: 'KAEL. Todos los derechos reservados.',
      disclaimer: 'KAEL no vende barcos ni presta servicios náuticos. Actúa como intermediario digital.'
    },
    cookie: {
      pre: 'Usamos cookies técnicas necesarias para el funcionamiento de la web y, si lo aceptas, cookies analíticas para entender cómo se usa. Puedes cambiar tu decisión en cualquier momento desde la ',
      linkLabel: 'política de cookies',
      post: '.',
      accept: 'Aceptar todas',
      reject: 'Rechazar'
    },
    legalNav: { aviso: 'Aviso legal', privacidad: 'Privacidad', cookies: 'Cookies', condiciones: 'Condiciones de intermediación', reclamaciones: 'Reclamaciones' },
    markets: { ibiza: 'Ibiza y Formentera', canarias: 'Canarias', cancun: 'Cancún', phuket: 'Phuket', dubai: 'Dubái' },
    countries: { 'España': 'España', 'México': 'México', 'Tailandia': 'Tailandia', 'EAU': 'EAU' },
    common: {
      solicitarReserva: 'Solicitar reserva', verEstaEmbarcacion: 'Ver esta embarcación', verEmpresa: 'Ver empresa',
      empresaVerificada: 'Empresa verificada', respondeEn: 'Responde en', desde: 'desde', personas: 'personas',
      conPatron: 'Con patrón', sinPatron: 'Sin patrón', muyPronto: 'Muy pronto', todasLasEmpresas: 'Todas las empresas', seleccionar: 'Seleccionar', enviando: 'Enviando…',
      destacado: 'Destacado', volverAlInicio: 'Volver al inicio', precioOrientativo: 'Precio orientativo',
      embarcacion: 'embarcación', embarcaciones: 'embarcaciones',
      types: { 'Lancha': 'Lancha', 'Yate': 'Yate', 'Catamarán': 'Catamarán' },
      empresasVerificandoPrefix: 'Estamos verificando empresas náuticas en '
    },
    home: {
      heroCardTitle: 'Muy pronto',
      heroEmptyDesc: 'Estamos verificando empresas náuticas en {markets}.',
      heroTag: 'Plataforma de intermediación náutica',
      h1: 'Tu día en el mar empieza aquí',
      heroNote: 'Compara embarcaciones de empresas náuticas verificadas y solicita disponibilidad en un paso. Sin pagos por adelantado.',
      verLaFlota: 'Ver la flota',
      barcoAnterior: 'Barco anterior', barcoSiguiente: 'Barco siguiente',
      marquee: { lanchas: 'Lanchas', yates: 'Yates', catamaranes: 'Catamaranes', conPatron: 'Con patrón', sinPatron: 'Sin patrón', verificadas: 'Empresas verificadas' },
      selectorEyebrow: 'La flota',
      selectorTitle: 'Elige tu empresa y tu barco',
      selectorSubtitle: 'Arrastra, usa las flechas o pulsa un barco para girar el carrusel. Fotografías reales de cada embarcación.',
      stageAriaLabel: 'Selector de embarcaciones en 3D. Usa las flechas del teclado para girar.',
      dragHint: 'Arrastra para girar',
      selectorEmpty: 'Todavía no hay embarcaciones publicadas. Estamos verificando empresas náuticas en {markets}.',
      stat0: 'No cobramos nada al solicitar. Pagas a la empresa náutica.',
      stat2h: 'Compromiso de primera respuesta de las empresas.',
      stat100: 'Empresas verificadas: identidad, habilitación y seguros.',
      statDestinosSuffix: ' destinos',
      statDestinosLabel: 'Destinos en los que estamos incorporando empresas verificadas.',
      comoFuncionaEyebrow: 'Cómo funciona',
      comoFuncionaTitle: 'Tú eliges el barco. Nosotros enviamos tu solicitud.',
      comoFuncionaLede: 'La empresa náutica confirma disponibilidad, horario y precio directamente contigo. El contrato y el pago son con ella, no con nosotros.',
      comoFuncionaAlt: 'Grupo disfrutando de un día en catamarán',
      step1t: 'Eliges tu barco', step1d: 'Compara embarcaciones de empresas verificadas.',
      step2t: 'Envías una solicitud', step2d: 'Fecha, personas y contacto. Sin ningún pago.',
      step3t: 'La empresa te contacta', step3d: 'Confirma disponibilidad real, horario y precio final.',
      step4t: 'Contratas con la empresa', step4d: 'El alquiler y el pago se formalizan directamente con ella.',
      warnBanner: 'Una solicitud no es una reserva confirmada. La reserva existe cuando la empresa náutica acepta y confirma las condiciones contigo.',
      searchTitle: '¿Qué barco estás buscando?',
      labelDestino: 'Destino', labelFecha: 'Fecha', labelPersonas: 'Personas', labelTipo: 'Tipo', labelPatron: 'Con patrón',
      todosLosDestinos: 'Todos los destinos', todos: 'Todos', indiferente: 'Indiferente', buscar: 'Buscar',
      embarcacionesTitle: 'Embarcaciones', verTodasConFiltros: 'Ver todas con filtros',
      boatsGridEmpty: 'Todavía no hay embarcaciones publicadas. En cuanto una empresa confirme su colaboración, sus barcos aparecerán aquí.',
      compareTitle: 'La comparación', compareLede: 'Buscar barco por tu cuenta en agosto, o hacerlo desde aquí.',
      comparePorTuCuenta: 'Por tu cuenta',
      compareRow1: ['Comparar embarcaciones', 'Web a web, WhatsApp a WhatsApp', 'Seis barcos, una ficha comparable'],
      compareRow2: ['Saber quién presta el servicio', 'A menudo no aparece', 'Empresa identificada en cada ficha'],
      compareRow3: ['Solicitar a varias empresas', 'Un mensaje por empresa', 'Una solicitud, hasta tres empresas'],
      compareRow4: ['Pago por adelantado', 'Señales y fianzas sin contexto', 'Ninguno aquí. Pagas a la empresa'],
      asistenteEyebrow: 'Asistente', asistenteTitle: '¿No sabes qué barco elegir?',
      asistenteLede: 'Responde cuatro preguntas sobre tu grupo, tu presupuesto y tu puerto de salida, y te proponemos las embarcaciones que encajan.',
      empezar: 'Empezar',
      empresasEyebrow: 'Empresas verificadas',
      empresasLede: 'Ninguna embarcación se publica sin verificar identidad, habilitación para la actividad, documentación y seguros.',
      verEmpresas: 'Ver empresas',
      companiesTeaserEmptySuffix: '. Consulta el estado por destino.',
      consultaEstado: 'Consulta el estado por destino',
      closingTitle: 'Alquila tu barco donde quieras navegar'
    },
    catalog: {
      pageTitle: 'Barcos', muyPronto: 'Muy pronto',
      subtitleNote: 'Ordenadas por relevancia, ubicación, capacidad, disponibilidad y calidad de la ficha. Las posiciones patrocinadas se identifican como «Destacado».',
      filtros: 'Filtros', tipo: 'Tipo', destino: 'Destino', patron: 'Patrón',
      solicitudMultipleTitle: 'Solicitud múltiple',
      solicitudMultipleDesc: 'Selecciona hasta 3 barcos y envía una única solicitud a varias empresas.',
      selectBoatsBelow: 'Selecciona barcos abajo',
      continuarCon: 'Continuar con', barco: 'barco', barcos: 'barcos',
      emptyAllTitle: 'Todavía no hay embarcaciones publicadas.',
      emptyAllDesc: 'Estamos verificando empresas náuticas en {markets}. En cuanto una empresa confirme su colaboración, sus barcos aparecerán aquí.',
      resultCount: '{n} {label} disponibles para solicitud',
      emptyFiltered: 'No hay embarcaciones con esos filtros. Prueba a quitar alguno o ',
      usaElAsistente: 'usa el asistente',
      capacidad: 'Capacidad', eslora: 'Eslora',
      empresaVerificadaTrust: ' · empresa verificada · responde en ',
      precioFinalNota: 'Precio final sujeto a disponibilidad, temporada y condiciones de la empresa.',
      anadidoSolicitudMultiple: 'Añadido a la solicitud múltiple', anadirSolicitudMultiple: 'Añadir a solicitud múltiple',
      maxTresAlert: 'Puedes seleccionar hasta 3 embarcaciones para una solicitud múltiple.',
      enviarSolicitudA: 'Enviar solicitud a', empresa: 'empresa', empresasWord: 'empresas',
      skippers: { 'Con patrón': 'Con patrón', 'Sin patrón': 'Sin patrón' }
    },
    boat: {
      volverAResultados: 'Volver a resultados',
      emptyTitle: 'Todavía no hay embarcaciones publicadas.',
      emptyDesc: 'Estamos incorporando empresas náuticas verificadas. {link} para ver la disponibilidad actual.',
      volverAlListado: 'Vuelve al listado',
      caracteristicas: 'Características', incluido: 'Incluido', noIncluido: 'No incluido',
      gestionadoPor: 'Gestionado por', tiempoRespuestaPrefix: 'Empresa verificada · tiempo medio de respuesta ',
      legalParagraphPrefix: 'Esta embarcación es ofrecida por ', legalParagraphSuffix: '. Las solicitudes realizadas desde KAEL se remiten a la empresa para confirmar disponibilidad, horario, precio y condiciones. El contrato de alquiler y el pago del servicio se realizan directamente con la empresa náutica.',
      condicionesCancelacion: 'Condiciones de cancelación',
      cancelacionPrefix: 'Definidas por ', cancelacionSuffix: ' y comunicadas antes de formalizar el contrato. Las decisiones sobre navegación y meteorología corresponden a la empresa responsable de la embarcación y al patrón, conforme a la normativa aplicable.',
      precioNota: 'Precio final sujeto a disponibilidad, horario, temporada, duración y condiciones de la empresa. Consulta qué incluye el precio.',
      labelFecha: 'Fecha', labelPersonas: 'Personas', labelDuracion: 'Duración',
      consultamosNota: 'Consultamos disponibilidad. No se realiza ningún pago ahora.',
      specs: { tipo: 'Tipo', capacidad: 'Capacidad autorizada', eslora: 'Eslora', puertoBase: 'Puerto base', patron: 'Patrón', camarotes: 'Camarotes', banos: 'Baños', combustible: 'Combustible', combustibleValor: 'No incluido, se liquida al regreso' }
    },
    companies: {
      h1: 'Empresas náuticas verificadas',
      lede: 'Ninguna embarcación se publica en KAEL sin verificar la identidad de la empresa, su habilitación para la actividad de arrendamiento náutico, documentación y seguros. Si tienes una empresa náutica y quieres publicar tu flota, ',
      escribenos: 'escríbenos',
      emptyMarketSuffix: '. Muy pronto aquí.'
    },
    company: {
      volverAEmpresas: 'Volver a empresas',
      emptyTitle: 'Todavía no hay empresas publicadas.',
      emptyDesc: 'Estamos verificando empresas náuticas en varios destinos. {link} para ver el estado por destino.',
      tiempoRespuesta: 'Tiempo medio de respuesta', solicitudesConfirmadas: 'Solicitudes confirmadas', valoracionClientes: 'Valoración de clientes',
      razonSocial: 'Razón social', cif: 'CIF', base: 'Base', actividad: 'Actividad', actividadValor: 'Arrendamiento náutico',
      susEmbarcaciones: 'Sus embarcaciones',
      infoParagraphPrefix: 'Las solicitudes enviadas desde KAEL se remiten a ', infoParagraphSuffix: ', que confirma disponibilidad, horario, precio y condiciones directamente contigo. El contrato de alquiler y el cobro del servicio corresponden a la empresa náutica.'
    },
    wizard: {
      h1: '¿No sabes qué barco elegir?',
      lede: 'Cuatro preguntas rápidas y te proponemos tres embarcaciones.',
      preguntaDe: 'Pregunta {n} de 4',
      q1: '¿Cuántos sois?',
      q1o1: '2 – 4 personas', q1o2: '5 – 8 personas', q1o3: '9 – 12 personas',
      q2: '¿Qué tipo de día quieres?',
      q2o1l: 'Día en Formentera', q2o1h: 'Travesía y calas de aguas claras',
      q2o2l: 'Calas de Ibiza', q2o2h: 'Costa oeste, salidas cortas',
      q2o3l: 'Algo premium', q2o3h: 'Yate con tripulación',
      q2o4l: 'En catamarán', q2o4h: 'Grupo grande, familias',
      q3: '¿Presupuesto orientativo por día?',
      q3o1: 'Hasta 800 €', q3o2: '800 – 1.500 €', q3o3: '1.500 – 2.500 €', q3o4: 'Sin límite claro',
      q4: '¿Desde dónde quieres salir?', indiferente: 'Indiferente',
      resultado: 'Resultado',
      emptyTitle: 'Todavía no hay embarcaciones publicadas',
      emptyDesc: 'Estamos incorporando empresas náuticas verificadas. Vuelve pronto para ver propuestas según tus respuestas.',
      volverAEmpezar: 'Volver a empezar',
      hemosEncontrado: 'Hemos encontrado {n} opciones que podrían encajar contigo',
      puedesSolicitar: 'Puedes solicitar disponibilidad a una empresa o a las tres a la vez.',
      orientativo: 'orientativo',
      solicitarATres: 'Solicitar disponibilidad a las tres'
    },
    solicitud: {
      volverALaFicha: 'Volver a la ficha',
      h1: 'Solicitud de reserva',
      subtitle: 'Pendiente de confirmación por la empresa náutica. No se realiza ningún pago ahora.',
      datosReserva: 'Datos de la reserva', tusDatos: 'Tus datos',
      labelFecha: 'Fecha', labelPersonas: 'Número de personas', labelDuracion: 'Duración deseada', labelHorario: 'Horario preferido',
      diaCompleto: 'Día completo', medioManana: 'Medio día — mañana', medioTarde: 'Medio día — tarde',
      labelNombre: 'Nombre y apellidos', labelEmail: 'Email', labelTelefono: 'Teléfono', labelPais: 'País',
      paises: { 'España': 'España', 'Reino Unido': 'Reino Unido', 'Italia': 'Italia', 'Francia': 'Francia', 'Alemania': 'Alemania', 'Otro': 'Otro' },
      labelComentarios: 'Comentarios o preferencias', comentariosPlaceholder: 'Nos gustaría salir sobre las 10:00 y visitar Formentera.',
      empresaHoneypot: 'Empresa',
      privacyPrefix: 'Al enviar esta solicitud, tus datos serán tratados por KAEL para gestionar tu solicitud de alquiler y comunicarla a la empresa náutica correspondiente. La empresa podrá utilizar tus datos para contactarte y gestionar la posible contratación del servicio. Consulta nuestra ',
      politicaPrivacidad: 'Política de Privacidad',
      checkboxPrivacy: 'He leído y acepto la Política de Privacidad.',
      checkboxMarketing: 'Quiero recibir ofertas y novedades. ', opcional: '(opcional)',
      solicitarReserva: 'Solicitar reserva',
      noImplicaPago: 'Esta solicitud no implica ningún pago ni una reserva confirmada.',
      empresaLabel: 'Empresa', precioOrientativo: 'Precio orientativo',
      warnPrefix: 'Estás enviando una ', warnBold: 'solicitud', warnSuffix: '. La reserva no queda confirmada hasta que ', warnSuffix2: ' confirme disponibilidad y condiciones contigo.',
      emptyMsg: 'Todavía no hay embarcaciones publicadas. ', volverAlListado: 'Vuelve al listado'
    },
    solicitudMultiple: {
      volverAResultados: 'Volver a resultados',
      h1: 'Solicitar disponibilidad a varias empresas',
      labelFecha: 'Fecha', labelPersonas: 'Personas', labelDuracion: 'Duración', diaCompleto: 'Día completo', medioDia: 'Medio día',
      labelNombre: 'Nombre y apellidos', labelEmail: 'Email', labelTelefono: 'Teléfono',
      checkboxPrivacy: 'He leído y acepto la Política de Privacidad. Entiendo que mis datos se comunicarán a las empresas náuticas seleccionadas.',
      enviarSolicitud: 'Enviar solicitud',
      cadaEmpresaNota: 'Cada empresa responderá por separado. Ninguna solicitud implica pago ni reserva confirmada.',
      emptyMsg: 'No has seleccionado ninguna embarcación todavía. ', vuelveAlListado: 'Vuelve al listado', anadeHastaTres: ' y añade hasta 3 barcos a la solicitud múltiple.',
      unaSolaSolicitudPrefix: 'Una sola solicitud, ', empresaNautica: 'empresa náutica', empresasNauticas: 'empresas náuticas',
      cadaUnaRespondera: '. Cada una responderá con disponibilidad, precio y horario.',
      responde: 'responde en',
      enviarSolicitudA: 'Enviar solicitud a', empresa: 'empresa', empresasPlural: 'empresas'
    },
    confirmacion: {
      h1: 'Solicitud enviada correctamente',
      multiLine: 'Hemos enviado tu solicitud a las empresas náuticas seleccionadas. Cada una se pondrá en contacto contigo para confirmar disponibilidad, horario, precio y condiciones.',
      singleLinePrefix: 'Hemos enviado tu solicitud a ', singleLineSuffix: '. La empresa se pondrá en contacto contigo para confirmar disponibilidad, horario, precio y condiciones del alquiler.',
      laEmpresaNautica: 'la empresa náutica',
      referenciaSolicitud: 'Referencia de solicitud',
      infoBanner: 'Esta solicitud no implica un pago a KAEL ni una reserva confirmada hasta que la empresa náutica confirme directamente el servicio.',
      demoNoticePrefix: 'Modo de demostración: ', demoNoticeText: 'el backend de notificaciones aún no está desplegado, así que esta solicitud se ha guardado solo en tu navegador y no se ha enviado ningún email real a la empresa. Despliega server/ (ver README) para activar los envíos.',
      noContactadoTitle: '¿Todavía no te han contactado?',
      noContactadoDesc: 'La empresa se compromete a responder en menos de 2 horas.',
      avisarnos: 'Avisarnos',
      volverAlInicio: 'Volver al inicio',
      rowEmbarcacion: 'Embarcación', rowFecha: 'Fecha solicitada', rowPersonas: 'Personas', rowCliente: 'Cliente', rowEstado: 'Estado',
      pendienteDeEmpresa: 'Pendiente de empresa'
    },
    notfound: {
      eyebrow: 'Error 404', h1: 'No hemos encontrado esta página',
      lede: 'Puede que el enlace esté roto o que la embarcación ya no esté publicada. Vuelve al catálogo para seguir buscando tu barco.',
      verLaFlota: 'Ver la flota'
    },
    admin: {
      h1: 'Panel interno — solicitudes',
      desc: 'Backoffice mínimo (MVP). Requiere que el servidor de server/ esté desplegado y ADMIN_USER/ADMIN_PASS configurados. Tu navegador te pedirá usuario y contraseña.',
      thRef: 'Referencia', thFecha: 'Fecha creación', thBarcos: 'Barco(s)', thCliente: 'Cliente', thContacto: 'Contacto',
      thFechaSol: 'Fecha solicitada', thPersonas: 'Personas', thEstado: 'Estado', thImporte: 'Importe',
      cargando: 'Cargando…', sinSolicitudes: 'Todavía no hay solicitudes.',
      statTotales: 'Solicitudes totales', statPendientes: 'Pendientes de empresa', statConfirmadas: 'Confirmadas',
      errorCarga: 'No se pudo cargar (¿backend desplegado y configurado?): '
    },
    legal: {
      updated: 'Última actualización: '
    },
    legalDocs: {
      avisoLegal:
        '<h1>Aviso legal</h1>' +
        '<div class="updated">Última actualización: <span data-year></span></div>' +
        '<p>El presente aviso legal regula el uso del sitio web <strong>KAEL</strong> (en adelante, «la Plataforma»), accesible en kaelaut.com, conforme a la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).</p>' +
        '<h2>1. Datos identificativos del titular</h2>' +
        '<p>En cumplimiento del deber de información recogido en el artículo 10 de la LSSI-CE, se indican a continuación los datos identificativos de la empresa titular de la Plataforma:</p>' +
        '<ul>' +
          '<li>Denominación social: KAEL AUT</li>' +
          '<li>Nombre comercial: KAEL</li>' +
          '<li>NIF/CIF: <mark>[COMPLETAR]</mark></li>' +
          '<li>Domicilio social: <mark>[COMPLETAR — dirección, Ibiza/Formentera, Islas Baleares]</mark></li>' +
          '<li>Correo electrónico: <mark>[COMPLETAR — hola@kaelaut.com]</mark></li>' +
          '<li>Teléfono: <mark>[COMPLETAR]</mark></li>' +
          '<li>Datos registrales: <mark>[COMPLETAR — Registro Mercantil]</mark></li>' +
        '</ul>' +
        '<h2>2. Objeto y naturaleza de la actividad</h2>' +
        '<p>KAEL es una <strong>plataforma digital de intermediación</strong> que conecta a personas interesadas en alquilar una embarcación con empresas náuticas verificadas que operan en varios destinos (Ibiza y Formentera, Canarias, Cancún, Phuket, Dubái). La Plataforma no es propietaria de las embarcaciones publicadas, no presta el servicio náutico y no cobra el importe del alquiler.</p>' +
        '<p>Las solicitudes realizadas a través de la Plataforma son transmitidas a la empresa náutica correspondiente, que confirma disponibilidad, horario, precio final y condiciones directamente con el cliente, y con quien se formaliza el contrato de alquiler y se realiza el pago del servicio.</p>' +
        '<h2>3. Condiciones de uso</h2>' +
        '<p>El acceso y uso de la Plataforma atribuye la condición de usuario y supone la aceptación de este aviso legal, de las <a href="condiciones-intermediacion.html">condiciones de intermediación</a> y de la <a href="privacidad.html">política de privacidad</a>. El usuario se compromete a utilizar la Plataforma conforme a la ley, la buena fe y el orden público, y a facilitar información veraz en los formularios de solicitud.</p>' +
        '<h2>4. Propiedad intelectual e industrial</h2>' +
        '<p>Los contenidos de la Plataforma (textos, diseño, marcas, logotipos) son titularidad de KAEL o de las empresas náuticas colaboradoras, salvo indicación contraria, y están protegidos por la normativa de propiedad intelectual e industrial. Las fotografías de embarcaciones son proporcionadas por las empresas náuticas y/o utilizadas con su autorización.</p>' +
        '<h2>5. Responsabilidad</h2>' +
        '<p>KAEL no es responsable de la prestación del servicio náutico, de la disponibilidad real de las embarcaciones, del estado de la embarcación, de la seguridad en la navegación, ni de las condiciones económicas finales acordadas entre el cliente y la empresa náutica. La responsabilidad sobre estos extremos corresponde en exclusiva a la empresa náutica gestora de cada embarcación, según se detalla en las <a href="condiciones-intermediacion.html">condiciones de intermediación</a>.</p>' +
        '<h2>6. Enlaces externos</h2>' +
        '<p>La Plataforma puede contener enlaces a sitios de terceros. KAEL no asume responsabilidad por el contenido o funcionamiento de dichos sitios.</p>' +
        '<h2>7. Legislación aplicable</h2>' +
        '<p>Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someterán a los juzgados y tribunales que correspondan conforme a la normativa de protección de consumidores.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Este documento es una plantilla base y no sustituye el asesoramiento de un abogado. Antes de publicar la web, revisa y completa los datos marcados con <mark>[COMPLETAR]</mark> y valida el contenido con un profesional colegiado en España/Baleares.</p>',

      privacidad:
        '<h1>Política de privacidad</h1>' +
        '<div class="updated">Última actualización: <span data-year></span></div>' +
        '<p>En KAEL tratamos tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).</p>' +
        '<h2>1. Responsable del tratamiento</h2>' +
        '<ul>' +
          '<li>Responsable: KAEL AUT (nombre comercial: KAEL)</li>' +
          '<li>NIF: <mark>[COMPLETAR]</mark></li>' +
          '<li>Dirección: <mark>[COMPLETAR]</mark></li>' +
          '<li>Contacto de privacidad: <mark>[COMPLETAR — privacidad@kaelaut.com]</mark></li>' +
        '</ul>' +
        '<h2>2. Qué datos tratamos y con qué finalidad</h2>' +
        '<p>Cuando envías una solicitud de reserva a través de la Plataforma tratamos los siguientes datos, con las finalidades indicadas:</p>' +
        '<ul>' +
          '<li><strong>Gestión de la solicitud:</strong> nombre, email, teléfono, país, fecha, número de personas, duración, horario preferido y comentarios, para generar la solicitud, remitirla a la empresa náutica seleccionada y hacerte seguimiento.</li>' +
          '<li><strong>Comunicaciones comerciales</strong> (solo si marcas la casilla correspondiente): envío de ofertas y novedades de KAEL.</li>' +
          '<li><strong>Analítica y mejora del servicio:</strong> si aceptas las cookies analíticas, para entender el uso de la web (ver <a href="cookies.html">política de cookies</a>).</li>' +
        '</ul>' +
        '<p>No solicitamos por defecto DNI, pasaporte, número de tarjeta, IBAN ni dirección postal completa en el formulario de solicitud inicial: aplicamos el principio de minimización de datos desde el diseño.</p>' +
        '<h2>3. Base legal del tratamiento</h2>' +
        '<p>La base legal es el consentimiento explícito que prestas al enviar el formulario y aceptar esta política, así como, en su caso, la ejecución de medidas precontractuales a solicitud tuya (gestionar tu solicitud de alquiler).</p>' +
        '<h2>4. A quién comunicamos tus datos</h2>' +
        '<p>Tus datos se comunican a la <strong>empresa náutica gestora</strong> de la embarcación que hayas seleccionado (o a varias, si utilizas la solicitud múltiple), para que pueda contactarte, confirmar disponibilidad y, en su caso, formalizar el alquiler contigo. La empresa náutica trata tus datos como responsable independiente para la gestión del propio alquiler.</p>' +
        '<p>Podemos utilizar proveedores tecnológicos (hosting, envío de email transaccional) que actúan como encargados del tratamiento bajo contrato, con las garantías exigidas por el RGPD. Si alguno de estos proveedores está fuera del Espacio Económico Europeo, nos aseguramos de que existan garantías adecuadas (cláusulas contractuales tipo u otras).</p>' +
        '<h2>5. Plazo de conservación</h2>' +
        '<p>Conservamos los datos de las solicitudes durante el tiempo necesario para gestionar la relación comercial y, posteriormente, durante los plazos de prescripción legal aplicables (fiscal, mercantil). Los datos de contacto para comunicaciones comerciales se conservan hasta que retires tu consentimiento.</p>' +
        '<h2>6. Tus derechos</h2>' +
        '<p>Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a <mark>[COMPLETAR — privacidad@kaelaut.com]</mark>, indicando el derecho que deseas ejercer y adjuntando copia de un documento que acredite tu identidad. Tienes también derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que el tratamiento no se ajusta a la normativa.</p>' +
        '<h2>7. Seguridad</h2>' +
        '<p>Aplicamos medidas técnicas y organizativas razonables (HTTPS, control de accesos, minimización de datos) para proteger tus datos frente a accesos no autorizados, pérdida o alteración.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Este documento es una plantilla base. Antes de publicar la web, completa los datos marcados con <mark>[COMPLETAR]</mark>, formaliza contratos de encargado de tratamiento con tus proveedores tecnológicos y con cada empresa náutica colaboradora, y valida el texto con un asesor en protección de datos.</p>',

      cookies:
        '<h1>Política de cookies</h1>' +
        '<div class="updated">Última actualización: <span data-year></span></div>' +
        '<p>Este sitio utiliza cookies propias y, si las aceptas, cookies analíticas de terceros, conforme al artículo 22.2 de la LSSI-CE y a la guía de la Agencia Española de Protección de Datos (AEPD).</p>' +
        '<h2>1. ¿Qué es una cookie?</h2>' +
        '<p>Una cookie es un pequeño archivo que se almacena en tu navegador al visitar una web y que permite recordar información sobre tu visita.</p>' +
        '<h2>2. Cookies que utilizamos</h2>' +
        '<ul>' +
          '<li><strong>Técnicas / necesarias (siempre activas):</strong> permiten el funcionamiento básico de la web, como recordar tu selección para la solicitud múltiple de barcos o tu decisión sobre esta banner de cookies. No requieren consentimiento.</li>' +
          '<li><strong>Analíticas (solo con tu consentimiento):</strong> nos ayudan a entender cómo se usa la web para mejorarla. Se activan únicamente si pulsas «Aceptar todas».</li>' +
          '<li><strong>Marketing / remarketing (solo con tu consentimiento, si en el futuro se activan):</strong> permitirían mostrar anuncios relevantes en otras webs. Actualmente no están activas por defecto.</li>' +
        '</ul>' +
        '<h2>3. Gestionar tu decisión</h2>' +
        '<p>Al entrar en la web te mostramos un aviso con dos opciones igual de accesibles: <strong>«Aceptar todas»</strong> y <strong>«Rechazar»</strong>. Puedes cambiar tu decisión en cualquier momento borrando las cookies de tu navegador o, en próximas versiones de esta web, desde un panel de preferencias.</p>' +
        '<h2>4. Cookies de terceros</h2>' +
        '<p>Si en el futuro se incorpora Google Analytics, un píxel de Meta/TikTok u otra herramienta de medición o publicidad, esta política se actualizará detallando cada cookie, su finalidad, duración y el tercero responsable, y su activación quedará condicionada a tu consentimiento previo.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Plantilla base a completar por el titular del sitio antes de activar cualquier herramienta de analítica o publicidad de terceros.</p>',

      condiciones:
        '<h1>Condiciones de intermediación</h1>' +
        '<div class="updated">Última actualización: <span data-year></span></div>' +
        '<h2>1. Qué es KAEL</h2>' +
        '<p>KAEL es una plataforma digital de <strong>intermediación</strong> para el alquiler de embarcaciones en varios destinos (Ibiza y Formentera, Canarias, Cancún, Phuket, Dubái). Conecta a personas interesadas en alquilar un barco con empresas náuticas verificadas que ofrecen sus embarcaciones en la Plataforma.</p>' +
        '<p><strong>KAEL no es propietaria de las embarcaciones, no presta el servicio náutico y no cobra el importe del alquiler.</strong> Su función se limita a mostrar la oferta, recoger solicitudes de disponibilidad y transmitirlas a la empresa náutica correspondiente, dejando constancia verificable del origen de cada solicitud.</p>' +
        '<h2>2. Solicitud frente a reserva confirmada</h2>' +
        '<p>Cuando completas el formulario y pulsas «Solicitar reserva», estás enviando una <strong>solicitud</strong>, no una reserva confirmada. La solicitud queda en estado «pendiente de empresa» hasta que la empresa náutica correspondiente comprueba la disponibilidad real y confirma contigo, directamente, la fecha, el horario, el precio final y las condiciones del alquiler. Solo en ese momento existe una reserva confirmada.</p>' +
        '<p>Enviar una solicitud a través de KAEL no implica ningún pago a KAEL ni compromiso económico alguno con la Plataforma.</p>' +
        '<h2>3. Quién presta el servicio y quién cobra</h2>' +
        '<p>El alquiler de la embarcación, su contrato, el cobro del precio, la fianza en su caso, la documentación náutica, la seguridad, la tripulación o patrón cuando corresponda, y la gestión de incidencias, cancelaciones y devoluciones son responsabilidad exclusiva de la <strong>empresa náutica</strong> identificada en la ficha de cada embarcación («Gestionado por»). El pago del alquiler se realiza siempre directamente a la empresa náutica, nunca a KAEL.</p>' +
        '<h2>4. Precio orientativo</h2>' +
        '<p>Los precios mostrados en la Plataforma son orientativos («desde X €») salvo que la empresa náutica facilite expresamente un precio cerrado. El precio final puede variar en función de la disponibilidad, la temporada, la duración, el combustible, el patrón, la limpieza, la fianza u otros conceptos, que serán detallados por la empresa náutica antes de formalizar el contrato.</p>' +
        '<h2>5. Verificación de empresas náuticas</h2>' +
        '<p>Antes de publicar sus embarcaciones, cada empresa colaboradora es verificada por KAEL: identidad, CIF/NIF, habilitación para la actividad de arrendamiento náutico y documentación básica. Esta verificación no constituye una certificación jurídica exhaustiva ni exime a la empresa náutica de cumplir con toda la normativa aplicable a su actividad (Ley de Navegación Marítima, normativa de seguridad marítima, seguros obligatorios, etc.).</p>' +
        '<h2>6. Cancelaciones y meteorología</h2>' +
        '<p>Las condiciones de cancelación son definidas por cada empresa náutica y se comunican antes de formalizar el contrato. Las decisiones relativas a la navegación y a las condiciones meteorológicas corresponden a la empresa responsable de la embarcación y, en su caso, al patrón, conforme a la normativa de seguridad marítima aplicable.</p>' +
        '<h2>7. Responsabilidad de KAEL</h2>' +
        '<p>KAEL no es responsable de la disponibilidad real, el estado, la seguridad o la prestación efectiva del servicio de las embarcaciones publicadas, ni de los acuerdos económicos alcanzados entre cliente y empresa náutica. KAEL responde, dentro de lo razonable, de la correcta transmisión de las solicitudes generadas a través de la Plataforma y del funcionamiento técnico del servicio de intermediación.</p>' +
        '<h2>8. Reclamaciones</h2>' +
        '<p>Si tu incidencia se refiere al funcionamiento de la Plataforma (por ejemplo, un fallo al enviar una solicitud), contacta con nosotros según se indica en la página de <a href="reclamaciones.html">reclamaciones</a>. Si tu incidencia se refiere a la prestación del servicio náutico (disponibilidad, estado del barco, patrón, cobro, cancelaciones), debes dirigirte en primer lugar a la empresa náutica gestora, sin perjuicio de que KAEL pueda mediar de buena fe entre las partes.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Estas condiciones son una plantilla base pensada para reflejar el modelo de intermediación descrito en la documentación del proyecto. Antes de publicar la web, hazlas revisar por un abogado especializado en Baleares, que debe adaptarlas al contrato real firmado con cada empresa náutica colaboradora.</p>',

      reclamaciones:
        '<h1>Reclamaciones</h1>' +
        '<div class="updated">Última actualización: <span data-year></span></div>' +
        '<p>Queremos que cualquier problema se resuelva rápido y con claridad sobre quién debe responder. Antes de reclamar, es útil saber a quién corresponde tu incidencia:</p>' +
        '<h2>1. Problemas con la Plataforma</h2>' +
        '<p>Si tu problema es técnico o comercial y está relacionado con el funcionamiento de KAEL — por ejemplo, un formulario que no envía, una ficha con datos incorrectos, o dudas sobre cómo funciona una solicitud — escríbenos indicando tu referencia de solicitud (si la tienes):</p>' +
        '<ul>' +
          '<li>Email: <mark>[COMPLETAR — reclamaciones@kaelaut.com]</mark></li>' +
          '<li>Teléfono: <mark>[COMPLETAR]</mark></li>' +
          '<li>Plazo de respuesta objetivo: 48 horas laborables</li>' +
        '</ul>' +
        '<h2>2. Problemas con el alquiler del barco</h2>' +
        '<p>Si tu problema se refiere a la prestación del servicio náutico en sí — disponibilidad, estado de la embarcación, patrón, precio finalmente cobrado, cancelaciones o incidencias durante la navegación — debes dirigirte en primer lugar <strong>directamente a la empresa náutica</strong> que gestionó tu alquiler, identificada en la ficha de la embarcación y en tu email de confirmación.</p>' +
        '<p>Si no obtienes respuesta satisfactoria de la empresa náutica, escríbenos con el detalle de tu solicitud (referencia, fechas, empresa) y mediaremos de buena fe entre las partes, sin que ello implique que KAEL asuma responsabilidad por la prestación del servicio, que corresponde a la empresa náutica.</p>' +
        '<h2>3. Hojas de reclamaciones</h2>' +
        '<p>Como consumidor, tienes derecho a solicitar la hoja de reclamaciones oficial. Para incidencias relativas al servicio náutico, la hoja de reclamaciones corresponde a la empresa náutica prestadora del servicio. Para incidencias relativas a la Plataforma, puedes solicitarla a KAEL en los datos de contacto anteriores.</p>' +
        '<h2>4. Resolución alternativa de litigios</h2>' +
        '<p>Como consumidor residente en la UE, también puedes acceder a la plataforma europea de resolución de litigios en línea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Completa los datos de contacto marcados con <mark>[COMPLETAR]</mark> antes de publicar la web.</p>'
    },
    meta: {
      indexTitle: 'KAEL — Alquiler de barcos en varios destinos',
      indexDesc: 'Compara embarcaciones de empresas náuticas verificadas en Ibiza, Canarias, Cancún, Phuket y Dubái, y solicita disponibilidad en un paso. Sin pagos por adelantado: el contrato y el cobro son con la empresa náutica.',
      indexOgTitle: 'KAEL — Alquiler de barcos en varios destinos',
      indexOgDesc: 'Compara embarcaciones de empresas náuticas verificadas y solicita disponibilidad en un paso.',
      barcosTitle: 'Barcos — KAEL',
      barcosDesc: 'Filtra embarcaciones por tipo, destino y patrón. Precios orientativos, empresa gestora identificada y solicitud de disponibilidad sin pagos por adelantado.',
      empresasTitle: 'Empresas náuticas verificadas — KAEL',
      empresasDesc: 'Empresas náuticas verificadas en Ibiza, Canarias, Cancún, Phuket y Dubái: identidad, habilitación para la actividad, documentación y seguros comprobados.',
      asistenteTitle: '¿No sabes qué barco elegir? — KAEL',
      asistenteDesc: 'Responde cuatro preguntas sobre tu grupo, presupuesto y puerto de salida, y te proponemos las embarcaciones que mejor encajan.',
      solicitudTitle: 'Solicitud de reserva — KAEL',
      solicitudMultipleTitle: 'Solicitar a varias empresas — KAEL',
      confirmacionTitle: 'Solicitud enviada — KAEL',
      notfoundTitle: 'Página no encontrada — KAEL'
    }
  },

  en: {
    nav: { barcos: 'Boats', comoFunciona: 'How it works', empresas: 'Verified companies', asistente: "Not sure which boat", solicitarBarco: 'Request a boat', menu: 'Menu' },
    header: { destinosSuffix: ' destinations' },
    footer: {
      note: 'KAEL is an intermediary platform. It does not provide the boating service or charge for the rental. Boats are offered by verified nautical companies in several destinations.',
      destinosTitle: 'Destinations',
      empresasTitle: 'Companies',
      legalTitle: 'Legal',
      publicarFlota: 'List your boats',
      procesoVerificacion: 'Verification process',
      accesoPanel: 'Partner login',
      rightsReserved: 'KAEL. All rights reserved.',
      disclaimer: 'KAEL does not sell boats or provide boating services. It acts as a digital intermediary.'
    },
    cookie: {
      pre: 'We use technical cookies necessary for the site to work and, if you accept, analytics cookies to understand how it is used. You can change your decision at any time from our ',
      linkLabel: 'cookie policy',
      post: '.',
      accept: 'Accept all',
      reject: 'Reject'
    },
    legalNav: { aviso: 'Legal notice', privacidad: 'Privacy', cookies: 'Cookies', condiciones: 'Intermediation terms', reclamaciones: 'Complaints' },
    markets: { ibiza: 'Ibiza & Formentera', canarias: 'Canary Islands', cancun: 'Cancún', phuket: 'Phuket', dubai: 'Dubai' },
    countries: { 'España': 'Spain', 'México': 'Mexico', 'Tailandia': 'Thailand', 'EAU': 'UAE' },
    common: {
      solicitarReserva: 'Request booking', verEstaEmbarcacion: 'View this boat', verEmpresa: 'View company',
      empresaVerificada: 'Verified company', respondeEn: 'Responds in', desde: 'from', personas: 'people',
      conPatron: 'With skipper', sinPatron: 'Bareboat', muyPronto: 'Coming soon', todasLasEmpresas: 'All companies', seleccionar: 'Select', enviando: 'Sending…',
      destacado: 'Featured', volverAlInicio: 'Back to home', precioOrientativo: 'Estimated price',
      embarcacion: 'boat', embarcaciones: 'boats',
      types: { 'Lancha': 'Speedboat', 'Yate': 'Yacht', 'Catamarán': 'Catamaran' },
      empresasVerificandoPrefix: "We're verifying nautical companies in "
    },
    home: {
      heroCardTitle: 'Coming soon',
      heroEmptyDesc: "We're verifying nautical companies in {markets}.",
      heroTag: 'Nautical intermediation platform',
      h1: 'Your day at sea starts here',
      heroNote: 'Compare boats from verified nautical companies and request availability in one step. No upfront payments.',
      verLaFlota: 'See the fleet',
      barcoAnterior: 'Previous boat', barcoSiguiente: 'Next boat',
      marquee: { lanchas: 'Speedboats', yates: 'Yachts', catamaranes: 'Catamarans', conPatron: 'With skipper', sinPatron: 'Bareboat', verificadas: 'Verified companies' },
      selectorEyebrow: 'The fleet',
      selectorTitle: 'Choose your company and your boat',
      selectorSubtitle: 'Drag, use the arrows, or click a boat to spin the carousel. Real photographs of every boat.',
      stageAriaLabel: '3D boat selector. Use the keyboard arrows to spin it.',
      dragHint: 'Drag to spin',
      selectorEmpty: "No boats published yet. We're verifying nautical companies in {markets}.",
      stat0: "We don't charge anything when you make a request. You pay the nautical company.",
      stat2h: 'First-response commitment from companies.',
      stat100: 'Verified companies: identity, licensing and insurance.',
      statDestinosSuffix: ' destinations',
      statDestinosLabel: "Destinations where we're onboarding verified companies.",
      comoFuncionaEyebrow: 'How it works',
      comoFuncionaTitle: 'You choose the boat. We send your request.',
      comoFuncionaLede: 'The nautical company confirms availability, schedule and price directly with you. The contract and payment are with them, not with us.',
      comoFuncionaAlt: 'Group enjoying a day on a catamaran',
      step1t: 'You choose your boat', step1d: 'Compare boats from verified companies.',
      step2t: 'You send a request', step2d: 'Date, people and contact details. No payment at all.',
      step3t: 'The company contacts you', step3d: 'Confirms real availability, schedule and final price.',
      step4t: 'You book with the company', step4d: 'The rental and payment are arranged directly with them.',
      warnBanner: 'A request is not a confirmed booking. The booking exists once the nautical company accepts and confirms the terms with you.',
      searchTitle: 'What boat are you looking for?',
      labelDestino: 'Destination', labelFecha: 'Date', labelPersonas: 'People', labelTipo: 'Type', labelPatron: 'With skipper',
      todosLosDestinos: 'All destinations', todos: 'All', indiferente: "Doesn't matter", buscar: 'Search',
      embarcacionesTitle: 'Boats', verTodasConFiltros: 'See all with filters',
      boatsGridEmpty: 'No boats published yet. As soon as a company confirms its collaboration, its boats will appear here.',
      compareTitle: 'The comparison', compareLede: 'Search for a boat on your own in August, or do it from here.',
      comparePorTuCuenta: 'On your own',
      compareRow1: ['Comparing boats', 'Site to site, WhatsApp to WhatsApp', 'Six boats, one comparable listing'],
      compareRow2: ['Knowing who provides the service', "Often doesn't show up", 'Company identified on every listing'],
      compareRow3: ['Requesting from several companies', 'One message per company', 'One request, up to three companies'],
      compareRow4: ['Upfront payment', 'Deposits and down payments with no context', 'None here. You pay the company'],
      asistenteEyebrow: 'Assistant', asistenteTitle: "Not sure which boat to choose?",
      asistenteLede: "Answer four questions about your group, budget and departure port, and we'll suggest boats that fit.",
      empezar: 'Get started',
      empresasEyebrow: 'Verified companies',
      empresasLede: "No boat is published without verifying identity, licensing for the activity, documentation and insurance.",
      verEmpresas: 'See companies',
      companiesTeaserEmptySuffix: '. Check the status by destination.',
      consultaEstado: 'Check the status by destination',
      closingTitle: 'Rent your boat wherever you want to sail'
    },
    catalog: {
      pageTitle: 'Boats', muyPronto: 'Coming soon',
      subtitleNote: 'Sorted by relevance, location, capacity, availability and listing quality. Sponsored positions are marked as "Featured".',
      filtros: 'Filters', tipo: 'Type', destino: 'Destination', patron: 'Skipper',
      solicitudMultipleTitle: 'Multiple request',
      solicitudMultipleDesc: 'Select up to 3 boats and send a single request to several companies.',
      selectBoatsBelow: 'Select boats below',
      continuarCon: 'Continue with', barco: 'boat', barcos: 'boats',
      emptyAllTitle: 'No boats published yet.',
      emptyAllDesc: "We're verifying nautical companies in {markets}. As soon as a company confirms its collaboration, its boats will appear here.",
      resultCount: '{n} {label} available to request',
      emptyFiltered: 'No boats match those filters. Try removing one or ',
      usaElAsistente: 'use the assistant',
      capacidad: 'Capacity', eslora: 'Length',
      empresaVerificadaTrust: ' · verified company · responds in ',
      precioFinalNota: "Final price subject to availability, season and the company's terms.",
      anadidoSolicitudMultiple: 'Added to the multiple request', anadirSolicitudMultiple: 'Add to multiple request',
      maxTresAlert: 'You can select up to 3 boats for a multiple request.',
      enviarSolicitudA: 'Send request to', empresa: 'company', empresasWord: 'companies',
      skippers: { 'Con patrón': 'With skipper', 'Sin patrón': 'Bareboat' }
    },
    boat: {
      volverAResultados: 'Back to results',
      emptyTitle: 'No boats published yet.',
      emptyDesc: "We're onboarding verified nautical companies. {link} to see current availability.",
      volverAlListado: 'Go back to the list',
      caracteristicas: 'Features', incluido: 'Included', noIncluido: 'Not included',
      gestionadoPor: 'Managed by', tiempoRespuestaPrefix: 'Verified company · average response time ',
      legalParagraphPrefix: 'This boat is offered by ', legalParagraphSuffix: '. Requests made from KAEL are sent to the company to confirm availability, schedule, price and terms. The rental contract and payment are made directly with the nautical company.',
      condicionesCancelacion: 'Cancellation terms',
      cancelacionPrefix: 'Defined by ', cancelacionSuffix: ' and communicated before formalizing the contract. Decisions about navigation and weather are the responsibility of the company operating the boat and, where applicable, the skipper, in accordance with the applicable regulations.',
      precioNota: "Final price subject to availability, schedule, season, duration and the company's terms. Check what the price includes.",
      labelFecha: 'Date', labelPersonas: 'People', labelDuracion: 'Duration',
      consultamosNota: 'We check availability. No payment is made now.',
      specs: { tipo: 'Type', capacidad: 'Authorized capacity', eslora: 'Length', puertoBase: 'Home port', patron: 'Skipper', camarotes: 'Cabins', banos: 'Bathrooms', combustible: 'Fuel', combustibleValor: 'Not included, settled on return' }
    },
    companies: {
      h1: 'Verified nautical companies',
      lede: 'No boat is published on KAEL without verifying the identity of the company, its licensing for the nautical rental activity, documentation and insurance. If you run a nautical company and want to list your fleet, ',
      escribenos: 'write to us',
      emptyMarketSuffix: '. Coming soon here.'
    },
    company: {
      volverAEmpresas: 'Back to companies',
      emptyTitle: 'No companies published yet.',
      emptyDesc: "We're verifying nautical companies in several destinations. {link} to see the status by destination.",
      tiempoRespuesta: 'Average response time', solicitudesConfirmadas: 'Confirmed requests', valoracionClientes: 'Customer rating',
      razonSocial: 'Legal name', cif: 'Tax ID', base: 'Base', actividad: 'Activity', actividadValor: 'Nautical rental',
      susEmbarcaciones: 'Its boats',
      infoParagraphPrefix: 'Requests sent from KAEL are forwarded to ', infoParagraphSuffix: ', who confirms availability, schedule, price and terms directly with you. The rental contract and payment for the service are the responsibility of the nautical company.'
    },
    wizard: {
      h1: "Not sure which boat to choose?",
      lede: "Four quick questions and we'll suggest three boats.",
      preguntaDe: 'Question {n} of 4',
      q1: 'How many are you?',
      q1o1: '2 – 4 people', q1o2: '5 – 8 people', q1o3: '9 – 12 people',
      q2: 'What kind of day do you want?',
      q2o1l: 'A day in Formentera', q2o1h: 'Crossing and clear-water coves',
      q2o2l: 'Ibiza coves', q2o2h: 'West coast, short trips',
      q2o3l: 'Something premium', q2o3h: 'Crewed yacht',
      q2o4l: 'On a catamaran', q2o4h: 'Large group, families',
      q3: 'Roughly, what daily budget?',
      q3o1: 'Up to €800', q3o2: '€800 – €1,500', q3o3: '€1,500 – €2,500', q3o4: 'No clear limit',
      q4: 'Where do you want to depart from?', indiferente: "Doesn't matter",
      resultado: 'Result',
      emptyTitle: 'No boats published yet',
      emptyDesc: "We're onboarding verified nautical companies. Come back soon to see suggestions based on your answers.",
      volverAEmpezar: 'Start over',
      hemosEncontrado: "We found {n} options that could suit you",
      puedesSolicitar: 'You can request availability from one company or all three at once.',
      orientativo: 'estimated',
      solicitarATres: 'Request availability from all three'
    },
    solicitud: {
      volverALaFicha: 'Back to listing',
      h1: 'Booking request',
      subtitle: 'Pending confirmation from the nautical company. No payment is made now.',
      datosReserva: 'Booking details', tusDatos: 'Your details',
      labelFecha: 'Date', labelPersonas: 'Number of people', labelDuracion: 'Desired duration', labelHorario: 'Preferred time',
      diaCompleto: 'Full day', medioManana: 'Half day — morning', medioTarde: 'Half day — afternoon',
      labelNombre: 'Full name', labelEmail: 'Email', labelTelefono: 'Phone', labelPais: 'Country',
      paises: { 'España': 'Spain', 'Reino Unido': 'United Kingdom', 'Italia': 'Italy', 'Francia': 'France', 'Alemania': 'Germany', 'Otro': 'Other' },
      labelComentarios: 'Comments or preferences', comentariosPlaceholder: "We'd like to leave around 10:00 and visit Formentera.",
      empresaHoneypot: 'Company',
      privacyPrefix: 'By submitting this request, your data will be processed by KAEL to manage your rental request and pass it on to the relevant nautical company. The company may use your data to contact you and arrange the possible service. See our ',
      politicaPrivacidad: 'Privacy Policy',
      checkboxPrivacy: 'I have read and accept the Privacy Policy.',
      checkboxMarketing: 'I want to receive offers and news. ', opcional: '(optional)',
      solicitarReserva: 'Request booking',
      noImplicaPago: 'This request does not involve any payment or a confirmed booking.',
      empresaLabel: 'Company', precioOrientativo: 'Estimated price',
      warnPrefix: "You're sending a ", warnBold: 'request', warnSuffix: '. The booking is not confirmed until ', warnSuffix2: ' confirms availability and terms with you.',
      emptyMsg: 'No boats published yet. ', volverAlListado: 'Go back to the list'
    },
    solicitudMultiple: {
      volverAResultados: 'Back to results',
      h1: 'Request availability from several companies',
      labelFecha: 'Date', labelPersonas: 'People', labelDuracion: 'Duration', diaCompleto: 'Full day', medioDia: 'Half day',
      labelNombre: 'Full name', labelEmail: 'Email', labelTelefono: 'Phone',
      checkboxPrivacy: 'I have read and accept the Privacy Policy. I understand that my data will be shared with the selected nautical companies.',
      enviarSolicitud: 'Send request',
      cadaEmpresaNota: 'Each company will respond separately. No request involves payment or a confirmed booking.',
      emptyMsg: "You haven't selected any boat yet. ", vuelveAlListado: 'Go back to the list', anadeHastaTres: ' and add up to 3 boats to the multiple request.',
      unaSolaSolicitudPrefix: 'One request, ', empresaNautica: 'nautical company', empresasNauticas: 'nautical companies',
      cadaUnaRespondera: '. Each will reply with availability, price and schedule.',
      responde: 'responds in',
      enviarSolicitudA: 'Send request to', empresa: 'company', empresasPlural: 'companies'
    },
    confirmacion: {
      h1: 'Request sent successfully',
      multiLine: 'We have sent your request to the selected nautical companies. Each one will get in touch to confirm availability, schedule, price and terms.',
      singleLinePrefix: 'We have sent your request to ', singleLineSuffix: '. The company will get in touch to confirm availability, schedule, price and rental terms.',
      laEmpresaNautica: 'the nautical company',
      referenciaSolicitud: 'Request reference',
      infoBanner: "This request does not involve a payment to KAEL or a confirmed booking until the nautical company confirms the service directly.",
      demoNoticePrefix: 'Demo mode: ', demoNoticeText: "the notifications backend isn't deployed yet, so this request was only saved in your browser and no real email was sent to the company. Deploy server/ (see README) to enable sending.",
      noContactadoTitle: "Haven't they contacted you yet?",
      noContactadoDesc: 'The company commits to responding within 2 hours.',
      avisarnos: 'Let us know',
      volverAlInicio: 'Back to home',
      rowEmbarcacion: 'Boat', rowFecha: 'Requested date', rowPersonas: 'People', rowCliente: 'Client', rowEstado: 'Status',
      pendienteDeEmpresa: 'Pending company'
    },
    notfound: {
      eyebrow: 'Error 404', h1: "We couldn't find this page",
      lede: "The link may be broken or the boat may no longer be listed. Go back to the catalog to keep looking for your boat.",
      verLaFlota: 'See the fleet'
    },
    admin: {
      h1: 'Internal panel — requests',
      desc: 'Minimal backoffice (MVP). Requires the server/ backend to be deployed and ADMIN_USER/ADMIN_PASS configured. Your browser will ask for a username and password.',
      thRef: 'Reference', thFecha: 'Created', thBarcos: 'Boat(s)', thCliente: 'Client', thContacto: 'Contact',
      thFechaSol: 'Requested date', thPersonas: 'People', thEstado: 'Status', thImporte: 'Amount',
      cargando: 'Loading…', sinSolicitudes: 'No requests yet.',
      statTotales: 'Total requests', statPendientes: 'Pending company', statConfirmadas: 'Confirmed',
      errorCarga: "Couldn't load (is the backend deployed and configured?): "
    },
    legal: {
      updated: 'Last updated: '
    },
    legalDocs: {
      avisoLegal:
        '<h1>Legal notice</h1>' +
        '<div class="updated">Last updated: <span data-year></span></div>' +
        '<p>This legal notice governs the use of the <strong>KAEL</strong> website (hereinafter, "the Platform"), accessible at kaelaut.com, in accordance with Spanish Law 34/2002 of 11 July on Information Society Services and Electronic Commerce (LSSI-CE).</p>' +
        '<h2>1. Identification of the owner</h2>' +
        '<p>In compliance with the duty of information set out in article 10 of the LSSI-CE, the identifying details of the company that owns the Platform are set out below:</p>' +
        '<ul>' +
          '<li>Legal (registered) name: KAEL AUT</li>' +
          '<li>Trade name: KAEL</li>' +
          '<li>Tax ID (NIF/CIF): <mark>[TO COMPLETE]</mark></li>' +
          '<li>Registered address: <mark>[TO COMPLETE — address, Ibiza/Formentera, Balearic Islands]</mark></li>' +
          '<li>Email: <mark>[TO COMPLETE — hola@kaelaut.com]</mark></li>' +
          '<li>Phone: <mark>[TO COMPLETE]</mark></li>' +
          '<li>Registration details: <mark>[TO COMPLETE — Companies Register]</mark></li>' +
        '</ul>' +
        '<h2>2. Purpose and nature of the activity</h2>' +
        '<p>KAEL is a <strong>digital intermediation platform</strong> that connects people interested in renting a boat with verified nautical companies operating in several destinations (Ibiza & Formentera, Canary Islands, Cancún, Phuket, Dubai). The Platform does not own the boats listed, does not provide the boating service, and does not charge for the rental.</p>' +
        '<p>Requests made through the Platform are sent to the relevant nautical company, which confirms availability, schedule, final price and terms directly with the customer, and with whom the rental contract is formalized and payment for the service is made.</p>' +
        '<h2>3. Terms of use</h2>' +
        '<p>Accessing and using the Platform grants user status and implies acceptance of this legal notice, of the <a href="condiciones-intermediacion.html">intermediation terms</a> and of the <a href="privacidad.html">privacy policy</a>. Users agree to use the Platform in accordance with the law, good faith and public order, and to provide truthful information in the request forms.</p>' +
        '<h2>4. Intellectual and industrial property</h2>' +
        '<p>The Platform\'s content (text, design, trademarks, logos) belongs to KAEL or to the collaborating nautical companies, unless stated otherwise, and is protected by intellectual and industrial property regulations. Boat photographs are provided by the nautical companies and/or used with their authorization.</p>' +
        '<h2>5. Liability</h2>' +
        '<p>KAEL is not responsible for the provision of the boating service, the real availability of the boats, the condition of the boat, navigation safety, or the final financial terms agreed between the customer and the nautical company. Responsibility for these matters lies exclusively with the nautical company operating each boat, as detailed in the <a href="condiciones-intermediacion.html">intermediation terms</a>.</p>' +
        '<h2>6. External links</h2>' +
        '<p>The Platform may contain links to third-party sites. KAEL assumes no responsibility for the content or operation of such sites.</p>' +
        '<h2>7. Applicable law</h2>' +
        '<p>These terms are governed by Spanish law. Any dispute will be submitted to the courts corresponding under consumer protection regulations.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">This document is a base template and does not replace legal advice. Before publishing the site, review and complete the fields marked <mark>[TO COMPLETE]</mark> and have the content validated by a licensed lawyer in Spain/the Balearic Islands.</p>',

      privacidad:
        '<h1>Privacy policy</h1>' +
        '<div class="updated">Last updated: <span data-year></span></div>' +
        '<p>At KAEL we process your personal data in accordance with Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 on the Protection of Personal Data and the guarantee of digital rights (LOPDGDD).</p>' +
        '<h2>1. Data controller</h2>' +
        '<ul>' +
          '<li>Controller: KAEL AUT (trade name: KAEL)</li>' +
          '<li>Tax ID: <mark>[TO COMPLETE]</mark></li>' +
          '<li>Address: <mark>[TO COMPLETE]</mark></li>' +
          '<li>Privacy contact: <mark>[TO COMPLETE — privacidad@kaelaut.com]</mark></li>' +
        '</ul>' +
        '<h2>2. What data we process and why</h2>' +
        '<p>When you submit a booking request through the Platform, we process the following data for the purposes indicated:</p>' +
        '<ul>' +
          '<li><strong>Request management:</strong> name, email, phone, country, date, number of people, duration, preferred time and comments, in order to generate the request, forward it to the selected nautical company and follow up with you.</li>' +
          '<li><strong>Marketing communications</strong> (only if you tick the relevant box): sending KAEL offers and news.</li>' +
          '<li><strong>Analytics and service improvement:</strong> if you accept analytics cookies, to understand how the site is used (see <a href="cookies.html">cookie policy</a>).</li>' +
        '</ul>' +
        '<p>We do not request ID/passport numbers, card numbers, IBANs or a full postal address by default in the initial request form: we apply the principle of data minimization by design.</p>' +
        '<h2>3. Legal basis for processing</h2>' +
        '<p>The legal basis is the explicit consent you give when submitting the form and accepting this policy, as well as, where applicable, the performance of pre-contractual measures at your request (managing your rental request).</p>' +
        '<h2>4. Who we share your data with</h2>' +
        '<p>Your data is shared with the <strong>nautical company managing</strong> the boat you selected (or several, if you use the multiple request), so that it can contact you, confirm availability and, where applicable, arrange the rental with you. The nautical company processes your data as an independent controller for managing the rental itself.</p>' +
        '<p>We may use technology providers (hosting, transactional email delivery) that act as data processors under contract, with the guarantees required by the GDPR. If any of these providers is located outside the European Economic Area, we ensure appropriate safeguards are in place (standard contractual clauses or others).</p>' +
        '<h2>5. Retention period</h2>' +
        '<p>We retain request data for as long as necessary to manage the business relationship and, subsequently, for the applicable statutory limitation periods (tax, commercial). Contact data for marketing communications is retained until you withdraw your consent.</p>' +
        '<h2>6. Your rights</h2>' +
        '<p>You can exercise your rights of access, rectification, erasure, objection, restriction of processing and portability at any time by writing to <mark>[TO COMPLETE — privacidad@kaelaut.com]</mark>, indicating which right you wish to exercise and attaching a copy of a document proving your identity. You also have the right to lodge a complaint with the Spanish Data Protection Agency (AEPD) if you believe the processing does not comply with the regulations.</p>' +
        '<h2>7. Security</h2>' +
        '<p>We apply reasonable technical and organizational measures (HTTPS, access control, data minimization) to protect your data against unauthorized access, loss or alteration.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">This document is a base template. Before publishing the site, complete the fields marked <mark>[TO COMPLETE]</mark>, formalize data processing agreements with your technology providers and with each collaborating nautical company, and have the text validated by a data protection advisor.</p>',

      cookies:
        '<h1>Cookie policy</h1>' +
        '<div class="updated">Last updated: <span data-year></span></div>' +
        '<p>This site uses its own cookies and, if you accept them, third-party analytics cookies, in accordance with article 22.2 of the LSSI-CE and the guidance of the Spanish Data Protection Agency (AEPD).</p>' +
        '<h2>1. What is a cookie?</h2>' +
        '<p>A cookie is a small file stored in your browser when you visit a website, which allows information about your visit to be remembered.</p>' +
        '<h2>2. Cookies we use</h2>' +
        '<ul>' +
          '<li><strong>Technical / necessary (always active):</strong> enable the basic operation of the site, such as remembering your selection for the multiple boat request or your decision on this cookie banner. They do not require consent.</li>' +
          '<li><strong>Analytics (only with your consent):</strong> help us understand how the site is used in order to improve it. They are only activated if you click "Accept all".</li>' +
          '<li><strong>Marketing / remarketing (only with your consent, if activated in the future):</strong> would allow showing relevant ads on other sites. Currently not active by default.</li>' +
        '</ul>' +
        '<h2>3. Managing your decision</h2>' +
        '<p>When you enter the site we show you a notice with two equally accessible options: <strong>"Accept all"</strong> and <strong>"Reject"</strong>. You can change your decision at any time by clearing your browser\'s cookies or, in future versions of this site, from a preferences panel.</p>' +
        '<h2>4. Third-party cookies</h2>' +
        '<p>If Google Analytics, a Meta/TikTok pixel or another measurement or advertising tool is added in the future, this policy will be updated detailing each cookie, its purpose, duration and the responsible third party, and its activation will be conditional on your prior consent.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Base template to be completed by the site owner before activating any third-party analytics or advertising tool.</p>',

      condiciones:
        '<h1>Intermediation terms</h1>' +
        '<div class="updated">Last updated: <span data-year></span></div>' +
        '<h2>1. What KAEL is</h2>' +
        '<p>KAEL is a digital <strong>intermediation</strong> platform for boat rentals in several destinations (Ibiza & Formentera, Canary Islands, Cancún, Phuket, Dubai). It connects people interested in renting a boat with verified nautical companies that offer their boats on the Platform.</p>' +
        '<p><strong>KAEL does not own the boats, does not provide the boating service, and does not charge for the rental.</strong> Its function is limited to showing the listings, collecting availability requests and forwarding them to the relevant nautical company, keeping a verifiable record of the origin of each request.</p>' +
        '<h2>2. Request versus confirmed booking</h2>' +
        '<p>When you complete the form and click "Request booking", you are sending a <strong>request</strong>, not a confirmed booking. The request remains in "pending company" status until the relevant nautical company checks real availability and confirms the date, schedule, final price and rental terms directly with you. Only at that point does a confirmed booking exist.</p>' +
        '<p>Sending a request through KAEL does not involve any payment to KAEL or any financial commitment to the Platform.</p>' +
        '<h2>3. Who provides the service and who charges for it</h2>' +
        '<p>The boat rental, its contract, collecting the price, any deposit, nautical documentation, safety, crew or skipper where applicable, and handling incidents, cancellations and refunds are the exclusive responsibility of the <strong>nautical company</strong> identified on each boat\'s listing ("Managed by"). Payment for the rental is always made directly to the nautical company, never to KAEL.</p>' +
        '<h2>4. Estimated price</h2>' +
        '<p>Prices shown on the Platform are estimates ("from €X") unless the nautical company expressly provides a fixed price. The final price may vary depending on availability, season, duration, fuel, skipper, cleaning, deposit or other items, which will be detailed by the nautical company before formalizing the contract.</p>' +
        '<h2>5. Verification of nautical companies</h2>' +
        '<p>Before listing their boats, each partner company is verified by KAEL: identity, tax ID, licensing for the nautical rental activity, and basic documentation. This verification does not constitute an exhaustive legal certification and does not exempt the nautical company from complying with all regulations applicable to its activity (Maritime Navigation Law, maritime safety regulations, mandatory insurance, etc.).</p>' +
        '<h2>6. Cancellations and weather</h2>' +
        '<p>Cancellation terms are defined by each nautical company and communicated before formalizing the contract. Decisions regarding navigation and weather conditions are the responsibility of the company operating the boat and, where applicable, the skipper, in accordance with applicable maritime safety regulations.</p>' +
        '<h2>7. KAEL\'s liability</h2>' +
        '<p>KAEL is not responsible for the real availability, condition, safety or actual provision of the service of the boats listed, nor for the financial arrangements reached between the customer and the nautical company. KAEL is responsible, within reason, for the correct transmission of requests generated through the Platform and for the technical operation of the intermediation service.</p>' +
        '<h2>8. Complaints</h2>' +
        '<p>If your issue concerns the operation of the Platform (for example, a request that fails to send), contact us as indicated on the <a href="reclamaciones.html">complaints</a> page. If your issue concerns the provision of the boating service (availability, condition of the boat, skipper, charges, cancellations), you should first contact the managing nautical company directly, without prejudice to KAEL being able to mediate in good faith between the parties.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">These terms are a base template intended to reflect the intermediation model described in the project\'s base documentation. Before publishing the site, have them reviewed by a lawyer specializing in the Balearic Islands, who must adapt them to the actual contract signed with each collaborating nautical company.</p>',

      reclamaciones:
        '<h1>Complaints</h1>' +
        '<div class="updated">Last updated: <span data-year></span></div>' +
        '<p>We want any problem to be resolved quickly and with clarity about who should respond. Before filing a complaint, it helps to know who your issue should be directed to:</p>' +
        '<h2>1. Issues with the Platform</h2>' +
        '<p>If your issue is technical or commercial and relates to how KAEL works — for example, a form that fails to send, a listing with incorrect data, or questions about how a request works — write to us stating your request reference (if you have one):</p>' +
        '<ul>' +
          '<li>Email: <mark>[TO COMPLETE — reclamaciones@kaelaut.com]</mark></li>' +
          '<li>Phone: <mark>[TO COMPLETE]</mark></li>' +
          '<li>Target response time: 48 business hours</li>' +
        '</ul>' +
        '<h2>2. Issues with the boat rental</h2>' +
        '<p>If your issue concerns the provision of the boating service itself — availability, condition of the boat, skipper, the price ultimately charged, cancellations or incidents during the trip — you should first contact <strong>the nautical company directly</strong>, identified on the boat\'s listing and in your confirmation email.</p>' +
        '<p>If you do not get a satisfactory response from the nautical company, write to us with the details of your request (reference, dates, company) and we will mediate in good faith between the parties, without this implying that KAEL assumes responsibility for the provision of the service, which lies with the nautical company.</p>' +
        '<h2>3. Official complaint forms</h2>' +
        '<p>As a consumer, you have the right to request the official complaint form. For issues relating to the boating service, the complaint form is the responsibility of the nautical company providing the service. For issues relating to the Platform, you can request it from KAEL using the contact details above.</p>' +
        '<h2>4. Alternative dispute resolution</h2>' +
        '<p>As an EU-resident consumer, you can also access the European online dispute resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>' +
        '<p style="margin-top:32px; font-size:13px; color:var(--muted);">Complete the contact details marked <mark>[TO COMPLETE]</mark> before publishing the site.</p>'
    },
    meta: {
      indexTitle: 'KAEL — Boat rentals in several destinations',
      indexDesc: 'Compare boats from verified nautical companies in Ibiza, the Canary Islands, Cancún, Phuket and Dubai, and request availability in one step. No upfront payments: the contract and payment are with the nautical company.',
      indexOgTitle: 'KAEL — Boat rentals in several destinations',
      indexOgDesc: 'Compare boats from verified nautical companies and request availability in one step.',
      barcosTitle: 'Boats — KAEL',
      barcosDesc: "Filter boats by type, destination and skipper. Estimated prices, the managing company clearly identified, and availability requests with no upfront payments.",
      empresasTitle: 'Verified nautical companies — KAEL',
      empresasDesc: 'Verified nautical companies in Ibiza, the Canary Islands, Cancún, Phuket and Dubai: identity, licensing, documentation and insurance checked.',
      asistenteTitle: 'Not sure which boat to choose? — KAEL',
      asistenteDesc: "Answer four questions about your group, budget and departure port, and we'll suggest the boats that best fit.",
      solicitudTitle: 'Booking request — KAEL',
      solicitudMultipleTitle: 'Request from several companies — KAEL',
      confirmacionTitle: 'Request sent — KAEL',
      notfoundTitle: 'Page not found — KAEL'
    }
  }
};

function getLang() {
  // El parámetro ?lang= en la URL manda si está presente: es la señal que
  // usa setLang() para que el idioma elegido se aplique de forma fiable en
  // el propio reload que dispara, sin depender de que localStorage haya
  // terminado de persistir a tiempo (bajo file:// hemos comprobado que un
  // reload puede no ver todavía la escritura de la página anterior, aunque
  // sí funciona siempre sobre http/https).
  try {
    var fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'es' || fromUrl === 'en') {
      try { localStorage.setItem(I18N_LANG_KEY, fromUrl); } catch (e) { /* ignore */ }
      return fromUrl;
    }
  } catch (e) { /* URLSearchParams no disponible */ }
  try {
    var saved = localStorage.getItem(I18N_LANG_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch (e) { /* storage blocked */ }
  return 'es';
}

function setLang(lang) {
  try { localStorage.setItem(I18N_LANG_KEY, lang); } catch (e) { /* ignore */ }
  // Fijamos el idioma en la URL con replaceState (no navega) y forzamos
  // después un reload de verdad: reload() es lo único que garantiza una
  // recarga real y determinista en todos los protocolos que hemos probado
  // (incluido file://), mientras que reasignar location.href con un query
  // string distinto no siempre dispara una recarga completa bajo file://.
  try {
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState(null, '', url.toString());
  } catch (e) { /* ignore */ }
  window.location.reload();
}

function t(key) {
  var lang = getLang();
  var lookup = function (dict) {
    return key.split('.').reduce(function (o, k) { return (o && o[k] !== undefined) ? o[k] : undefined; }, dict);
  };
  var val = lookup(I18N[lang]);
  if (val === undefined) val = lookup(I18N.es);
  return val !== undefined ? val : key;
}

function marketName(id) { return t('markets.' + id); }
function countryName(name) { return t('countries.' + name); }

function applyI18n(root) {
  root = root || document;
  document.documentElement.lang = getLang();
  root.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
  });
  root.querySelectorAll('[data-i18n-content]').forEach(function (el) {
    el.setAttribute('content', t(el.getAttribute('data-i18n-content')));
  });
  root.querySelectorAll('[data-i18n-value]').forEach(function (el) {
    el.value = t(el.getAttribute('data-i18n-value'));
  });
}
