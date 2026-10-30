/**
 * SECCIONES MODULE
 * Gestión de secciones y matrículas
 */

/**
 * Obtiene secciones con información completa
 */
function getSeccionesCompletas() {
  try {
    Logger.log('=== getSeccionesCompletas ===');
    
    const sheet = getSheet(SHEETS.secciones);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const secciones = data.slice(1).map(row => ({
      ID: row[0],
      CodigoCurso: row[1],
      NombreCurso: row[2],
      Docente: row[3],
      FechaInicio: row[4],
      FechaFin: row[5],
      Horario: row[6],
      Estado: row[7] || 'Activa',
      Modalidad: row[8] || 'Online',
      MaxAlumnos: row[9] || 20,
      AlumnosInscritos: row[10] || 0,
      Precio: row[11] || 0,
      Observaciones: row[12] || ''
    }));
    
    Logger.log('Secciones encontradas: ' + secciones.length);
    return secciones;
  } catch (error) {
    Logger.log('ERROR en getSeccionesCompletas: ' + error.toString());
    return [];
  }
}

/**
 * Guarda una nueva sección
 */
function guardarSeccion(datosSeccion) {
  try {
    Logger.log('=== guardarSeccion ===');
    
    const sheet = getSheet(SHEETS.secciones);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de secciones' };
    }
    
    // Generar ID único
    const seccionId = 'SEC-' + Date.now();
    
    sheet.appendRow([
      seccionId,
      datosSeccion.codigoCurso,
      datosSeccion.nombreCurso,
      datosSeccion.docente,
      datosSeccion.fechaInicio,
      datosSeccion.fechaFin,
      datosSeccion.horario,
      datosSeccion.estado || 'Activa',
      datosSeccion.modalidad || 'Online',
      datosSeccion.maxAlumnos || 20,
      0, // AlumnosInscritos inicial
      datosSeccion.precio || 0,
      datosSeccion.observaciones || ''
    ]);
    
    Logger.log('Sección guardada: ' + seccionId);
    
    return {
      success: true,
      message: 'Sección creada correctamente',
      seccionId: seccionId
    };
  } catch (error) {
    Logger.log('ERROR en guardarSeccion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza una sección existente
 */
function actualizarSeccion(seccionId, datosSeccion) {
  try {
    Logger.log('=== actualizarSeccion: ' + seccionId + ' ===');
    
    const sheet = getSheet(SHEETS.secciones);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de secciones' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === seccionId) {
        // Actualizar la fila
        sheet.getRange(i + 1, 2).setValue(datosSeccion.codigoCurso);
        sheet.getRange(i + 1, 3).setValue(datosSeccion.nombreCurso);
        sheet.getRange(i + 1, 4).setValue(datosSeccion.docente);
        sheet.getRange(i + 1, 5).setValue(datosSeccion.fechaInicio);
        sheet.getRange(i + 1, 6).setValue(datosSeccion.fechaFin);
        sheet.getRange(i + 1, 7).setValue(datosSeccion.horario);
        sheet.getRange(i + 1, 8).setValue(datosSeccion.estado);
        sheet.getRange(i + 1, 9).setValue(datosSeccion.modalidad);
        sheet.getRange(i + 1, 10).setValue(datosSeccion.maxAlumnos);
        sheet.getRange(i + 1, 12).setValue(datosSeccion.precio);
        sheet.getRange(i + 1, 13).setValue(datosSeccion.observaciones);
        
        Logger.log('Sección actualizada: ' + seccionId);
        return { success: true, message: 'Sección actualizada correctamente' };
      }
    }
    
    return { success: false, message: 'Sección no encontrada' };
  } catch (error) {
    Logger.log('ERROR en actualizarSeccion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene sección por ID
 */
function obtenerSeccionPorId(seccionId) {
  try {
    const secciones = getSeccionesCompletas();
    return secciones.find(s => s.ID === seccionId) || null;
  } catch (error) {
    Logger.log('ERROR en obtenerSeccionPorId: ' + error.toString());
    return null;
  }
}


/**
 * Finaliza automáticamente secciones cuya última clase ya pasó.
 * - Secciones activas con FechaInicio en últimos 3 meses: consulta Calendar para fecha real del último evento.
 * - Secciones activas con FechaInicio de hace más de 3 meses: marca como Finalizada directamente.
 * Configurar como trigger diario.
 */
function finalizarSeccionesTerminadas() {
  try {
    Logger.log('=== finalizarSeccionesTerminadas ===');
    
    var ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    var secSheet = ss.getSheetByName('Secciones');
    var secData = secSheet.getDataRange().getValues();
    
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var hace3Meses = new Date(hoy);
    hace3Meses.setMonth(hace3Meses.getMonth() - 3);
    
    var finalizadas = 0;
    var finalizadasAntiguas = 0;
    
    for (var i = 1; i < secData.length; i++) {
      var estado = String(secData[i][12] || '').trim();
      // Procesar secciones vivas ('En Curso' es el estado activo real que asigna
      // sincronizarEstadosSecciones; 'Activa' y '' se mantienen por compatibilidad
      // con datos antiguos). Solo se saltan las ya cerradas.
      if (estado === 'Finalizada' || estado === 'Cancelada') continue;
      
      var codigo = String(secData[i][0] || '');
      if (!codigo) continue;
      
      var fechaInicioRaw = secData[i][13];
      var fechaInicio = null;
      
      if (fechaInicioRaw instanceof Date) {
        fechaInicio = new Date(fechaInicioRaw);
      } else if (fechaInicioRaw) {
        var partes = String(fechaInicioRaw).split('/');
        if (partes.length === 3) {
          fechaInicio = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        } else {
          fechaInicio = new Date(fechaInicioRaw);
        }
      }
      
      if (!fechaInicio || isNaN(fechaInicio.getTime())) continue;
      fechaInicio.setHours(0, 0, 0, 0);
      
      if (fechaInicio < hace3Meses) {
        secSheet.getRange(i + 1, 13).setValue('Finalizada');
        Logger.log('✅ ' + codigo + ' -> Finalizada (antigua)');
        finalizadasAntiguas++;
        continue;
      }
      
      var calendarEventId = String(secData[i][20] || '');
      if (!calendarEventId) continue;
      
      try {
        var ultimaFecha = obtenerFechaUltimoEventoSeccion(codigo);
        if (ultimaFecha && ultimaFecha < hoy) {
          secSheet.getRange(i + 1, 13).setValue('Finalizada');
          Logger.log('✅ ' + codigo + ' -> Finalizada (último evento: ' + ultimaFecha.toLocaleDateString() + ')');
          finalizadas++;
        }
      } catch(calErr) {
        Logger.log('⚠️ ' + codigo + ' -> Error Calendar: ' + calErr.toString());
      }
      
      Utilities.sleep(500);
    }
    
    var msg = 'Finalizadas: ' + finalizadas + ' (Calendar) + ' + finalizadasAntiguas + ' (antiguas >3m)';
    Logger.log('📋 ' + msg);
    return msg;
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}

function obtenerFechaUltimoEventoSeccion(codigoSeccion) {
  var match = codigoSeccion.match(/(\d{2})(\d{2})-/);
  if (!match) return null;
  
  var mes = parseInt(match[1]) - 1;
  var ano = 2000 + parseInt(match[2]);
  var inicioMes = new Date(ano, mes, 1);
  var finBusqueda = new Date(ano, mes + 6, 0, 23, 59, 59);
  var nombreBuscado = 'Clase ' + codigoSeccion;
  
  var events = Calendar.Events.list('primary', {
    timeMin: inicioMes.toISOString(),
    timeMax: finBusqueda.toISOString(),
    q: nombreBuscado,
    singleEvents: true,
    maxResults: 100
  });
  
  var ultimaFecha = null;
  if (events.items) {
    events.items.forEach(function(ev) {
      if (ev.summary && ev.summary.trim().indexOf(nombreBuscado) === 0 && ev.status !== 'cancelled') {
        var fechaEvento = new Date(ev.start.dateTime || ev.start.date);
        if (!ultimaFecha || fechaEvento > ultimaFecha) {
          ultimaFecha = fechaEvento;
        }
      }
    });
  }
  
  return ultimaFecha;
}

/**
 * Sincroniza automáticamente el estado de las secciones según su fecha de inicio.
 * - "Programada" con fecha de inicio <= hoy Y tiene Calendar → pasa a "En Curso"
 * - "En Curso" con fecha de inicio > hoy → pasa a "Programada"
 * - "En Curso" sin Calendar (nunca se agendó) → pasa a "Programada"
 * Configurar como trigger diario (ej: 6:00 AM).
 */
function sincronizarEstadosSecciones() {
  try {
    Logger.log('=== sincronizarEstadosSecciones ===');
    
    var ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    var secSheet = ss.getSheetByName('Secciones');
    var secData = secSheet.getDataRange().getValues();
    
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    var pasaronAEnCurso = 0;
    var pasaronAProgramada = 0;
    
    for (var i = 1; i < secData.length; i++) {
      var estado = String(secData[i][12] || '').trim();
      var codigo = String(secData[i][0] || '');
      if (!codigo) continue;
      
      // Solo procesar Programada y En Curso (no tocar Finalizada ni Cancelada)
      if (estado !== 'Programada' && estado !== 'En Curso') continue;
      
      var fechaInicioRaw = secData[i][13];
      var calendarEventId = String(secData[i][20] || '').trim();
      var fechaInicio = null;
      
      if (fechaInicioRaw instanceof Date) {
        fechaInicio = new Date(fechaInicioRaw);
      } else if (fechaInicioRaw) {
        var partes = String(fechaInicioRaw).split('/');
        if (partes.length === 3) {
          fechaInicio = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        } else {
          fechaInicio = new Date(fechaInicioRaw);
        }
      }
      
      if (!fechaInicio || isNaN(fechaInicio.getTime())) continue;
      fechaInicio.setHours(0, 0, 0, 0);
      
      // Programada + fecha <= hoy + tiene Calendar → En Curso
      if (estado === 'Programada' && fechaInicio <= hoy && calendarEventId) {
        secSheet.getRange(i + 1, 13).setValue('En Curso');
        Logger.log('▶️ ' + codigo + ': Programada → En Curso (inicio: ' + fechaInicio.toLocaleDateString() + ', calendar: sí)');
        pasaronAEnCurso++;
      }
      
      // En Curso + fecha > hoy → Programada (aún no inicia)
      if (estado === 'En Curso' && fechaInicio > hoy) {
        secSheet.getRange(i + 1, 13).setValue('Programada');
        Logger.log('⏸️ ' + codigo + ': En Curso → Programada (inicio: ' + fechaInicio.toLocaleDateString() + ', aún no inicia)');
        pasaronAProgramada++;
      }
      
      // En Curso + fecha <= hoy + NO tiene Calendar → Programada (nunca se agendó)
      if (estado === 'En Curso' && fechaInicio <= hoy && !calendarEventId) {
        secSheet.getRange(i + 1, 13).setValue('Programada');
        Logger.log('⏸️ ' + codigo + ': En Curso → Programada (inicio: ' + fechaInicio.toLocaleDateString() + ', sin calendar = nunca inició)');
        pasaronAProgramada++;
      }
    }
    
    var msg = '▶️ A En Curso: ' + pasaronAEnCurso + ' | ⏸️ A Programada: ' + pasaronAProgramada;
    Logger.log('📋 ' + msg);
    return msg;
  } catch (error) {
    Logger.log('❌ ERROR en sincronizarEstadosSecciones: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}
