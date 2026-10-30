/**
 * CURSOS MODULE
 * Gestión completa de cursos, beneficios y requisitos
 */

/**
 * Guarda un nuevo curso
 */
function saveCurso(data) {
  try {
    let sheet = getSheet(SHEETS.cursos);
    if (!sheet) {
      sheet = getDB().insertSheet(SHEETS.cursos);
      sheet.appendRow([
        'Código', 'Nombre', 'Tecnología', 'Provider', 'Nivel', 'Horas', 'Precio Base',
        'Frecuencia', 'Beneficios', 'Requisitos_Clase', 'URL_Imagen', 'File_ID', 'Fecha Creación'
      ]);
    }
    
    sheet.appendRow([
      data.codigo,
      data.nombre,
      data.tecnologia,
      data.provider,
      data.nivel,
      parseFloat(data.horas) || 0,
      parseFloat(data.precioBase) || 0,
      data.frecuencia || '3 veces por semana',
      data.beneficios || '',
      data.urlImagen || '',
      data.fileId || '',
      new Date()
    ]);
    
    return { success: true, message: 'Curso creado' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene curso por código
 */
function getCursoByCodigo(codigo) {
  try {
    Logger.log('=== getCursoByCodigo: ' + codigo + ' ===');
    
    const cursos = getCursos();
    Logger.log('Total cursos disponibles: ' + cursos.length);
    
    // Buscar coincidencia exacta primero
    let curso = cursos.find(c => c.Codigo === codigo);
    
    if (!curso) {
      // Si no encuentra coincidencia exacta, buscar coincidencia parcial (sin espacios)
      const codigoLimpio = (codigo || '').toString().trim().toUpperCase();
      curso = cursos.find(c => (c.Codigo || '').toString().trim().toUpperCase() === codigoLimpio);
    }
    
    if (!curso) {
      Logger.log('❌ Curso no encontrado para código: ' + codigo);
      Logger.log('Códigos disponibles: ' + cursos.map(c => c.Codigo).join(', '));
    } else {
      Logger.log('✓ Curso encontrado: ' + curso.Nombre);
    }
    
    return curso;
  } catch (error) {
    Logger.log('ERROR en getCursoByCodigo: ' + error.toString());
    return null;
  }
}

/**
 * Obtiene los beneficios de un curso
 */
function obtenerBeneficiosCurso(codigoCurso) {
  try {
    const curso = getCursoByCodigo(codigoCurso);
    if (!curso || !curso.Beneficios) {
      return [];
    }
    
    // Los beneficios están separados por saltos de línea, punto y coma, o pipe
    const beneficios = curso.Beneficios
      .split(/[\n;|]/)
      .map(b => b.trim())
      .filter(b => b.length > 0)
      .map(b => {
        // Si no comienza con ✅, agregarlo
        if (!b.startsWith('✅')) {
          return '✅ ' + b;
        }
        return b;
      });
    
    return beneficios;
  } catch (error) {
    Logger.log('ERROR en obtenerBeneficiosCurso: ' + error.toString());
    return [];
  }
}

/**
 * Guarda beneficios de curso
 */
function guardarBeneficiosCurso(codigoCurso, beneficios) {
  try {
    Logger.log('guardarBeneficiosCurso: ' + codigoCurso + ', beneficios: ' + beneficios.length);
    
    const sheet = getSheet(SHEETS.cursos);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Buscar o crear columna de Beneficios
    let beneficiosIndex = headers.indexOf('Beneficios');
    if (beneficiosIndex === -1) {
      sheet.getRange(1, headers.length + 1).setValue('Beneficios');
      beneficiosIndex = headers.length;
    }
    
    // Buscar el curso y actualizar beneficios
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === codigoCurso) {
        const beneficiosStr = beneficios.join('|');
        sheet.getRange(i + 1, beneficiosIndex + 1).setValue(beneficiosStr);
        Logger.log('Beneficios guardados para curso: ' + codigoCurso);
        return { success: true, message: 'Beneficios guardados correctamente' };
      }
    }
    
    return { success: false, message: 'Curso no encontrado' };
  } catch (error) {
    Logger.log('ERROR en guardarBeneficiosCurso: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene requisitos de curso
 */
function obtenerRequisitosCurso(codigoCurso) {
  try {
    Logger.log('obtenerRequisitosCurso: ' + codigoCurso);
    
    const sheet = getSheet(SHEETS.cursos);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Buscar o crear columna de Requisitos_Clase
    let requisitosIndex = headers.indexOf('Requisitos_Clase');
    if (requisitosIndex === -1) {
      // Agregar columna si no existe
      sheet.getRange(1, headers.length + 1).setValue('Requisitos_Clase');
      requisitosIndex = headers.length;
    }
    
    // Buscar el curso
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === codigoCurso) {
        const requisitosStr = data[i][requisitosIndex] || '';
        const requisitos = requisitosStr ? requisitosStr.split('|').map(r => r.trim()).filter(r => r) : [];
        Logger.log('Requisitos encontrados: ' + requisitos.length);
        return requisitos;
      }
    }
    
    return [];
  } catch (error) {
    Logger.log('ERROR en obtenerRequisitosCurso: ' + error.toString());
    return [];
  }
}

/**
 * Guarda requisitos de curso
 */
function guardarRequisitosCurso(codigoCurso, requisitos) {
  try {
    Logger.log('guardarRequisitosCurso: ' + codigoCurso + ', requisitos: ' + requisitos.length);
    
    const sheet = getSheet(SHEETS.cursos);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Buscar o crear columna de Requisitos_Clase
    let requisitosIndex = headers.indexOf('Requisitos_Clase');
    if (requisitosIndex === -1) {
      sheet.getRange(1, headers.length + 1).setValue('Requisitos_Clase');
      requisitosIndex = headers.length;
    }
    
    // Buscar el curso y actualizar requisitos
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === codigoCurso) {
        const requisitosStr = requisitos.join('|');
        sheet.getRange(i + 1, requisitosIndex + 1).setValue(requisitosStr);
        Logger.log('Requisitos guardados para curso: ' + codigoCurso);
        return { success: true, message: 'Requisitos guardados correctamente' };
      }
    }
    
    return { success: false, message: 'Curso no encontrado' };
  } catch (error) {
    Logger.log('ERROR en guardarRequisitosCurso: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Obtiene la frecuencia de un curso
 */
function obtenerFrecuenciaCurso(codigoCurso) {
  try {
    const curso = getCursoByCodigo(codigoCurso);
    if (!curso) {
      return '3 veces por semana';
    }
    return curso.Frecuencia || '3 veces por semana';
  } catch (error) {
    Logger.log('ERROR en obtenerFrecuenciaCurso: ' + error.toString());
    return '3 veces por semana';
  }
}

/**
 * Genera HTML para beneficios de un curso
 */
function generarHtmlBeneficiosCurso(codigoCurso) {
  try {
    const beneficios = obtenerBeneficiosCurso(codigoCurso);
    
    if (beneficios.length === 0) {
      return '';
    }
    
    let html = '';
    for (let beneficio of beneficios) {
      html += '<p>' + beneficio + '</p>';
    }
    
    return html;
  } catch (error) {
    Logger.log('ERROR en generarHtmlBeneficiosCurso: ' + error.toString());
    return '';
  }
}

/**
 * Obtiene docentes por curso - VERSIÓN CORREGIDA PARA ESTRUCTURA REAL
 */
function obtenerDocentesPorCurso(codigoCurso) {
  try {
    Logger.log('=== obtenerDocentesPorCurso ESTRUCTURA REAL: ' + codigoCurso + ' ===');
    
    // Obtener docentes con estructura corregida
    const todosLosDocentes = getDocentes();
    Logger.log('Total docentes disponibles: ' + todosLosDocentes.length);
    
    const docentesDelCurso = [];
    
    todosLosDocentes.forEach(docente => {
      // Verificar si el docente dicta este curso
      const cursosQueDicta = String(docente.CursosQueDicta || '');
      
      if (cursosQueDicta.includes(codigoCurso)) {
        // SOLO agregar docentes que tengan foto
        if (docente.Foto && docente.Foto.trim() !== '') {
          docentesDelCurso.push({
            Nombre: docente.Nombre || '',
            Cargo: docente.Certificaciones || 'Instructor Certificado', // Usar certificaciones como cargo
            Foto: docente.Foto,
            LinkedIn: docente.LinkedIn || '#',
            Certificaciones: docente.Certificaciones || ''
          });
          Logger.log('✅ Docente con foto agregado: ' + docente.Nombre);
          Logger.log('   - Certificaciones: ' + docente.Certificaciones);
          Logger.log('   - Cursos que dicta: ' + docente.CursosQueDicta);
          Logger.log('   - Foto: ' + docente.Foto.substring(0, 50) + '...');
        } else {
          Logger.log('⚠️ Docente sin foto omitido: ' + docente.Nombre + ' (Cursos: ' + docente.CursosQueDicta + ')');
        }
      }
    });
    
    Logger.log('Docentes con foto encontrados para ' + codigoCurso + ': ' + docentesDelCurso.length);
    return docentesDelCurso;
  } catch (error) {
    Logger.log('ERROR en obtenerDocentesPorCurso: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene frecuencias disponibles
 */
function obtenerFrecuenciasDisponibles() {
  try {
    Logger.log('=== obtenerFrecuenciasDisponibles ===');
    
    const frecuencias = [
      '1 vez por semana',
      '2 veces por semana', 
      '3 veces por semana',
      '4 veces por semana',
      '5 veces por semana',
      'Diario',
      'Fin de semana',
      'Intensivo'
    ];
    
    Logger.log('Frecuencias disponibles: ' + frecuencias.length);
    return frecuencias;
  } catch (error) {
    Logger.log('ERROR en obtenerFrecuenciasDisponibles: ' + error.toString());
    return ['3 veces por semana'];
  }
}

/**
 * Guarda curso con imagen
 */
function guardarCursoConImagen(datosCurso) {
  try {
    let urlImagen = '';
    let fileId = '';
    
    // Si hay imagen, subirla primero
    if (datosCurso.imagenBase64) {
      const resultadoImagen = subirImagenCursoBase64(
        datosCurso.imagenBase64, 
        datosCurso.codigo, 
        datosCurso.nombre + '.jpg'
      );
      
      if (resultadoImagen.success) {
        urlImagen = resultadoImagen.url;
        fileId = resultadoImagen.fileId;
      }
    }
    
    // Guardar curso
    const resultado = saveCurso({
      codigo: datosCurso.codigo,
      nombre: datosCurso.nombre,
      tecnologia: datosCurso.tecnologia,
      provider: datosCurso.provider,
      nivel: datosCurso.nivel,
      horas: datosCurso.horas,
      precioBase: datosCurso.precioBase,
      frecuencia: datosCurso.frecuencia,
      beneficios: datosCurso.beneficios,
      urlImagen: urlImagen,
      fileId: fileId
    });
    
    return resultado;
  } catch (error) {
    Logger.log('ERROR en guardarCursoConImagen: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Actualiza curso con imagen
 */
function actualizarCursoConImagen(codigoCurso, datosCurso, archivoBase64) {
  try {
    Logger.log('=== actualizarCursoConImagen ===');
    Logger.log('Código: ' + codigoCurso);
    
    const sheet = getSheet(SHEETS.cursos);
    if (!sheet) {
      return { success: false, message: 'No se pudo acceder a la hoja de cursos' };
    }
    
    const data = sheet.getDataRange().getValues();
    let cursoEncontrado = false;
    
    // Buscar el curso
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === codigoCurso) {
        cursoEncontrado = true;
        
        // Actualizar datos básicos
        sheet.getRange(i + 1, 2).setValue(datosCurso.nombre);
        sheet.getRange(i + 1, 3).setValue(datosCurso.tecnologia);
        sheet.getRange(i + 1, 4).setValue(datosCurso.provider);
        sheet.getRange(i + 1, 5).setValue(datosCurso.nivel);
        sheet.getRange(i + 1, 6).setValue(datosCurso.horas);
        sheet.getRange(i + 1, 7).setValue(datosCurso.precioBase);
        sheet.getRange(i + 1, 8).setValue(datosCurso.frecuencia);
        
        // Si hay nueva imagen, subirla
        if (archivoBase64) {
          const resultadoImagen = actualizarImagenCurso(codigoCurso, archivoBase64);
          if (resultadoImagen.success) {
            sheet.getRange(i + 1, 11).setValue(resultadoImagen.url);
            sheet.getRange(i + 1, 12).setValue(resultadoImagen.fileId);
          }
        }
        
        break;
      }
    }
    
    if (!cursoEncontrado) {
      return { success: false, message: 'Curso no encontrado' };
    }
    
    return { success: true, message: 'Curso actualizado correctamente' };
  } catch (error) {
    Logger.log('ERROR en actualizarCursoConImagen: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}