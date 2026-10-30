/**
 * DOCENTES MODULE
 * Funciones de gestión de docentes (guardar, actualizar, eliminar)
 * 
 * ⚠️ NOTA: getDocentes() está definida en _Code.gs para evitar conflictos de scope.
 * NO DUPLICAR AQUÍ.
 */

/**
 * Crea un nuevo docente en la hoja.
 * Alias esperado por el frontend (docentes.html llama a saveDocente).
 */
function saveDocente(datosDocente) {
  return guardarDocente(datosDocente);
}

/**
 * Genera el siguiente ID de docente respetando el formato existente "D####"
 * (D seguido de un correlativo con ceros a la izquierda, p. ej. D0060).
 * Toma el número más alto ya presente en la columna ID y le suma 1.
 */
function generarSiguienteIdDocente(sheet) {
  try {
    var hoja = sheet || getSheet(SHEETS.docentes);
    var maxNum = 0;

    if (hoja) {
      var data = hoja.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var id = String(data[i][0] || '').trim();
        // Extraer el número de IDs con formato D#### (ignora DOC-timestamp u otros)
        var match = id.match(/^D0*(\d+)$/i);
        if (match) {
          var num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    var siguiente = maxNum + 1;
    // Rellenar a 4 dígitos: D0001, D0060, D0100, etc.
    return 'D' + ('0000' + siguiente).slice(-4);
  } catch (error) {
    Logger.log('⚠️ Error generando ID de docente, se usa fallback: ' + error.toString());
    return 'D' + ('0000' + Date.now()).slice(-4);
  }
}

function guardarDocente(datosDocente) {
  try {
    Logger.log('=== guardarDocente ===');
    Logger.log('Datos recibidos: ' + JSON.stringify(datosDocente));

    var sheet = getSheet(SHEETS.docentes);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de docentes' };
    }

    var d = datosDocente || {};

    // Normalizar campos que el frontend puede enviar como array o boolean
    var certificaciones = Array.isArray(d.certificaciones) ? d.certificaciones.join(', ') : (d.certificaciones || '');
    var cursosQueDicta = Array.isArray(d.cursosQueDicta) ? d.cursosQueDicta.join(', ') : (d.cursosQueDicta || '');
    var puedeWebinars = (d.puedeWebinars === true || d.puedeWebinars === 'Si' || d.puedeWebinars === 'SI') ? 'Si' : 'No';
    var tieneMaterial = (d.tieneMateriales === true || d.tieneMaterial === true || d.tieneMateriales === 'Si') ? 'Si' : 'No';

    // El frontend usa canalPago/metodoPago; aceptar ambos
    var metodoPago = d.canalPago || d.metodoPago || '';

    var docenteId = generarSiguienteIdDocente(sheet);

    // Orden REAL de columnas de la hoja DOCENTES:
    // ID(0), Nombre(1), Email(2), Telefono(3), Pais(4), Certificaciones(5),
    // CursosQueDicta(6), TarifaHora(7), MetodoPago(8), EmailPayPal(9), Banco(10),
    // NumeroCuenta(11), LinkedIn(12), Estado(13), PuedeWebinars(14), TieneMaterial(15),
    // Comentarios(16), Cargo(17), Foto(18), FileId(19)
    sheet.appendRow([
      docenteId,
      d.nombre || '',
      d.email || '',
      d.telefono || '',
      d.pais || '',
      certificaciones,
      cursosQueDicta,
      parseFloat(d.tarifaHora) || 0,
      metodoPago,
      d.emailPaypal || d.emailPayPal || '',
      d.banco || '',
      d.numeroCuenta || '',
      d.linkedin || '',
      d.estado || 'Activo',
      puedeWebinars,
      tieneMaterial,
      d.comentarios || '',
      d.cargo || '',
      '', // Foto: se completa abajo si viene imagen
      ''  // FileId
    ]);

    Logger.log('Docente guardado: ' + docenteId);

    // Si el frontend envió una imagen en base64, subirla a Drive.
    // subirImagenDocente() sube el archivo y actualiza las columnas Foto y FileId.
    if (d.fotoBase64) {
      try {
        var resultadoFoto = subirImagenDocente(d.fotoBase64, docenteId);
        Logger.log('Resultado subida foto: ' + JSON.stringify(resultadoFoto));
      } catch (fotoError) {
        // La foto no debe bloquear la creación del docente.
        Logger.log('⚠️ No se pudo subir la foto (no bloquea): ' + fotoError.toString());
      }
    } else if (d.foto) {
      // Ya viene una URL de foto lista (p. ej. reutilizando una existente).
      try {
        updateDocente(docenteId, 'Foto', d.foto);
        if (d.fotoFileId || d.fileId) {
          updateDocente(docenteId, 'FileId', d.fotoFileId || d.fileId);
        }
      } catch (urlError) {
        Logger.log('⚠️ No se pudo guardar la URL de foto (no bloquea): ' + urlError.toString());
      }
    }

    return { success: true, message: 'Docente creado correctamente', docenteId: docenteId };
  } catch (error) {
    Logger.log('ERROR en guardarDocente: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function updateDocente(docenteId, campo, nuevoValor) {
  try {
    Logger.log('=== updateDocente: ' + docenteId + ', ' + campo + ' ===');
    Logger.log('Valor nuevo: ' + nuevoValor);
    
    var sheet = getSheet(SHEETS.docentes);
    if (!sheet) {
      Logger.log('❌ Sheet no encontrado');
      return { success: false, message: 'No se pudo acceder a la hoja de docentes' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    Logger.log('Headers: ' + JSON.stringify(headers));
    
    // Mapeo de campo del frontend a posición fija en la hoja
    // Real: ID(0), Nombre(1), Email(2), Telefono(3), Pais(4), Certificaciones(5), CursosQueDicta(6), TarifaHora(7), MetodoPago(8), EmailPayPal(9), Banco(10), NumeroCuenta(11), LinkedIn(12), Estado(13), PuedeWebinars(14), TieneMaterial(15), Comentarios(16), Cargo(17), Foto(18), FileId(19)
    var fixedColumnMap = {
      'ID': 0, 'Nombre': 1, 'Email': 2, 'Telefono': 3, 'Pais': 4,
      'Certificaciones': 5, 'CursosQueDicta': 6, 'TarifaHora': 7,
      'MetodoPago': 8, 'EmailPayPal': 9, 'Banco': 10, 'NumeroCuenta': 11,
      'LinkedIn': 12, 'Estado': 13, 'PuedeWebinars': 14, 'TieneMaterial': 15,
      'Comentarios': 16, 'Cargo': 17, 'Foto': 18, 'FileId': 19
    };
    
    // Primero intentar con el mapa fijo
    var columnIndex = fixedColumnMap.hasOwnProperty(campo) ? fixedColumnMap[campo] : -1;
    
    // Si no está en el mapa fijo, buscar por header
    if (columnIndex === -1) {
      columnIndex = headers.findIndex(function(h) { return String(h).toLowerCase().replace(/[_\s]/g, '') === String(campo).toLowerCase().replace(/[_\s]/g, ''); });
    }
    
    Logger.log('Column index para "' + campo + '": ' + columnIndex);
    
    if (columnIndex === -1) {
      Logger.log('❌ Campo no encontrado: ' + campo);
      return { success: false, message: 'Campo no encontrado: ' + campo };
    }
    
    // Buscar docente por ID
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === String(docenteId).trim()) {
        rowIndex = i + 1;
        break;
      }
    }
    
    Logger.log('Row index para "' + docenteId + '": ' + rowIndex);
    
    if (rowIndex === -1) {
      Logger.log('❌ Docente no encontrado: ' + docenteId);
      return { success: false, message: 'Docente no encontrado: ' + docenteId };
    }
    
    var valorActualizar = campo === 'TarifaHora' ? (parseFloat(nuevoValor) || 0) : nuevoValor;
    sheet.getRange(rowIndex, columnIndex + 1).setValue(valorActualizar);
    
    Logger.log('✅ Docente actualizado: ' + docenteId + ', Campo: ' + campo + ', Columna: ' + (columnIndex + 1));
    return { success: true, message: 'Docente actualizado correctamente' };
  } catch (error) {
    Logger.log('❌ ERROR en updateDocente: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function deleteDocente(docenteId) {
  try {
    Logger.log('=== deleteDocente: ' + docenteId + ' ===');
    
    const sheet = getSheet(SHEETS.docentes);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de docentes' };
    }
    
    const data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(docenteId)) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, message: 'Docente no encontrado: ' + docenteId };
    }
    
    sheet.deleteRow(rowIndex);
    Logger.log('✅ Docente eliminado: ' + docenteId);
    return { success: true, message: 'Docente eliminado correctamente' };
  } catch (error) {
    Logger.log('ERROR en deleteDocente: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

function obtenerDocentePorId(docenteId) {
  try {
    const docentes = getDocentes();
    return docentes.find(function(d) { return d.ID === docenteId; }) || null;
  } catch (error) {
    Logger.log('ERROR en obtenerDocentePorId: ' + error.toString());
    return null;
  }
}

function getDocentesActivos() {
  try {
    return getDocentes().filter(function(d) { return d.Estado === 'Activo'; });
  } catch (error) {
    Logger.log('ERROR en getDocentesActivos: ' + error.toString());
    return [];
  }
}

function getDocentesPorCurso(codigoCurso) {
  try {
    return getDocentes().filter(function(d) {
      return d.CursosQueDicta && d.CursosQueDicta.includes(codigoCurso);
    });
  } catch (error) {
    Logger.log('ERROR en getDocentesPorCurso: ' + error.toString());
    return [];
  }
}

function actualizarFotoDocente(docenteId, base64Imagen) {
  Logger.log('=== actualizarFotoDocente ===');
  Logger.log('Docente ID: ' + docenteId);
  return subirImagenDocente(base64Imagen, docenteId);
}
