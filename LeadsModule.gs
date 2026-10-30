/**
 * LeadsModule.gs - Funciones de gestión de Leads
 * Incluye trigger automático para mover leads a REMARKETING
 */

/**
 * Mueve leads a REMARKETING si han pasado 22+ horas reales desde el timestamp.
 * Aplica a leads con ESTADO_BOT = FINALIZADO o CONFIRMO_MEET.
 * Configurar como trigger de tiempo: cada hora.
 */
function moverLeadsARemarketing() {
  try {
    var ss = SpreadsheetApp.openById(LEADS_SHEET_ID);
    var sheet = ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    
    // Columnas que no se tocan
    var columnasProtegidas = ['ASISTIO_MEET_PC', 'ASISTIO_MEET_CP', 'CONVERTIDO', 'REMARKETING'];
    
    // Estados del bot que gatillan remarketing después de 22h
    var estadosParaRemarketing = ['FINALIZADO', 'CONFIRMO_MEET'];
    
    var cambios = 0;
    var ahora = new Date();
    
    for (var i = 1; i < data.length; i++) {
      var estadoBot = String(data[i][10] || '').trim().toUpperCase();
      var colN = String(data[i][13] || '').trim();
      var timestamp = data[i][0];
      
      // Solo procesar si el ESTADO_BOT es uno de los que gatillan remarketing
      if (estadosParaRemarketing.indexOf(estadoBot) === -1) continue;
      
      // No tocar si ya está en columna protegida
      if (columnasProtegidas.indexOf(colN) !== -1) continue;
      
      // Calcular horas reales desde timestamp (sin excluir días)
      var ts = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(ts.getTime())) continue;
      var horasReales = (ahora - ts) / 3600000;
      
      if (horasReales >= 22) {
        sheet.getRange(i + 1, 14).setValue('REMARKETING');
        cambios++;
      }
    }
    
    if (cambios > 0) {
      Logger.log('📢 [moverLeadsARemarketing] ' + cambios + ' leads movidos a REMARKETING');
    }
    
    return 'Movidos ' + cambios + ' leads a REMARKETING';
  } catch (error) {
    Logger.log('❌ [moverLeadsARemarketing] ERROR: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}

/**
 * Actualiza col N de múltiples leads en batch (una sola ejecución).
 * Recibe array de objetos [{fila: N, columna: 'VALOR'}]
 */
function actualizarColumnasLeadsBatch(cambios) {
  try {
    if (!cambios || cambios.length === 0) return { success: true, actualizados: 0 };
    
    var ss = SpreadsheetApp.openById(LEADS_SHEET_ID);
    var sheet = ss.getSheets()[0];
    
    for (var i = 0; i < cambios.length; i++) {
      sheet.getRange(cambios[i].fila, 14).setValue(cambios[i].columna);
    }
    
    return { success: true, actualizados: cambios.length };
  } catch (error) {
    Logger.log('❌ [actualizarColumnasLeadsBatch] ERROR: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Migra col N: reemplaza 'FINALIZADO' por 'RECONFIRMO_MEET' y
 * devuelve leads en REMARKETING cuyo ESTADO_BOT es NO_CONFIRMO_MEET a NO_CONFIRMO_MEET.
 * EJECUTAR UNA VEZ.
 */
function migrarFinalizadoAConfirmoMeet() {
  var ss = SpreadsheetApp.openById(LEADS_SHEET_ID);
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var cambios = 0;
  
  for (var i = 1; i < data.length; i++) {
    var colN = String(data[i][13] || '').trim();
    var estadoBot = String(data[i][10] || '').trim().toUpperCase();
    
    // Migrar FINALIZADO en col N a RECONFIRMO_MEET
    if (colN === 'FINALIZADO') {
      sheet.getRange(i + 1, 14).setValue('RECONFIRMO_MEET');
      cambios++;
    }
    
    // Devolver leads en REMARKETING cuyo bot es NO_CONFIRMO_MEET
    if (colN === 'REMARKETING' && estadoBot === 'NO_CONFIRMO_MEET') {
      sheet.getRange(i + 1, 14).setValue('NO_CONFIRMO_MEET');
      cambios++;
    }
  }
  
  Logger.log('✅ Migración completada: ' + cambios + ' leads actualizados');
  return 'Actualizados ' + cambios;
}
