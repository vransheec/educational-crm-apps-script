/**
 * MÓDULO DE COBRANZA
 * Funciones relacionadas con cobranza y pagos
 * 
 * ⚠️ NOTA: La función getCobranzaData() está definida en Code.gs
 * para evitar conflictos de scope. NO DUPLICAR AQUÍ.
 */

// Función para registrar pago
function registrarPago(ventaId, monto, metodo) {
  try {
    Logger.log('=== registrarPago ===');
    Logger.log('VentaID: ' + ventaId + ', Monto: ' + monto + ', Método: ' + metodo);
    
    const pagosSheet = getSheet(SHEETS.pagos);
    if (!pagosSheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de pagos' };
    }
    
    // Generar ID único para el pago
    const pagoId = 'PAG-' + Date.now();
    const fecha = new Date();
    
    // Agregar el pago
    pagosSheet.appendRow([
      pagoId,
      ventaId,
      monto,
      fecha,
      metodo,
      'Completado'
    ]);
    
    Logger.log('Pago registrado: ' + pagoId);
    
    return {
      success: true,
      message: 'Pago registrado correctamente',
      pagoId: pagoId
    };
  } catch (error) {
    Logger.log('ERROR en registrarPago: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
/**
 * Obtiene una matrícula por ID
 */
function obtenerMatriculaPorId(matriculaId) {
  try {
    const matriculasSheet = getSheet('Matriculas');
    if (!matriculasSheet) return null;
    
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
 * Actualiza el estado de una venta
 */
function actualizarEstadoVenta(ventaId, nuevoEstado) {
  try {
    Logger.log('=== actualizarEstadoVenta ===');
    Logger.log('VentaID: ' + ventaId + ', Nuevo Estado: ' + nuevoEstado);
    
    const ventasSheet = getSheet(SHEETS.ventas);
    if (!ventasSheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de ventas' };
    }
    
    const data = ventasSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ventaId) {
        ventasSheet.getRange(i + 1, 5).setValue(nuevoEstado); // Columna Estado
        Logger.log('Estado actualizado para venta: ' + ventaId);
        return { success: true, message: 'Estado actualizado correctamente' };
      }
    }
    
    return { success: false, message: 'Venta no encontrada' };
  } catch (error) {
    Logger.log('ERROR en actualizarEstadoVenta: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}


/**
 * Envía recordatorios de pago automáticos.
 * Se ejecuta diariamente (trigger 13:00-14:30).
 * Envía a alumnos con cuotas pendientes cuya sección inicia en 2 días, 1 día, o hoy.
 */
function enviarRecordatoriosPago() {
  try {
    Logger.log('=== enviarRecordatoriosPago ===');
    
    var ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    var secSheet = ss.getSheetByName('Secciones');
    var matSheet = ss.getSheetByName('Matriculas');
    var almSheet = ss.getSheetByName('Alumnos');
    var pagosSheet = ss.getSheetByName('Pagos');
    var cuotasSheet = ss.getSheetByName('CuotasProgramadas');
    
    var secData = secSheet.getDataRange().getValues();
    var matData = matSheet.getDataRange().getValues();
    var almData = almSheet.getDataRange().getValues();
    var pagosData = pagosSheet ? pagosSheet.getDataRange().getValues() : [];
    var cuotasData = cuotasSheet ? cuotasSheet.getDataRange().getValues() : [];
    
    // Mapear alumnos
    var alumnosMap = {};
    for (var a = 1; a < almData.length; a++) {
      alumnosMap[String(almData[a][0])] = { nombre: String(almData[a][1] || ''), email: String(almData[a][2] || '') };
    }
    
    // Contar pagos por matrícula
    var pagosPorMatricula = {};
    for (var p = 1; p < pagosData.length; p++) {
      var matId = String(pagosData[p][1] || '');
      if (matId) pagosPorMatricula[matId] = (pagosPorMatricula[matId] || 0) + 1;
    }
    
    // Agrupar cuotas por ID_Venta
    var cuotasPorVenta = {};
    for (var c = 1; c < cuotasData.length; c++) {
      var ventaId = String(cuotasData[c][0] || '');
      if (!cuotasPorVenta[ventaId]) cuotasPorVenta[ventaId] = [];
      cuotasPorVenta[ventaId].push({
        numero: parseInt(cuotasData[c][1]) || 0,
        monto: parseFloat(cuotasData[c][2]) || 0,
        fechaVencimiento: String(cuotasData[c][3] || '')
      });
    }
    
    // Determinar fechas objetivo (hoy, mañana, pasado mañana)
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
    var pasado = new Date(hoy); pasado.setDate(pasado.getDate() + 2);
    
    // Buscar secciones que inician en 0, 1 o 2 días
    var seccionesObjetivo = [];
    for (var s = 1; s < secData.length; s++) {
      var fechaInicioRaw = secData[s][13];
      if (!fechaInicioRaw) continue;
      
      var fechaInicio;
      if (fechaInicioRaw instanceof Date) {
        fechaInicio = new Date(fechaInicioRaw);
      } else {
        // Intentar parsear DD/MM/YYYY
        var partes = String(fechaInicioRaw).split('/');
        if (partes.length === 3) {
          fechaInicio = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        } else {
          fechaInicio = new Date(fechaInicioRaw);
        }
      }
      
      if (isNaN(fechaInicio.getTime())) continue;
      fechaInicio.setHours(0, 0, 0, 0);
      
      var diffDias = Math.round((fechaInicio - hoy) / (1000 * 60 * 60 * 24));
      if (diffDias >= 0 && diffDias <= 3) {
        seccionesObjetivo.push({
          codigo: String(secData[s][0]),
          nombre: String(secData[s][1]),
          fechaInicio: fechaInicio,
          diasParaInicio: diffDias
        });
      }
    }
    
    Logger.log('📋 Secciones que inician en 0-3 días: ' + seccionesObjetivo.length);
    if (seccionesObjetivo.length > 0) {
      seccionesObjetivo.forEach(function(s) {
        Logger.log('  📌 ' + s.codigo + ' (' + s.nombre + ') - inicio en ' + s.diasParaInicio + ' día(s) - fechaInicio: ' + s.fechaInicio);
      });
    }
    if (seccionesObjetivo.length === 0) return 'Sin secciones próximas a iniciar';
    
    // Para evitar duplicados: usar PropertiesService
    var props = PropertiesService.getScriptProperties();
    var hoyStr = Utilities.formatDate(hoy, 'America/Lima', 'yyyy-MM-dd');
    var enviadosKey = 'reminders_' + hoyStr;
    var enviadosHoy = {};
    try {
      var enviadosJson = props.getProperty(enviadosKey);
      if (enviadosJson) enviadosHoy = JSON.parse(enviadosJson);
    } catch(e) {}
    
    var enviados = 0;
    var omitidos = 0;
    
    seccionesObjetivo.forEach(function(seccion) {
      // Buscar matrículas con saldo pendiente en esta sección
      Logger.log('🔍 Procesando sección: ' + seccion.codigo + ' (inicio en ' + seccion.diasParaInicio + ' días)');
      var matriculasEnSeccion = 0;
      
      for (var m = 1; m < matData.length; m++) {
        if (String(matData[m][2]) !== seccion.codigo) continue;
        
        matriculasEnSeccion++;
        var matriculaId = String(matData[m][0]);
        var alumnoId = String(matData[m][1]);
        var saldo = parseFloat(matData[m][8]) || 0;
        var modalidad = String(matData[m][14] || 'Pro');
        var montoExamen = (modalidad === 'Certify') ? (parseFloat(matData[m][15]) || 0) : 0;
        var precioMat = parseFloat(matData[m][3]) || 0;
        var totalPagado = parseFloat(matData[m][6]) || 0;
        var idVenta = String(matData[m][12] || '');
        
        // Omitir si saldo = 0
        if (saldo <= 0) {
          Logger.log('  ⏭️ ' + matriculaId + ' (alumno=' + alumnoId + '): saldo=0, omitido');
          continue;
        }
        
        // Omitir Retake (nunca se les envía recordatorio)
        if (modalidad === 'Retake') {
          Logger.log('  ⏭️ ' + matriculaId + ': modalidad Retake, omitido');
          continue;
        }
        
        // Omitir Certify si ya pagó la parte del curso
        if (modalidad === 'Certify' && montoExamen > 0 && totalPagado >= (precioMat - montoExamen)) {
          Logger.log('  ⏭️ ' + matriculaId + ': Certify ya pagó parte curso, omitido');
          continue;
        }
        
        // Omitir si ya se envió hoy para esta matrícula
        if (enviadosHoy[matriculaId]) { 
          Logger.log('  ⏭️ ' + matriculaId + ': ya enviado hoy, omitido');
          omitidos++; continue; 
        }
        
        // Determinar monto de próxima cuota
        var numPagosRealizados = pagosPorMatricula[matriculaId] || 0;
        var cuotasVenta = cuotasPorVenta[idVenta] || [];
        var proximaCuota = null;
        
        // Ordenar cuotas por número
        cuotasVenta.sort(function(a, b) { return a.numero - b.numero; });
        
        // La próxima cuota es la número (pagos + 1)
        var numProximaCuota = numPagosRealizados + 1;
        for (var cv = 0; cv < cuotasVenta.length; cv++) {
          if (cuotasVenta[cv].numero === numProximaCuota) {
            proximaCuota = cuotasVenta[cv];
            break;
          }
        }
        
        // Si no encontró cuota programada, usar saldo pendiente como monto
        if (!proximaCuota) {
          proximaCuota = { monto: saldo, numero: numProximaCuota };
          Logger.log('  ℹ️ ' + matriculaId + ': sin cuota programada, usando saldo pendiente: ' + saldo);
        }
        
        // Obtener datos del alumno
        var alumno = alumnosMap[alumnoId];
        if (!alumno || !alumno.email) {
          Logger.log('  ⏭️ ' + matriculaId + ': alumno sin email (alumnoId=' + alumnoId + ', encontrado=' + (alumno ? 'sí' : 'no') + ')');
          continue;
        }
        
        // Formatear fecha límite (día de inicio, 17:00 hrs)
        var fechaLimite = Utilities.formatDate(seccion.fechaInicio, 'America/Lima', 'dd/MM/yyyy') + ' a las 17:00 hrs (hora Perú)';
        
        // Enviar email
        try {
          enviarPlantilla('recordatorio-pago', {
            alumno_nombre: alumno.nombre,
            email_alumno: alumno.email,
            nombre_curso: seccion.nombre,
            precio: proximaCuota.monto.toFixed(2),
            fecha_limite: fechaLimite,
            link_pago: 'https://payment-provider.example.com/pay/YOUR_PAYMENT_LINK',
            dias_para_inicio: seccion.diasParaInicio
          });
          
          enviadosHoy[matriculaId] = true;
          enviados++;
          Logger.log('📧 Reminder enviado: ' + alumno.nombre + ' (' + alumno.email + ') - $' + proximaCuota.monto.toFixed(2) + ' - ' + seccion.codigo);
        } catch(emailErr) {
          Logger.log('⚠️ Error enviando reminder a ' + alumno.email + ': ' + emailErr.toString());
        }
      }
      
      Logger.log('📊 Sección ' + seccion.codigo + ': ' + matriculasEnSeccion + ' matrículas encontradas');
    });
    
    // Guardar registro de enviados
    props.setProperty(enviadosKey, JSON.stringify(enviadosHoy));
    
    // Limpiar registros antiguos (más de 7 días)
    var allKeys = props.getKeys();
    allKeys.forEach(function(key) {
      if (key.startsWith('reminders_') && key !== enviadosKey) {
        var keyDate = key.replace('reminders_', '');
        var diff = (hoy - new Date(keyDate)) / (1000 * 60 * 60 * 24);
        if (diff > 7) props.deleteProperty(key);
      }
    });
    
    var msg = '📧 Recordatorios enviados: ' + enviados + ' | Omitidos: ' + omitidos;
    Logger.log(msg);
    return msg;
  } catch (error) {
    Logger.log('❌ ERROR en enviarRecordatoriosPago: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}

/**
 * SIMULACIÓN: Muestra qué recordatorios de pago se enviarían sin enviar nada.
 * Ejecutar manualmente desde el editor de Apps Script.
 */
function simularRecordatoriosPago() {
  try {
    Logger.log('=== SIMULACIÓN enviarRecordatoriosPago (DRY RUN) ===');
    Logger.log('Fecha actual: ' + new Date().toString());
    
    var ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    var secSheet = ss.getSheetByName('Secciones');
    var matSheet = ss.getSheetByName('Matriculas');
    var almSheet = ss.getSheetByName('Alumnos');
    var pagosSheet = ss.getSheetByName('Pagos');
    var cuotasSheet = ss.getSheetByName('CuotasProgramadas');
    
    var secData = secSheet.getDataRange().getValues();
    var matData = matSheet.getDataRange().getValues();
    var almData = almSheet.getDataRange().getValues();
    var pagosData = pagosSheet ? pagosSheet.getDataRange().getValues() : [];
    var cuotasData = cuotasSheet ? cuotasSheet.getDataRange().getValues() : [];
    
    var alumnosMap = {};
    for (var a = 1; a < almData.length; a++) {
      alumnosMap[String(almData[a][0])] = { nombre: String(almData[a][1] || ''), email: String(almData[a][2] || '') };
    }
    
    var pagosPorMatricula = {};
    for (var p = 1; p < pagosData.length; p++) {
      var matId = String(pagosData[p][1] || '');
      if (matId) pagosPorMatricula[matId] = (pagosPorMatricula[matId] || 0) + 1;
    }
    
    var cuotasPorVenta = {};
    for (var c = 1; c < cuotasData.length; c++) {
      var ventaId = String(cuotasData[c][0] || '');
      if (!cuotasPorVenta[ventaId]) cuotasPorVenta[ventaId] = [];
      cuotasPorVenta[ventaId].push({
        numero: parseInt(cuotasData[c][1]) || 0,
        monto: parseFloat(cuotasData[c][2]) || 0,
        fechaVencimiento: String(cuotasData[c][3] || '')
      });
    }
    
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    var seccionesObjetivo = [];
    for (var s = 1; s < secData.length; s++) {
      var fechaInicioRaw = secData[s][13];
      if (!fechaInicioRaw) continue;
      var fechaInicio;
      if (fechaInicioRaw instanceof Date) {
        fechaInicio = new Date(fechaInicioRaw);
      } else {
        var partes = String(fechaInicioRaw).split('/');
        if (partes.length === 3) {
          fechaInicio = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
        } else {
          fechaInicio = new Date(fechaInicioRaw);
        }
      }
      if (isNaN(fechaInicio.getTime())) continue;
      fechaInicio.setHours(0, 0, 0, 0);
      var diffDias = Math.round((fechaInicio - hoy) / (1000 * 60 * 60 * 24));
      if (diffDias >= 0 && diffDias <= 3) {
        seccionesObjetivo.push({
          codigo: String(secData[s][0]),
          nombre: String(secData[s][1]),
          fechaInicio: fechaInicio,
          diasParaInicio: diffDias
        });
      }
    }
    
    Logger.log('📋 Secciones que inician en 0-3 días: ' + seccionesObjetivo.length);
    seccionesObjetivo.forEach(function(sec) {
      Logger.log('  📌 ' + sec.codigo + ' (' + sec.nombre + ') - inicio en ' + sec.diasParaInicio + ' día(s)');
    });
    
    if (seccionesObjetivo.length === 0) {
      Logger.log('⚠️ No hay secciones próximas. No se enviarían recordatorios.');
      return 'Sin secciones próximas';
    }
    
    var enviariaA = [];
    
    seccionesObjetivo.forEach(function(seccion) {
      for (var m = 1; m < matData.length; m++) {
        if (String(matData[m][2]) !== seccion.codigo) continue;
        
        var matriculaId = String(matData[m][0]);
        var alumnoId = String(matData[m][1]);
        var saldo = parseFloat(matData[m][8]) || 0;
        var modalidad = String(matData[m][14] || 'Pro');
        var idVenta = String(matData[m][12] || '');
        
        if (saldo <= 0) continue;
        if (modalidad === 'Retake') continue;
        
        var numPagosRealizados = pagosPorMatricula[matriculaId] || 0;
        var cuotasVenta = cuotasPorVenta[idVenta] || [];
        cuotasVenta.sort(function(a, b) { return a.numero - b.numero; });
        var numProximaCuota = numPagosRealizados + 1;
        var proximaCuota = null;
        for (var cv = 0; cv < cuotasVenta.length; cv++) {
          if (cuotasVenta[cv].numero === numProximaCuota) { proximaCuota = cuotasVenta[cv]; break; }
        }
        
        var monto = proximaCuota ? proximaCuota.monto : saldo;
        
        var alumno = alumnosMap[alumnoId];
        if (!alumno || !alumno.email) continue;
        
        enviariaA.push({
          seccion: seccion.codigo,
          curso: seccion.nombre,
          diasParaInicio: seccion.diasParaInicio,
          alumno: alumno.nombre,
          email: alumno.email,
          monto: monto,
          saldo: saldo,
          matriculaId: matriculaId,
          cuotaNum: numProximaCuota,
          tieneCuotaProgramada: !!proximaCuota
        });
      }
    });
    
    Logger.log('');
    Logger.log('========================================');
    Logger.log('📧 ENVIARÍA RECORDATORIOS A ' + enviariaA.length + ' ALUMNO(S):');
    Logger.log('========================================');
    enviariaA.forEach(function(e, i) {
      Logger.log('');
      Logger.log((i+1) + '. ' + e.alumno + ' (' + e.email + ')');
      Logger.log('   Sección: ' + e.seccion + ' - ' + e.curso);
      Logger.log('   Inicio en: ' + e.diasParaInicio + ' día(s)');
      Logger.log('   Monto a cobrar: $' + e.monto.toFixed(2) + ' (saldo total: $' + e.saldo.toFixed(2) + ')');
      Logger.log('   Cuota #' + e.cuotaNum + ' | Cuota programada: ' + (e.tieneCuotaProgramada ? 'SÍ' : 'NO (usa saldo)'));
    });
    
    if (enviariaA.length === 0) {
      Logger.log('⚠️ No hay alumnos con saldo pendiente en las secciones próximas.');
    }
    
    return 'Simulación completada: ' + enviariaA.length + ' recordatorios se enviarían';
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}

/**
 * Envía recordatorio de pago a un alumno específico por matrícula.
 * Llamado desde el botón individual en Cobranza.
 */
function enviarRecordatorioManual(matriculaId) {
  try {
    Logger.log('📧 [enviarRecordatorioManual] Matrícula: ' + matriculaId);
    
    var ss = SpreadsheetApp.openById('YOUR_DATABASE_SPREADSHEET_ID');
    var matSheet = ss.getSheetByName('Matriculas');
    var almSheet = ss.getSheetByName('Alumnos');
    var secSheet = ss.getSheetByName('Secciones');
    var matData = matSheet.getDataRange().getValues();
    var almData = almSheet.getDataRange().getValues();
    var secData = secSheet.getDataRange().getValues();
    
    // Buscar matrícula
    var matricula = null;
    for (var i = 1; i < matData.length; i++) {
      if (String(matData[i][0]) === String(matriculaId)) {
        matricula = {
          alumnoId: String(matData[i][1]),
          seccion: String(matData[i][2]),
          saldo: parseFloat(matData[i][8]) || 0,
          idVenta: String(matData[i][12] || '')
        };
        break;
      }
    }
    
    if (!matricula) return { success: false, message: 'Matrícula no encontrada' };
    if (matricula.saldo <= 0) return { success: false, message: 'No tiene saldo pendiente' };
    
    // Buscar alumno
    var alumno = null;
    for (var a = 1; a < almData.length; a++) {
      if (String(almData[a][0]) === matricula.alumnoId) {
        alumno = { nombre: String(almData[a][1] || ''), email: String(almData[a][2] || '') };
        break;
      }
    }
    if (!alumno || !alumno.email) return { success: false, message: 'Alumno sin email' };
    
    // Buscar sección para nombre del curso y fecha
    var nombreCurso = matricula.seccion;
    var fechaInicio = new Date();
    for (var s = 1; s < secData.length; s++) {
      if (String(secData[s][0]) === matricula.seccion) {
        nombreCurso = String(secData[s][1] || matricula.seccion);
        if (secData[s][13] instanceof Date) fechaInicio = secData[s][13];
        break;
      }
    }
    
    // Determinar monto (cuota programada o saldo)
    var monto = matricula.saldo;
    try {
      var cuotas = getCuotasProgramadas(matriculaId);
      if (cuotas && cuotas.length > 0) {
        var pendientes = cuotas.filter(function(c) { return c.estado === 'Pendiente'; });
        if (pendientes.length > 0) monto = pendientes[0].monto;
      }
    } catch(e) {}
    
    var fechaLimite = Utilities.formatDate(fechaInicio, 'America/Lima', 'dd/MM/yyyy') + ' a las 17:00 hrs (hora Perú)';
    
    enviarPlantilla('recordatorio-pago', {
      alumno_nombre: alumno.nombre,
      email_alumno: alumno.email,
      nombre_curso: nombreCurso,
      precio: monto.toFixed(2),
      fecha_limite: fechaLimite,
      link_pago: 'https://payment-provider.example.com/pay/YOUR_PAYMENT_LINK',
      dias_para_inicio: 0
    });
    
    Logger.log('✅ Recordatorio enviado a ' + alumno.email);
    return { success: true, message: 'Recordatorio enviado a ' + alumno.nombre };
  } catch (error) {
    Logger.log('❌ [enviarRecordatorioManual] ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Envía recordatorios masivos a múltiples matrículas.
 * Máximo 20 por ejecución con delay de 2 segundos entre cada uno.
 */
function enviarRecordatoriosMasivo(matriculaIds) {
  try {
    Logger.log('📧 [enviarRecordatoriosMasivo] ' + matriculaIds.length + ' matrículas');
    
    var enviados = 0;
    var errores = 0;
    var max = Math.min(matriculaIds.length, 20);
    
    for (var i = 0; i < max; i++) {
      try {
        var resultado = enviarRecordatorioManual(matriculaIds[i]);
        if (resultado.success) {
          enviados++;
        } else {
          errores++;
          Logger.log('⚠️ Error en ' + matriculaIds[i] + ': ' + resultado.message);
        }
      } catch(e) {
        errores++;
        Logger.log('⚠️ Error en ' + matriculaIds[i] + ': ' + e.toString());
      }
      
      // Delay de 2 segundos entre envíos para evitar spam
      if (i < max - 1) Utilities.sleep(2000);
    }
    
    var msg = 'Enviados: ' + enviados + ' | Errores: ' + errores;
    Logger.log('📋 [enviarRecordatoriosMasivo] ' + msg);
    return { success: true, enviados: enviados, errores: errores, message: msg };
  } catch (error) {
    Logger.log('❌ [enviarRecordatoriosMasivo] ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
