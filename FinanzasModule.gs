/**
 * FINANZAS MODULE
 * Dashboard financiero, gastos fijos/variables, comisiones
 * 
 * Hojas requeridas:
 * - GastosFijos: Tipo, Concepto, Monto, Frecuencia, FechaInicio, FechaFin, Activo
 * - GastosVariables: ID, Tipo, Concepto, Monto, Fecha, FacturaDriveId, Notas
 * - Comisiones: MedioPago, PorcentajeNacional, PorcentajeInternacional, MontoFijo, IGV
 */

// ============================================
// INICIALIZACIÓN DE HOJAS
// ============================================

/**
 * Obtiene o crea la hoja de GastosFijos
 */
function getHojaGastosFijos_() {
  var ss = SpreadsheetApp.openById(DB_SHEET_ID);
  var sheet = ss.getSheetByName('GastosFijos');
  if (!sheet) {
    sheet = ss.insertSheet('GastosFijos');
    sheet.appendRow(['ID', 'Tipo', 'Concepto', 'Monto', 'Frecuencia', 'FechaInicio', 'FechaFin', 'Activo', 'Trabajador', 'FacturaDriveId', 'Excepciones']);
    Logger.log('✅ Hoja GastosFijos creada');
  }
  return sheet;
}

/**
 * Obtiene o crea la hoja de GastosVariables
 */
function getHojaGastosVariables_() {
  var ss = SpreadsheetApp.openById(DB_SHEET_ID);
  var sheet = ss.getSheetByName('GastosVariables');
  if (!sheet) {
    sheet = ss.insertSheet('GastosVariables');
    sheet.appendRow(['ID', 'Tipo', 'Concepto', 'Monto', 'Fecha', 'Categoria', 'FacturaDriveId', 'Notas']);
    Logger.log('✅ Hoja GastosVariables creada');
  }
  return sheet;
}

/**
 * Obtiene o crea la hoja de Comisiones
 */
function getHojaComisiones_() {
  var ss = SpreadsheetApp.openById(DB_SHEET_ID);
  var sheet = ss.getSheetByName('Comisiones');
  if (!sheet) {
    sheet = ss.insertSheet('Comisiones');
    sheet.appendRow(['MedioPago', 'PorcentajeNacional', 'PorcentajeInternacional', 'MontoFijo', 'IGV']);
    // Insertar datos por defecto
    sheet.appendRow(['Yape', 0, 0, 0, 0]);
    sheet.appendRow(['Plin', 0, 0, 0, 0]);
    sheet.appendRow(['Transferencia', 0, 0, 0, 0]);
    sheet.appendRow(['Openpay', 3.79, 4.45, 1, 18]);
    sheet.appendRow(['PayPal', 5.45, 5.45, 0.30, 0]);
    sheet.appendRow(['Shopify', 0, 0, 0, 0]);
    Logger.log('✅ Hoja Comisiones creada con datos por defecto');
  }
  return sheet;
}

/**
 * Inicializa las hojas de finanzas si no existen
 */
function inicializarHojasFinanzas() {
  getHojaGastosFijos_();
  getHojaGastosVariables_();
  getHojaComisiones_();
  return { success: true, message: 'Hojas de finanzas inicializadas' };
}

// ============================================
// GASTOS FIJOS - CRUD
// ============================================

/**
 * Obtiene todos los gastos fijos
 */
function getGastosFijos() {
  try {
    var sheet = getHojaGastosFijos_();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var gastos = [];
    for (var i = 1; i < data.length; i++) {
      var excepcionesRaw = String(data[i][10] || '');
      var excepciones = {};
      if (excepcionesRaw) {
        try { excepciones = JSON.parse(excepcionesRaw); } catch(e) {}
      }
      gastos.push({
        id: String(data[i][0] || ''),
        tipo: String(data[i][1] || ''),
        concepto: String(data[i][2] || ''),
        monto: parseFloat(data[i][3]) || 0,
        frecuencia: String(data[i][4] || 'mensual'),
        fechaInicio: String(data[i][5] || ''),
        fechaFin: String(data[i][6] || ''),
        activo: String(data[i][7] || 'Sí'),
        trabajador: String(data[i][8] || ''),
        facturaDriveId: String(data[i][9] || ''),
        excepciones: excepciones
      });
    }
    return gastos;
  } catch (error) {
    Logger.log('❌ Error en getGastosFijos: ' + error.toString());
    return [];
  }
}

/**
 * Guarda un gasto fijo (crear o actualizar)
 */
function saveGastoFijo(data) {
  try {
    Logger.log('💾 saveGastoFijo: ' + JSON.stringify(data));
    var sheet = getHojaGastosFijos_();
    
    if (data.id) {
      // Actualizar existente
      var allData = sheet.getDataRange().getValues();
      for (var i = 1; i < allData.length; i++) {
        if (String(allData[i][0]) === String(data.id)) {
          var excepcionesStr = data.excepciones ? JSON.stringify(data.excepciones) : '';
          sheet.getRange(i + 1, 2, 1, 10).setValues([[
            data.tipo, data.concepto, data.monto, data.frecuencia,
            data.fechaInicio, data.fechaFin, data.activo || 'Sí', data.trabajador || '', data.facturaDriveId || '', excepcionesStr
          ]]);
          return { success: true, message: 'Gasto fijo actualizado', id: data.id };
        }
      }
      return { success: false, message: 'Gasto fijo no encontrado' };
    } else {
      // Crear nuevo
      var id = 'GF-' + Date.now();
      var excepcionesStr2 = data.excepciones ? JSON.stringify(data.excepciones) : '';
      sheet.appendRow([
        id, data.tipo, data.concepto, data.monto, data.frecuencia,
        data.fechaInicio, data.fechaFin, data.activo || 'Sí', data.trabajador || '', data.facturaDriveId || '', excepcionesStr2
      ]);
      return { success: true, message: 'Gasto fijo creado', id: id };
    }
  } catch (error) {
    Logger.log('❌ Error en saveGastoFijo: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Elimina un gasto fijo
 */
function deleteGastoFijo(id) {
  try {
    var sheet = getHojaGastosFijos_();
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Gasto fijo eliminado' };
      }
    }
    return { success: false, message: 'Gasto fijo no encontrado' };
  } catch (error) {
    Logger.log('❌ Error en deleteGastoFijo: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// GASTOS VARIABLES - CRUD
// ============================================

/**
 * Obtiene todos los gastos variables
 */
function getGastosVariables() {
  try {
    var sheet = getHojaGastosVariables_();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var gastos = [];
    for (var i = 1; i < data.length; i++) {
      gastos.push({
        id: String(data[i][0] || ''),
        tipo: String(data[i][1] || ''),
        concepto: String(data[i][2] || ''),
        monto: parseFloat(data[i][3]) || 0,
        fecha: String(data[i][4] || ''),
        categoria: String(data[i][5] || ''),
        facturaDriveId: String(data[i][6] || ''),
        notas: String(data[i][7] || '')
      });
    }
    return gastos;
  } catch (error) {
    Logger.log('❌ Error en getGastosVariables: ' + error.toString());
    return [];
  }
}

/**
 * Guarda un gasto variable (crear o actualizar)
 */
function saveGastoVariable(data) {
  try {
    Logger.log('💾 saveGastoVariable: ' + JSON.stringify(data));
    var sheet = getHojaGastosVariables_();
    
    if (data.id) {
      // Actualizar existente
      var allData = sheet.getDataRange().getValues();
      for (var i = 1; i < allData.length; i++) {
        if (String(allData[i][0]) === String(data.id)) {
          sheet.getRange(i + 1, 2, 1, 7).setValues([[
            data.tipo, data.concepto, data.monto, data.fecha,
            data.categoria, data.facturaDriveId || '', data.notas || ''
          ]]);
          return { success: true, message: 'Gasto variable actualizado', id: data.id };
        }
      }
      return { success: false, message: 'Gasto variable no encontrado' };
    } else {
      // Crear nuevo
      var id = 'GV-' + Date.now();
      sheet.appendRow([
        id, data.tipo, data.concepto, data.monto, data.fecha,
        data.categoria, data.facturaDriveId || '', data.notas || ''
      ]);
      return { success: true, message: 'Gasto variable creado', id: id };
    }
  } catch (error) {
    Logger.log('❌ Error en saveGastoVariable: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Elimina un gasto variable
 */
function deleteGastoVariable(id) {
  try {
    var sheet = getHojaGastosVariables_();
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Gasto variable eliminado' };
      }
    }
    return { success: false, message: 'Gasto variable no encontrado' };
  } catch (error) {
    Logger.log('❌ Error en deleteGastoVariable: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Sube una factura a Drive y retorna el ID del archivo
 */
function subirFactura(base64Data, fileName, mimeType) {
  try {
    Logger.log('📎 subirFactura: ' + fileName);
    
    // Obtener o crear carpeta de facturas
    var folders = DriveApp.getFoldersByName('Educational CRM_Facturas');
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('Educational CRM_Facturas');
    }
    
    // Decodificar base64 y crear archivo
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);
    
    // Hacer el archivo accesible por enlace
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    Logger.log('✅ Factura subida: ' + file.getId());
    return { success: true, fileId: file.getId(), url: file.getUrl() };
  } catch (error) {
    Logger.log('❌ Error en subirFactura: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// COMISIONES - CRUD
// ============================================

/**
 * Obtiene la tabla de comisiones
 */
function getComisiones() {
  try {
    var sheet = getHojaComisiones_();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var comisiones = [];
    for (var i = 1; i < data.length; i++) {
      comisiones.push({
        medioPago: String(data[i][0] || ''),
        porcentajeNacional: parseFloat(data[i][1]) || 0,
        porcentajeInternacional: parseFloat(data[i][2]) || 0,
        montoFijo: parseFloat(data[i][3]) || 0,
        igv: parseFloat(data[i][4]) || 0
      });
    }
    return comisiones;
  } catch (error) {
    Logger.log('❌ Error en getComisiones: ' + error.toString());
    return [];
  }
}

/**
 * Guarda la tabla de comisiones completa (reemplaza todo)
 */
function saveComisiones(comisiones) {
  try {
    Logger.log('💾 saveComisiones: ' + comisiones.length + ' registros');
    var sheet = getHojaComisiones_();
    
    // Limpiar datos existentes (mantener header)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // Insertar nuevos datos
    comisiones.forEach(function(c) {
      sheet.appendRow([
        c.medioPago,
        c.porcentajeNacional || 0,
        c.porcentajeInternacional || 0,
        c.montoFijo || 0,
        c.igv || 0
      ]);
    });
    
    return { success: true, message: 'Comisiones actualizadas' };
  } catch (error) {
    Logger.log('❌ Error en saveComisiones: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// ============================================
// DASHBOARD FINANCIERO - Cálculos
// ============================================

/**
 * Obtiene datos del dashboard financiero con ingresos netos mensuales
 * Fórmula: Ingreso Neto = Pagos Recibidos - Comisiones - Gastos Fijos - Gastos Variables
 */
function getDashboardFinanciero(anio) {
  try {
    Logger.log('📊 [getDashboardFinanciero] Año: ' + anio);
    
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var year = parseInt(anio) || new Date().getFullYear();
    
    // 1. Obtener pagos del año
    var pagosSheet = ss.getSheetByName('Pagos');
    var pagos = [];
    if (pagosSheet) {
      var pagosData = pagosSheet.getDataRange().getValues();
      for (var p = 1; p < pagosData.length; p++) {
        var fechaPago = pagosData[p][7]; // Fecha_Pago está en col 7
        var fecha;
        if (fechaPago instanceof Date) {
          fecha = fechaPago;
        } else {
          fecha = new Date(fechaPago);
        }
        if (isNaN(fecha.getTime())) continue;
        if (fecha.getFullYear() !== year) continue;
        
        pagos.push({
          id: String(pagosData[p][0] || ''),
          matriculaId: String(pagosData[p][1] || ''),
          monto: parseFloat(pagosData[p][3]) || 0,
          fecha: fecha,
          mes: fecha.getMonth(), // 0-11
          medioPago: String(pagosData[p][4] || '') // Medio_Pago está en col 4
        });
      }
    }
    Logger.log('📊 Pagos del año ' + year + ': ' + pagos.length);
    
    // 2. Obtener datos de alumnos para determinar nacional/internacional
    var alumnosSheet = ss.getSheetByName('Alumnos');
    var matriculasSheet = ss.getSheetByName('Matriculas');
    var paisPorMatricula = {};
    
    if (alumnosSheet && matriculasSheet) {
      var alumnosData = alumnosSheet.getDataRange().getValues();
      var matriculasData = matriculasSheet.getDataRange().getValues();
      
      // Mapear alumnoId -> país
      var paisPorAlumno = {};
      for (var a = 1; a < alumnosData.length; a++) {
        paisPorAlumno[String(alumnosData[a][0])] = String(alumnosData[a][4] || '').trim().toLowerCase();
      }
      
      // Mapear matriculaId -> país del alumno
      for (var m = 1; m < matriculasData.length; m++) {
        var matId = String(matriculasData[m][0]);
        var almId = String(matriculasData[m][1]);
        paisPorMatricula[matId] = paisPorAlumno[almId] || '';
      }
    }
    
    // 3. Obtener comisiones
    var comisiones = getComisiones();
    var comisionesMap = {};
    comisiones.forEach(function(c) {
      comisionesMap[c.medioPago] = c;
    });
    
    // 4. Calcular ingresos brutos y comisiones por mes
    var meses = [];
    for (var i = 0; i < 12; i++) {
      meses.push({
        mes: i,
        nombreMes: getNombreMes_(i),
        ingresosBrutos: 0,
        comisiones: 0,
        gastosFijos: 0,
        gastosVariables: 0,
        ingresoNeto: 0
      });
    }
    
    pagos.forEach(function(pago) {
      meses[pago.mes].ingresosBrutos += pago.monto;
      
      // Calcular comisión para este pago
      var comision = comisionesMap[pago.medioPago];
      if (comision) {
        var pais = paisPorMatricula[pago.matriculaId] || '';
        var esNacional = (pais === 'perú' || pais === 'peru' || pais === 'pe');
        var porcentaje = esNacional ? comision.porcentajeNacional : comision.porcentajeInternacional;
        
        // Calcular comisión con IGV si aplica
        var comisionMonto = (pago.monto * porcentaje / 100);
        if (comision.igv > 0) {
          comisionMonto = comisionMonto * (1 + comision.igv / 100);
        }
        comisionMonto += comision.montoFijo;
        
        meses[pago.mes].comisiones += comisionMonto;
      }
    });
    
    // 5. Obtener gastos fijos del año
    var gastosFijos = getGastosFijos();
    gastosFijos.forEach(function(gf) {
      if (gf.activo !== 'Sí') return;
      
      var fechaInicio = gf.fechaInicio ? new Date(gf.fechaInicio) : new Date(year, 0, 1);
      var fechaFin = gf.fechaFin ? new Date(gf.fechaFin) : new Date(year, 11, 31);
      
      // Determinar en qué meses aplica según frecuencia
      var intervaloMeses = 1; // mensual por defecto
      if (gf.frecuencia === 'bimestral') intervaloMeses = 2;
      else if (gf.frecuencia === 'trimestral') intervaloMeses = 3;
      else if (gf.frecuencia === 'semestral') intervaloMeses = 6;
      else if (gf.frecuencia === 'anual') intervaloMeses = 12;
      
      var mesInicio = (fechaInicio.getFullYear() < year) ? 0 : fechaInicio.getMonth();
      
      for (var mes = 0; mes < 12; mes++) {
        var fechaMes = new Date(year, mes, 15);
        if (fechaMes < fechaInicio || fechaMes > fechaFin) continue;
        
        var aplicaEsteMes = false;
        if (gf.frecuencia === 'mensual') {
          aplicaEsteMes = true;
        } else {
          // Para frecuencias no mensuales, aplicar cada N meses desde el mes de inicio
          var diffMeses = (year * 12 + mes) - (fechaInicio.getFullYear() * 12 + fechaInicio.getMonth());
          if (diffMeses >= 0 && diffMeses % intervaloMeses === 0) {
            aplicaEsteMes = true;
          }
        }
        
        if (aplicaEsteMes) {
          // Verificar si hay excepción para este mes
          var claveMes = year + '-' + String(mes + 1).padStart(2, '0');
          var montoMes = gf.monto;
          if (gf.excepciones && gf.excepciones[claveMes]) {
            montoMes = parseFloat(gf.excepciones[claveMes].monto) || gf.monto;
          }
          meses[mes].gastosFijos += montoMes;
        }
      }
    });
    
    // 6. Obtener gastos variables del año
    var gastosVariables = getGastosVariables();
    gastosVariables.forEach(function(gv) {
      var fecha = new Date(gv.fecha);
      if (isNaN(fecha.getTime())) return;
      if (fecha.getFullYear() !== year) return;
      meses[fecha.getMonth()].gastosVariables += gv.monto;
    });
    
    // 7. Calcular ingreso neto por mes
    var totalBruto = 0, totalComisiones = 0, totalGastosFijos = 0, totalGastosVariables = 0, totalNeto = 0;
    
    meses.forEach(function(m) {
      m.ingresoNeto = m.ingresosBrutos - m.comisiones - m.gastosFijos - m.gastosVariables;
      totalBruto += m.ingresosBrutos;
      totalComisiones += m.comisiones;
      totalGastosFijos += m.gastosFijos;
      totalGastosVariables += m.gastosVariables;
      totalNeto += m.ingresoNeto;
    });
    
    var resultado = {
      anio: year,
      meses: meses,
      totales: {
        ingresosBrutos: totalBruto,
        comisiones: totalComisiones,
        gastosFijos: totalGastosFijos,
        gastosVariables: totalGastosVariables,
        ingresoNeto: totalNeto
      }
    };
    
    Logger.log('✅ [getDashboardFinanciero] Bruto: $' + totalBruto.toFixed(2) + ', Neto: $' + totalNeto.toFixed(2));
    return resultado;
  } catch (error) {
    Logger.log('❌ [getDashboardFinanciero] ERROR: ' + error.toString());
    return {
      anio: anio || new Date().getFullYear(),
      meses: [],
      totales: { ingresosBrutos: 0, comisiones: 0, gastosFijos: 0, gastosVariables: 0, ingresoNeto: 0 }
    };
  }
}

/**
 * Helper: nombre del mes en español
 */
function getNombreMes_(index) {
  var nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return nombres[index] || '';
}

/**
 * Guarda una excepción de monto para un gasto fijo en un mes específico
 * @param {string} gastoFijoId - ID del gasto fijo
 * @param {string} mesAnio - Formato "YYYY-MM" (ej: "2026-06")
 * @param {number} monto - Monto para ese mes
 * @param {string} motivo - Razón del ajuste (ej: "Descuento por falta", "Bono")
 */
function saveExcepcionGastoFijo(gastoFijoId, mesAnio, monto, motivo) {
  try {
    var sheet = getHojaGastosFijos_();
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(gastoFijoId)) {
        var excepcionesRaw = String(data[i][10] || '');
        var excepciones = {};
        if (excepcionesRaw) {
          try { excepciones = JSON.parse(excepcionesRaw); } catch(e) {}
        }
        
        if (monto === null || monto === undefined) {
          // Eliminar excepción
          delete excepciones[mesAnio];
        } else {
          excepciones[mesAnio] = { monto: monto, motivo: motivo || '' };
        }
        
        sheet.getRange(i + 1, 11).setValue(JSON.stringify(excepciones));
        return { success: true, message: 'Excepción guardada para ' + mesAnio, excepciones: excepciones };
      }
    }
    return { success: false, message: 'Gasto fijo no encontrado' };
  } catch (error) {
    Logger.log('❌ Error en saveExcepcionGastoFijo: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Elimina una excepción de un gasto fijo
 */
function deleteExcepcionGastoFijo(gastoFijoId, mesAnio) {
  return saveExcepcionGastoFijo(gastoFijoId, mesAnio, null, null);
}

/**
 * Proyección de gastos del próximo mes
 * Retorna el desglose de gastos fijos que aplicarán el mes siguiente
 */
function getProyeccionProximoMes() {
  try {
    var hoy = new Date();
    var mesProximo = hoy.getMonth() + 1; // 0-11 + 1
    var anioProximo = hoy.getFullYear();
    if (mesProximo > 11) { mesProximo = 0; anioProximo++; }
    
    var gastosFijos = getGastosFijos();
    var proyeccion = [];
    var totalProyectado = 0;
    
    gastosFijos.forEach(function(gf) {
      if (gf.activo !== 'Sí') return;
      
      var fechaInicio = gf.fechaInicio ? new Date(gf.fechaInicio) : new Date(2020, 0, 1);
      var fechaFin = gf.fechaFin ? new Date(gf.fechaFin) : new Date(2099, 11, 31);
      var fechaMes = new Date(anioProximo, mesProximo, 15);
      
      if (fechaMes < fechaInicio || fechaMes > fechaFin) return;
      
      var intervaloMeses = 1;
      if (gf.frecuencia === 'bimestral') intervaloMeses = 2;
      else if (gf.frecuencia === 'trimestral') intervaloMeses = 3;
      else if (gf.frecuencia === 'semestral') intervaloMeses = 6;
      else if (gf.frecuencia === 'anual') intervaloMeses = 12;
      
      var aplicaEsteMes = false;
      if (gf.frecuencia === 'mensual') {
        aplicaEsteMes = true;
      } else {
        var diffMeses = (anioProximo * 12 + mesProximo) - (fechaInicio.getFullYear() * 12 + fechaInicio.getMonth());
        if (diffMeses >= 0 && diffMeses % intervaloMeses === 0) {
          aplicaEsteMes = true;
        }
      }
      
      if (aplicaEsteMes) {
        var claveMes = anioProximo + '-' + String(mesProximo + 1).padStart(2, '0');
        var montoMes = gf.monto;
        var motivo = '';
        if (gf.excepciones && gf.excepciones[claveMes]) {
          montoMes = parseFloat(gf.excepciones[claveMes].monto) || gf.monto;
          motivo = gf.excepciones[claveMes].motivo || '';
        }
        
        proyeccion.push({
          id: gf.id,
          tipo: gf.tipo,
          concepto: gf.concepto,
          montoBase: gf.monto,
          montoProyectado: montoMes,
          tieneExcepcion: !!motivo,
          motivo: motivo,
          trabajador: gf.trabajador
        });
        totalProyectado += montoMes;
      }
    });
    
    return {
      mes: getNombreMes_(mesProximo),
      anio: anioProximo,
      claveMes: anioProximo + '-' + String(mesProximo + 1).padStart(2, '0'),
      gastos: proyeccion,
      total: totalProyectado
    };
  } catch (error) {
    Logger.log('❌ Error en getProyeccionProximoMes: ' + error.toString());
    return { mes: '', anio: 0, gastos: [], total: 0 };
  }
}

// ============================================
// GASTOS AUTOMÁTICOS DE DOCENTES
// ============================================

/**
 * Calcula y registra automáticamente los pagos a docentes como gastos variables.
 * Lógica: Si la última clase (evento en Google Calendar) de una sección ya pasó,
 * se registra el gasto = tarifa_hora × horas_totales_del_curso.
 * 
 * Se ejecuta manualmente o con trigger. No duplica si ya existe el gasto.
 */
function calcularGastosDocentes() {
  try {
    Logger.log('🎓 [calcularGastosDocentes] INICIANDO...');
    
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var seccionesSheet = ss.getSheetByName('Secciones');
    var docentesSheet = ss.getSheetByName('Docentes');
    
    if (!seccionesSheet || !docentesSheet) {
      return { success: false, message: 'Hojas Secciones o Docentes no encontradas' };
    }
    
    var secData = seccionesSheet.getDataRange().getValues();
    var docData = docentesSheet.getDataRange().getValues();
    
    // Mapear docentes: id -> { nombre, tarifa }
    var docentesMap = {};
    for (var d = 1; d < docData.length; d++) {
      docentesMap[String(docData[d][0])] = {
        nombre: String(docData[d][1] || ''),
        tarifa: parseFloat(docData[d][7]) || 0
      };
    }
    
    // Obtener gastos variables existentes para no duplicar
    var gastosExistentes = getGastosVariables();
    var gastosDocenteExistentes = {};
    gastosExistentes.forEach(function(g) {
      if (g.tipo === 'Docente') {
        gastosDocenteExistentes[g.concepto] = true;
      }
    });
    
    var hoy = new Date();
    var calendar = CalendarApp.getDefaultCalendar();
    var gastosCreados = 0;
    var gastosOmitidos = 0;
    var errores = [];
    
    // Procesar cada sección
    for (var s = 1; s < secData.length; s++) {
      var codigoSeccion = String(secData[s][0] || '');
      var docenteId = String(secData[s][5] || '');
      var horas = parseFloat(secData[s][7]) || 0;
      
      if (!codigoSeccion || !docenteId || horas <= 0) continue;
      
      var docente = docentesMap[docenteId];
      if (!docente || docente.tarifa <= 0) continue;
      
      // Extraer mes/año del código de sección (ej: SAA0526-A → mes=05, año=2026)
      var match = codigoSeccion.match(/(\d{2})(\d{2})-/);
      if (!match) continue;
      
      var mesSec = parseInt(match[1]); // 01-12
      var anioSec = 2000 + parseInt(match[2]); // 26 → 2026
      
      // Solo procesar secciones del mes actual o anteriores del mismo año
      var fechaFinMes = new Date(anioSec, mesSec, 0); // Último día del mes de la sección
      if (fechaFinMes > hoy) continue; // El mes aún no terminó
      
      // Verificar si ya existe el gasto para esta sección
      var conceptoGasto = codigoSeccion + ' - ' + docente.nombre;
      if (gastosDocenteExistentes[conceptoGasto]) {
        gastosOmitidos++;
        continue;
      }
      
      // Buscar eventos en el calendario para esta sección
      var fechaInicioMes = new Date(anioSec, mesSec - 1, 1);
      var fechaFinBusqueda = new Date(anioSec, mesSec, 0, 23, 59, 59);
      
      try {
        var eventos = calendar.getEvents(fechaInicioMes, fechaFinBusqueda, { search: codigoSeccion });
        
        if (eventos.length === 0) {
          // No hay eventos, no registrar gasto
          continue;
        }
        
        // Encontrar la última clase
        var ultimaClase = eventos[eventos.length - 1].getStartTime();
        
        // Si la última clase ya pasó, registrar el gasto
        if (ultimaClase <= hoy) {
          var monto = docente.tarifa * horas;
          var fechaGasto = ultimaClase.toISOString().split('T')[0];
          
          var resultado = saveGastoVariable({
            tipo: 'Docente',
            concepto: conceptoGasto,
            monto: monto,
            fecha: fechaGasto,
            categoria: 'Docente',
            notas: 'Auto-generado. Tarifa: $' + docente.tarifa + '/hr × ' + horas + ' hrs. Eventos: ' + eventos.length
          });
          
          if (resultado.success) {
            gastosCreados++;
            Logger.log('✅ Gasto docente creado: ' + conceptoGasto + ' $' + monto.toFixed(2));
          } else {
            errores.push(codigoSeccion + ': ' + resultado.message);
          }
        }
      } catch (calError) {
        errores.push(codigoSeccion + ': Error calendario - ' + calError.toString());
      }
    }
    
    var msg = '🎓 Gastos docentes: ' + gastosCreados + ' creados, ' + gastosOmitidos + ' ya existían';
    if (errores.length > 0) msg += '. Errores: ' + errores.length;
    Logger.log(msg);
    
    return {
      success: true,
      message: msg,
      creados: gastosCreados,
      omitidos: gastosOmitidos,
      errores: errores
    };
  } catch (error) {
    Logger.log('❌ [calcularGastosDocentes] ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * DIAGNÓSTICO: Muestra la estructura real de la hoja Pagos y datos de mayo
 * Ejecutar desde el editor de Apps Script para ver los logs
 */
function diagnosticoPagosMayo() {
  try {
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var pagosSheet = ss.getSheetByName('Pagos');
    if (!pagosSheet) {
      Logger.log('❌ Hoja Pagos no encontrada');
      return { error: 'Hoja Pagos no encontrada' };
    }
    
    var data = pagosSheet.getDataRange().getValues();
    Logger.log('📋 Total filas en Pagos: ' + data.length);
    Logger.log('📋 Headers: ' + JSON.stringify(data[0]));
    
    // Mostrar primeras 5 filas de datos
    Logger.log('📋 Primeras 5 filas de datos:');
    for (var i = 1; i < Math.min(6, data.length); i++) {
      Logger.log('  Fila ' + i + ': ' + JSON.stringify(data[i]));
    }
    
    // Buscar pagos de mayo 2025 o 2026
    var pagosMayo = [];
    var year = new Date().getFullYear();
    
    for (var p = 1; p < data.length; p++) {
      // Intentar con cada columna para encontrar la fecha
      for (var col = 0; col < data[p].length; col++) {
        var val = data[p][col];
        var fecha = null;
        if (val instanceof Date) {
          fecha = val;
        } else if (typeof val === 'string' && val.length > 5) {
          fecha = new Date(val);
        }
        if (fecha && !isNaN(fecha.getTime()) && fecha.getMonth() === 4) { // Mayo = 4
          pagosMayo.push({
            fila: p,
            columnaFecha: col,
            fecha: fecha.toISOString(),
            datos: JSON.stringify(data[p])
          });
          break;
        }
      }
    }
    
    Logger.log('📋 Pagos encontrados en MAYO (cualquier año): ' + pagosMayo.length);
    pagosMayo.forEach(function(pm) {
      Logger.log('  Fila ' + pm.fila + ' | Col fecha: ' + pm.columnaFecha + ' | ' + pm.fecha);
      Logger.log('    Datos: ' + pm.datos);
    });
    
    return {
      totalFilas: data.length,
      headers: data[0],
      primeras5: data.slice(1, 6),
      pagosMayo: pagosMayo.length,
      detalleMayo: pagosMayo.slice(0, 10)
    };
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return { error: error.toString() };
  }
}


/**
 * Diagnóstico llamable desde frontend - retorna info de la hoja Pagos
 */
function diagnosticoFinanzas() {
  try {
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var pagosSheet = ss.getSheetByName('Pagos');
    if (!pagosSheet) return { error: 'Hoja Pagos no encontrada', hojas: ss.getSheets().map(function(s) { return s.getName(); }) };
    
    var data = pagosSheet.getDataRange().getValues();
    var headers = data[0];
    var totalFilas = data.length - 1;
    
    // Buscar pagos de mayo del año actual
    var year = new Date().getFullYear();
    var pagosMayo = 0;
    var sumaMayo = 0;
    var ejemplosMayo = [];
    
    for (var p = 1; p < data.length; p++) {
      // Probar columna 7 (Fecha_Pago)
      var fechaVal = data[p][7];
      var fecha = null;
      if (fechaVal instanceof Date) {
        fecha = fechaVal;
      } else if (fechaVal) {
        fecha = new Date(String(fechaVal));
      }
      
      if (fecha && !isNaN(fecha.getTime()) && fecha.getMonth() === 4 && fecha.getFullYear() === year) {
        pagosMayo++;
        sumaMayo += parseFloat(data[p][3]) || 0;
        if (ejemplosMayo.length < 5) {
          ejemplosMayo.push({
            id: String(data[p][0]),
            matricula: String(data[p][1]),
            monto: parseFloat(data[p][3]) || 0,
            fecha: fecha.toISOString().split('T')[0],
            medioPago: String(data[p][4] || ''),
            rawFecha: String(fechaVal)
          });
        }
      }
    }
    
    // Si no encontró en col 7, probar todas las columnas
    var colFechaDetectada = -1;
    if (pagosMayo === 0) {
      for (var col = 0; col < headers.length; col++) {
        var headerLower = String(headers[col]).toLowerCase();
        if (headerLower.indexOf('fecha') !== -1) {
          colFechaDetectada = col;
          for (var p2 = 1; p2 < data.length; p2++) {
            var fv = data[p2][col];
            var f2 = null;
            if (fv instanceof Date) f2 = fv;
            else if (fv) f2 = new Date(String(fv));
            if (f2 && !isNaN(f2.getTime()) && f2.getMonth() === 4 && f2.getFullYear() === year) {
              pagosMayo++;
              sumaMayo += parseFloat(data[p2][3]) || 0;
              if (ejemplosMayo.length < 5) {
                ejemplosMayo.push({
                  id: String(data[p2][0]),
                  monto: parseFloat(data[p2][3]) || 0,
                  fecha: f2.toISOString().split('T')[0],
                  medioPago: String(data[p2][4] || ''),
                  rawFecha: String(fv),
                  colUsada: col
                });
              }
            }
          }
          if (pagosMayo > 0) break;
        }
      }
    }
    
    return {
      headers: headers,
      totalPagos: totalFilas,
      anio: year,
      pagosMayo: pagosMayo,
      sumaMayo: sumaMayo,
      ejemplosMayo: ejemplosMayo,
      colFechaDetectada: colFechaDetectada,
      primeraFila: data.length > 1 ? data[1] : [],
      nota: pagosMayo === 0 ? 'No se encontraron pagos en mayo ' + year + '. Verificar formato de fecha.' : 'OK'
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Diagnóstico de pagos de marzo - analiza si hay forma de distinguir históricos
 */
function diagnosticoMarzo() {
  try {
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var pagosSheet = ss.getSheetByName('Pagos');
    var matriculasSheet = ss.getSheetByName('Matriculas');
    if (!pagosSheet) return { error: 'Hoja Pagos no encontrada' };
    
    var pagosData = pagosSheet.getDataRange().getValues();
    var year = new Date().getFullYear(); // 2026
    
    // Recopilar pagos de marzo 2026
    var pagosMarzo = [];
    for (var p = 1; p < pagosData.length; p++) {
      var fechaVal = pagosData[p][7]; // Fecha_Pago col 7
      var fecha = null;
      if (fechaVal instanceof Date) fecha = fechaVal;
      else if (fechaVal) fecha = new Date(String(fechaVal));
      
      if (fecha && !isNaN(fecha.getTime()) && fecha.getMonth() === 2 && fecha.getFullYear() === year) {
        pagosMarzo.push({
          id: String(pagosData[p][0]),
          matriculaId: String(pagosData[p][1]),
          cuota: pagosData[p][2],
          monto: parseFloat(pagosData[p][3]) || 0,
          medioPago: String(pagosData[p][4] || ''),
          tipoPago: String(pagosData[p][5] || ''),
          idOperacion: String(pagosData[p][6] || ''),
          fechaPago: fecha,
          fechaDia: fecha.getDate()
        });
      }
    }
    
    // Analizar patrones en los pagos de marzo
    var porDia = {};
    var conOperacion = 0;
    var sinOperacion = 0;
    var mediosPago = {};
    var tiposPago = {};
    
    pagosMarzo.forEach(function(pm) {
      var dia = pm.fechaDia;
      porDia[dia] = (porDia[dia] || 0) + 1;
      if (pm.idOperacion && pm.idOperacion.trim()) conOperacion++;
      else sinOperacion++;
      mediosPago[pm.medioPago || '(vacío)'] = (mediosPago[pm.medioPago || '(vacío)'] || 0) + 1;
      tiposPago[pm.tipoPago || '(vacío)'] = (tiposPago[pm.tipoPago || '(vacío)'] || 0) + 1;
    });
    
    // Verificar si la hoja Matriculas tiene FechaMatricula que podría indicar fecha real
    var matriculasFechas = {};
    if (matriculasSheet) {
      var matData = matriculasSheet.getDataRange().getValues();
      var matHeaders = matData[0];
      // Buscar columna de fecha de matrícula
      var colFechaMat = -1;
      for (var h = 0; h < matHeaders.length; h++) {
        var hName = String(matHeaders[h]).toLowerCase();
        if (hName.indexOf('fecha') !== -1) {
          colFechaMat = h;
          break;
        }
      }
      
      if (colFechaMat >= 0) {
        for (var m = 1; m < matData.length; m++) {
          var matId = String(matData[m][0]);
          var fechaMat = matData[m][colFechaMat];
          if (fechaMat instanceof Date) {
            matriculasFechas[matId] = fechaMat;
          } else if (fechaMat) {
            var parsed = new Date(String(fechaMat));
            if (!isNaN(parsed.getTime())) matriculasFechas[matId] = parsed;
          }
        }
      }
    }
    
    // Para los pagos de marzo, ver si la matrícula tiene fecha anterior
    var pagosConMatAnterior = 0;
    var pagosConMatMarzo = 0;
    var ejemplosHistoricos = [];
    
    pagosMarzo.forEach(function(pm) {
      var fechaMat = matriculasFechas[pm.matriculaId];
      if (fechaMat) {
        if (fechaMat.getMonth() < 2 || fechaMat.getFullYear() < year) {
          pagosConMatAnterior++;
          if (ejemplosHistoricos.length < 5) {
            ejemplosHistoricos.push({
              pagoId: pm.id,
              matriculaId: pm.matriculaId,
              monto: pm.monto,
              fechaPago: pm.fechaPago.toISOString().split('T')[0],
              fechaMatricula: fechaMat.toISOString().split('T')[0]
            });
          }
        } else {
          pagosConMatMarzo++;
        }
      }
    });
    
    // Buscar si hay concentración en un solo día (indicaría carga masiva)
    var diasConMasPagos = Object.keys(porDia).sort(function(a, b) { return porDia[b] - porDia[a]; }).slice(0, 5);
    
    return {
      totalPagosMarzo: pagosMarzo.length,
      sumaMarzo: pagosMarzo.reduce(function(s, p) { return s + p.monto; }, 0),
      distribucionPorDia: porDia,
      diasConMasPagos: diasConMasPagos.map(function(d) { return { dia: d, pagos: porDia[d] }; }),
      conIdOperacion: conOperacion,
      sinIdOperacion: sinOperacion,
      mediosPago: mediosPago,
      tiposPago: tiposPago,
      analisisMatriculas: {
        pagosConMatriculaAnteriorAMarzo: pagosConMatAnterior,
        pagosConMatriculaEnMarzo: pagosConMatMarzo,
        sinDatoMatricula: pagosMarzo.length - pagosConMatAnterior - pagosConMatMarzo,
        ejemplosHistoricos: ejemplosHistoricos
      },
      conclusion: pagosConMatAnterior > pagosMarzo.length * 0.5 
        ? 'PROBABLE CARGA MASIVA: ' + pagosConMatAnterior + ' de ' + pagosMarzo.length + ' pagos tienen matrícula anterior a marzo. Se recomienda filtrar desde mayo.'
        : 'Los pagos de marzo parecen legítimos en su mayoría.'
    };
  } catch (error) {
    return { error: error.toString() };
  }
}


/**
 * Diagnóstico: Lee los headers reales del sheet de Leads
 */
function diagnosticoLeadsHeaders() {
  try {
    var ss = SpreadsheetApp.openById(LEADS_SHEET_ID);
    var sheet = ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var totalCols = headers.length;
    var totalFilas = data.length - 1;
    
    var resultado = [];
    for (var i = 0; i < headers.length; i++) {
      var colLetra = '';
      var n = i;
      while (n >= 0) {
        colLetra = String.fromCharCode(65 + (n % 26)) + colLetra;
        n = Math.floor(n / 26) - 1;
      }
      resultado.push({
        indice: i,
        columna: colLetra,
        header: String(headers[i] || '(vacío)'),
        ejemplo: data.length > 1 ? String(data[1][i] || '').substring(0, 50) : ''
      });
    }
    
    return {
      sheetName: sheet.getName(),
      totalColumnas: totalCols,
      totalFilas: totalFilas,
      headers: resultado
    };
  } catch (error) {
    return { error: error.toString() };
  }
}


/**
 * Diagnóstico: Verifica el código de curso (col 19) para secciones GCDL y GACE
 */
function diagnosticoCodigosCursoSimulador() {
  try {
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var secSheet = ss.getSheetByName('Secciones');
    var data = secSheet.getDataRange().getValues();
    var headers = data[0];
    
    Logger.log('📋 Header col 19: ' + String(headers[19] || '(vacío)'));
    Logger.log('📋 Total secciones: ' + (data.length - 1));
    
    Logger.log('');
    Logger.log('=== SECCIONES GCDL ===');
    for (var i = 1; i < data.length; i++) {
      var codigo = String(data[i][0] || '');
      if (codigo.indexOf('GCDL') === 0) {
        var codigoCurso = String(data[i][19] || '(VACÍO)');
        Logger.log('  ' + codigo + ' | Nombre: ' + String(data[i][1] || '') + ' | CodigoCurso(col19): ' + codigoCurso);
      }
    }
    
    Logger.log('');
    Logger.log('=== SECCIONES GACE ===');
    for (var j = 1; j < data.length; j++) {
      var codigo2 = String(data[j][0] || '');
      if (codigo2.indexOf('GACE') === 0) {
        var codigoCurso2 = String(data[j][19] || '(VACÍO)');
        Logger.log('  ' + codigo2 + ' | Nombre: ' + String(data[j][1] || '') + ' | CodigoCurso(col19): ' + codigoCurso2);
      }
    }
    
    return 'Ver logs';
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}


// ============================================
// EDICIÓN DE CUOTAS PROGRAMADAS (Mantenimiento)
// ============================================

/**
 * Busca cuotas programadas por ID de matrícula o nombre de alumno
 */
function buscarCuotasParaEditar(termino) {
  try {
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var matSheet = ss.getSheetByName('Matriculas');
    var almSheet = ss.getSheetByName('Alumnos');
    var matData = matSheet.getDataRange().getValues();
    var almData = almSheet.getDataRange().getValues();
    
    // Buscar matrícula por ID o por nombre de alumno
    var matriculaId = '';
    var alumnoNombre = '';
    var seccion = '';
    var idVenta = '';
    
    var terminoLower = termino.toLowerCase().trim();
    var terminoDigits = termino.replace(/[^\d]/g, '');
    
    // Mapear alumnos
    var alumnosMap = {};
    for (var a = 1; a < almData.length; a++) {
      alumnosMap[String(almData[a][0])] = { nombre: String(almData[a][1] || ''), telefono: String(almData[a][3] || '') };
    }
    
    for (var i = 1; i < matData.length; i++) {
      var matId = String(matData[i][0] || '');
      var almId = String(matData[i][1] || '');
      var alumno = alumnosMap[almId];
      
      // Buscar por ID de matrícula
      if (matId.toLowerCase() === terminoLower) {
        matriculaId = matId;
        alumnoNombre = alumno ? alumno.nombre : '';
        seccion = String(matData[i][2] || '');
        idVenta = String(matData[i][12] || '');
        break;
      }
      // Buscar por nombre de alumno
      if (alumno && alumno.nombre.toLowerCase().includes(terminoLower)) {
        matriculaId = matId;
        alumnoNombre = alumno.nombre;
        seccion = String(matData[i][2] || '');
        idVenta = String(matData[i][12] || '');
        break;
      }
      // Buscar por teléfono
      if (terminoDigits.length >= 4 && alumno) {
        var telDigits = alumno.telefono.replace(/[^\d]/g, '');
        if (telDigits.includes(terminoDigits) || terminoDigits.includes(telDigits)) {
          matriculaId = matId;
          alumnoNombre = alumno.nombre;
          seccion = String(matData[i][2] || '');
          idVenta = String(matData[i][12] || '');
          break;
        }
      }
    }
    
    if (!matriculaId) return { success: false, message: 'No se encontró matrícula con ese término' };
    if (!idVenta) return { success: false, message: 'Matrícula ' + matriculaId + ' no tiene ID de venta asociado' };
    
    // Obtener cuotas
    var cuotas = getCuotasProgramadasPorVenta(idVenta);
    
    return {
      success: true,
      matriculaId: matriculaId,
      alumno: alumnoNombre,
      seccion: seccion,
      idVenta: idVenta,
      cuotas: cuotas
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza las cuotas programadas de una venta (reemplaza todas)
 */
function actualizarCuotasProgramadas(idVenta, cuotas) {
  try {
    Logger.log('📅 [actualizarCuotasProgramadas] venta=' + idVenta + ' cuotas=' + cuotas.length);
    
    var ss = SpreadsheetApp.openById(DB_SHEET_ID);
    var sheet = ss.getSheetByName('CuotasProgramadas');
    if (!sheet) return { success: false, message: 'Hoja CuotasProgramadas no encontrada' };
    
    var data = sheet.getDataRange().getValues();
    
    // Eliminar cuotas existentes de esta venta (de abajo hacia arriba)
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]) === String(idVenta)) {
        sheet.deleteRow(i + 1);
      }
    }
    
    // Insertar nuevas cuotas
    cuotas.forEach(function(c) {
      sheet.appendRow([idVenta, c.numero, c.monto, c.fechaVencimiento || '', 'Pendiente']);
    });
    
    Logger.log('✅ [actualizarCuotasProgramadas] ' + cuotas.length + ' cuotas actualizadas');
    return { success: true, message: 'Cuotas actualizadas: ' + cuotas.length };
  } catch (error) {
    Logger.log('❌ [actualizarCuotasProgramadas] ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
