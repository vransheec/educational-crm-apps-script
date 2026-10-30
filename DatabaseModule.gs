/**
 * DATABASE MODULE
 * Gestión de base de datos y relaciones complejas entre tablas
 */

// Configuración adicional de hojas que no están en CoreFunctions
const ADDITIONAL_SHEETS = {
  matriculas: 'Matriculas',
  recordatorios: 'Recordatorios',
  logs: 'Logs'
};

/**
 * getMatriculasConPagos - MOVIDO A _Code.gs para compatibilidad con google.script.run
 * Ver _Code.gs para la implementación actual
 */

/**
 * Obtiene los pagos de una matrícula específica
 */
function obtenerPagosMatricula(matriculaId) {
  try {
    Logger.log('=== obtenerPagosMatricula: ' + matriculaId + ' ===');
    
    const pagosSheet = getSheet(SHEETS.pagos);
    if (!pagosSheet) {
      Logger.log('ERROR: Hoja Pagos no encontrada');
      return [];
    }
    
    const pagosData = pagosSheet.getDataRange().getValues();
    const pagos = [];
    
    // Estructura esperada de la hoja Pagos:
    // ID_Pago, MatriculaID, NumeroCuota, Monto, MedioPago, FechaPago, IDOperacion, Estado
    for (let i = 1; i < pagosData.length; i++) {
      if (String(pagosData[i][1]) === String(matriculaId)) {
        pagos.push({
          ID: String(pagosData[i][0] || ''),
          MatriculaID: String(pagosData[i][1] || ''),
          NumeroCuota: parseInt(pagosData[i][2]) || 1,
          Monto: parseFloat(pagosData[i][3]) || 0,
          MedioPago: String(pagosData[i][4] || ''),
          FechaPago: String(pagosData[i][5] || ''),
          IDOperacion: String(pagosData[i][6] || ''),
          Estado: String(pagosData[i][7] || 'Completado')
        });
      }
    }
    
    Logger.log('Pagos encontrados para matrícula ' + matriculaId + ': ' + pagos.length);
    return pagos;
  } catch (error) {
    Logger.log('ERROR en obtenerPagosMatricula: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene una matrícula por ID con información completa
 */
function obtenerMatriculaPorId(matriculaId) {
  try {
    const matriculasSheet = getSheet(ADDITIONAL_SHEETS.matriculas);
    const data = matriculasSheet.getDataRange().getValues();
    
    const headers = data[0];
    const rows = data.slice(1);
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === matriculaId) {
        const matricula = {};
        headers.forEach((header, index) => {
          matricula[header] = rows[i][index];
        });
        return matricula;
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('ERROR en obtenerMatriculaPorId: ' + error.toString());
    return null;
  }
}

/**
 * Distribuye un pago entre múltiples matrículas
 * Registra cada pago en la hoja Pagos via savePago para trazabilidad completa
 */
function distribuirPagoEntreCursos(matriculaIds, montoPago, medioPago, idOperacion, esTest) {
  var spreadsheet = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
  var matriculasSheet = spreadsheet.getSheetByName('Matriculas');
  var pagosSheet = spreadsheet.getSheetByName('Pagos');
  var data = matriculasSheet.getDataRange().getValues();
  
  var montoRestante = montoPago;
  var pagosRealizados = [];
  
  matriculaIds.forEach(function(matriculaId) {
    if (montoRestante <= 0) return;
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(matriculaId)) {
        var saldoPendiente = parseFloat(data[i][8]) || 0;
        var montoAPagar = Math.min(montoRestante, saldoPendiente);
        
        if (montoAPagar > 0) {
          // Registrar en hoja Pagos - usar max ID existente
          var pagosAllD = pagosSheet.getDataRange().getValues();
          var maxPD = 0;
          for (var pd = 1; pd < pagosAllD.length; pd++) {
            var pdm = String(pagosAllD[pd][0] || '').match(/^P(\d+)$/);
            if (pdm) { var pdn = parseInt(pdm[1]); if (pdn > maxPD) maxPD = pdn; }
          }
          var pagoId = 'P' + String(maxPD + 1).padStart(6, '0');
          
          pagosSheet.appendRow([
            pagoId,
            matriculaId,
            1,
            montoAPagar,
            medioPago || '',
            'Cuota Inicial',
            idOperacion || '',
            new Date(),
            esTest ? 'Sí' : 'No'
          ]);
          
          Logger.log('✅ [distribuirPago] Pago registrado: ' + pagoId + ' matricula=' + matriculaId + ' monto=' + montoAPagar);
          
          // Recalcular totales desde hoja Pagos (fuente de verdad)
          actualizarTotalesMatricula(matriculaId);
          
          // Enviar email de confirmación de pago
          try {
            enviarEmailConfirmacionPagoAuto(matriculaId, montoAPagar);
          } catch(emailErr) {
            Logger.log('⚠️ [distribuirPago] Error email confirmación (no bloquea): ' + emailErr.toString());
          }
          
          pagosRealizados.push({
            matriculaId: matriculaId,
            pagoId: pagoId,
            monto: montoAPagar,
            saldoAnterior: saldoPendiente,
            saldoNuevo: saldoPendiente - montoAPagar
          });
          
          montoRestante -= montoAPagar;
        }
        break;
      }
    }
  });
  
  Logger.log('✅ [distribuirPago] Distribuidos: $' + (montoPago - montoRestante) + ' de $' + montoPago);
  
  return {
    success: true,
    pagosRealizados: pagosRealizados,
    montoDistribuido: montoPago - montoRestante,
    montoSobrante: montoRestante
  };
}

/**
 * Registra un log de actividad en el sistema
 */
function registrarLog(accion, tabla, id, detalle) {
  try {
    let logsSheet = getSheet(ADDITIONAL_SHEETS.logs);
    
    if (!logsSheet) {
      // Crear hoja de logs si no existe
      const ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
      logsSheet = ss.insertSheet(ADDITIONAL_SHEETS.logs);
      logsSheet.appendRow(['Fecha', 'Accion', 'Tabla', 'ID', 'Detalle', 'Usuario']);
    }
    
    logsSheet.appendRow([
      new Date(),
      accion,
      tabla,
      id,
      detalle,
      Session.getActiveUser().getEmail()
    ]);
    
    return true;
  } catch (error) {
    Logger.log('ERROR en registrarLog: ' + error.toString());
    return false;
  }
}

/**
 * Obtiene logs del sistema con filtros opcionales
 */
function getLogs(filtros) {
  try {
    var logsSheet = getSheet(ADDITIONAL_SHEETS.logs);
    if (!logsSheet) return [];
    
    var data = logsSheet.getDataRange().getValues();
    var logs = [];
    
    for (var i = data.length - 1; i >= 1; i--) {
      var log = {
        fecha: data[i][0] instanceof Date ? Utilities.formatDate(data[i][0], 'America/Lima', 'dd/MM/yyyy HH:mm') : String(data[i][0] || ''),
        accion: String(data[i][1] || ''),
        tabla: String(data[i][2] || ''),
        id: String(data[i][3] || ''),
        detalle: String(data[i][4] || ''),
        usuario: String(data[i][5] || '')
      };
      
      // Aplicar filtros
      if (filtros) {
        if (filtros.tabla && log.tabla !== filtros.tabla) continue;
        if (filtros.accion && log.accion.indexOf(filtros.accion) === -1) continue;
      }
      
      logs.push(log);
      if (logs.length >= 100) break; // Limitar a 100 registros
    }
    
    return logs;
  } catch (error) {
    Logger.log('ERROR en getLogs: ' + error.toString());
    return [];
  }
}

/**
 * Crea la hoja de recordatorios si no existe
 */
function crearHojaRecordatorios() {
  try {
    const ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    const sheet = ss.insertSheet(ADDITIONAL_SHEETS.recordatorios);
    sheet.appendRow(['ID_Matricula', 'Fecha', 'Tipo', 'Notas']);
    return sheet;
  } catch (error) {
    Logger.log('ERROR al crear hoja Recordatorios: ' + error.toString());
    return null;
  }
}

/**
 * Valida la integridad de las relaciones entre tablas
 */
function validarIntegridadDatos() {
  try {
    Logger.log('=== VALIDANDO INTEGRIDAD DE DATOS ===');
    
    const errores = [];
    
    // Validar relación Matriculas -> Alumnos
    const matriculasSheet = getSheet(ADDITIONAL_SHEETS.matriculas);
    const alumnosSheet = getSheet(SHEETS.alumnos);
    
    if (matriculasSheet && alumnosSheet) {
      const matriculasData = matriculasSheet.getDataRange().getValues();
      const alumnosData = alumnosSheet.getDataRange().getValues();
      const alumnosIds = alumnosData.slice(1).map(row => row[0]);
      
      for (let i = 1; i < matriculasData.length; i++) {
        const alumnoId = matriculasData[i][1];
        if (!alumnosIds.includes(alumnoId)) {
          errores.push(`Matrícula ${matriculasData[i][0]} referencia alumno inexistente: ${alumnoId}`);
        }
      }
    }
    
    Logger.log(`Validación completada. Errores encontrados: ${errores.length}`);
    
    return {
      success: true,
      errores: errores,
      totalErrores: errores.length
    };
    
  } catch (error) {
    Logger.log('ERROR en validarIntegridadDatos: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * FUNCIÓN DE TEST SIMPLE - Para debugging directo
 */
function testSimple() {
  Logger.log('🧪 TEST SIMPLE EJECUTADO - TIMESTAMP: ' + new Date().toISOString());
  return {
    success: true,
    message: 'Test simple funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '421'
  };
}

/**
 * TEST ESPECÍFICO para getMatriculasConPagos con logging detallado
 */
function testGetMatriculasConPagosDetallado(alumnoId) {
  Logger.log('🧪 === TEST DETALLADO getMatriculasConPagos ===');
  Logger.log('🧪 AlumnoId recibido: "' + alumnoId + '"');
  Logger.log('🧪 Tipo: ' + typeof alumnoId);
  
  try {
    const resultado = getMatriculasConPagos(alumnoId);
    Logger.log('🧪 Resultado obtenido: ' + JSON.stringify(resultado, null, 2));
    
    return {
      testSuccess: true,
      funcionOriginal: resultado,
      debug: {
        alumnoIdRecibido: alumnoId,
        tipoAlumnoId: typeof alumnoId,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    Logger.log('🧪 ERROR en test: ' + error.toString());
    return {
      testSuccess: false,
      error: error.toString(),
      debug: {
        alumnoIdRecibido: alumnoId,
        tipoAlumnoId: typeof alumnoId,
        timestamp: new Date().toISOString()
      }
    };
  }
}
function diagnosticarGetMatriculasConPagos(alumnoId) {
  try {
    Logger.log('=== DIAGNÓSTICO getMatriculasConPagos ===');
    Logger.log('Timestamp: ' + new Date().toLocaleString('es-ES'));
    Logger.log('Alumno ID recibido: "' + alumnoId + '" (tipo: ' + typeof alumnoId + ')');
    
    const resultado = {
      timestamp: new Date().toLocaleString('es-ES'),
      alumnoId: alumnoId,
      pasos: [],
      error: null,
      resultado: null
    };
    
    // Paso 1: Verificar hoja Alumnos
    resultado.pasos.push('1. Verificando hoja Alumnos...');
    const alumnosSheet = getSheet(SHEETS.alumnos);
    if (!alumnosSheet) {
      resultado.error = 'Hoja Alumnos no encontrada';
      Logger.log('❌ ERROR: ' + resultado.error);
      return resultado;
    }
    resultado.pasos.push('✅ Hoja Alumnos encontrada');
    
    // Paso 2: Obtener datos de alumnos
    resultado.pasos.push('2. Obteniendo datos de alumnos...');
    const alumnosData = alumnosSheet.getDataRange().getValues();
    resultado.pasos.push('✅ Datos obtenidos: ' + alumnosData.length + ' filas');
    Logger.log('Filas en Alumnos: ' + alumnosData.length);
    
    // Paso 3: Buscar alumno específico
    resultado.pasos.push('3. Buscando alumno con ID: "' + alumnoId + '"...');
    let alumno = null;
    let alumnosEncontrados = 0;
    
    for (let i = 1; i < alumnosData.length; i++) {
      const idEnHoja = String(alumnosData[i][0] || '');
      if (idEnHoja === String(alumnoId)) {
        alumno = {
          ID: idEnHoja,
          Nombre: String(alumnosData[i][1] || ''),
          Email: String(alumnosData[i][2] || ''),
          Telefono: String(alumnosData[i][3] || ''),
          Pais: String(alumnosData[i][4] || '')
        };
        alumnosEncontrados++;
        Logger.log('✅ Alumno encontrado: ' + alumno.Nombre);
        break;
      }
    }
    
    if (!alumno) {
      // Mostrar algunos IDs para debugging
      resultado.pasos.push('❌ Alumno NO encontrado');
      resultado.pasos.push('Primeros 5 IDs en la hoja:');
      for (let i = 1; i < Math.min(6, alumnosData.length); i++) {
        const id = String(alumnosData[i][0] || '');
        resultado.pasos.push('  - "' + id + '" (tipo: ' + typeof alumnosData[i][0] + ')');
      }
      resultado.error = 'Alumno no encontrado con ID: "' + alumnoId + '"';
      return resultado;
    }
    
    resultado.pasos.push('✅ Alumno encontrado: ' + alumno.Nombre);
    
    // Paso 4: Verificar hoja Matriculas
    resultado.pasos.push('4. Verificando hoja Matriculas...');
    const matriculasSheet = getSheet('Matriculas');
    if (!matriculasSheet) {
      resultado.error = 'Hoja Matriculas no encontrada';
      resultado.pasos.push('❌ ERROR: ' + resultado.error);
      return resultado;
    }
    resultado.pasos.push('✅ Hoja Matriculas encontrada');
    
    // Paso 5: Obtener matrículas
    resultado.pasos.push('5. Obteniendo matrículas del alumno...');
    const matriculasData = matriculasSheet.getDataRange().getValues();
    resultado.pasos.push('✅ Datos obtenidos: ' + matriculasData.length + ' filas');
    
    const matriculas = [];
    for (let i = 1; i < matriculasData.length; i++) {
      const alumnoIdEnMatricula = String(matriculasData[i][1] || '');
      if (alumnoIdEnMatricula === String(alumnoId)) {
        const matriculaId = String(matriculasData[i][0] || '');
        matriculas.push({
          ID: matriculaId,
          AlumnoID: alumnoIdEnMatricula,
          Seccion: String(matriculasData[i][2] || ''),
          PrecioTotal: parseFloat(matriculasData[i][3]) || 0,
          Estado: String(matriculasData[i][5] || 'Pendiente'),
          TotalPagado: parseFloat(matriculasData[i][6]) || 0,
          SaldoPendiente: parseFloat(matriculasData[i][8]) || 0
        });
      }
    }
    
    resultado.pasos.push('✅ Matrículas encontradas: ' + matriculas.length);
    
    // Resultado final
    resultado.resultado = {
      success: true,
      alumno: alumno,
      matriculas: matriculas,
      error: null
    };
    
    Logger.log('=== DIAGNÓSTICO COMPLETADO EXITOSAMENTE ===');
    return resultado;
    
  } catch (error) {
    Logger.log('❌ ERROR en diagnóstico: ' + error.toString());
    return {
      timestamp: new Date().toLocaleString('es-ES'),
      alumnoId: alumnoId,
      pasos: ['ERROR durante diagnóstico'],
      error: error.toString(),
      resultado: null
    };
  }
}