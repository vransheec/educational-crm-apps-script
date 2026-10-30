/**
 * MANTENIMIENTO MODULE
 * Funciones de mantenimiento, diagnóstico y corrección del sistema
 */

/**
 * Función principal de mantenimiento
 */
function menuMantenimiento() {
  Logger.log('=== MENÚ DE MANTENIMIENTO ===');
  Logger.log('1. Para reorganizar imágenes de cursos, ejecuta: fixImagenes()');
  Logger.log('2. Para corregir logo, ejecuta: corregirConfiguracionLogo()');
  Logger.log('3. Para diagnóstico de imágenes, ejecuta: diagnosticarImagenesCursos()');
  Logger.log('===============================');
  
  // Ejecutar automáticamente la reorganización de imágenes
  Logger.log('Ejecutando reorganización de imágenes automáticamente...');
  return reorganizarHojaCursos();
}

/**
 * Función simple para ejecutar corrección de imágenes
 */
function fixImagenes() {
  return reorganizarHojaCursos();
}

/**
 * Reorganiza y corrige la estructura de la hoja de cursos
 */
function reorganizarHojaCursos() {
  try {
    Logger.log('=== REORGANIZANDO HOJA DE CURSOS ===');
    
    const sheet = getSheet(SHEETS.cursos);
    if (!sheet) {
      Logger.log('ERROR: No se pudo obtener la hoja de cursos');
      return { success: false, message: 'No se pudo obtener la hoja de cursos' };
    }
    
    const data = sheet.getDataRange().getValues();
    Logger.log('Headers actuales: ' + JSON.stringify(data[0]));
    
    // Corregir headers primero
    const headersCorrectos = [
      'Código', 'Nombre', 'Tecnología', 'Provider', 'Nivel', 
      'Horas', 'Precio Base', 'Frecuencia', 'Beneficios', 'Requisitos_Clase',
      'URLImagen', 'FileId'
    ];
    
    // Actualizar headers
    for (let i = 0; i < headersCorrectos.length; i++) {
      sheet.getRange(1, i + 1).setValue(headersCorrectos[i]);
    }
    
    Logger.log('Headers corregidos: ' + JSON.stringify(headersCorrectos));
    
    let procesados = 0;
    
    // Procesar cada fila de datos
    for (let i = 1; i < data.length; i++) {
      const codigo = data[i][0];
      const fileIdEnK = data[i][10]; // Lo que está actualmente en K
      const beneficiosEnL = data[i][11]; // Lo que está actualmente en L (si hay algo)
      
      Logger.log('--- Procesando curso ' + codigo + ' ---');
      Logger.log('  Dato en K: ' + (typeof fileIdEnK === 'string' ? fileIdEnK.substring(0, 50) + '...' : fileIdEnK));
      
      // Si el dato en K parece ser un File ID válido (no contiene ✅ y es corto)
      if (typeof fileIdEnK === 'string' && fileIdEnK.trim() !== '' && 
          !fileIdEnK.includes('✅') && fileIdEnK.length < 100) {
        
        const fileId = fileIdEnK.trim();
        const urlCorrecta = 'https://drive.google.com/uc?export=view&id=' + fileId;
        
        Logger.log('  File ID válido detectado: ' + fileId);
        Logger.log('  Generando URL: ' + urlCorrecta);
        
        // Poner la URL en K y el FileId en L
        sheet.getRange(i + 1, 11).setValue(urlCorrecta);  // Columna K (URLImagen)
        sheet.getRange(i + 1, 12).setValue(fileId);       // Columna L (FileId)
        
        procesados++;
        
      } else if (typeof fileIdEnK === 'string' && fileIdEnK.includes('✅')) {
        // Si contiene beneficios, moverlos a la columna correcta
        Logger.log('  Beneficios detectados en K, moviendo a columna I');
        sheet.getRange(i + 1, 9).setValue(fileIdEnK);   // Columna I (Beneficios)
        sheet.getRange(i + 1, 11).setValue('');         // Limpiar K
        sheet.getRange(i + 1, 12).setValue('');         // Limpiar L
      } else {
        Logger.log('  Sin datos válidos para procesar');
        // Limpiar las columnas
        sheet.getRange(i + 1, 11).setValue('');         // Limpiar K
        sheet.getRange(i + 1, 12).setValue('');         // Limpiar L
      }
    }
    
    Logger.log('✅ Cursos procesados: ' + procesados);
    Logger.log('=== FIN REORGANIZACIÓN ===');
    
    return { success: true, message: 'Se reorganizaron ' + procesados + ' cursos' };
  } catch (error) {
    Logger.log('ERROR reorganizando hoja: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Diagnóstico de imágenes de cursos
 */
function diagnosticarImagenesCursos() {
  try {
    Logger.log('=== DIAGNÓSTICO DE IMÁGENES DE CURSOS ===');
    
    const sheet = getSheet(SHEETS.cursos);
    if (!sheet) {
      Logger.log('ERROR: No se pudo obtener la hoja de cursos');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    Logger.log('Total filas en hoja: ' + data.length);
    
    // Revisar headers
    Logger.log('Headers: ' + JSON.stringify(data[0]));
    
    // Revisar las primeras 5 filas de datos
    for (let i = 1; i < Math.min(6, data.length); i++) {
      const codigo = data[i][0];
      const nombre = data[i][1];
      const urlImagen = data[i][10];
      const fileId = data[i][11];
      
      Logger.log('--- Curso ' + i + ' ---');
      Logger.log('  Código: ' + codigo);
      Logger.log('  Nombre: ' + nombre);
      Logger.log('  URL Imagen (col 10): ' + urlImagen);
      Logger.log('  File ID (col 11): ' + fileId);
      
      // Si hay FileId, generar URL correcta
      if (fileId && fileId.trim() !== '') {
        const urlCorrecta = 'https://drive.google.com/uc?export=view&id=' + fileId.trim();
        Logger.log('  URL Correcta debería ser: ' + urlCorrecta);
        
        // Actualizar si es diferente
        if (urlImagen !== urlCorrecta) {
          Logger.log('  ⚠️ URL incorrecta detectada, corrigiendo...');
          sheet.getRange(i + 1, 11).setValue(urlCorrecta);
          Logger.log('  ✅ URL corregida');
        }
      }
    }
    
    Logger.log('=== FIN DIAGNÓSTICO ===');
  } catch (error) {
    Logger.log('ERROR en diagnóstico: ' + error.toString());
  }
}

/**
 * Corrige la configuración del logo con el ID correcto
 */
function corregirConfiguracionLogo() {
  try {
    Logger.log('=== Corrigiendo configuración del logo ===');
    
    const logoFileIdCorrecto = 'YOUR_DRIVE_FILE_ID';
    const logoUrlCorrecta = 'https://drive.google.com/uc?export=view&id=' + logoFileIdCorrecto;
    
    // Guardar la configuración correcta
    guardarConfiguracion('Logo_URL', logoUrlCorrecta);
    guardarConfiguracion('Logo_FileID', logoFileIdCorrecto);
    
    Logger.log('✅ Configuración corregida:');
    Logger.log('  - Logo_URL: ' + logoUrlCorrecta);
    Logger.log('  - Logo_FileID: ' + logoFileIdCorrecto);
    
    // Verificar que se guardó correctamente
    const verificacion = obtenerURLLogoPorDefecto();
    Logger.log('  - Verificación: ' + verificacion);
    
    return logoUrlCorrecta;
  } catch (error) {
    Logger.log('ERROR corrigiendo configuración: ' + error.toString());
    return null;
  }
}

/**
 * Limpia el caché del logo y fuerza búsqueda nueva
 */
function limpiarCacheLogo() {
  try {
    Logger.log('=== Limpiando caché de logo ===');
    const configSheet = getSheet(SHEETS.config);
    if (!configSheet) {
      Logger.log('ERROR: Hoja de configuración no encontrada');
      return false;
    }
    
    const configData = configSheet.getDataRange().getValues();
    for (let i = 0; i < configData.length; i++) {
      const clave = String(configData[i][0] || '').trim();
      if (clave === 'Logo_URL' || clave === 'LOGO_URL' || clave === 'logo_url') {
        configSheet.getRange(i + 1, 2).setValue('');
        Logger.log('Logo_URL limpiado en fila ' + (i + 1));
        Logger.log('Ahora buscando nuevo logo...');
        
        // Buscar el nuevo logo
        const nuevoUrl = obtenerURLLogoPorDefecto();
        Logger.log('Nuevo logo URL: ' + nuevoUrl);
        return nuevoUrl;
      }
    }
    
    Logger.log('No se encontró Logo_URL en configuración');
    return false;
  } catch (error) {
    Logger.log('ERROR en limpiarCacheLogo: ' + error.toString());
    return false;
  }
}

/**
 * Obtiene URL del logo por defecto
 */
function obtenerURLLogoPorDefecto() {
  try {
    Logger.log('=== obtenerURLLogoPorDefecto ===');
    
    // Primero intentar obtener de configuración
    const configSheet = getSheet(SHEETS.config);
    if (configSheet) {
      const configData = configSheet.getDataRange().getValues();
      for (let i = 0; i < configData.length; i++) {
        const clave = String(configData[i][0] || '').trim();
        if (clave === 'Logo_URL' || clave === 'LOGO_URL' || clave === 'logo_url') {
          const logoUrl = String(configData[i][1] || '').trim();
          if (logoUrl && logoUrl !== '') {
            Logger.log('Logo encontrado en configuración: ' + logoUrl);
            return logoUrl;
          }
          break;
        }
      }
    }
    
    Logger.log('Logo no encontrado en configuración, buscando en Drive');
    
    // Buscar en la carpeta "Logos"
    const carpetas = DriveApp.getFoldersByName('Logos');
    if (!carpetas.hasNext()) {
      Logger.log('ERROR: Carpeta "Logos" no encontrada');
      return '';
    }
    
    const carpeta = carpetas.next();
    Logger.log('Carpeta "Logos" encontrada: ' + carpeta.getId());
    
    // Buscar el archivo "logo3-recortado.png"
    const archivos = carpeta.getFilesByName('logo3-recortado.png');
    if (archivos.hasNext()) {
      const archivo = archivos.next();
      const fileId = archivo.getId();
      const logoUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
      Logger.log('Logo "logo3-recortado.png" encontrado en Drive: ' + logoUrl);
      
      // Guardar en configuración para futuras cargas
      guardarConfiguracion('Logo_URL', logoUrl);
      
      return logoUrl;
    }
    
    Logger.log('ERROR: Archivo "logo3-recortado.png" no encontrado en carpeta "Logos"');
    return '';
  } catch (error) {
    Logger.log('ERROR en obtenerURLLogoPorDefecto: ' + error.toString());
    return '';
  }
}

/**
 * Obtiene URL del logo
 */
function obtenerURLLogo() {
  try {
    Logger.log('=== obtenerURLLogo ===');
    
    // Obtener la URL del logo desde la configuración
    const configSheet = getSheet(SHEETS.config);
    if (!configSheet) {
      Logger.log('ERROR: Hoja Configuracion no encontrada, usando fallback');
      return '';
    }
    
    const configData = configSheet.getDataRange().getValues();
    Logger.log('Total filas en Configuración: ' + configData.length);
    
    // Buscar la fila con "Logo_URL" o "LOGO_URL"
    for (let i = 0; i < configData.length; i++) {
      const clave = String(configData[i][0] || '').trim();
      Logger.log('Fila ' + i + ' - Clave: "' + clave + '"');
      
      if (clave === 'Logo_URL' || clave === 'LOGO_URL' || clave === 'logo_url') {
        const logoUrl = String(configData[i][1] || '').trim();
        Logger.log('Logo URL encontrada: ' + logoUrl);
        if (logoUrl && logoUrl !== '') {
          return logoUrl;
        }
      }
    }
    
    Logger.log('Logo URL no encontrada en configuración, intentando subir logo por defecto');
    
    // Si no hay logo, intentar subir el logo por defecto
    const logoUrl = obtenerURLLogoPorDefecto();
    if (logoUrl) {
      guardarConfiguracion('Logo_URL', logoUrl);
      return logoUrl;
    }
    
    Logger.log('Logo URL no encontrada en configuración, retornando vacío');
    return '';
  } catch (error) {
    Logger.log('ERROR en obtenerURLLogo: ' + error.toString());
    return '';
  }
}

/**
 * Función de diagnóstico para probar manualmente
 */
function testBuscarLogo() {
  const url = obtenerURLLogoPorDefecto();
  Logger.log('URL final: ' + url);
  return url;
}

/**
 * Valida la integridad del sistema completo
 */
function validarIntegridadSistema() {
  try {
    Logger.log('=== VALIDANDO INTEGRIDAD DEL SISTEMA ===');
    
    const errores = [];
    const advertencias = [];
    
    // Validar hojas principales
    const hojasRequeridas = Object.values(SHEETS);
    hojasRequeridas.forEach(nombreHoja => {
      const sheet = getSheet(nombreHoja);
      if (!sheet) {
        errores.push(`Hoja faltante: ${nombreHoja}`);
      } else {
        const data = sheet.getDataRange().getValues();
        if (data.length === 0) {
          advertencias.push(`Hoja vacía: ${nombreHoja}`);
        }
      }
    });
    
    // Validar configuración
    const logoUrl = obtenerURLLogo();
    if (!logoUrl) {
      advertencias.push('Logo no configurado');
    }
    
    // Validar carpetas de Drive
    const carpetaCursos = obtenerOCrearCarpetaCursos();
    const carpetaDocentes = obtenerOCrearCarpetaDocentes();
    
    if (!carpetaCursos) {
      errores.push('No se pudo crear/acceder a carpeta de cursos');
    }
    
    if (!carpetaDocentes) {
      errores.push('No se pudo crear/acceder a carpeta de docentes');
    }
    
    Logger.log(`Validación completada - Errores: ${errores.length}, Advertencias: ${advertencias.length}`);
    
    return {
      success: errores.length === 0,
      errores: errores,
      advertencias: advertencias,
      totalErrores: errores.length,
      totalAdvertencias: advertencias.length
    };
    
  } catch (error) {
    Logger.log('ERROR en validarIntegridadSistema: ' + error.toString());
    return { 
      success: false, 
      errores: [error.toString()],
      advertencias: [],
      totalErrores: 1,
      totalAdvertencias: 0
    };
  }
}

/**
 * Función de prueba para validar el logo
 */
function testLogoDeployment() {
  try {
    Logger.log('=== TESTING LOGO DEPLOYMENT - DIRECT SYSTEM ===');
    
    const result = verificarEstadoLogo();
    Logger.log('Deployment result: ' + JSON.stringify(result));
    
    if (result.status === 'SUCCESS') {
      Logger.log('🎉 SUCCESS: Red logo is deployed and working via direct system!');
      return 'SUCCESS: Red logo is deployed and working via direct system!';
    } else {
      Logger.log('⚠️ WARNING: Issue with direct deployment system');
      return 'WARNING: Issue with direct deployment - ' + result.message;
    }
    
  } catch (error) {
    Logger.log('ERROR in testLogoDeployment: ' + error.toString());
    return 'ERROR: ' + error.toString();
  }
}

/**
 * Verifica el estado del logo
 */
function verificarEstadoLogo() {
  try {
    Logger.log('=== VERIFICANDO ESTADO DEL LOGO - DESPLIEGUE DIRECTO ===');
    
    // Obtener contenido del nav generado directamente
    const navContent = getNavHTML('ventas');
    
    // Verificaciones específicas
    const tieneLogoRojo = navContent.includes('#FF0000');
    const tieneTextoLogo = navContent.includes('LOGO');
    const tieneBordeAmarillo = navContent.includes('yellow');
    const tieneComentario = navContent.includes('LOGO DESPLEGADO DIRECTAMENTE');
    const tieneNavegacion = navContent.includes('Navigation System');
    
    Logger.log('🔍 Análisis del nav generado directamente:');
    Logger.log('- Tiene logo rojo (#FF0000): ' + tieneLogoRojo);
    Logger.log('- Tiene texto "LOGO": ' + tieneTextoLogo);
    Logger.log('- Tiene borde amarillo: ' + tieneBordeAmarillo);
    Logger.log('- Tiene comentario de despliegue directo: ' + tieneComentario);
    Logger.log('- Tiene sistema de navegación: ' + tieneNavegacion);
    
    if (tieneLogoRojo && tieneTextoLogo && tieneBordeAmarillo && tieneComentario) {
      Logger.log('✅ ÉXITO: El logo rojo está correctamente desplegado DIRECTAMENTE');
      return {
        status: 'SUCCESS',
        message: 'Logo rojo desplegado correctamente via función directa',
        details: {
          logoRojo: tieneLogoRojo,
          textoLogo: tieneTextoLogo,
          bordeAmarillo: tieneBordeAmarillo,
          comentario: tieneComentario,
          navegacion: tieneNavegacion
        }
      };
    } else {
      Logger.log('❌ ERROR: Problema con el despliegue directo');
      return {
        status: 'ERROR',
        message: 'Problema con el despliegue directo del logo',
        details: {
          logoRojo: tieneLogoRojo,
          textoLogo: tieneTextoLogo,
          bordeAmarillo: tieneBordeAmarillo,
          comentario: tieneComentario,
          navegacion: tieneNavegacion
        }
      };
    }
    
  } catch (error) {
    Logger.log('ERROR en verificarEstadoLogo: ' + error.toString());
    return {
      status: 'ERROR',
      message: 'Error al verificar: ' + error.toString(),
      details: null
    };
  }
}