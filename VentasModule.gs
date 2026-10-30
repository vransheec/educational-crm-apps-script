/**
 * MÓDULO DE VENTAS
 * Funciones relacionadas con ventas y secciones
 * 
 * ⚠️ NOTA: Las funciones getAlumnos(), buscarAlumno() y getSecciones()
 * están definidas en Code.gs para evitar conflictos de scope.
 * NO DUPLICAR AQUÍ.
 */

// ⚠️ NOTA: getCursos() está definida en _Code.gs para evitar conflictos de scope.
// NO DUPLICAR AQUÍ.

/**
 * Registra una nueva venta
 */
function registrarVenta(datosVenta) {
  try {
    Logger.log('=== registrarVenta ===');
    Logger.log('Datos: ' + JSON.stringify(datosVenta));
    
    const sheet = getSheet(SHEETS.ventas);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de ventas' };
    }
    
    // Generar ID único
    const ventaId = 'VTA-' + Date.now();
    const fecha = new Date();
    
    // Agregar la venta
    sheet.appendRow([
      ventaId,
      datosVenta.alumnoId,
      datosVenta.alumnoNombre,
      datosVenta.cursos.join(', '),
      datosVenta.precioTotal,
      datosVenta.modalidadPago,
      fecha,
      'Registrada'
    ]);
    
    Logger.log('Venta registrada: ' + ventaId);
    
    return {
      success: true,
      message: 'Venta registrada correctamente',
      ventaId: ventaId
    };
  } catch (error) {
    Logger.log('ERROR en registrarVenta: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene un alumno por ID
 */
function obtenerAlumnoPorId(alumnoId) {
  try {
    const alumnosSheet = getSheet(SHEETS.alumnos);
    const data = alumnosSheet.getDataRange().getValues();
    
    // Usar la misma estructura que getAlumnos
    // Estructura: ID_Alumno, Nombre, Gmail, Teléfono, País, LinkedIn, Fecha_Registro
    const rows = data.slice(1);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const alumno = {
        ID: String(row[0] || ''),
        Nombre: String(row[1] || ''),
        Gmail: String(row[2] || ''),
        Email: String(row[2] || ''), // Alias para compatibilidad
        Telefono: String(row[3] || ''), // CRÍTICO: Convertir a string
        Pais: String(row[4] || ''),
        LinkedIn: String(row[5] || '')
      };
      
      if (String(alumno.ID) === String(alumnoId)) {
        return alumno;
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('ERROR en obtenerAlumnoPorId: ' + error.toString());
    return null;
  }
}
/**
 * Obtiene alumnos por sección
 */
function getAlumnosPorSeccion(seccionId) {
  try {
    Logger.log('=== getAlumnosPorSeccion: ' + seccionId + ' ===');
    
    // Obtener matrículas de la sección
    const matriculasSheet = getSheet('Matriculas');
    if (!matriculasSheet) {
      Logger.log('Hoja Matriculas no encontrada');
      return [];
    }
    
    const matriculasData = matriculasSheet.getDataRange().getValues();
    const alumnosEnSeccion = [];
    
    // Cargar historial de reprogramaciones para contar por sección
    var reprogCounts = {};
    try {
      var ssReprog = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
      var histSheet = ssReprog.getSheetByName('HistorialReprogramaciones');
      if (histSheet) {
        var histData = histSheet.getDataRange().getValues();
        // Contar cuántas veces aparece cada sección como CodigoAnterior (fue reprogramada)
        for (var h = 1; h < histData.length; h++) {
          var codAnterior = String(histData[h][1] || '');
          if (codAnterior) {
            reprogCounts[codAnterior] = (reprogCounts[codAnterior] || 0) + 1;
          }
        }
      }
    } catch(histErr) {
      Logger.log('⚠️ Error leyendo historial reprogramaciones: ' + histErr.toString());
    }
    
    // Buscar matrículas de esta sección
    for (let i = 1; i < matriculasData.length; i++) {
      const codigoSeccion = matriculasData[i][2]; // Columna CodigoSeccion
      if (codigoSeccion === seccionId) {
        const alumnoId = matriculasData[i][1]; // Columna AlumnoID
        
        // Contar reprogramaciones: cuántas veces la sección actual fue reprogramada
        var numReprog = reprogCounts[seccionId] || 0;
        
        // Fecha comprometida (col 14, index 13)
        var fechaComprometidaRaw = matriculasData[i][13];
        var fechaComprometida = '';
        if (fechaComprometidaRaw instanceof Date) {
          fechaComprometida = String(fechaComprometidaRaw.getDate()).padStart(2,'0') + '/' + String(fechaComprometidaRaw.getMonth()+1).padStart(2,'0') + '/' + fechaComprometidaRaw.getFullYear();
        } else {
          fechaComprometida = String(fechaComprometidaRaw || '');
        }
        
        // Obtener información completa del alumno
        const alumno = obtenerAlumnoPorId(alumnoId);
        if (alumno) {
          alumnosEnSeccion.push({
            ...alumno,
            MatriculaId: matriculasData[i][0],
            EstadoPago: matriculasData[i][5],
            TotalPagado: matriculasData[i][6],
            SaldoPendiente: matriculasData[i][8],
            Modalidad: String(matriculasData[i][14] || 'Pro'),
            FechaComprometida: fechaComprometida,
            Reprogramaciones: numReprog,
            FechaMatricula: matriculasData[i][9] instanceof Date ? (String(matriculasData[i][9].getDate()).padStart(2,'0') + '/' + String(matriculasData[i][9].getMonth()+1).padStart(2,'0') + '/' + matriculasData[i][9].getFullYear()) : String(matriculasData[i][9] || '')
          });
        }
      }
    }
    
    Logger.log('Alumnos encontrados en sección: ' + alumnosEnSeccion.length);
    return alumnosEnSeccion;
  } catch (error) {
    Logger.log('ERROR en getAlumnosPorSeccion: ' + error.toString());
    return [];
  }
}
/**
 * Obtiene información completa de un alumno con manejo de errores
 */
function obtenerInformacionAlumno(alumnoId) {
  try {
    Logger.log('=== obtenerInformacionAlumno: ' + alumnoId + ' ===');
    
    if (!alumnoId) {
      Logger.log('AlumnoId no proporcionado');
      return { success: false, message: 'ID de alumno requerido' };
    }
    
    const alumno = obtenerAlumnoPorId(alumnoId);
    if (!alumno) {
      Logger.log('Alumno no encontrado: ' + alumnoId);
      return { success: false, message: 'Alumno no encontrado' };
    }
    
    // Asegurar que todos los campos sean strings y que el objeto alumno esté bien estructurado
    const alumnoCompleto = {
      ID: String(alumno.ID || ''),
      Nombre: String(alumno.Nombre || ''),
      Email: String(alumno.Email || alumno.Gmail || ''),
      Telefono: String(alumno.Telefono || ''),
      Pais: String(alumno.Pais || ''),
      LinkedIn: String(alumno.LinkedIn || ''),
      Estado: String(alumno.Estado || 'Activo')
    };
    
    // CRÍTICO: Retornar estructura correcta con propiedad 'alumno'
    Logger.log('Información de alumno obtenida correctamente');
    return { 
      success: true, 
      alumno: alumnoCompleto,  // Esta es la propiedad que busca el frontend
      message: 'Alumno encontrado correctamente'
    };
  } catch (error) {
    Logger.log('ERROR en obtenerInformacionAlumno: ' + error.toString());
    return { 
      success: false, 
      message: error.toString(),
      alumno: null  // Asegurar que siempre existe la propiedad alumno
    };
  }
}