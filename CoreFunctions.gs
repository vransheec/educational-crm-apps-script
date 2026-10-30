/**
 * FUNCIONES CORE DEL SISTEMA
 * Funciones básicas y de configuración que necesitan todas las demás
 */

// Configuración de hojas
var SHEETS = {
  ventas: 'Ventas',
  alumnos: 'Alumnos',
  cursos: 'Cursos',
  docentes: 'Docentes',
  secciones: 'Secciones',
  pagos: 'Pagos',
  config: 'Configuración',
  certificaciones: 'Certificaciones'
};

// Función principal para obtener hojas
function getSheet(sheetName) {
  try {
    Logger.log('=== getSheet: ' + sheetName + ' ===');
    
    const DB_SHEET_ID = 'YOUR_DATABASE_SPREADSHEET_ID';
    Logger.log('Intentando abrir spreadsheet: ' + DB_SHEET_ID);
    
    const ss = SpreadsheetApp.openById(DB_SHEET_ID);
    Logger.log('Spreadsheet abierto correctamente');
    
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log('Hoja no existe, creando: ' + sheetName);
      sheet = ss.insertSheet(sheetName);
      
      // Crear headers básicos según el tipo de hoja
      if (sheetName === SHEETS.ventas) {
        sheet.appendRow(['ID', 'Alumno', 'Curso', 'Precio', 'Estado', 'Fecha']);
      } else if (sheetName === SHEETS.alumnos) {
        sheet.appendRow(['ID', 'Nombre', 'Email', 'Telefono', 'Estado', 'FechaRegistro']);
      } else if (sheetName === SHEETS.cursos) {
        sheet.appendRow(['Código', 'Nombre', 'Tecnología', 'Provider', 'Nivel', 'Horas', 'Precio Base', 'Frecuencia', 'Beneficios', 'Requisitos_Clase', 'URLImagen', 'FileId']);
      } else if (sheetName === SHEETS.docentes) {
        sheet.appendRow(['ID', 'Nombre', 'Email', 'Certificaciones', 'CursosQueDicta', 'Pais', 'TarifaHora', 'MetodoPago', 'Telefono', 'Estado', 'PuedeWebinars', 'Experiencia', 'Especialidades', 'Idiomas', 'Disponibilidad', 'LinkedIn', 'GitHub', 'Cargo', 'Comentarios', 'Foto', 'FileId']);
      } else if (sheetName === SHEETS.secciones) {
        sheet.appendRow(['ID', 'CodigoCurso', 'NombreCurso', 'Docente', 'FechaInicio', 'FechaFin', 'Horario', 'Estado', 'Modalidad', 'MaxAlumnos', 'AlumnosInscritos', 'Precio', 'Observaciones']);
      } else if (sheetName === SHEETS.pagos) {
        sheet.appendRow(['ID', 'VentaID', 'Monto', 'Fecha', 'Metodo', 'Estado']);
      } else if (sheetName === SHEETS.config) {
        sheet.appendRow(['Clave', 'Valor']);
      } else if (sheetName === SHEETS.certificaciones) {
        sheet.appendRow(['Codigo', 'Nombre', 'Tecnologia', 'Provider', 'Nivel', 'Descripcion', 'Duracion', 'Precio', 'Requisitos', 'Estado', 'FechaCreacion']);
      }
      
      Logger.log('Hoja creada con headers: ' + sheetName);
    } else {
      Logger.log('Hoja encontrada: ' + sheetName);
    }
    
    return sheet;
  } catch (error) {
    Logger.log('ERROR en getSheet (' + sheetName + '): ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return null;
  }
}

// Función para guardar configuración
function guardarConfiguracion(clave, valor) {
  try {
    const DB_SHEET_ID = 'YOUR_DATABASE_SPREADSHEET_ID';
    const ss = SpreadsheetApp.openById(DB_SHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.config);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.config);
      sheet.appendRow(['Clave', 'Valor']); // Headers
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Buscar si ya existe la clave
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === clave) {
        sheet.getRange(i + 1, 2).setValue(valor);
        return true;
      }
    }
    
    // Si no existe, agregar nueva fila
    sheet.appendRow([clave, valor]);
    return true;
  } catch (error) {
    Logger.log('ERROR en guardarConfiguracion: ' + error.toString());
    return false;
  }
}

// Función para obtener configuración
function obtenerConfiguracion(clave) {
  try {
    const DB_SHEET_ID = 'YOUR_DATABASE_SPREADSHEET_ID';
    const ss = SpreadsheetApp.openById(DB_SHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.config);
    
    if (!sheet) {
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === clave) {
        return data[i][1];
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('ERROR en obtenerConfiguracion: ' + error.toString());
    return null;
  }
}