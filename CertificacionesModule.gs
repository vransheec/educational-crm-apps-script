/**
 * CERTIFICACIONES MODULE
 * Gestión de certificaciones y exámenes
 */

/**
 * Obtiene todas las certificaciones
 */
function getCertificaciones() {
  try {
    Logger.log('=== getCertificaciones ===');
    
    const sheet = getSheet(SHEETS.certificaciones);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const certificaciones = data.slice(1).map(row => ({
      Codigo: row[0],
      Nombre: row[1],
      Tecnologia: row[2],
      Provider: row[3],
      Nivel: row[4],
      Descripcion: row[5],
      Duracion: row[6] || '',
      Precio: row[7] || 0,
      Requisitos: row[8] || '',
      Estado: row[9] || 'Activa',
      FechaCreacion: row[10]
    }));
    
    Logger.log('Certificaciones encontradas: ' + certificaciones.length);
    return certificaciones;
  } catch (error) {
    Logger.log('ERROR en getCertificaciones: ' + error.toString());
    return [];
  }
}

/**
 * Guarda una nueva certificación
 */
function guardarCertificacion(datosCertificacion) {
  try {
    Logger.log('=== guardarCertificacion ===');
    
    const sheet = getSheet(SHEETS.certificaciones);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de certificaciones' };
    }
    
    sheet.appendRow([
      datosCertificacion.codigo,
      datosCertificacion.nombre,
      datosCertificacion.tecnologia,
      datosCertificacion.provider,
      datosCertificacion.nivel,
      datosCertificacion.descripcion || '',
      datosCertificacion.duracion || '',
      datosCertificacion.precio || 0,
      datosCertificacion.requisitos || '',
      datosCertificacion.estado || 'Activa',
      new Date()
    ]);
    
    Logger.log('Certificación guardada: ' + datosCertificacion.codigo);
    
    return {
      success: true,
      message: 'Certificación creada correctamente',
      codigo: datosCertificacion.codigo
    };
  } catch (error) {
    Logger.log('ERROR en guardarCertificacion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza una certificación existente
 */
function actualizarCertificacion(codigo, datosCertificacion) {
  try {
    Logger.log('=== actualizarCertificacion: ' + codigo + ' ===');
    
    const sheet = getSheet(SHEETS.certificaciones);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de certificaciones' };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === codigo) {
        // Actualizar la fila
        sheet.getRange(i + 1, 2).setValue(datosCertificacion.nombre);
        sheet.getRange(i + 1, 3).setValue(datosCertificacion.tecnologia);
        sheet.getRange(i + 1, 4).setValue(datosCertificacion.provider);
        sheet.getRange(i + 1, 5).setValue(datosCertificacion.nivel);
        sheet.getRange(i + 1, 6).setValue(datosCertificacion.descripcion);
        sheet.getRange(i + 1, 7).setValue(datosCertificacion.duracion);
        sheet.getRange(i + 1, 8).setValue(datosCertificacion.precio);
        sheet.getRange(i + 1, 9).setValue(datosCertificacion.requisitos);
        sheet.getRange(i + 1, 10).setValue(datosCertificacion.estado);
        
        Logger.log('Certificación actualizada: ' + codigo);
        return { success: true, message: 'Certificación actualizada correctamente' };
      }
    }
    
    return { success: false, message: 'Certificación no encontrada' };
  } catch (error) {
    Logger.log('ERROR en actualizarCertificacion: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene certificación por código
 */
function obtenerCertificacionPorCodigo(codigo) {
  try {
    const certificaciones = getCertificaciones();
    return certificaciones.find(c => c.Codigo === codigo) || null;
  } catch (error) {
    Logger.log('ERROR en obtenerCertificacionPorCodigo: ' + error.toString());
    return null;
  }
}

/**
 * Busca certificaciones por término
 */
function buscarCertificaciones(termino) {
  try {
    Logger.log('=== buscarCertificaciones: ' + termino + ' ===');
    
    if (!termino || termino.trim().length < 2) {
      return [];
    }
    
    const certificaciones = getCertificaciones();
    const terminoLower = termino.toLowerCase();
    
    const resultados = certificaciones.filter(cert => 
      cert.Nombre.toLowerCase().includes(terminoLower) ||
      cert.Tecnologia.toLowerCase().includes(terminoLower) ||
      cert.Provider.toLowerCase().includes(terminoLower) ||
      (cert.Descripcion && cert.Descripcion.toLowerCase().includes(terminoLower))
    ).slice(0, 10); // Limitar a 10 resultados
    
    Logger.log('Resultados encontrados: ' + resultados.length);
    return resultados;
  } catch (error) {
    Logger.log('ERROR en buscarCertificaciones: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene certificaciones por tecnología
 */
function getCertificacionesPorTecnologia(tecnologia) {
  try {
    const certificaciones = getCertificaciones();
    return certificaciones.filter(c => 
      c.Tecnologia && c.Tecnologia.toLowerCase() === tecnologia.toLowerCase()
    );
  } catch (error) {
    Logger.log('ERROR en getCertificacionesPorTecnologia: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene certificaciones por provider
 */
function getCertificacionesPorProvider(provider) {
  try {
    const certificaciones = getCertificaciones();
    return certificaciones.filter(c => 
      c.Provider && c.Provider.toLowerCase() === provider.toLowerCase()
    );
  } catch (error) {
    Logger.log('ERROR en getCertificacionesPorProvider: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene certificaciones activas
 */
function getCertificacionesActivas() {
  try {
    const certificaciones = getCertificaciones();
    return certificaciones.filter(c => c.Estado === 'Activa');
  } catch (error) {
    Logger.log('ERROR en getCertificacionesActivas: ' + error.toString());
    return [];
  }
}