/**
 * TIMELINE MODULE
 * Funciones para el timeline y calendario de eventos
 */

/**
 * Obtiene eventos del timeline
 */
function getTimelineEvents() {
  try {
    Logger.log('=== getTimelineEvents ===');
    
    const secciones = getSecciones();
    const eventos = [];
    
    // Convertir secciones a eventos de timeline
    secciones.forEach(seccion => {
      if (seccion.FechaInicio) {
        eventos.push({
          id: 'inicio-' + seccion.ID,
          title: 'Inicio: ' + seccion.NombreCurso,
          start: seccion.FechaInicio,
          type: 'inicio',
          curso: seccion.CodigoCurso,
          docente: seccion.Docente,
          seccionId: seccion.ID,
          color: '#28a745'
        });
      }
      
      if (seccion.FechaFin) {
        eventos.push({
          id: 'fin-' + seccion.ID,
          title: 'Fin: ' + seccion.NombreCurso,
          start: seccion.FechaFin,
          type: 'fin',
          curso: seccion.CodigoCurso,
          docente: seccion.Docente,
          seccionId: seccion.ID,
          color: '#dc3545'
        });
      }
    });
    
    // Ordenar por fecha
    eventos.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    Logger.log('Eventos de timeline generados: ' + eventos.length);
    return eventos;
  } catch (error) {
    Logger.log('ERROR en getTimelineEvents: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene eventos para el calendario
 */
function getCalendarEvents(fechaInicio, fechaFin) {
  try {
    Logger.log('=== getCalendarEvents ===');
    Logger.log('Período: ' + fechaInicio + ' - ' + fechaFin);
    
    const secciones = getSecciones();
    const eventos = [];
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    secciones.forEach(seccion => {
      // Evento de inicio de sección
      if (seccion.FechaInicio) {
        const fechaInicioSeccion = new Date(seccion.FechaInicio);
        if (fechaInicioSeccion >= inicio && fechaInicioSeccion <= fin) {
          eventos.push({
            id: 'inicio-' + seccion.ID,
            title: '🚀 ' + seccion.NombreCurso,
            start: seccion.FechaInicio,
            allDay: true,
            backgroundColor: '#28a745',
            borderColor: '#1e7e34',
            textColor: '#ffffff',
            extendedProps: {
              type: 'inicio',
              seccionId: seccion.ID,
              docente: seccion.Docente,
              horario: seccion.Horario
            }
          });
        }
      }
      
      // Evento de fin de sección
      if (seccion.FechaFin) {
        const fechaFinSeccion = new Date(seccion.FechaFin);
        if (fechaFinSeccion >= inicio && fechaFinSeccion <= fin) {
          eventos.push({
            id: 'fin-' + seccion.ID,
            title: '🏁 ' + seccion.NombreCurso,
            start: seccion.FechaFin,
            allDay: true,
            backgroundColor: '#dc3545',
            borderColor: '#c82333',
            textColor: '#ffffff',
            extendedProps: {
              type: 'fin',
              seccionId: seccion.ID,
              docente: seccion.Docente,
              horario: seccion.Horario
            }
          });
        }
      }
      
      // Generar eventos de clases (si hay horario definido)
      if (seccion.FechaInicio && seccion.FechaFin && seccion.Horario) {
        const eventosClases = generarEventosClases(seccion, inicio, fin);
        eventos.push(...eventosClases);
      }
    });
    
    Logger.log('Eventos de calendario generados: ' + eventos.length);
    return eventos;
  } catch (error) {
    Logger.log('ERROR en getCalendarEvents: ' + error.toString());
    return [];
  }
}

/**
 * Genera eventos de clases individuales
 */
function generarEventosClases(seccion, fechaInicio, fechaFin) {
  try {
    const eventos = [];
    const inicioSeccion = new Date(seccion.FechaInicio);
    const finSeccion = new Date(seccion.FechaFin);
    
    // Parsear horario (ej: "Lunes, Miércoles, Viernes 19:00-21:00")
    const horarioParts = seccion.Horario.split(' ');
    if (horarioParts.length < 2) return eventos;
    
    const diasSemana = horarioParts[0].split(',').map(d => d.trim());
    const horario = horarioParts[horarioParts.length - 1]; // Último elemento es la hora
    
    // Mapear días de la semana
    const diasMap = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 
      'Viernes': 5, 'Sábado': 6, 'Domingo': 0
    };
    
    // Parsear hora (ej: "19:00-21:00")
    const [horaInicio, horaFin] = horario.split('-');
    if (!horaInicio || !horaFin) return eventos;
    
    // Generar eventos para cada día de clase
    let fechaActual = new Date(Math.max(inicioSeccion, fechaInicio));
    const fechaLimite = new Date(Math.min(finSeccion, fechaFin));
    
    while (fechaActual <= fechaLimite) {
      const diaSemana = fechaActual.getDay();
      const nombreDia = Object.keys(diasMap).find(key => diasMap[key] === diaSemana);
      
      if (nombreDia && diasSemana.some(d => d.includes(nombreDia))) {
        const fechaClase = new Date(fechaActual);
        const [horaI, minI] = horaInicio.split(':');
        const [horaF, minF] = horaFin.split(':');
        
        const inicioClase = new Date(fechaClase);
        inicioClase.setHours(parseInt(horaI), parseInt(minI), 0);
        
        const finClase = new Date(fechaClase);
        finClase.setHours(parseInt(horaF), parseInt(minF), 0);
        
        eventos.push({
          id: 'clase-' + seccion.ID + '-' + fechaClase.toISOString().split('T')[0],
          title: '📚 ' + seccion.NombreCurso,
          start: inicioClase.toISOString(),
          end: finClase.toISOString(),
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          textColor: '#ffffff',
          extendedProps: {
            type: 'clase',
            seccionId: seccion.ID,
            docente: seccion.Docente,
            modalidad: seccion.Modalidad
          }
        });
      }
      
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return eventos;
  } catch (error) {
    Logger.log('ERROR en generarEventosClases: ' + error.toString());
    return [];
  }
}

/**
 * Crea un nuevo evento en el timeline
 */
function crearEventoTimeline(datosEvento) {
  try {
    Logger.log('=== crearEventoTimeline ===');
    
    // Por ahora, los eventos se crean a través de secciones
    // En el futuro se podría tener una tabla separada de eventos
    
    if (datosEvento.tipo === 'seccion') {
      return guardarSeccion({
        codigoCurso: datosEvento.codigoCurso,
        nombreCurso: datosEvento.nombreCurso,
        docente: datosEvento.docente,
        fechaInicio: datosEvento.fechaInicio,
        fechaFin: datosEvento.fechaFin,
        horario: datosEvento.horario,
        modalidad: datosEvento.modalidad,
        maxAlumnos: datosEvento.maxAlumnos,
        precio: datosEvento.precio
      });
    }
    
    return { success: false, message: 'Tipo de evento no soportado' };
  } catch (error) {
    Logger.log('ERROR en crearEventoTimeline: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza un evento del timeline
 */
function actualizarEventoTimeline(eventoId, datosEvento) {
  try {
    Logger.log('=== actualizarEventoTimeline: ' + eventoId + ' ===');
    
    // Extraer ID de sección del eventoId
    const seccionId = eventoId.replace(/^(inicio-|fin-|clase-)/, '').split('-')[0];
    
    return actualizarSeccion(seccionId, {
      codigoCurso: datosEvento.codigoCurso,
      nombreCurso: datosEvento.nombreCurso,
      docente: datosEvento.docente,
      fechaInicio: datosEvento.fechaInicio,
      fechaFin: datosEvento.fechaFin,
      horario: datosEvento.horario,
      modalidad: datosEvento.modalidad,
      maxAlumnos: datosEvento.maxAlumnos,
      precio: datosEvento.precio
    });
  } catch (error) {
    Logger.log('ERROR en actualizarEventoTimeline: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Elimina un evento del timeline
 */
function eliminarEventoTimeline(eventoId) {
  try {
    Logger.log('=== eliminarEventoTimeline: ' + eventoId + ' ===');
    
    // Extraer ID de sección del eventoId
    const seccionId = eventoId.replace(/^(inicio-|fin-|clase-)/, '').split('-')[0];
    
    const sheet = getSheet(SHEETS.secciones);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de secciones' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === seccionId) {
        sheet.deleteRow(i + 1);
        Logger.log('Sección eliminada: ' + seccionId);
        return { success: true, message: 'Evento eliminado correctamente' };
      }
    }
    
    return { success: false, message: 'Evento no encontrado' };
  } catch (error) {
    Logger.log('ERROR en eliminarEventoTimeline: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene conflictos de horarios
 */
function detectarConflictosHorarios(fechaInicio, fechaFin, horario, docenteId, seccionIdExcluir) {
  try {
    Logger.log('=== detectarConflictosHorarios ===');
    
    const secciones = getSecciones();
    const conflictos = [];
    
    const inicioNuevo = new Date(fechaInicio);
    const finNuevo = new Date(fechaFin);
    
    secciones.forEach(seccion => {
      // Excluir la sección actual si se está editando
      if (seccionIdExcluir && seccion.ID === seccionIdExcluir) {
        return;
      }
      
      // Verificar si es el mismo docente
      if (docenteId && seccion.Docente === docenteId) {
        const inicioExistente = new Date(seccion.FechaInicio);
        const finExistente = new Date(seccion.FechaFin);
        
        // Verificar solapamiento de fechas
        if (inicioNuevo <= finExistente && finNuevo >= inicioExistente) {
          // Verificar solapamiento de horarios
          if (horario === seccion.Horario) {
            conflictos.push({
              seccionId: seccion.ID,
              nombreCurso: seccion.NombreCurso,
              docente: seccion.Docente,
              fechaInicio: seccion.FechaInicio,
              fechaFin: seccion.FechaFin,
              horario: seccion.Horario,
              tipo: 'docente'
            });
          }
        }
      }
    });
    
    Logger.log('Conflictos detectados: ' + conflictos.length);
    return conflictos;
  } catch (error) {
    Logger.log('ERROR en detectarConflictosHorarios: ' + error.toString());
    return [];
  }
}