/**
 * MÓDULO DE PLANTILLAS
 * Funciones relacionadas con plantillas de email
 */

// Función para obtener plantillas disponibles (requerida por plantillas.html)
function getPlantillasDisponibles() {
  try {
    Logger.log('=== getPlantillasDisponibles ===');
    
    const plantillas = [
      {
        id: 'bienvenida',
        nombre: '🎉 Email de Bienvenida',
        descripcion: 'Correo de bienvenida para nuevos alumnos con información del curso'
      },
      {
        id: 'recordatorio-pago',
        nombre: '💰 Recordatorio de Pago',
        descripcion: 'Recordatorio de pago pendiente para alumnos'
      },
      {
        id: 'confirmacion-pago',
        nombre: '✅ Confirmación de Pago',
        descripcion: 'Confirmación de pago recibido'
      },
      {
        id: 'cambio-seccion',
        nombre: '🔄 Cambio de Sección',
        descripcion: 'Notificación de cambio de sección'
      },
      {
        id: 'cambio-inicio-seccion',
        nombre: '📅 Cambio de Inicio de Sección',
        descripcion: 'Notificación de cambio de fecha de inicio'
      },
      {
        id: 'acceso-simulador',
        nombre: '🎮 Acceso a Simulador',
        descripcion: 'Credenciales de acceso al simulador de examen'
      },
      {
        id: 'acceso-simulador-recompra',
        nombre: '🎮 Simulador - Recompra',
        descripcion: 'Notificación de nuevo curso asignado en simulador (alumno existente)'
      },
      {
        id: 'acceso-material',
        nombre: '📂 Acceso a Material del Curso',
        descripcion: 'Notificación de acceso a carpeta de material'
      }
    ];
    
    Logger.log('Plantillas disponibles: ' + plantillas.length);
    return plantillas;
  } catch (error) {
    Logger.log('ERROR en getPlantillasDisponibles: ' + error.toString());
    return [];
  }
}

// Función para obtener configuración de plantilla
function getConfiguracionPlantilla(plantillaId) {
  try {
    Logger.log('=== getConfiguracionPlantilla: ' + plantillaId + ' ===');
    
    // Obtener cursos y docentes directamente (más confiable)
    let cursos = [];
    let docentes = [];
    
    try {
      cursos = getCursos() || [];
      Logger.log('Cursos obtenidos directamente: ' + cursos.length);
    } catch (error) {
      Logger.log('Error obteniendo cursos: ' + error.toString());
      cursos = [];
    }
    
    try {
      docentes = getDocentes() || [];
      Logger.log('Docentes obtenidos directamente: ' + docentes.length);
    } catch (error) {
      Logger.log('Error obteniendo docentes: ' + error.toString());
      docentes = [];
    }
    
    let secciones = [];
    try {
      secciones = getSecciones() || [];
      Logger.log('Secciones obtenidas: ' + secciones.length);
    } catch (error) {
      Logger.log('Error obteniendo secciones: ' + error.toString());
      secciones = [];
    }
    
    Logger.log('Cursos cargados: ' + cursos.length);
    Logger.log('Docentes cargados: ' + docentes.length);
    
    // Definir parámetros según la plantilla
    let parametros = [];
    
    if (plantillaId === 'bienvenida') {
      parametros = [
        {
          id: 'curso',
          label: 'Cursos (selecciona uno o más)',
          tipo: 'multiselect',
          opciones: cursos.map(c => ({ 
            value: c.Codigo || c.Nombre, 
            label: c.Nombre || c.Codigo 
          }))
        },
        {
          id: 'alumno_nombre',
          label: 'Nombre del Alumno',
          tipo: 'text',
          placeholder: 'Nombre completo del alumno'
        },
        {
          id: 'email_alumno',
          label: 'Email del Alumno',
          tipo: 'text',
          placeholder: 'email@ejemplo.com'
        },
        {
          id: 'fecha_inicio',
          label: 'Fecha de Inicio',
          tipo: 'text',
          placeholder: 'DD/MM/YYYY'
        },
        {
          id: 'frecuencia',
          label: 'Frecuencia',
          tipo: 'select',
          opciones: [
            { value: 'L-M-V', label: 'Lunes-Miércoles-Viernes (3h/clase)' },
            { value: 'M-J-S', label: 'Martes-Jueves-Sábado (3h/clase)' },
            { value: 'Solo-Sabados', label: 'Solo Sábados (5h/clase)' }
          ]
        },
        {
          id: 'modalidad',
          label: 'Modalidad de Compra',
          tipo: 'select',
          opciones: [
            { value: 'Basic', label: '🟢 Basic' },
            { value: 'Pro', label: '🔵 Pro' },
            { value: 'Certify', label: '🟣 Certify' }
          ]
        }
      ];
    } else if (plantillaId === 'confirmacion-pago') {
      parametros = [
        {
          id: 'alumno_nombre',
          label: 'Buscar Alumno',
          tipo: 'search',
          placeholder: 'Escribe el nombre del alumno...'
        },
        {
          id: 'alumno_id',
          label: 'ID Alumno',
          tipo: 'hidden'
        },
        {
          id: 'email_alumno',
          label: 'Email del Alumno',
          tipo: 'text',
          placeholder: 'email@ejemplo.com'
        },
        {
          id: 'matricula_id',
          label: 'Pago Realizado',
          tipo: 'select',
          opciones: []
        },
        {
          id: 'monto_pago',
          label: 'Monto del Pago',
          tipo: 'number',
          placeholder: '0.00'
        }
      ];
    } else if (plantillaId === 'recordatorio-pago') {
      parametros = [
        {
          id: 'alumno_nombre',
          label: 'Buscar Alumno',
          tipo: 'search',
          placeholder: 'Escribe el nombre del alumno...'
        },
        {
          id: 'alumno_id',
          label: 'ID Alumno',
          tipo: 'hidden'
        },
        {
          id: 'email_alumno',
          label: 'Email del Alumno',
          tipo: 'text',
          placeholder: 'email@ejemplo.com'
        },
        {
          id: 'cuotas_pendientes',
          label: 'Cuotas Pendientes',
          tipo: 'multiselect',
          opciones: []
        }
      ];
    } else if (plantillaId === 'cambio-seccion') {
      parametros = [
        {
          id: 'alumno_nombre',
          label: 'Buscar Alumno',
          tipo: 'search',
          placeholder: 'Escribe el nombre del alumno...'
        },
        {
          id: 'alumno_id',
          label: 'ID Alumno',
          tipo: 'hidden'
        },
        {
          id: 'email_alumno',
          label: 'Email del Alumno',
          tipo: 'text',
          placeholder: 'email@ejemplo.com'
        },
        {
          id: 'seccion_actual',
          label: 'Sección Origen',
          tipo: 'select',
          opciones: secciones.map(function(s) { return { value: s.Codigo, label: s.Codigo + ' - ' + s.NombreCurso + ' (' + s.Frecuencia + ')' }; })
        },
        {
          id: 'seccion_nueva',
          label: 'Sección Destino',
          tipo: 'select',
          opciones: secciones.map(function(s) { return { value: s.Codigo, label: s.Codigo + ' - ' + s.NombreCurso + ' (' + s.Frecuencia + ')' }; })
        },
        {
          id: 'motivo',
          label: 'Motivo del Cambio (opcional)',
          tipo: 'text',
          placeholder: 'Razón del cambio de sección'
        }
      ];
    } else if (plantillaId === 'cambio-inicio-seccion') {
      parametros = [
        {
          id: 'alumno_nombre',
          label: 'Buscar Alumno',
          tipo: 'search',
          placeholder: 'Escribe el nombre del alumno...'
        },
        {
          id: 'alumno_id',
          label: 'ID Alumno',
          tipo: 'hidden'
        },
        {
          id: 'email_alumno',
          label: 'Email del Alumno',
          tipo: 'text',
          placeholder: 'email@ejemplo.com'
        },
        {
          id: 'seccion',
          label: 'Sección',
          tipo: 'select',
          opciones: secciones.map(function(s) { return { value: s.Codigo, label: s.Codigo + ' - ' + s.NombreCurso + ' (' + s.Frecuencia + ')' }; })
        },
        {
          id: 'nueva_fecha',
          label: 'Nueva Fecha de Inicio',
          tipo: 'text',
          placeholder: 'DD/MM/YYYY'
        }
      ];
    } else if (plantillaId === 'acceso-simulador') {
      parametros = [
        { id: 'alumno_nombre', label: 'Buscar Alumno', tipo: 'search', placeholder: 'Nombre del alumno...' },
        { id: 'alumno_id', label: 'ID Alumno', tipo: 'hidden' },
        { id: 'email_alumno', label: 'Email del Alumno', tipo: 'text', placeholder: 'email@ejemplo.com' },
        { id: 'cursos_simulador', label: 'Cursos del Simulador', tipo: 'text', placeholder: 'CLF, SAA' },
        { id: 'password', label: 'Contraseña', tipo: 'text', placeholder: 'Se genera automáticamente' },
        { id: 'fecha_inicio', label: 'Fecha Inicio', tipo: 'text', placeholder: 'DD/MM/YYYY' },
        { id: 'fecha_fin', label: 'Fecha Fin', tipo: 'text', placeholder: 'DD/MM/YYYY' }
      ];
    } else if (plantillaId === 'acceso-material') {
      parametros = [
        { id: 'alumno_nombre', label: 'Buscar Alumno', tipo: 'search', placeholder: 'Nombre del alumno...' },
        { id: 'alumno_id', label: 'ID Alumno', tipo: 'hidden' },
        { id: 'email_alumno', label: 'Email del Alumno', tipo: 'text', placeholder: 'email@ejemplo.com' },
        { id: 'nombre_curso', label: 'Nombre del Curso', tipo: 'text', placeholder: 'AWS Cloud Practitioner' },
        { id: 'seccion', label: 'Sección', tipo: 'text', placeholder: 'CLF0625-A' },
        { id: 'url_carpeta', label: 'URL de la Carpeta', tipo: 'text', placeholder: 'https://drive.google.com/drive/folders/...' }
      ];
    }
    
    const configuracion = {
      plantillaId: plantillaId,
      parametros: parametros,
      cursos: cursos,
      docentes: docentes,
      variables: [
        { nombre: 'NOMBRE_ALUMNO', descripcion: 'Nombre del alumno' },
        { nombre: 'NOMBRE_CURSO', descripcion: 'Nombre del curso' },
        { nombre: 'FECHA_INICIO', descripcion: 'Fecha de inicio del curso' },
        { nombre: 'DOCENTE', descripcion: 'Nombre del docente' },
        { nombre: 'PRECIO', descripcion: 'Precio del curso' },
        { nombre: 'FRECUENCIA', descripcion: 'Frecuencia del curso' }
      ]
    };
    
    Logger.log('Configuración generada para plantilla: ' + plantillaId);
    Logger.log('Parámetros incluidos: ' + parametros.length);
    return configuracion;
  } catch (error) {
    Logger.log('ERROR en getConfiguracionPlantilla: ' + error.toString());
    return {
      plantillaId: plantillaId,
      parametros: [],
      cursos: [],
      docentes: [],
      variables: []
    };
  }
}

// Función para obtener docentes (helper para plantillas) - REMOVIDA
// USAR DocentesModule.getDocentes() en su lugar para evitar conflictos
// Esta función causaba conflictos con la versión corregida en DocentesModule.gs
/**
 * Genera HTML para los íconos de redes sociales - MISMO FORMATO QUE DOCENTES
 */
function generarIconosRedesSociales() {
  try {
    Logger.log('=== generarIconosRedesSociales ===');
    
    // Obtener iconos desde Admin Plantillas (PropertiesService)
    const iconos = obtenerIconosPersonalizados();
    
    Logger.log('🔍 Iconos obtenidos: ' + iconos.length);
    
    let html = `<div style="display: inline-block; margin: 0 10px;">`;
    
    // Iconos de redes sociales con URLs
    const redesSociales = {
      'ig-icon': 'https://www.instagram.com/your_handle',
      'fb-icon': 'https://www.facebook.com/share/1BKSwCXH5q/?mibextid=wwXIfr',
      'in-icon': 'https://www.linkedin.com/company/your-company/'
    };
    
    Object.keys(redesSociales).forEach(iconoName => {
      const url = redesSociales[iconoName];
      
      // Buscar el icono en la lista
      const icono = iconos.find(i => i.name === iconoName);
      
      let contenido = '';
      if (icono && icono.imageUrl && icono.imageUrl !== '') {
        // Usar imagen si existe
        contenido = `<img src="${icono.imageUrl}" alt="${iconoName}" style="width: 32px; height: 32px; vertical-align: middle;">`;
      } else {
        // Fallback a emoji genérico
        const emojiDefault = iconoName === 'ig-icon' ? '📷' : (iconoName === 'fb-icon' ? '👍' : '💼');
        contenido = `<span style="font-size: 24px;">${emojiDefault}</span>`;
      }
      
      html += `
        <a href="${url}" target="_blank" style="color: white; text-decoration: none; display: inline-block; margin: 0 8px;">
          ${contenido}
        </a>
      `;
    });
    
    html += `</div>`;
    
    Logger.log('✅ Iconos de redes sociales generados (formato docentes)');
    return html;
  } catch (error) {
    Logger.log('ERROR en generarIconosRedesSociales: ' + error.toString());
    return '<div style="text-align: center; color: white;">📷 👍 💼</div>';
  }
}

/**
 * Procesa una plantilla con variables
 */
function procesarPlantilla(plantillaId, variables) {
  try {
    Logger.log('=== procesarPlantilla: ' + plantillaId + ' ===');
    
    // Obtener contenido base de la plantilla
    let contenido = obtenerContenidoPlantilla(plantillaId);
    
    // Reemplazar variables
    Object.keys(variables).forEach(variable => {
      const valor = variables[variable] || '';
      const regex = new RegExp('{{' + variable + '}}', 'g');
      contenido = contenido.replace(regex, valor);
    });
    
    Logger.log('Plantilla procesada correctamente');
    return {
      success: true,
      contenido: contenido
    };
  } catch (error) {
    Logger.log('ERROR en procesarPlantilla: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Construye el HTML estándar de un email con logo, banner, contenido, contacto, redes y footer
 */
function construirPlantillaEmail(titulo, contenidoHtml, footerText, highlightBg, highlightBorder) {
  return '<!DOCTYPE html><html lang="es-419"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<style>body{font-family:Arial,sans-serif;margin:0;padding:0;}.container{max-width:600px;margin:0 auto;background:#fff;}.header{background:#fff;padding:20px;text-align:center;}.header img{max-width:150px;height:auto;}.banner{background:#263d86;color:white;padding:30px;text-align:center;}.banner h1{margin:0;font-size:24px;}.content{padding:30px;color:#333;}.content p{line-height:1.6;margin:15px 0;}.highlight{background:' + (highlightBg || '#e8f4f8') + ';padding:15px;margin:20px 0;border-left:4px solid ' + (highlightBorder || '#263d86') + ';border-radius:4px;}.pendiente{background:#fff3cd;padding:15px;margin:20px 0;border-left:4px solid #ffc107;border-radius:4px;}.footer{background:#f5f5f5;padding:20px;text-align:center;font-size:12px;}</style>' +
    '</head><body><div class="container">' +
    '<div class="header"><img src="{{LOGO_URL}}" alt="Educational CRM"></div>' +
    '<div class="banner"><h1>' + titulo + '</h1></div>' +
    '<div class="content">' + contenidoHtml + '</div>' +
    '<div style="background:#f9f9f9;padding:20px;text-align:center;border-top:2px solid #e5e7eb;">' +
    '<p style="margin:8px 0;font-size:12px;">📩 <a href="mailto:contact@example.com" style="color:#1155cc;text-decoration:none;">contact@example.com</a></p>' +
    '<p style="margin:8px 0;font-size:12px;">🌐 <a href="https://www.example.com" style="color:#1155cc;text-decoration:none;">www.example.com</a></p>' +
    '<p style="margin:8px 0;font-size:12px;">📱 <a href="tel:000000000000" style="color:#1155cc;text-decoration:none;">000000000000</a></p>' +
    '</div>' +
    '<div style="background:#263d86;padding:20px;text-align:center;">' +
    '<p style="color:white;margin:0 0 15px 0;font-size:14px;font-weight:bold;">Síguenos en nuestras redes sociales</p>' +
    '<div style="margin:0;">{{ICONOS_REDES_SOCIALES}}</div>' +
    '</div>' +
    '<div class="footer"><p>' + footerText + '</p></div>' +
    '</div></body></html>';
}

/**
 * Obtiene el contenido base de una plantilla - VERSIÓN SEGURA
 */
function obtenerContenidoPlantilla(plantillaId) {
  Logger.log('📋 obtenerContenidoPlantilla SEGURA llamada con ID: ' + plantillaId);
  
  try {
    // Cargar configuración guardada del preview
    var savedConfig = null;
    try {
      var savedJson = obtenerConfigPreview(plantillaId);
      if (savedJson) {
        savedConfig = JSON.parse(savedJson);
        Logger.log('✅ Config de preview cargada para: ' + plantillaId);
      }
    } catch(e) {
      Logger.log('⚠️ Error cargando config preview: ' + e.toString());
    }
    
    let contenido = '';
    
    if (plantillaId === 'bienvenida') {
      // Valores editables con fallback a defaults
      var bannerTitle = (savedConfig && savedConfig.title) || 'BIENVENIDO A EDUCATIONAL CRM';
      var welcomeMsg = (savedConfig && savedConfig.welcome) || 'Estimado {{NOMBRE_ALUMNO}},\n\nNos complace confirmar la recepción exitosa de su pago para el curso {{NOMBRE_CURSO}}. El curso se desarrollará {{FRECUENCIA}}, cada sesión tendrá una duración de 3 horas, de 19:00 hrs a 22:00 hrs (GMT-5).\n\nTu matrícula ha quedado ingresada oficialmente.';
      var benefitsTitle = (savedConfig && savedConfig.benefitsTitle) || '✨ BENEFICIOS DEL CURSO';
      var teachersTitle = (savedConfig && savedConfig.teachersTitle) || 'DOCENTES DEL CURSO';
      var footerText = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      
      // Convertir saltos de línea en párrafos HTML
      var welcomeHtml = welcomeMsg.split('\n').filter(function(line) { return line.trim() !== ''; }).map(function(line) { return '<p>' + line + '</p>'; }).join('\n              ');
      contenido = `
        <!DOCTYPE html>
        <html lang="es-419">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; background-color: #fff; }
            .header { background-color: #fff; padding: 0; text-align: center; }
            .header img { max-width: 200px; height: auto; }
            .banner { background-color: #263d86; color: white; padding: 30px; text-align: center; }
            .banner h1 { margin: 0; font-size: 28px; }
            .banner p { margin: 10px 0 0 0; font-size: 14px; }
            .content { padding: 30px; color: #263d86; }
            .content p { line-height: 1.6; margin: 15px 0; }
            .benefits-section { background-color: #d9d9d9; padding: 30px; text-align: center; }
            .benefits-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .benefits-list { background-color: #fff; padding: 30px; text-align: left; }
            .benefits-list p { margin: 10px 0; }
            .docentes-header { background-color: #d9d9d9; padding: 20px; text-align: center; font-size: 18px; font-weight: bold; }
            .docentes-container { background-color: #fff; padding: 30px; }
            .docente-card { display: inline-block; width: 30%; margin: 10px 1.5%; vertical-align: top; text-align: center; }
            .docente-card img { width: 100%; max-width: 200px; height: auto; margin-bottom: 15px; }
            .docente-card h3 { margin: 10px 0; font-size: 14px; color: #263d86; }
            .docente-card p { margin: 5px 0; font-size: 11px; }
            .docente-card a { color: #1155cc; text-decoration: none; font-weight: bold; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
            .start-date { background-color: #e8f4f8; padding: 15px; margin: 20px 0; border-left: 4px solid #263d86; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <img src="{{LOGO_URL}}" alt="Educational CRM" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
            </div>

            <!-- Banner -->
            <div class="banner">
              <h1>${bannerTitle}</h1>
              <p>{{NOMBRE_CURSO}}</p>
            </div>

            <!-- Course Image Section -->
            <div style="text-align: center; padding: 5px 0; background-color: #f9f9f9;">
              {{IMAGEN_CURSO}}
            </div>

            <!-- Main Content -->
            <div class="content">
              ${welcomeHtml}
              
              <!-- Start Date Section -->
              <div class="start-date">
                <strong>Fecha de Inicio:</strong> {{FECHA_INICIO}}
              </div>
              
              <p><a href="https://example.com/policies/terms-of-service" style="color: #1155cc; text-decoration: none; font-weight: bold;">📋 Términos y Condiciones</a></p>
              <p><a href="https://example.com/policies/refund-policy" style="color: #1155cc; text-decoration: none; font-weight: bold;">💰 Refund Policy</a></p>
            </div>

            <!-- Benefits Section -->
            <div class="benefits-section">
              <div class="benefits-title">${benefitsTitle}</div>
              <p style="font-size: 11px; margin: 0;">Incluidos en tu matrícula</p>
            </div>

            <div class="benefits-list">
              {{BENEFICIOS_CURSO}}
            </div>

            <!-- Docentes Section -->
            <div class="docentes-header">${teachersTitle}</div>
            
            <div class="docentes-container">
              {{DOCENTES_DINAMICOS}}
            </div>

            <!-- Support Section -->
            <div style="background: #f9f9f9; padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.6; color: #333;">Si tienes alguna consulta adicional o necesitas apoyo con el proceso de instalación, no dudes en escribirnos.</p>
              <p style="margin: 15px 0; font-size: 14px; font-weight: bold; color: #263d86;">¡Bienvenido a Educational CRM!</p>
              <p style="margin: 15px 0; font-size: 12px; color: #666;">Cordialmente,<br><strong>Equipo Académico de Educational CRM</strong></p>
              <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
                <p style="margin: 8px 0; font-size: 12px;">
                  <span style="color: #263d86; font-weight: bold;">📩</span> 
                  <a href="mailto:contact@example.com" style="color: #1155cc; text-decoration: none;">contact@example.com</a>
                </p>
                <p style="margin: 8px 0; font-size: 12px;">
                  <span style="color: #263d86; font-weight: bold;">🌐</span> 
                  <a href="https://www.example.com" style="color: #1155cc; text-decoration: none;">www.example.com</a>
                </p>
                <p style="margin: 8px 0; font-size: 12px;">
                  <span style="color: #263d86; font-weight: bold;">📱</span> 
                  <a href="tel:000000000000" style="color: #1155cc; text-decoration: none;">000000000000</a>
                </p>
              </div>
            </div>

            <!-- Social Media Section -->
            <div style="background: #263d86; padding: 20px; text-align: center;">
              <p style="color: white; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">Síguenos en nuestras redes sociales</p>
              <div style="margin: 0;">
                {{ICONOS_REDES_SOCIALES}}
              </div>
            </div>

            <!-- Policies -->
            <div style="text-align: center; padding: 10px 20px; background: #f5f5f5;">
              <a href="https://example.com/policies/terms-of-service" style="color: #888; text-decoration: none; font-size: 10px; margin: 0 10px;">📋 Términos y Condiciones</a>
              <a href="https://example.com/policies/refund-policy" style="color: #888; text-decoration: none; font-size: 10px; margin: 0 10px;">💰 Refund Policy</a>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>${footerText}</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (plantillaId === 'recordatorio-pago') {
      var recTitle = (savedConfig && savedConfig.title) || 'RECORDATORIO DE PAGO';
      var recWelcome = (savedConfig && savedConfig.welcome) || 'Hola {{NOMBRE_ALUMNO}},\n\nTe recordamos que tienes un pago pendiente por el curso {{NOMBRE_CURSO}}.\n\nMonto de tu próxima cuota: ${{PRECIO}}\n\nFecha límite de pago: {{FECHA_LIMITE}}\n\nRealiza tu pago aquí:\nhttps://payment-provider.example.com/pay/YOUR_PAYMENT_LINK\n\nUna vez realizado el pago, puedes responder este correo adjuntando tu voucher o enviarlo por WhatsApp al 000000000000.';
      var recFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var recHtml = recWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      // Agregar botón de WhatsApp
      recHtml += '<div style="text-align:center;margin:20px 0;"><a href="https://wa.me/000000000000?text=Hola%2C%20adjunto%20mi%20voucher%20de%20pago" target="_blank" style="display:inline-block;background:#25D366;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">📱 Enviar voucher por WhatsApp</a></div>';
      // Agregar datos bancarios (solo para alumnos en Perú)
      recHtml += '<div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:8px;padding:15px;margin:15px 0;font-size:13px;">';
      recHtml += '<p style="font-weight:bold;color:#1e40af;margin:0 0 8px 0;">🏦 Datos bancarios (solo para alumnos en Perú):</p>';
      recHtml += '<p style="margin:4px 0;"><strong>Transferencia Dólares:</strong></p>';
      recHtml += '<p style="margin:2px 0 2px 10px;">• Cuenta Empresarial Dólares: <strong>XXX-XXXXXXXXXX</strong></p>';
      recHtml += '<p style="margin:2px 0 2px 10px;">• CCI Dólares: <strong>XXXXXXXXXXXXXXXXXXXX</strong></p>';
      recHtml += '<p style="margin:10px 0 4px 0;"><strong>Transferencia Soles:</strong></p>';
      recHtml += '<p style="margin:2px 0 2px 10px;">• Cuenta Empresarial Soles: <strong>XXX-XXXXXXXXXX</strong></p>';
      recHtml += '<p style="margin:2px 0 2px 10px;">• CCI Soles: <strong>XXXXXXXXXXXXXXXXXXXX</strong></p>';
      recHtml += '</div>';
      contenido = construirPlantillaEmail(recTitle, recHtml, recFooter, '#fff3cd', '#ffc107');
    } else if (plantillaId === 'confirmacion-pago') {
      var confTitle = (savedConfig && savedConfig.title) || 'CONFIRMACIÓN DE PAGO';
      var confWelcome = (savedConfig && savedConfig.welcome) || 'Hola {{NOMBRE_ALUMNO}},\n\nHemos recibido tu pago por el curso {{NOMBRE_CURSO}}.\n\nMonto recibido: ${{PRECIO}}\n\n{{SALDO_PENDIENTE}}\n\nSi tienes cuotas pendientes, recuerda realizar tus pagos a tiempo.\n\n¡Gracias por tu pago!';
      var confFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var confHtml = confWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      contenido = construirPlantillaEmail(confTitle, confHtml, confFooter, '#d4edda', '#28a745');
    } else if (plantillaId === 'cambio-seccion') {
      var csTitle = (savedConfig && savedConfig.title) || 'CAMBIO DE SECCIÓN';
      var csWelcome = (savedConfig && savedConfig.welcome) || 'Estimado {{NOMBRE_ALUMNO}},\n\nLe informamos que se ha realizado un cambio en su sección del curso {{NOMBRE_CURSO}}.\n\nSección Anterior: {{SECCION_ACTUAL}}\nNueva Sección: {{SECCION_NUEVA}}\nNueva Fecha de Inicio: {{FECHA_NUEVA}}\n{{MOTIVO_SECCION}}\n\nSi tienes alguna consulta sobre este cambio, no dudes en contactarnos.';
      var csFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var csHtml = csWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      contenido = construirPlantillaEmail(csTitle, csHtml, csFooter, '#e8f4f8', '#263d86');
    } else if (plantillaId === 'cambio-inicio-seccion') {
      var ciTitle = (savedConfig && savedConfig.title) || 'CAMBIO DE FECHA DE INICIO';
      var ciWelcome = (savedConfig && savedConfig.welcome) || 'Hola {{NOMBRE_ALUMNO}},\n\nTe informamos que la fecha de inicio de tu curso {{NOMBRE_CURSO}} ha sido modificada.\n\nNueva fecha de inicio: {{NUEVA_FECHA}}\n\nSi tienes alguna consulta sobre este cambio, no dudes en contactarnos.';
      var ciFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var ciHtml = ciWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      contenido = construirPlantillaEmail(ciTitle, ciHtml, ciFooter, '#e8f4f8', '#263d86');
    } else if (plantillaId === 'acceso-simulador') {
      var simTitle = (savedConfig && savedConfig.title) || 'ACCESO A SIMULADOR DE EXAMEN';
      var simWelcome = (savedConfig && savedConfig.welcome) || 'Hola {{NOMBRE_ALUMNO}},\n\nTe damos la bienvenida al simulador de examen de Educational CRM.\n\nCursos: {{CURSOS_SIMULADOR}}\n\nTus credenciales de acceso:\nUsuario: {{EMAIL_ALUMNO}}\nContraseña: {{PASSWORD}}\n\nPeriodo de acceso: {{FECHA_INICIO}} al {{FECHA_FIN}}\n\nAccede al simulador en: https://simulator.example.com\n\n¡Éxitos en tu preparación!';
      var simFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var simHtml = simWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      contenido = construirPlantillaEmail(simTitle, simHtml, simFooter, '#dbeafe', '#2563eb');
    } else if (plantillaId === 'acceso-simulador-recompra') {
      var simRTitle = (savedConfig && savedConfig.title) || 'NUEVO CURSO ASIGNADO EN SIMULADOR';
      var simRWelcome = (savedConfig && savedConfig.welcome) || 'Hola {{NOMBRE_ALUMNO}},\n\nTe informamos que se ha asignado un nuevo curso a tu cuenta del simulador de examen.\n\nNuevo curso: {{CURSOS_SIMULADOR}}\n\nAccede con tus credenciales habituales:\nUsuario: {{EMAIL_ALUMNO}}\nContraseña: La misma que ya tienes registrada\n\nPeriodo de acceso: {{FECHA_INICIO}} al {{FECHA_FIN}}\n\nAccede al simulador en: https://simulator.example.com\n\nSi olvidaste tu contraseña, contáctanos para restablecerla.\n\n¡Éxitos en tu preparación!';
      var simRFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var simRHtml = simRWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      contenido = construirPlantillaEmail(simRTitle, simRHtml, simRFooter, '#dbeafe', '#2563eb');
    } else if (plantillaId === 'acceso-material') {
      var matTitle = (savedConfig && savedConfig.title) || 'ACCESO A MATERIAL DEL CURSO';
      var matWelcome = (savedConfig && savedConfig.welcome) || 'Hola {{NOMBRE_ALUMNO}},\n\n¡Felicidades por completar el pago de tu curso {{NOMBRE_CURSO}}!\n\nYa tienes acceso al material de estudio de tu sección {{SECCION}}.\n\nAccede a tu material aquí:\n{{URL_CARPETA}}\n\nRecuerda revisar el contenido antes de cada clase para aprovechar al máximo tu experiencia de aprendizaje.\n\n¡Éxitos en tu preparación!';
      var matFooter = (savedConfig && savedConfig.footer) || '© 2026 Educational CRM. Todos los derechos reservados.';
      var matHtml = matWelcome.split('\n').filter(function(l){return l.trim()!=='';}).map(function(l){return '<p>'+l+'</p>';}).join('');
      contenido = construirPlantillaEmail(matTitle, matHtml, matFooter, '#d4edda', '#28a745');
    } else {
      contenido = '<p>Plantilla no encontrada</p>';
    }
    
    Logger.log('📋 Contenido obtenido para ' + plantillaId + ', longitud: ' + contenido.length);
    Logger.log('📋 Contiene PRECIO: ' + contenido.includes('{{PRECIO}}'));
    
    return contenido;
    
  } catch (error) {
    Logger.log('❌ ERROR en obtenerContenidoPlantilla: ' + error.toString());
    return '<p>Error obteniendo plantilla: ' + plantillaId + '</p>';
  }
}

/**
 * FUNCIONES FALTANTES PARA PLANTILLAS ADMIN
 */

/**
 * Obtiene enlaces personalizados para plantillas
 */
function obtenerEnlacesPersonalizados() {
  try {
    Logger.log('=== obtenerEnlacesPersonalizados ===');
    
    // Enlaces por defecto del sistema
    const enlaces = [
      {
        id: 'whatsapp',
        nombre: 'WhatsApp',
        url: 'https://wa.me/1234567890',
        icono: 'fab fa-whatsapp',
        color: '#25D366',
        activo: true
      },
      {
        id: 'linkedin',
        nombre: 'LinkedIn',
        url: 'https://linkedin.com/company/your-company',
        icono: 'fab fa-linkedin',
        color: '#0077B5',
        activo: true
      },
      {
        id: 'email',
        nombre: 'Email',
        url: 'mailto:owner@example.com',
        icono: 'fas fa-envelope',
        color: '#EA4335',
        activo: true
      },
      {
        id: 'website',
        nombre: 'Sitio Web',
        url: 'https://example.com',
        icono: 'fas fa-globe',
        color: '#4285F4',
        activo: true
      }
    ];
    
    Logger.log('Enlaces personalizados obtenidos: ' + enlaces.length);
    return enlaces;
  } catch (error) {
    Logger.log('ERROR en obtenerEnlacesPersonalizados: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene configuración de plantilla para admin
 */
function obtenerConfiguracionPlantilla(plantillaId) {
  try {
    Logger.log('=== obtenerConfiguracionPlantilla: ' + plantillaId + ' ===');
    
    if (!plantillaId) {
      return {
        success: false,
        message: 'ID de plantilla requerido'
      };
    }
    
    const cursos = getCursos() || [];
    const docentes = getDocentes() || [];
    const enlaces = obtenerEnlacesPersonalizados() || [];
    
    const configuracion = {
      plantillaId: plantillaId,
      nombre: obtenerNombrePlantilla(plantillaId),
      contenido: obtenerContenidoPlantilla(plantillaId),
      cursos: cursos,
      docentes: docentes,
      enlaces: enlaces,
      variables: [
        { nombre: 'NOMBRE_ALUMNO', descripcion: 'Nombre del alumno', ejemplo: 'Juan Pérez' },
        { nombre: 'NOMBRE_CURSO', descripcion: 'Nombre del curso', ejemplo: 'AWS Cloud Practitioner' },
        { nombre: 'FECHA_INICIO', descripcion: 'Fecha de inicio del curso', ejemplo: '15 de Abril, 2026' },
        { nombre: 'DOCENTE', descripcion: 'Nombre del docente', ejemplo: 'John Doe' },
        { nombre: 'PRECIO', descripcion: 'Precio del curso', ejemplo: '$299' },
        { nombre: 'EMPRESA', descripcion: 'Nombre de la empresa', ejemplo: 'Educational CRM' },
        { nombre: 'TELEFONO', descripcion: 'Teléfono de contacto', ejemplo: '+1 234 567 890' },
        { nombre: 'EMAIL', descripcion: 'Email de contacto', ejemplo: 'owner@example.com' }
      ],
      estilos: {
        colorPrimario: '#4285F4',
        colorSecundario: '#34A853',
        fuentePrincipal: 'Arial, sans-serif',
        tamañoFuente: '14px'
      }
    };
    
    Logger.log('Configuración generada para plantilla: ' + plantillaId);
    return {
      success: true,
      configuracion: configuracion
    };
  } catch (error) {
    Logger.log('ERROR en obtenerConfiguracionPlantilla: ' + error.toString());
    return {
      success: false,
      message: error.toString(),
      configuracion: {
        plantillaId: plantillaId,
        cursos: [],
        docentes: [],
        enlaces: [],
        variables: []
      }
    };
  }
}

/**
 * Genera vista previa de plantilla - VERSIÓN COMPLETA CON DATOS REALES
 */
function generarPreviewPlantilla(plantillaId, parametros) {
  try {
    console.log('=== generarPreviewPlantilla: ' + plantillaId + ' ===');
    console.log('Parámetros:', parametros);
    Logger.log('=== generarPreviewPlantilla COMPLETA: ' + plantillaId + ' ===');
    Logger.log('Parámetros: ' + JSON.stringify(parametros));
    
    // Validar parametros
    if (!parametros) {
      console.log('⚠️ parametros es null/undefined, usando objeto vacío');
      parametros = {};
    }
    
    if (!plantillaId) {
      console.log('❌ plantillaId es requerido');
      return '<div style="color: red; padding: 20px;">Error: ID de plantilla requerido</div>';
    }
    
    // Obtener contenido base de la plantilla
    let contenido = obtenerContenidoPlantilla(plantillaId);
    Logger.log('Contenido obtenido, longitud: ' + contenido.length);
    
    // Para bienvenida, obtener datos adicionales
    let docenteAsignado = 'John Doe'; // Valor por defecto
    let logoUrl = obtenerURLLogo(); // Obtener logo desde configuración
    let imagenCurso = '';
    let beneficiosCurso = '';
    let docentesDelCurso = '';
    let iconosRedes = '';
    
    if (plantillaId === 'bienvenida' && parametros.curso) {
      try {
        // Soportar múltiples cursos (separados por coma del multiselect)
        var cursosIds = String(parametros.curso).split(',').filter(function(c) { return c.trim(); });
        Logger.log('Cursos seleccionados: ' + JSON.stringify(cursosIds));
        
        // Generar imágenes de todos los cursos
        var imagenesHtml = '';
        var beneficiosHtml = '';
        var nombresHtml = [];
        var docentesSet = {};
        
        cursosIds.forEach(function(cursoId) {
          cursoId = cursoId.trim();
          var cursoData = getCursoByCodigo(cursoId);
          var nombreCurso = cursoData ? (cursoData.Nombre || cursoId) : cursoId;
          nombresHtml.push(nombreCurso);
          
          // Imagen del curso
          if (cursoData && cursoData.URLImagen) {
            imagenesHtml += '<div style="text-align:center;margin:10px 0;"><img src="' + cursoData.URLImagen + '" alt="' + nombreCurso + '" style="max-width:400px;height:auto;"><p style="font-size:12px;color:#666;margin:5px 0;">' + nombreCurso + '</p></div>';
          } else {
            imagenesHtml += '<div style="text-align:center;margin:10px 0;"><img src="https://via.placeholder.com/400x200/263d86/ffffff?text=' + encodeURIComponent(cursoId) + '" alt="' + nombreCurso + '" style="max-width:400px;height:auto;"><p style="font-size:12px;color:#666;margin:5px 0;">' + nombreCurso + '</p></div>';
          }
          
          // Beneficios del curso (agrupados por curso)
          if (cursoData && cursoData.Beneficios) {
            beneficiosHtml += '<h4 style="margin:15px 0 5px 0;color:#263d86;">' + nombreCurso + '</h4>';
            var beneficiosArray = cursoData.Beneficios.split(/[\n|;]/).filter(function(b) { return b.trim(); });
            beneficiosHtml += beneficiosArray.map(function(b) {
              var bl = b.trim();
              var bi = bl.startsWith('✅') ? bl : '✅ ' + bl;
              return '<p style="margin:5px 0 5px 15px;line-height:1.5;">' + bi + '</p>';
            }).join('');
          }
          
          // Docentes del curso (sin duplicados)
          try {
            var docentesList = obtenerDocentesPorCurso(cursoId);
            docentesList.forEach(function(d) {
              if (d.Foto && d.Foto.trim() !== '' && !docentesSet[d.Nombre]) {
                docentesSet[d.Nombre] = d;
              }
            });
          } catch(de) {}
        });
        
        imagenCurso = imagenesHtml;
        
        // Reemplazar "(por un costo reducido)" por "por 3 meses" en beneficios de la BD
        beneficiosHtml = beneficiosHtml.replace(/\(por un costo reducido\)/gi, 'por 3 meses');
        
        // Agregar beneficios según modalidad
        var modalidadParam = parametros.modalidad || 'Pro';
        Logger.log('📋 Modalidad para beneficios: ' + modalidadParam);
        
        if (modalidadParam === 'Basic') {
          // Basic: SOLO clases en vivo, material descargable, guía de examen (ignorar beneficios de BD)
          beneficiosHtml = '';
          beneficiosHtml += '<h4 style="margin:15px 0 5px 0;color:#263d86;">🟢 Modalidad Basic</h4>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">✅ Clases en vivo con docente certificado</p>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">✅ Material descargable del curso</p>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">✅ Guía de examen de certificación</p>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">✅ Grabaciones por un mes</p>';
        } else if (modalidadParam === 'Certify') {
          // Certify: beneficios estándar + examen pagado + 4 meses simulador + 2 sesiones 1a1
          if (!beneficiosHtml) {
            beneficiosHtml = '<p style="margin:10px 0;line-height:1.5;">✅ Acceso completo a la plataforma de aprendizaje</p><p style="margin:10px 0;line-height:1.5;">✅ Material de estudio actualizado</p><p style="margin:10px 0;line-height:1.5;">✅ Certificado de finalización</p><p style="margin:10px 0;line-height:1.5;">✅ Soporte técnico durante el curso</p><p style="margin:10px 0;line-height:1.5;">✅ Acceso a grabaciones de las clases</p>';
          }
          beneficiosHtml += '<h4 style="margin:20px 0 5px 0;color:#7c3aed;">🟣 Beneficios Certify</h4>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">🎓 Examen Oficial PAGADO</p>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">🎯 Agendamiento de Examen de Certificación</p>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">🎮 4 meses de acceso al Simulador de Examen</p>';
          beneficiosHtml += '<p style="margin:5px 0 5px 15px;line-height:1.5;">👨‍💻 2 sesiones 1 a 1 con Arquitecto previo a su examen</p>';
        } else {
          // Pro: beneficios estándar (fallback si no hay beneficios del curso)
          if (!beneficiosHtml) {
            beneficiosHtml = '<p style="margin:10px 0;line-height:1.5;">✅ Acceso completo a la plataforma de aprendizaje</p><p style="margin:10px 0;line-height:1.5;">✅ Material de estudio actualizado</p><p style="margin:10px 0;line-height:1.5;">✅ Certificado de finalización</p><p style="margin:10px 0;line-height:1.5;">✅ Soporte técnico durante el curso</p><p style="margin:10px 0;line-height:1.5;">✅ Acceso a grabaciones de las clases</p>';
          }
        }
        beneficiosCurso = beneficiosHtml;
        
        // Construir HTML de docentes sin duplicados
        docentesDelCurso = '';
        for (var dn in docentesSet) {
          var d = docentesSet[dn];
          var linkedinUrl = d.LinkedIn || '#';
          docentesDelCurso += '<div class="docente-card"><img src="' + d.Foto + '" alt="' + d.Nombre + '" style="width:100%;max-width:200px;height:auto;margin-bottom:15px;border-radius:8px;"><h3>' + d.Nombre + '</h3><p><a href="' + linkedinUrl + '" target="_blank">LinkedIn</a></p></div>';
        }
        
        docenteAsignado = nombresHtml.length > 0 ? obtenerDocentePorCurso(cursosIds[0]) : 'John Doe';
        
        // Nombre del curso para el banner (todos los cursos)
        parametros._nombresCursos = nombresHtml.join(' + ');
        
        // Obtener iconos de redes sociales
        iconosRedes = generarIconosRedesSociales();
        
      } catch (e) {
        Logger.log('Error obteniendo datos adicionales: ' + e.toString());
      }
    }
    
    // Reemplazos específicos para bienvenida (SIN PRECIO)
    if (plantillaId === 'bienvenida') {
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, parametros._nombresCursos || parametros.curso || '[Nombre del Curso]');
      contenido = contenido.replace(/\{\{DOCENTE\}\}/g, docenteAsignado);
      contenido = contenido.replace(/\{\{FECHA_INICIO\}\}/g, parametros.fecha_inicio || '[Fecha de Inicio]');
      contenido = contenido.replace(/\{\{FRECUENCIA\}\}/g, parametros.frecuencia || '[Frecuencia del Curso]');
      contenido = contenido.replace(/\{\{IMAGEN_CURSO\}\}/g, imagenCurso);
      contenido = contenido.replace(/\{\{BENEFICIOS_CURSO\}\}/g, beneficiosCurso);
      contenido = contenido.replace(/\{\{DOCENTES_DINAMICOS\}\}/g, docentesDelCurso);
      contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, iconosRedes);
      
      // PROCESAR DOCENTES FIJOS - ASEGURAR 3 POR FILA
      const docentesConFoto = getDocentes().filter(d => d.Foto && d.Foto.trim() !== '');
      
      // Docente 1 - John Doe (fijo)
      contenido = contenido.replace(/\{\{DOCENTE_1_FOTO\}\}/g, 'https://drive.google.com/uc?export=view&id=1beZ89v7sGKft8BYkfmlmIqCrt8pJRgAj');
      contenido = contenido.replace(/\{\{DOCENTE_1_CARGO\}\}/g, '');
      
      // Docente 2 - Hector Pezóa (fijo)
      contenido = contenido.replace(/\{\{DOCENTE_2_FOTO\}\}/g, 'https://drive.google.com/uc?export=view&id=1beZ89v7sGKft8BYkfmlmIqCrt8pJRgAj');
      contenido = contenido.replace(/\{\{DOCENTE_2_CARGO\}\}/g, '');
      
      // Docente 3 - Dinámico (primer docente con foto de la base de datos)
      if (docentesConFoto.length > 0) {
        const docente3 = docentesConFoto[0];
        contenido = contenido.replace(/\{\{DOCENTE_3_NOMBRE\}\}/g, docente3.Nombre);
        contenido = contenido.replace(/\{\{DOCENTE_3_FOTO\}\}/g, docente3.Foto);
        contenido = contenido.replace(/\{\{DOCENTE_3_TITULO\}\}/g, docente3.Cargo || 'Instructor Certificado');
        contenido = contenido.replace(/\{\{DOCENTE_3_CARGO\}\}/g, '');
        contenido = contenido.replace(/\{\{DOCENTE_3_LINKEDIN\}\}/g, docente3.LinkedIn || '#');
      } else {
        // Fallback para docente 3
        contenido = contenido.replace(/\{\{DOCENTE_3_NOMBRE\}\}/g, 'Instructor Certificado');
        contenido = contenido.replace(/\{\{DOCENTE_3_FOTO\}\}/g, 'https://drive.google.com/uc?export=view&id=1beZ89v7sGKft8BYkfmlmIqCrt8pJRgAj');
        contenido = contenido.replace(/\{\{DOCENTE_3_TITULO\}\}/g, 'Especialista en Cloud Computing');
        contenido = contenido.replace(/\{\{DOCENTE_3_CARGO\}\}/g, '');
        contenido = contenido.replace(/\{\{DOCENTE_3_LINKEDIN\}\}/g, '#');
      }
      
      // Docente 4 - Dinámico (segundo docente con foto de la base de datos)
      if (docentesConFoto.length > 1) {
        const docente4 = docentesConFoto[1];
        contenido = contenido.replace(/\{\{DOCENTE_4_NOMBRE\}\}/g, docente4.Nombre);
        contenido = contenido.replace(/\{\{DOCENTE_4_FOTO\}\}/g, docente4.Foto);
        contenido = contenido.replace(/\{\{DOCENTE_4_TITULO\}\}/g, docente4.Cargo || 'Instructor Certificado');
        contenido = contenido.replace(/\{\{DOCENTE_4_CARGO\}\}/g, '');
        contenido = contenido.replace(/\{\{DOCENTE_4_LINKEDIN\}\}/g, docente4.LinkedIn || '#');
      } else {
        // Fallback para docente 4
        contenido = contenido.replace(/\{\{DOCENTE_4_NOMBRE\}\}/g, 'Instructor Certificado');
        contenido = contenido.replace(/\{\{DOCENTE_4_FOTO\}\}/g, 'https://drive.google.com/uc?export=view&id=1beZ89v7sGKft8BYkfmlmIqCrt8pJRgAj');
        contenido = contenido.replace(/\{\{DOCENTE_4_TITULO\}\}/g, 'Especialista en Cloud Computing');
        contenido = contenido.replace(/\{\{DOCENTE_4_CARGO\}\}/g, '');
        contenido = contenido.replace(/\{\{DOCENTE_4_LINKEDIN\}\}/g, '#');
      }
      
    } else if (plantillaId === 'cambio-seccion') {
      // Resolver nombres de secciones desde códigos
      var seccionOrigen = parametros.seccion_actual || '[Sección Origen]';
      var seccionDestino = parametros.seccion_nueva || '[Sección Destino]';
      var nombreCurso = '[Nombre del Curso]';
      var fechaNueva = '[Nueva Fecha]';
      
      try {
        var allSecciones = getSecciones() || [];
        allSecciones.forEach(function(s) {
          if (s.Codigo === parametros.seccion_actual) {
            seccionOrigen = s.Codigo + ' - ' + s.NombreCurso + ' (' + s.Frecuencia + ')';
            nombreCurso = s.NombreCurso || nombreCurso;
          }
          if (s.Codigo === parametros.seccion_nueva) {
            seccionDestino = s.Codigo + ' - ' + s.NombreCurso + ' (' + s.Frecuencia + ')';
            fechaNueva = s.FechaInicio || fechaNueva;
          }
        });
      } catch(secErr) {
        Logger.log('⚠️ Error resolviendo secciones: ' + secErr.toString());
      }
      
      // Procesamiento específico para cambio de sección
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, nombreCurso);
      contenido = contenido.replace(/\{\{SECCION_ACTUAL\}\}/g, seccionOrigen);
      contenido = contenido.replace(/\{\{SECCION_NUEVA\}\}/g, seccionDestino);
      contenido = contenido.replace(/\{\{FECHA_NUEVA\}\}/g, fechaNueva);
      
      // Motivo opcional
      const motivoTexto = parametros.motivo ? 
        `<p><strong>Motivo:</strong> ${parametros.motivo}</p>` : '';
      contenido = contenido.replace(/\{\{MOTIVO_SECCION\}\}/g, motivoTexto);
      
    } else if (plantillaId === 'recordatorio-pago') {
      // Resolver datos de la cuota seleccionada
      var nombreCursoRec = parametros.nombre_curso || '[Nombre del Curso]';
      var saldoRec = parametros.precio || '[Saldo]';
      
      // Si viene cuotas_pendientes (envío desde preview manual), resolver desde cobranza
      if (parametros.cuotas_pendientes && !parametros.nombre_curso) {
        try {
          var cobranzaData = getCobranzaData();
          if (cobranzaData && Array.isArray(cobranzaData)) {
            var matIdBuscar = parametros.cuotas_pendientes.split('_cuota_')[0] || parametros.cuotas_pendientes;
            for (var ci = 0; ci < cobranzaData.length; ci++) {
              if (cobranzaData[ci].MatriculaId === matIdBuscar) {
                nombreCursoRec = cobranzaData[ci].Seccion || '';
                saldoRec = (cobranzaData[ci].Saldo || 0).toFixed(2);
                break;
              }
            }
          }
        } catch(recErr) {
          Logger.log('Error resolviendo cuota: ' + recErr.toString());
        }
      }
      
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, nombreCursoRec);
      contenido = contenido.replace(/\{\{PRECIO\}\}/g, saldoRec);
      contenido = contenido.replace(/\{\{FECHA_LIMITE\}\}/g, parametros.fecha_limite || '[Fecha Límite]');
      contenido = contenido.replace(/\{\{LINK_PAGO\}\}/g, parametros.link_pago || 'https://payment-provider.example.com/pay/YOUR_PAYMENT_LINK');
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      try { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, generarIconosRedesSociales()); } catch(e) { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, ''); }
      
    } else if (plantillaId === 'confirmacion-pago') {
      // Resolver datos de la matrícula seleccionada
      var nombreCursoConf = parametros.todas_secciones || '[Nombre del Curso]';
      var montoConf = parametros.monto_pago || '[Monto]';
      var saldoPendienteConf = 0;
      
      // Si no viene todas_secciones (envío manual), resolver desde matrícula
      if (!parametros.todas_secciones && parametros.matricula_id) {
        try {
          var cobranzaDataConf = getCobranzaData();
          if (cobranzaDataConf && Array.isArray(cobranzaDataConf)) {
            for (var mi = 0; mi < cobranzaDataConf.length; mi++) {
              if (cobranzaDataConf[mi].MatriculaId === parametros.matricula_id) {
                nombreCursoConf = cobranzaDataConf[mi].Seccion || '';
                saldoPendienteConf = cobranzaDataConf[mi].Saldo || 0;
                break;
              }
            }
          }
        } catch(confErr) {
          Logger.log('Error resolviendo matricula: ' + confErr.toString());
        }
      } else if (parametros.matricula_id) {
        // Obtener saldo pendiente
        try {
          var cobranzaDataConf2 = getCobranzaData();
          if (cobranzaDataConf2 && Array.isArray(cobranzaDataConf2)) {
            // Sumar saldo de todas las matrículas de la misma venta
            var idVentaConf = '';
            var ssConf = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
            var matSheetConf = ssConf.getSheetByName('Matriculas');
            var matDataConf = matSheetConf.getDataRange().getValues();
            for (var mc = 1; mc < matDataConf.length; mc++) {
              if (String(matDataConf[mc][0]) === parametros.matricula_id) {
                idVentaConf = String(matDataConf[mc][12] || '');
                break;
              }
            }
            if (idVentaConf) {
              for (var mc2 = 0; mc2 < cobranzaDataConf2.length; mc2++) {
                // Buscar matrículas de la misma venta
                for (var mc3 = 1; mc3 < matDataConf.length; mc3++) {
                  if (String(matDataConf[mc3][12]) === idVentaConf && cobranzaDataConf2[mc2].MatriculaId === String(matDataConf[mc3][0])) {
                    saldoPendienteConf += cobranzaDataConf2[mc2].Saldo || 0;
                  }
                }
              }
            }
          }
        } catch(confErr2) {
          Logger.log('Error resolviendo saldo: ' + confErr2.toString());
        }
      }
      
      // Generar HTML de saldo pendiente con detalle de cuotas (solo si hay saldo > 0)
      var saldoHtml = '';
      if (saldoPendienteConf > 0) {
        saldoHtml = '<div class="pendiente"><p><strong>Saldo pendiente:</strong> $' + saldoPendienteConf.toFixed(2) + '</p>';
        
        // Agregar detalle de cuotas programadas si existen
        if (parametros.matricula_id) {
          try {
            var cuotasProg = getCuotasProgramadas(parametros.matricula_id);
            if (cuotasProg && cuotasProg.length > 0) {
              var cuotasPendientes = cuotasProg.filter(function(c) { return c.estado === 'Pendiente'; });
              if (cuotasPendientes.length > 0) {
                saldoHtml += '<p style="margin-top:10px;font-size:13px;"><strong>Próximas cuotas:</strong></p>';
                cuotasPendientes.forEach(function(c) {
                  var fechaTexto = c.fechaVencimiento ? ' (vence: ' + c.fechaVencimiento + ')' : '';
                  saldoHtml += '<p style="margin:3px 0;font-size:13px;">• Cuota ' + c.numero + ': $' + c.monto.toFixed(2) + fechaTexto + '</p>';
                });
              }
            }
          } catch(cuotErr) {
            Logger.log('⚠️ Error obteniendo cuotas programadas: ' + cuotErr.toString());
          }
        }
        
        saldoHtml += '</div>';
      }
      
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, nombreCursoConf);
      contenido = contenido.replace(/\{\{PRECIO\}\}/g, montoConf);
      contenido = contenido.replace(/\{\{SALDO_PENDIENTE\}\}/g, saldoHtml);
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      try { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, generarIconosRedesSociales()); } catch(e) { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, ''); }
      
    } else if (plantillaId === 'cambio-inicio-seccion') {
      // Resolver nombre del curso desde la sección seleccionada
      var nombreCursoInicio = '[Nombre del Curso]';
      var seccionCodigo = parametros.seccion || '[Sección]';
      
      if (parametros.seccion) {
        try {
          var allSec = getSecciones() || [];
          for (var si = 0; si < allSec.length; si++) {
            if (allSec[si].Codigo === parametros.seccion) {
              nombreCursoInicio = allSec[si].NombreCurso || nombreCursoInicio;
              break;
            }
          }
        } catch(secErr2) {}
      }
      
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, nombreCursoInicio);
      contenido = contenido.replace(/\{\{NUEVA_FECHA\}\}/g, parametros.nueva_fecha || '[Nueva Fecha]');
      // Compatibilidad con variables viejas
      contenido = contenido.replace(/\{\{SECCION_ANTERIOR\}\}/g, seccionCodigo);
      contenido = contenido.replace(/\{\{SECCION_NUEVA\}\}/g, parametros.nueva_fecha || '[Nueva Fecha]');
      try { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, generarIconosRedesSociales()); } catch(e) { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, ''); }
      
    } else if (plantillaId === 'acceso-simulador') {
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{EMAIL_ALUMNO\}\}/g, parametros.email_alumno || '[Email]');
      contenido = contenido.replace(/\{\{CURSOS_SIMULADOR\}\}/g, parametros.cursos_simulador || '[Cursos]');
      contenido = contenido.replace(/\{\{PASSWORD\}\}/g, parametros.password || '[Contraseña]');
      contenido = contenido.replace(/\{\{FECHA_INICIO\}\}/g, parametros.fecha_inicio || '[Fecha Inicio]');
      contenido = contenido.replace(/\{\{FECHA_FIN\}\}/g, parametros.fecha_fin || '[Fecha Fin]');
      try { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, generarIconosRedesSociales()); } catch(e) { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, ''); }
      
    } else if (plantillaId === 'acceso-simulador-recompra') {
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{EMAIL_ALUMNO\}\}/g, parametros.email_alumno || '[Email]');
      contenido = contenido.replace(/\{\{CURSOS_SIMULADOR\}\}/g, parametros.cursos_simulador || '[Cursos]');
      contenido = contenido.replace(/\{\{FECHA_INICIO\}\}/g, parametros.fecha_inicio || '[Fecha Inicio]');
      contenido = contenido.replace(/\{\{FECHA_FIN\}\}/g, parametros.fecha_fin || '[Fecha Fin]');
      try { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, generarIconosRedesSociales()); } catch(e) { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, ''); }
      
    } else if (plantillaId === 'acceso-material') {
      contenido = contenido.replace(/\{\{LOGO_URL\}\}/g, logoUrl);
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, parametros.nombre_curso || '[Nombre del Curso]');
      contenido = contenido.replace(/\{\{SECCION\}\}/g, parametros.seccion || '[Sección]');
      var urlCarpeta = parametros.url_carpeta || '#';
      contenido = contenido.replace(/\{\{URL_CARPETA\}\}/g, '<a href="' + urlCarpeta + '" style="color:#1155cc;font-weight:bold;">📂 Acceder al Material</a>');
      try { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, generarIconosRedesSociales()); } catch(e) { contenido = contenido.replace(/\{\{ICONOS_REDES_SOCIALES\}\}/g, ''); }
      
    } else {
      // Para otras plantillas que SÍ usan PRECIO
      contenido = contenido.replace(/\{\{NOMBRE_ALUMNO\}\}/g, parametros.alumno_nombre || '[Nombre del Alumno]');
      contenido = contenido.replace(/\{\{NOMBRE_CURSO\}\}/g, parametros.curso || '[Nombre del Curso]');
      contenido = contenido.replace(/\{\{DOCENTE\}\}/g, docenteAsignado);
      contenido = contenido.replace(/\{\{FECHA_INICIO\}\}/g, parametros.fecha_inicio || '[Fecha de Inicio]');
      contenido = contenido.replace(/\{\{FRECUENCIA\}\}/g, parametros.frecuencia || '[Frecuencia del Curso]');
      contenido = contenido.replace(/\{\{PRECIO\}\}/g, parametros.monto_pago || '$299');
    }
    
    // Verificar que no queden variables sin reemplazar
    const variablesSinReemplazar = contenido.match(/\{\{[^}]+\}\}/g);
    if (variablesSinReemplazar) {
      Logger.log('⚠️ Variables sin reemplazar encontradas: ' + variablesSinReemplazar.join(', '));
      // Reemplazar cualquier variable restante con placeholder
      variablesSinReemplazar.forEach(variable => {
        contenido = contenido.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), '[Variable no definida]');
      });
    }
    
    Logger.log('✅ Vista previa generada correctamente, longitud: ' + contenido.length);
    console.log('✅ Vista previa generada, longitud: ' + contenido.length);
    
    // Siempre retornar un objeto con la estructura correcta
    return {
      success: true,
      html: contenido,
      plantillaId: plantillaId
    };
    
  } catch (error) {
    console.log('❌ ERROR en generarPreviewPlantilla: ' + error.toString());
    Logger.log('❌ ERROR en generarPreviewPlantilla: ' + error.toString());
    Logger.log('❌ Stack: ' + error.stack);
    
    // Retornar objeto de error válido
    return {
      success: false,
      html: '<div style="color: red; padding: 20px; border: 1px solid red; border-radius: 8px;"><h3>Error generando vista previa</h3><p><strong>Plantilla:</strong> ' + (plantillaId || 'desconocida') + '</p><p><strong>Error:</strong> ' + error.message + '</p></div>',
      error: error.message
    };
  }
}

/**
 * Obtiene el docente asignado para un curso específico
 */
function obtenerDocentePorCurso(codigoCurso) {
  try {
    Logger.log('=== obtenerDocentePorCurso: ' + codigoCurso + ' ===');
    
    // Buscar en secciones activas para este curso
    const secciones = getSecciones();
    const seccionActiva = secciones.find(s => 
      s.CodigoCurso === codigoCurso && 
      s.Estado === 'Activa'
    );
    
    if (seccionActiva && seccionActiva.Docente) {
      Logger.log('Docente encontrado: ' + seccionActiva.Docente);
      return seccionActiva.Docente;
    }
    
    // Si no hay sección activa, buscar cualquier sección de este curso
    const cualquierSeccion = secciones.find(s => s.CodigoCurso === codigoCurso);
    if (cualquierSeccion && cualquierSeccion.Docente) {
      Logger.log('Docente encontrado (cualquier sección): ' + cualquierSeccion.Docente);
      return cualquierSeccion.Docente;
    }
    
    // Docente por defecto
    Logger.log('Usando docente por defecto');
    return 'John Doe';
  } catch (error) {
    Logger.log('ERROR en obtenerDocentePorCurso: ' + error.toString());
    return 'John Doe';
  }
}

/**
 * Envía plantilla por email
 */
function enviarPlantilla(plantillaId, parametros) {
  try {
    Logger.log('=== enviarPlantilla: ' + plantillaId + ' ===');
    Logger.log('Parámetros: ' + JSON.stringify(parametros));
    
    // Validar email del destinatario
    const emailDestinatario = parametros.email_alumno;
    if (!emailDestinatario) {
      return {
        success: false,
        message: 'Email del destinatario requerido'
      };
    }
    
    // Para bienvenida, asignar docente automáticamente
    if (plantillaId === 'bienvenida' && parametros.curso) {
      const docenteAsignado = obtenerDocentePorCurso(parametros.curso);
      parametros.docente = docenteAsignado;
    }
    
    // Generar contenido del email
    const resultado = generarPreviewPlantilla(plantillaId, parametros);
    
    // Extraer el HTML del resultado (generarPreviewPlantilla retorna un objeto {success, html, plantillaId})
    var contenidoHtml = '';
    if (resultado && typeof resultado === 'object' && resultado.html) {
      contenidoHtml = resultado.html;
    } else if (typeof resultado === 'string') {
      contenidoHtml = resultado;
    } else {
      Logger.log('❌ No se pudo generar contenido de plantilla');
      return { success: false, message: 'Error generando contenido de plantilla' };
    }
    
    // Obtener asunto según la plantilla
    let asunto = '';
    switch(plantillaId) {
      case 'bienvenida':
        asunto = '🎉 ¡Bienvenido a Educational CRM! - ' + (parametros.curso || 'Tu Curso');
        break;
      case 'recordatorio-pago':
        asunto = '💰 Recordatorio de Pago - Educational CRM';
        break;
      case 'confirmacion-pago':
        asunto = '✅ Confirmación de Pago - Educational CRM';
        break;
      case 'cambio-seccion':
        asunto = '🔄 Cambio de Sección - Educational CRM';
        break;
      case 'cambio-inicio-seccion':
        asunto = '📅 Cambio de Fecha de Inicio - Educational CRM';
        break;
      case 'acceso-simulador':
        asunto = '🎮 Acceso a Simulador de Examen - Educational CRM';
        break;
      case 'acceso-simulador-recompra':
        asunto = '🎮 Nuevo Curso Asignado en Simulador - Educational CRM';
        break;
      case 'acceso-material':
        asunto = '📂 Acceso a Material del Curso - Educational CRM';
        break;
      default:
        asunto = 'Notificación - Educational CRM';
    }
    
    // Enviar email
    MailApp.sendEmail({
      to: emailDestinatario,
      subject: asunto,
      htmlBody: contenidoHtml,
      name: 'Educational CRM'
    });
    
    Logger.log('Email enviado exitosamente a: ' + emailDestinatario);
    
    return {
      success: true,
      message: 'Email enviado exitosamente a ' + emailDestinatario
    };
  } catch (error) {
    Logger.log('ERROR en enviarPlantilla: ' + error.toString());
    return {
      success: false,
      message: 'Error enviando email: ' + error.toString()
    };
  }
}

/**
 * Obtiene el nombre de una plantilla por ID
 */
function obtenerNombrePlantilla(plantillaId) {
  const nombres = {
    'bienvenida': '🎉 Email de Bienvenida',
    'recordatorio-pago': '💰 Recordatorio de Pago',
    'confirmacion-pago': '✅ Confirmación de Pago',
    'cambio-seccion': '🔄 Cambio de Sección',
    'cambio-inicio-seccion': '📅 Cambio de Inicio de Sección',
    'acceso-simulador': '🎮 Acceso a Simulador',
    'acceso-simulador-recompra': '🎮 Simulador - Recompra',
    'acceso-material': '📂 Acceso a Material del Curso'
  };
  
  return nombres[plantillaId] || 'Plantilla Desconocida';
}

/**
 * FUNCIONES PARA CORREGIR ADMIN PLANTILLAS
 * Restaurar funcionalidad perdida durante modularización
 */

/**
 * Inicializa iconos predeterminados de redes sociales
 */
function inicializarIconosPredeterminados() {
  try {
    Logger.log('=== inicializarIconosPredeterminados ===');
    
    const props = PropertiesService.getScriptProperties();
    const propiedades = props.getProperties();
    
    // Verificar si ya existen iconos con imágenes
    const iconosExistentes = Object.keys(propiedades).filter(k => k.startsWith('Icono_') && !k.endsWith('_FileId'));
    
    Logger.log('Iconos existentes: ' + iconosExistentes.length);
    
    // Si ya hay iconos, NO inicializar (para no sobrescribir)
    if (iconosExistentes.length > 0) {
      Logger.log('✅ Iconos ya existen, NO sobrescribiendo');
      return { success: true, message: 'Iconos ya existen' };
    }
    
    // SOLO inicializar si NO hay iconos
    Logger.log('🔧 No hay iconos, inicializando con estructura vacía...');
    
    const iconosPredeterminados = [
      {
        name: 'ig-icon',
        emoji: '',
        url: 'https://www.instagram.com/your_handle',
        imageUrl: ''
      },
      {
        name: 'fb-icon',
        emoji: '',
        url: 'https://www.facebook.com/share/1BKSwCXH5q/?mibextid=wwXIfr',
        imageUrl: ''
      },
      {
        name: 'in-icon',
        emoji: '',
        url: 'https://www.linkedin.com/company/your-company/',
        imageUrl: ''
      }
    ];
    
    iconosPredeterminados.forEach(icono => {
      props.setProperty('Icono_' + icono.name, JSON.stringify(icono));
      Logger.log('✅ Icono predeterminado guardado: ' + icono.name);
    });
    
    Logger.log('✅ Iconos predeterminados inicializados (SIN emojis)');
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en inicializarIconosPredeterminados: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Inicializa enlaces predeterminados
 */
function inicializarEnlacesPredeterminados() {
  try {
    Logger.log('=== inicializarEnlacesPredeterminados ===');
    
    const enlacesPredeterminados = [
      {
        name: 'Sitio Web',
        url: 'https://example.com',
        icon: '🌐'
      },
      {
        name: 'Términos y Condiciones',
        url: 'https://example.com/policies/terms-of-service',
        icon: '📋'
      },
      {
        name: 'Refund Policy',
        url: 'https://example.com/policies/refund-policy',
        icon: '💰'
      }
    ];
    
    const props = PropertiesService.getScriptProperties();
    enlacesPredeterminados.forEach(enlace => {
      props.setProperty('Enlace_' + enlace.name, JSON.stringify(enlace));
      Logger.log('✅ Enlace predeterminado guardado: ' + enlace.name);
    });
    
    Logger.log('✅ Enlaces predeterminados inicializados');
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en inicializarEnlacesPredeterminados: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Inicializa logo predeterminado
 */
function inicializarLogoPredeterminado() {
  try {
    Logger.log('=== inicializarLogoPredeterminado ===');
    
    const logoUrl = 'https://drive.google.com/uc?export=view&id=1beZ89v7sGKft8BYkfmlmIqCrt8pJRgAj';
    const props = PropertiesService.getScriptProperties();
    props.setProperty('Logo_URL', logoUrl);
    
    Logger.log('✅ Logo predeterminado inicializado: ' + logoUrl);
    return { success: true, url: logoUrl };
  } catch (error) {
    Logger.log('ERROR en inicializarLogoPredeterminado: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene iconos personalizados - VERSIÓN CORREGIDA (NO SOBRESCRIBE)
 */
function obtenerIconosPersonalizados() {
  try {
    Logger.log('=== obtenerIconosPersonalizados VERSIÓN CORREGIDA ===');
    
    // SOLO inicializar si NO existen iconos
    const propiedades = PropertiesService.getScriptProperties().getProperties();
    const iconosExistentes = Object.keys(propiedades).filter(k => k.startsWith('Icono_') && !k.endsWith('_FileId'));
    
    Logger.log('🔍 Iconos existentes en PropertiesService: ' + iconosExistentes.length);
    iconosExistentes.forEach(k => Logger.log('   - ' + k));
    
    if (iconosExistentes.length === 0) {
      Logger.log('🔧 No hay iconos, inicializando...');
      inicializarIconosPredeterminados();
    } else {
      Logger.log('✅ Iconos ya existen, NO sobrescribiendo');
    }
    
    const iconos = [];
    const propsActuales = PropertiesService.getScriptProperties().getProperties();
    
    Object.keys(propsActuales).forEach(key => {
      if (key.startsWith('Icono_') && !key.endsWith('_FileId')) {
        try {
          const iconoData = propsActuales[key];
          let icono;
          
          // Intentar parsear como JSON
          try {
            icono = JSON.parse(iconoData);
            Logger.log('✅ Icono parseado como JSON: ' + key);
            Logger.log('   - name: ' + icono.name);
            Logger.log('   - imageUrl: ' + icono.imageUrl);
            Logger.log('   - url: ' + icono.url);
          } catch (e) {
            // Si no es JSON, asumir que es una URL directa
            Logger.log('⚠️ Icono no es JSON, tratando como URL: ' + key);
            icono = {
              name: key.replace('Icono_', ''),
              imageUrl: iconoData,
              url: '#'
            };
          }
          
          // Asegurar que imageUrl existe
          if (!icono.imageUrl) {
            Logger.log('⚠️ Icono sin imageUrl: ' + key);
            icono.imageUrl = '';
          }
          
          iconos.push(icono);
          Logger.log('✅ Icono agregado al array: ' + icono.name + ' -> ' + icono.imageUrl);
        } catch (e) {
          Logger.log('❌ Error procesando icono: ' + key + ' -> ' + e.toString());
        }
      }
    });
    
    Logger.log('✅ Total de iconos retornados: ' + iconos.length);
    iconos.forEach(i => {
      Logger.log('   📋 ' + i.name + ': imageUrl=' + (i.imageUrl ? 'SÍ' : 'NO'));
    });
    
    return iconos;
  } catch (error) {
    Logger.log('ERROR en obtenerIconosPersonalizados: ' + error.toString());
    return [];
  }
}

/**
 * Obtener cuotas pendientes de un alumno - FUNCIÓN FALTANTE
 */
function obtenerCuotasPendientes(alumnoId) {
  try {
    Logger.log('=== obtenerCuotasPendientes: ' + alumnoId + ' ===');
    
    if (!alumnoId) {
      return [];
    }
    
    // getCobranzaData devuelve array directo, no objeto con .ventas
    var cobranzaData = getCobranzaData();
    
    if (!cobranzaData || !Array.isArray(cobranzaData)) {
      Logger.log('cobranzaData no es array valido');
      return [];
    }
    
    // Campo correcto: AlumnoId (d minuscula), Saldo para monto pendiente
    var pendientes = cobranzaData.filter(function(item) {
      return item.AlumnoId === alumnoId && item.Saldo > 0;
    });
    
    Logger.log('Cuotas pendientes encontradas: ' + pendientes.length);
    
    // Frontend espera { id, descripcion }
    return pendientes.map(function(item) {
      return {
        id: item.MatriculaId,
        descripcion: item.Seccion + ' - Saldo: $' + (item.Saldo || 0).toFixed(2) + ' de $' + (item.PrecioTotal || 0).toFixed(2)
      };
    });
    
  } catch (error) {
    Logger.log('ERROR en obtenerCuotasPendientes: ' + error.toString());
    return [];
  }
}

/**
 * Obtener matriculas con pagos realizados para un alumno (confirmacion de pago)
 */
function obtenerMatriculasPendientes(alumnoId) {
  try {
    Logger.log('=== obtenerMatriculasPendientes: ' + alumnoId + ' ===');
    if (!alumnoId) { return []; }
    var cobranzaData = getCobranzaData();
    if (!cobranzaData || !Array.isArray(cobranzaData)) { return []; }
    // Mostrar todas las matriculas del alumno que tengan pagos o saldo
    var matriculas = cobranzaData.filter(function(item) {
      return item.AlumnoId === alumnoId;
    });
    Logger.log('Matriculas del alumno: ' + matriculas.length);
    return matriculas.map(function(item) {
      return {
        id: item.MatriculaId,
        curso: item.Seccion,
        seccion: item.Seccion,
        saldoPendiente: item.Saldo || 0,
        precioTotal: item.PrecioTotal || 0,
        totalPagado: item.TotalPagado || 0
      };
    });
  } catch (error) {
    Logger.log('ERROR en obtenerMatriculasPendientes: ' + error.toString());
    return [];
  }
}

/**
 * Obtener secciones en las que un alumno esta matriculado
 */
function obtenerSeccionesAlumno(alumnoId) {
  try {
    Logger.log('=== obtenerSeccionesAlumno: ' + alumnoId + ' ===');
    if (!alumnoId) { return []; }
    var spreadsheet = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    var matriculasSheet = spreadsheet.getSheetByName('Matriculas');
    var seccionesSheet = spreadsheet.getSheetByName('Secciones');
    if (!matriculasSheet || !seccionesSheet) { return []; }
    var matData = matriculasSheet.getDataRange().getValues();
    var secData = seccionesSheet.getDataRange().getValues();
    var codigosSeccion = [];
    for (var i = 1; i < matData.length; i++) {
      if (String(matData[i][1] || '') === alumnoId) {
        codigosSeccion.push(String(matData[i][2] || ''));
      }
    }
    var resultado = [];
    for (var j = 1; j < secData.length; j++) {
      var codigo = String(secData[j][0] || '');
      if (codigosSeccion.indexOf(codigo) !== -1) {
        resultado.push({
          Codigo: codigo,
          NombreCurso: String(secData[j][1] || ''),
          Frecuencia: String(secData[j][10] || ''),
          Estado: String(secData[j][12] || '')
        });
      }
    }
    Logger.log('Secciones del alumno: ' + resultado.length);
    return resultado;
  } catch (error) {
    Logger.log('ERROR en obtenerSeccionesAlumno: ' + error.toString());
    return [];
  }
}
/**
 * Subir logo desde base64 - MISMO MECANISMO QUE ICONOS Y DOCENTES
 * Usa formato thumbnail que funciona en iframes de Apps Script
 */
function subirLogoBase64(base64Data, fileName) {
  try {
    Logger.log('=== subirLogoBase64 (THUMBNAIL FORMAT) ===');
    Logger.log('📊 Base64 recibido (primeros 50 chars): ' + base64Data.substring(0, 50));
    Logger.log('📊 Archivo: ' + fileName);
    
    if (!base64Data) {
      Logger.log('❌ Base64 vacío');
      return { success: false, message: 'Imagen inválida o vacía' };
    }
    
    // Remover prefijo data:image si existe
    let base64Clean = base64Data;
    if (base64Clean.includes(',')) {
      base64Clean = base64Clean.split(',')[1];
      Logger.log('✅ Prefijo data:image removido');
    }
    
    if (!base64Clean || base64Clean.trim() === '') {
      Logger.log('❌ Base64 vacío después de procesar');
      return { success: false, message: 'Imagen inválida o vacía' };
    }
    
    Logger.log('📊 Base64 length: ' + base64Clean.length);
    
    // Convertir base64 a blob
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Clean), 'image/png', fileName || 'logo.png');
    Logger.log('✅ Blob creado');
    
    // Obtener o crear carpeta de logos
    const folderId = obtenerOCrearCarpetaLogos();
    if (!folderId) {
      Logger.log('❌ No se pudo obtener carpeta de logos');
      return { success: false, message: 'No se pudo obtener carpeta de logos' };
    }
    
    Logger.log('✅ Carpeta de logos: ' + folderId);
    const carpeta = DriveApp.getFolderById(folderId);
    
    // Crear archivo
    const file = carpeta.createFile(blob);
    file.setName('logo-' + (fileName || 'logo.png'));
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const fileId = file.getId();
    // Usar formato thumbnail que funciona en iframes
    const logoUrl = 'https://drive.google.com/thumbnail?sz=w200&id=' + fileId;
    
    Logger.log('✅ Archivo creado: ' + fileId);
    Logger.log('🔗 URL generada (thumbnail): ' + logoUrl);
    
    // Guardar en PropertiesService
    const props = PropertiesService.getScriptProperties();
    props.setProperty('Logo_URL', logoUrl);
    props.setProperty('Logo_FileId', fileId);
    
    Logger.log('✅ Logo guardado en PropertiesService');
    Logger.log('✅ Verificando guardado...');
    const verificacion = props.getProperty('Logo_URL');
    Logger.log('✅ Verificación: ' + verificacion);
    
    return {
      success: true,
      message: 'Logo subido correctamente',
      url: logoUrl,
      fileId: fileId
    };
    
  } catch (error) {
    Logger.log('❌ ERROR en subirLogoBase64: ' + error.toString());
    return {
      success: false,
      message: 'Error al subir logo: ' + error.toString()
    };
  }
}

/**
 * Obtener URL del logo - VERSIÓN CON INICIALIZACIÓN FORZADA
 */
function obtenerURLLogo() {
  try {
    Logger.log('=== obtenerURLLogo ===');
    
    const props = PropertiesService.getScriptProperties();
    let logoUrl = props.getProperty('Logo_URL');
    
    Logger.log('📊 Logo URL obtenido: ' + logoUrl);
    
    // Si no hay logo, retornar vacío (no usar default)
    if (!logoUrl || logoUrl.trim() === '') {
      Logger.log('⚠️ No hay logo configurado');
      return '';
    }
    
    // Verificar que sea formato thumbnail
    if (logoUrl.includes('drive.google.com') && !logoUrl.includes('thumbnail')) {
      Logger.log('⚠️ Logo usa formato antiguo, convirtiendo a thumbnail...');
      convertirURLsLogoAThumbnail();
      logoUrl = props.getProperty('Logo_URL');
    }
    
    Logger.log('✅ Logo URL final: ' + logoUrl);
    return logoUrl;
  } catch (error) {
    Logger.log('ERROR en obtenerURLLogo: ' + error.toString());
    return '';
  }
}

/**
 * Agregar icono personalizado con URL
 */
function agregarIconoPersonalizadoConUrl(nombre, emoji, url) {
  try {
    Logger.log('=== agregarIconoPersonalizadoConUrl ===');
    
    const icono = {
      name: nombre,
      emoji: emoji,
      url: url || '',
      imageUrl: ''
    };
    
    const props = PropertiesService.getScriptProperties();
    props.setProperty('Icono_' + nombre, JSON.stringify(icono));
    
    Logger.log('✅ Icono agregado: ' + nombre);
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en agregarIconoPersonalizadoConUrl: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Agregar enlace personalizado
 */
function agregarEnlacePersonalizado(nombre, url, icono) {
  try {
    Logger.log('=== agregarEnlacePersonalizado ===');
    
    const enlace = {
      name: nombre,
      url: url,
      icon: icono
    };
    
    const props = PropertiesService.getScriptProperties();
    props.setProperty('Enlace_' + nombre, JSON.stringify(enlace));
    
    Logger.log('✅ Enlace agregado: ' + nombre);
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en agregarEnlacePersonalizado: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtener enlaces personalizados - VERSIÓN CON INICIALIZACIÓN FORZADA
 */
function obtenerEnlacesPersonalizados() {
  try {
    Logger.log('=== obtenerEnlacesPersonalizados CON INICIALIZACIÓN FORZADA ===');
    
    // SIEMPRE inicializar primero para asegurar que los enlaces estén
    Logger.log('🔧 Forzando inicialización de enlaces...');
    inicializarEnlacesPredeterminados();
    
    const enlaces = [];
    const propiedades = PropertiesService.getScriptProperties().getProperties();
    
    Object.keys(propiedades).forEach(key => {
      if (key.startsWith('Enlace_')) {
        try {
          const enlace = JSON.parse(propiedades[key]);
          enlaces.push(enlace);
        } catch (e) {
          Logger.log('Error parseando enlace: ' + key);
        }
      }
    });
    
    Logger.log('Enlaces encontrados después de inicialización: ' + enlaces.length);
    return enlaces;
  } catch (error) {
    Logger.log('ERROR en obtenerEnlacesPersonalizados: ' + error.toString());
    return [];
  }
}

/**
 * Eliminar icono personalizado
 */
function eliminarIconoPersonalizado(nombre) {
  try {
    PropertiesService.getScriptProperties().deleteProperty('Icono_' + nombre);
    Logger.log('✅ Icono eliminado: ' + nombre);
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en eliminarIconoPersonalizado: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Eliminar enlace personalizado
 */
function eliminarEnlacePersonalizado(nombre) {
  try {
    PropertiesService.getScriptProperties().deleteProperty('Enlace_' + nombre);
    Logger.log('✅ Enlace eliminado: ' + nombre);
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en eliminarEnlacePersonalizado: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Editar icono personalizado
 */
function editarIconoPersonalizado(nombreAnterior, nombreNuevo, emoji, url) {
  try {
    // Eliminar el anterior si el nombre cambió
    if (nombreAnterior !== nombreNuevo) {
      eliminarIconoPersonalizado(nombreAnterior);
    }
    
    const icono = {
      name: nombreNuevo,
      emoji: emoji,
      url: url || '',
      imageUrl: ''
    };
    
    const props = PropertiesService.getScriptProperties();
    props.setProperty('Icono_' + nombreNuevo, JSON.stringify(icono));
    
    Logger.log('✅ Icono editado: ' + nombreNuevo);
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en editarIconoPersonalizado: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Editar enlace personalizado
 */
function editarEnlacePersonalizado(nombreAnterior, nombreNuevo, url, icono) {
  try {
    // Eliminar el anterior si el nombre cambió
    if (nombreAnterior !== nombreNuevo) {
      eliminarEnlacePersonalizado(nombreAnterior);
    }
    
    const enlace = {
      name: nombreNuevo,
      url: url,
      icon: icono
    };
    
    const props = PropertiesService.getScriptProperties();
    props.setProperty('Enlace_' + nombreNuevo, JSON.stringify(enlace));
    
    Logger.log('✅ Enlace editado: ' + nombreNuevo);
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en editarEnlacePersonalizado: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Función para inicializar todo el sistema de plantillas
 */
function inicializarSistemaPlantillas() {
  try {
    Logger.log('=== inicializarSistemaPlantillas ===');
    
    inicializarLogoPredeterminado();
    inicializarEnlacesPredeterminados();
    inicializarIconosPredeterminados();
    
    Logger.log('✅ Sistema de plantillas inicializado completamente');
    return { success: true };
  } catch (error) {
    Logger.log('ERROR en inicializarSistemaPlantillas: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * Editar icono con imagen base64 - MISMO MECANISMO QUE DOCENTES Y CURSOS
 * Guarda en Google Drive y usa formato https://drive.google.com/uc?export=view&id=FILE_ID
 */
function editarIconoConImagen(nombreIcono, base64Imagen) {
  try {
    Logger.log('=== editarIconoConImagen: ' + nombreIcono + ' ===');
    
    if (!nombreIcono || !base64Imagen) {
      return { success: false, message: 'Nombre de icono e imagen son requeridos' };
    }
    
    Logger.log('📊 Base64 recibido (primeros 50 chars): ' + base64Imagen.substring(0, 50));
    
    // Remover prefijo data:image si existe (por si acaso)
    let base64Data = base64Imagen;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
      Logger.log('✅ Prefijo data:image removido');
    }
    
    // Validar que base64Data no sea undefined o vacío
    if (!base64Data || base64Data.trim() === '') {
      Logger.log('❌ Base64 vacío o inválido');
      return { success: false, message: 'Imagen inválida o vacía' };
    }
    
    Logger.log('📊 Base64 length: ' + base64Data.length);
    
    // Convertir base64 a blob
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', nombreIcono + '.jpg');
    
    // Obtener o crear carpeta de iconos
    const carpetaId = obtenerOCrearCarpetaIconos();
    const carpeta = DriveApp.getFolderById(carpetaId);
    
    // Crear archivo
    const archivo = carpeta.createFile(blob);
    archivo.setName('icono-' + nombreIcono + '.jpg');
    archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const fileId = archivo.getId();
    // USAR MISMO FORMATO QUE DOCENTES Y CURSOS
    const imagenUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    Logger.log('✅ Archivo creado: ' + fileId);
    Logger.log('🔗 URL (formato docentes/cursos): ' + imagenUrl);
    
    // Obtener icono actual para preservar URL de red social
    const configKey = 'Icono_' + nombreIcono;
    const props = PropertiesService.getScriptProperties();
    const iconoActualStr = props.getProperty(configKey);
    
    // URLs de red social predeterminadas
    const urlsRedes = {
      'ig-icon': 'https://www.instagram.com/your_handle',
      'fb-icon': 'https://www.facebook.com/share/1BKSwCXH5q/?mibextid=wwXIfr',
      'in-icon': 'https://www.linkedin.com/company/your-company/'
    };
    
    let iconoData = {
      name: nombreIcono,
      emoji: '',
      url: urlsRedes[nombreIcono] || '#',
      imageUrl: imagenUrl
    };
    
    // Si existe, SIEMPRE mantener la URL de red social original
    if (iconoActualStr) {
      try {
        const parsed = JSON.parse(iconoActualStr);
        if (parsed.url && parsed.url !== '#') {
          iconoData.url = parsed.url;
          Logger.log('✅ URL de red social preservada: ' + iconoData.url);
        }
      } catch (e) {
        Logger.log('No se pudo parsear icono anterior, usando predeterminado');
      }
    }
    
    // Guardar configuración en PropertiesService (no en Sheets)
    props.setProperty(configKey, JSON.stringify(iconoData));
    props.setProperty(configKey + '_FileId', fileId);
    
    Logger.log('✅ Icono actualizado: ' + nombreIcono);
    Logger.log('✅ Formato: https://drive.google.com/uc?export=view&id=FILE_ID (MISMO QUE DOCENTES Y CURSOS)');
    
    return {
      success: true,
      message: 'Icono actualizado correctamente',
      url: imagenUrl,
      fileId: fileId
    };
    
  } catch (error) {
    Logger.log('ERROR en editarIconoConImagen: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtener o crear carpeta de iconos
 */
function obtenerOCrearCarpetaIconos() {
  try {
    const configSheet = getSheet(SHEETS.config);
    if (!configSheet) {
      const carpeta = DriveApp.createFolder('Educational CRM - Iconos');
      return carpeta.getId();
    }
    
    const data = configSheet.getDataRange().getValues();
    
    // Buscar si ya existe el ID guardado
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'ICONOS_FOLDER_ID') {
        const folderId = String(data[i][1] || '').trim();
        if (folderId && folderId !== '' && folderId !== 'ICONOS_FOLDER_ID') {
          try {
            const folder = DriveApp.getFolderById(folderId);
            Logger.log('Carpeta de iconos encontrada: ' + folderId);
            return folderId;
          } catch (e) {
            Logger.log('Carpeta guardada no existe, creando nueva...');
          }
        }
      }
    }
    
    // Si no existe, crear nueva carpeta
    Logger.log('Creando carpeta de iconos...');
    const carpeta = DriveApp.createFolder('Educational CRM - Iconos');
    const folderId = carpeta.getId();
    
    // Guardar ID en configuración
    guardarConfiguracion('ICONOS_FOLDER_ID', folderId);
    
    Logger.log('Carpeta creada: ' + folderId);
    return folderId;
  } catch (error) {
    Logger.log('ERROR en obtenerOCrearCarpetaIconos: ' + error.toString());
    return null;
  }
}


/**
 * Agregar icono con imagen - Wrapper para subirImagenIcono en FileSystemModule
 * Llamada desde HTML: google.script.run.agregarIconoImagen(name, base64)
 */
function agregarIconoImagen(nombreIcono, base64Imagen) {
  Logger.log('=== agregarIconoImagen (wrapper) ===');
  return subirImagenIcono(nombreIcono, base64Imagen, '');
}



/**
 * Diagnosticar iconos guardados - Para debugging
 */
function diagnosticarIconosGuardados() {
  try {
    Logger.log('=== DIAGNÓSTICO DE ICONOS GUARDADOS ===');
    
    const propiedades = PropertiesService.getScriptProperties().getProperties();
    const iconosKeys = Object.keys(propiedades).filter(k => k.startsWith('Icono_'));
    
    Logger.log('Total de propiedades con Icono_: ' + iconosKeys.length);
    
    iconosKeys.forEach(key => {
      const valor = propiedades[key];
      Logger.log('\n📋 ' + key + ':');
      Logger.log('   Valor: ' + valor);
      
      try {
        const parsed = JSON.parse(valor);
        Logger.log('   ✅ JSON válido');
        Logger.log('   - name: ' + parsed.name);
        Logger.log('   - imageUrl: ' + parsed.imageUrl);
        Logger.log('   - url: ' + parsed.url);
        Logger.log('   - emoji: ' + parsed.emoji);
      } catch (e) {
        Logger.log('   ❌ No es JSON válido');
      }
    });
    
    Logger.log('\n=== FIN DIAGNÓSTICO ===');
    
    return {
      success: true,
      totalIconos: iconosKeys.length,
      iconos: iconosKeys
    };
  } catch (error) {
    Logger.log('ERROR en diagnosticarIconosGuardados: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * LIMPIAR TODOS LOS ICONOS Y EMPEZAR DE CERO
 * Ejecuta esto para borrar los emojis predeterminados
 */
function limpiarTodosLosIconos() {
  try {
    Logger.log('=== LIMPIANDO TODOS LOS ICONOS ===');
    
    const props = PropertiesService.getScriptProperties();
    const propiedades = props.getProperties();
    
    let contador = 0;
    Object.keys(propiedades).forEach(key => {
      if (key.startsWith('Icono_')) {
        props.deleteProperty(key);
        Logger.log('❌ Eliminado: ' + key);
        contador++;
      }
    });
    
    Logger.log('✅ Total de iconos eliminados: ' + contador);
    return { success: true, eliminados: contador };
  } catch (error) {
    Logger.log('ERROR en limpiarTodosLosIconos: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * Diagnosticar iconos guardados - Para debugging
 * Ejecuta esto desde Apps Script para ver qué se está guardando
 */
function diagnosticarIconosGuardados2() {
  try {
    Logger.log('=== DIAGNÓSTICO DE ICONOS GUARDADOS ===');
    
    const props = PropertiesService.getScriptProperties();
    const propiedades = props.getProperties();
    
    const iconosKeys = Object.keys(propiedades).filter(k => k.startsWith('Icono_') && !k.endsWith('_FileId'));
    
    Logger.log('Total de iconos: ' + iconosKeys.length);
    
    iconosKeys.forEach(key => {
      const valor = propiedades[key];
      Logger.log('\n📋 ' + key + ':');
      
      try {
        const parsed = JSON.parse(valor);
        Logger.log('   ✅ JSON válido');
        Logger.log('   - name: ' + parsed.name);
        Logger.log('   - imageUrl: ' + parsed.imageUrl);
        Logger.log('   - url: ' + parsed.url);
        Logger.log('   - emoji: ' + parsed.emoji);
      } catch (e) {
        Logger.log('   ❌ No es JSON válido: ' + valor);
      }
    });
    
    Logger.log('\n=== FIN DIAGNÓSTICO ===');
    
    return { success: true, totalIconos: iconosKeys.length };
  } catch (error) {
    Logger.log('ERROR en diagnosticarIconosGuardados2: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
