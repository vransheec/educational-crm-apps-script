/**
 * FILESYSTEM MODULE
 * Gestión de archivos e imágenes en Google Drive
 */

/**
 * Obtiene o crea la carpeta de docentes fotos
 */
function obtenerOCrearCarpetaDocentes() {
  try {
    const configSheet = getSheet(SHEETS.config);
    if (!configSheet) {
      Logger.log('ERROR: Tabla Configuracion no existe, creando carpeta sin guardar ID');
      const carpeta = DriveApp.createFolder('Educational CRM - Docentes Fotos');
      return carpeta.getId();
    }
    
    const data = configSheet.getDataRange().getValues();
    
    // Buscar si ya existe el ID guardado
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'DOCENTES_FOLDER_ID') {
        const folderId = String(data[i][1] || '').trim();
        if (folderId && folderId !== '' && folderId !== 'DOCENTES_FOLDER_ID') {
          try {
            const folder = DriveApp.getFolderById(folderId);
            Logger.log('Carpeta de docentes encontrada: ' + folderId);
            return folderId;
          } catch (e) {
            Logger.log('Carpeta guardada no existe o ID inválido, creando nueva...');
          }
        }
      }
    }
    
    // Si no existe, crear nueva carpeta
    Logger.log('Creando carpeta de docentes...');
    const carpeta = DriveApp.createFolder('Educational CRM - Docentes Fotos');
    const folderId = carpeta.getId();
    
    // Guardar ID en configuración
    guardarConfiguracion('DOCENTES_FOLDER_ID', folderId);
    
    Logger.log('Carpeta creada: ' + folderId);
    return folderId;
  } catch (error) {
    Logger.log('ERROR en obtenerOCrearCarpetaDocentes: ' + error.toString());
    return null;
  }
}

/**
 * Obtiene o crea la carpeta de cursos
 */
function obtenerOCrearCarpetaCursos() {
  try {
    Logger.log('=== OBTENER O CREAR CARPETA CURSOS ===');
    
    const configSheet = getSheet(SHEETS.config);
    if (!configSheet) {
      Logger.log('ERROR: Tabla Configuracion no existe, creando carpeta sin guardar ID');
      const carpeta = DriveApp.createFolder('Educational CRM - Cursos Imagenes');
      return carpeta.getId();
    }
    
    const data = configSheet.getDataRange().getValues();
    
    // Buscar si ya existe el ID guardado
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'CURSOS_FOLDER_ID') {
        const folderId = String(data[i][1] || '').trim();
        if (folderId && folderId !== '' && folderId !== 'CURSOS_FOLDER_ID') {
          try {
            const folder = DriveApp.getFolderById(folderId);
            Logger.log('Carpeta de cursos encontrada: ' + folderId);
            return folderId;
          } catch (e) {
            Logger.log('Carpeta guardada no existe o ID inválido: ' + e.toString());
          }
        }
      }
    }
    
    // Si no existe, crear nueva carpeta
    Logger.log('Creando nueva carpeta de cursos...');
    const carpeta = DriveApp.createFolder('Educational CRM - Cursos Imagenes');
    const folderId = carpeta.getId();
    
    // Guardar ID en configuración
    guardarConfiguracion('CURSOS_FOLDER_ID', folderId);
    
    Logger.log('Carpeta creada: ' + folderId);
    return folderId;
  } catch (error) {
    Logger.log('ERROR en obtenerOCrearCarpetaCursos: ' + error.toString());
    return null;
  }
}

/**
 * Sube imagen de curso desde base64
 */
function subirImagenCursoBase64(base64Imagen, codigoCurso, nombreArchivo) {
  try {
    Logger.log('=== subirImagenCursoBase64 ===');
    Logger.log('Código: ' + codigoCurso);
    
    if (!base64Imagen || !codigoCurso) {
      return { success: false, message: 'Faltan parámetros requeridos' };
    }
    
    const folderId = obtenerOCrearCarpetaCursos();
    if (!folderId) {
      return { success: false, message: 'No se pudo obtener carpeta de cursos' };
    }
    
    const carpeta = DriveApp.getFolderById(folderId);
    
    // Decodificar base64
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Imagen), 'image/jpeg', nombreArchivo);
    const archivo = carpeta.createFile(blob);
    archivo.setName(codigoCurso + '-' + nombreArchivo.replace(/\s+/g, '-'));
    archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const fileId = archivo.getId();
    const imagenUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    // Actualizar curso con nueva URL
    const cursosSheet = getSheet(SHEETS.cursos);
    const cursosData = cursosSheet.getDataRange().getValues();
    
    for (let i = 1; i < cursosData.length; i++) {
      if (cursosData[i][0] === codigoCurso) {
        cursosSheet.getRange(i + 1, 11).setValue(imagenUrl); // Columna K (URL_Imagen)
        cursosSheet.getRange(i + 1, 12).setValue(fileId);    // Columna L (File_ID)
        break;
      }
    }
    
    Logger.log('Imagen subida exitosamente: ' + imagenUrl);
    
    return {
      success: true,
      message: 'Imagen subida exitosamente',
      url: imagenUrl,
      fileId: fileId
    };
    
  } catch (error) {
    Logger.log('ERROR en subirImagenCursoBase64: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Sube imagen de curso desde blob
 */
function subirImagenCurso(archivoBlob, codigoCurso, nombreCurso) {
  try {
    if (!archivoBlob) {
      return { success: false, message: 'No se proporcionó archivo' };
    }
    
    const folderId = obtenerOCrearCarpetaCursos();
    if (!folderId) {
      return { success: false, message: 'No se pudo obtener carpeta de cursos' };
    }
    
    const carpeta = DriveApp.getFolderById(folderId);
    const nombreArchivo = codigoCurso + '-' + (nombreCurso || 'imagen').replace(/\s+/g, '-');
    
    const archivo = carpeta.createFile(archivoBlob);
    archivo.setName(nombreArchivo);
    archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const fileId = archivo.getId();
    const imagenUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    return {
      success: true,
      message: 'Imagen subida exitosamente',
      url: imagenUrl,
      fileId: fileId
    };
    
  } catch (error) {
    Logger.log('ERROR en subirImagenCurso: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Elimina imagen de curso de Google Drive
 */
function eliminarImagenCurso(fileId) {
  try {
    if (!fileId) {
      return { success: false, message: 'No se proporcionó ID de archivo' };
    }
    
    const archivo = DriveApp.getFileById(fileId);
    archivo.setTrashed(true);
    
    Logger.log('Imagen eliminada: ' + fileId);
    
    return {
      success: true,
      message: 'Imagen eliminada exitosamente'
    };
    
  } catch (error) {
    Logger.log('ERROR en eliminarImagenCurso: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza imagen de curso
 */
function actualizarImagenCurso(codigoCurso, base64Imagen) {
  try {
    const folderId = obtenerOCrearCarpetaCursos();
    const folder = DriveApp.getFolderById(folderId);
    
    // Decodificar base64 y crear blob
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Imagen), 'image/jpeg', codigoCurso + '.jpg');
    
    // Subir archivo a Google Drive
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const imagenUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    
    return {
      success: true,
      url: imagenUrl,
      fileId: file.getId()
    };
    
  } catch (error) {
    Logger.log('ERROR en actualizarImagenCurso: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Sube imagen de docente
 */
function subirImagenDocente(base64Imagen, docenteId) {
  try {
    const folderId = obtenerOCrearCarpetaDocentes();
    if (!folderId) {
      return { success: false, message: 'No se pudo obtener carpeta de docentes' };
    }
    
    const carpeta = DriveApp.getFolderById(folderId);
    
    // Decodificar base64
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Imagen), 'image/jpeg', docenteId + '.jpg');
    const archivo = carpeta.createFile(blob);
    archivo.setName('docente-' + docenteId + '.jpg');
    archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const fileId = archivo.getId();
    const imagenUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    // Actualizar docente con nueva URL
    const docentesSheet = getSheet(SHEETS.docentes);
    const docentesData = docentesSheet.getDataRange().getValues();
    
    for (let i = 1; i < docentesData.length; i++) {
      if (docentesData[i][0] === docenteId) {
        docentesSheet.getRange(i + 1, 19).setValue(imagenUrl); // Columna Foto
        docentesSheet.getRange(i + 1, 20).setValue(fileId);    // Columna FileId
        break;
      }
    }
    
    return {
      success: true,
      message: 'Foto de docente actualizada',
      url: imagenUrl,
      fileId: fileId
    };
    
  } catch (error) {
    Logger.log('ERROR en subirImagenDocente: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene URL del logo por defecto
 */
function obtenerURLLogoPorDefecto() {
  try {
    // Buscar en la carpeta "Logos"
    const carpetas = DriveApp.getFoldersByName('Logos');
    
    if (!carpetas.hasNext()) {
      Logger.log('ERROR: Carpeta "Logos" no encontrada');
      return null;
    }
    
    const carpeta = carpetas.next();
    const archivos = carpeta.getFilesByName('logo3-recortado.png');
    
    if (archivos.hasNext()) {
      const archivo = archivos.next();
      const fileId = archivo.getId();
      const url = 'https://drive.google.com/uc?export=view&id=' + fileId;
      
      Logger.log('Logo encontrado: ' + url);
      return url;
    }
    
    Logger.log('ERROR: Archivo logo3-recortado.png no encontrado');
    return null;
    
  } catch (error) {
    Logger.log('ERROR en obtenerURLLogoPorDefecto: ' + error.toString());
    return null;
  }
}

/**
 * Corrige permisos de archivos en Drive
 */
function corregirPermisosDrive() {
  try {
    Logger.log('=== CORRIGIENDO PERMISOS DE DRIVE ===');
    
    const resultados = {
      cursosCorregidos: 0,
      docentesCorregidos: 0,
      errores: []
    };
    
    // Corregir permisos de imágenes de cursos
    const cursosFolderId = obtenerOCrearCarpetaCursos();
    if (cursosFolderId) {
      const carpetaCursos = DriveApp.getFolderById(cursosFolderId);
      const archivosCursos = carpetaCursos.getFiles();
      
      while (archivosCursos.hasNext()) {
        try {
          const archivo = archivosCursos.next();
          archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
          resultados.cursosCorregidos++;
        } catch (e) {
          resultados.errores.push('Error en archivo de curso: ' + e.toString());
        }
      }
    }
    
    // Corregir permisos de imágenes de docentes
    const docentesFolderId = obtenerOCrearCarpetaDocentes();
    if (docentesFolderId) {
      const carpetaDocentes = DriveApp.getFolderById(docentesFolderId);
      const archivosDocentes = carpetaDocentes.getFiles();
      
      while (archivosDocentes.hasNext()) {
        try {
          const archivo = archivosDocentes.next();
          archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
          resultados.docentesCorregidos++;
        } catch (e) {
          resultados.errores.push('Error en archivo de docente: ' + e.toString());
        }
      }
    }
    
    Logger.log('Permisos corregidos - Cursos: ' + resultados.cursosCorregidos + ', Docentes: ' + resultados.docentesCorregidos);
    
    return {
      success: true,
      resultados: resultados
    };
    
  } catch (error) {
    Logger.log('ERROR en corregirPermisosDrive: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}


/**
 * Sube imagen de icono - MISMO MECANISMO QUE DOCENTES Y CURSOS
 * Llamada desde HTML: google.script.run.subirImagenIcono(nombreIcono, base64, urlDestino)
 */
function subirImagenIcono(nombreIcono, base64Imagen, urlDestino) {
  try {
    Logger.log('=== subirImagenIcono: ' + nombreIcono + ' ===');
    Logger.log('📊 Base64 recibido (primeros 50 chars): ' + base64Imagen.substring(0, 50));
    Logger.log('📊 urlDestino: ' + urlDestino);
    
    if (!nombreIcono || !base64Imagen) {
      Logger.log('❌ Parámetros faltantes');
      return { success: false, message: 'Nombre de icono e imagen son requeridos' };
    }
    
    // Remover prefijo data:image si existe
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
    
    Logger.log('📊 Base64 length después de procesar: ' + base64Data.length);
    
    // Convertir base64 a blob
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', nombreIcono + '.jpg');
    Logger.log('✅ Blob creado');
    
    // Obtener o crear carpeta de iconos
    const folderId = obtenerOCrearCarpetaIconos();
    if (!folderId) {
      Logger.log('❌ No se pudo obtener carpeta de iconos');
      return { success: false, message: 'No se pudo obtener carpeta de iconos' };
    }
    
    Logger.log('✅ Carpeta de iconos: ' + folderId);
    const carpeta = DriveApp.getFolderById(folderId);
    
    // Crear archivo
    const archivo = carpeta.createFile(blob);
    archivo.setName('icono-' + nombreIcono + '.jpg');
    archivo.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    
    const fileId = archivo.getId();
    // Usar formato que funciona en iframes de Apps Script
    const imagenUrl = 'https://drive.google.com/thumbnail?sz=w200&id=' + fileId;
    
    Logger.log('✅ Archivo creado: ' + fileId);
    Logger.log('🔗 URL generada: ' + imagenUrl);
    
    // Guardar en PropertiesService
    const props = PropertiesService.getScriptProperties();
    const configKey = 'Icono_' + nombreIcono;
    
    // URLs de red social predeterminadas
    const urlsRedes = {
      'ig-icon': 'https://www.instagram.com/your_handle',
      'fb-icon': 'https://www.facebook.com/share/1BKSwCXH5q/?mibextid=wwXIfr',
      'in-icon': 'https://www.linkedin.com/company/your-company/'
    };
    
    // Obtener icono actual para preservar datos
    const iconoActualStr = props.getProperty(configKey);
    let iconoData = {
      name: nombreIcono,
      emoji: '',
      url: urlDestino || urlsRedes[nombreIcono] || '#',
      imageUrl: imagenUrl
    };
    
    Logger.log('📋 iconoData a guardar:', JSON.stringify(iconoData));
    
    // Si existe, preservar URL si no se proporcionó una nueva
    if (iconoActualStr && !urlDestino) {
      try {
        const parsed = JSON.parse(iconoActualStr);
        if (parsed.url && parsed.url !== '#') {
          iconoData.url = parsed.url;
          Logger.log('✅ URL de red social preservada: ' + iconoData.url);
        }
      } catch (e) {
        Logger.log('⚠️ No se pudo parsear icono anterior');
      }
    }
    
    // Guardar configuración
    props.setProperty(configKey, JSON.stringify(iconoData));
    props.setProperty(configKey + '_FileId', fileId);
    
    Logger.log('✅ Icono guardado en PropertiesService: ' + configKey);
    Logger.log('✅ Verificando guardado...');
    const verificacion = props.getProperty(configKey);
    Logger.log('✅ Verificación: ' + verificacion);
    
    return {
      success: true,
      message: 'Icono actualizado correctamente',
      url: imagenUrl,
      fileId: fileId
    };
    
  } catch (error) {
    Logger.log('ERROR en subirImagenIcono: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtener o crear carpeta de iconos
 */
function obtenerOCrearCarpetaIconos() {
  try {
    const props = PropertiesService.getScriptProperties();
    let folderId = props.getProperty('ICONOS_FOLDER_ID');
    
    if (folderId && folderId !== '' && folderId !== 'ICONOS_FOLDER_ID') {
      try {
        const folder = DriveApp.getFolderById(folderId);
        Logger.log('Carpeta de iconos encontrada: ' + folderId);
        return folderId;
      } catch (e) {
        Logger.log('Carpeta guardada no existe, creando nueva...');
      }
    }
    
    // Si no existe, crear nueva carpeta
    Logger.log('Creando carpeta de iconos...');
    const carpeta = DriveApp.createFolder('Educational CRM - Iconos');
    folderId = carpeta.getId();
    
    // Guardar ID en PropertiesService
    props.setProperty('ICONOS_FOLDER_ID', folderId);
    
    Logger.log('Carpeta creada: ' + folderId);
    return folderId;
  } catch (error) {
    Logger.log('ERROR en obtenerOCrearCarpetaIconos: ' + error.toString());
    return null;
  }
}


/**
 * Convertir todas las URLs de logos a formato thumbnail que funciona en iframes
 */
function convertirURLsLogoAThumbnail() {
  try {
    Logger.log('=== Convirtiendo URLs de logo a thumbnail ===');
    
    const props = PropertiesService.getScriptProperties();
    const logoUrl = props.getProperty('Logo_URL');
    
    if (!logoUrl || !logoUrl.includes('drive.google.com')) {
      Logger.log('No hay URL de logo para convertir');
      return { success: true, convertidas: 0 };
    }
    
    // Extraer el file ID
    let fileId = '';
    if (logoUrl.includes('id=')) {
      fileId = logoUrl.split('id=')[1];
    }
    
    if (fileId) {
      const newUrl = 'https://drive.google.com/thumbnail?sz=w200&id=' + fileId;
      props.setProperty('Logo_URL', newUrl);
      Logger.log('✅ Logo convertido a thumbnail');
      Logger.log('   Nueva URL: ' + newUrl);
      return { success: true, convertidas: 1 };
    }
    
    return { success: true, convertidas: 0 };
  } catch (error) {
    Logger.log('ERROR en convertirURLsLogoAThumbnail: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtener o crear carpeta de logos
 */
function obtenerOCrearCarpetaLogos() {
  try {
    const props = PropertiesService.getScriptProperties();
    let folderId = props.getProperty('LOGOS_FOLDER_ID');
    
    if (folderId && folderId !== '' && folderId !== 'LOGOS_FOLDER_ID') {
      try {
        const folder = DriveApp.getFolderById(folderId);
        Logger.log('Carpeta de logos encontrada: ' + folderId);
        return folderId;
      } catch (e) {
        Logger.log('Carpeta guardada no existe, creando nueva...');
      }
    }
    
    // Si no existe, crear nueva carpeta
    Logger.log('Creando carpeta de logos...');
    const carpeta = DriveApp.createFolder('Educational CRM - Logos');
    folderId = carpeta.getId();
    
    // Guardar ID en PropertiesService
    props.setProperty('LOGOS_FOLDER_ID', folderId);
    
    Logger.log('Carpeta creada: ' + folderId);
    return folderId;
  } catch (error) {
    Logger.log('ERROR en obtenerOCrearCarpetaLogos: ' + error.toString());
    return null;
  }
}

/**
 * Convertir todas las URLs de iconos a formato thumbnail que funciona en iframes
 */
function convertirURLsIconosAThumbnail() {
  try {
    Logger.log('=== Convirtiendo URLs de iconos a thumbnail ===');
    
    const props = PropertiesService.getScriptProperties();
    const propiedades = props.getProperties();
    
    let contador = 0;
    Object.keys(propiedades).forEach(key => {
      if (key.startsWith('Icono_') && !key.endsWith('_FileId')) {
        try {
          const iconoData = JSON.parse(propiedades[key]);
          
          // Si tiene imageUrl, convertir a thumbnail
          if (iconoData.imageUrl && iconoData.imageUrl.includes('drive.google.com')) {
            // Extraer el file ID
            let fileId = '';
            if (iconoData.imageUrl.includes('id=')) {
              fileId = iconoData.imageUrl.split('id=')[1];
            }
            
            if (fileId) {
              const newUrl = 'https://drive.google.com/thumbnail?sz=w200&id=' + fileId;
              iconoData.imageUrl = newUrl;
              
              props.setProperty(key, JSON.stringify(iconoData));
              Logger.log('✅ Convertido: ' + key);
              Logger.log('   Nueva URL: ' + newUrl);
              contador++;
            }
          }
        } catch (e) {
          Logger.log('Error procesando ' + key + ': ' + e.toString());
        }
      }
    });
    
    Logger.log('✅ Total de URLs convertidas: ' + contador);
    return { success: true, convertidas: contador };
  } catch (error) {
    Logger.log('ERROR en convertirURLsIconosAThumbnail: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}
