// ============================================
// CAMBIO DE DATOS DEL ALUMNO (correo / celular)
// --------------------------------------------
// El bot encola solicitudes en la hoja "SolicitudesCambio". Un trigger diario
// (6:00 am) ejecuta procesarSolicitudesCambio(), que:
//   - Para CORREO: da de baja el correo viejo de Drive/Classroom/Calendar en
//     TODAS las secciones del alumno y da de alta el correo nuevo; luego
//     actualiza la hoja Alumnos.
//   - Para TELEFONO: solo actualiza la hoja Alumnos.
//
// Estructura de la hoja "SolicitudesCambio":
//   A Timestamp | B AlumnoID | C Telefono | D Campo (Email|Telefono) |
//   E ValorAnterior | F ValorNuevo | G Estado (PENDIENTE|PROCESADO|ERROR) |
//   H FechaProcesado | I Detalle
// ============================================

var CAMBIO_DB_SHEET_ID = 'YOUR_DATABASE_SPREADSHEET_ID';
var HOJA_SOLICITUDES_CAMBIO = 'SolicitudesCambio';

// Índices de columna de la hoja SolicitudesCambio (0-indexed)
var SC_COL = {
  TIMESTAMP: 0,
  ALUMNO_ID: 1,
  TELEFONO: 2,
  CAMPO: 3,
  VALOR_ANTERIOR: 4,
  VALOR_NUEVO: 5,
  ESTADO: 6,
  FECHA_PROCESADO: 7,
  DETALLE: 8
};

// ============================================
// ASEGURAR HOJA DE SOLICITUDES (crea con headers si no existe)
// Ejecutable manualmente una vez, y también se llama defensivamente.
// ============================================
function asegurarHojaSolicitudesCambio() {
  var ss = SpreadsheetApp.openById(CAMBIO_DB_SHEET_ID);
  var sheet = ss.getSheetByName(HOJA_SOLICITUDES_CAMBIO);
  if (!sheet) {
    sheet = ss.insertSheet(HOJA_SOLICITUDES_CAMBIO);
    sheet.appendRow([
      'Timestamp', 'AlumnoID', 'Telefono', 'Campo',
      'ValorAnterior', 'ValorNuevo', 'Estado', 'FechaProcesado', 'Detalle'
    ]);
    Logger.log('✅ Hoja ' + HOJA_SOLICITUDES_CAMBIO + ' creada');
  }
  return sheet;
}

// ============================================
// OBTENER TODAS LAS SECCIONES DE UN ALUMNO
// join Alumnos.ID -> Matriculas.AlumnoID(1) -> Matriculas.Seccion(2)
// Devuelve un array de códigos de sección (sin duplicados).
// ============================================
function obtenerSeccionesDeAlumno(alumnoId) {
  var ss = SpreadsheetApp.openById(CAMBIO_DB_SHEET_ID);
  var matSheet = ss.getSheetByName('Matriculas');
  if (!matSheet) return [];
  var matData = matSheet.getDataRange().getValues();

  var secciones = [];
  var vistas = {};
  for (var i = 1; i < matData.length; i++) {
    if (String(matData[i][1] || '').trim() !== String(alumnoId).trim()) continue;
    var codigo = String(matData[i][2] || '').trim();
    if (!codigo || vistas[codigo]) continue;
    vistas[codigo] = true;
    secciones.push(codigo);
  }
  return secciones;
}

// ============================================
// DRIVE — QUITAR ACCESO DE UN ALUMNO A LA CARPETA DE UNA SECCIÓN
// Contraparte de compartirCarpetaDriveConAlumno. No bloquea ante error.
// ============================================
function removerAlumnoDeCarpetaDrive(codigoSeccion, emailAlumno) {
  try {
    if (!emailAlumno || !codigoSeccion) return;
    Logger.log('📂 [removerCarpeta] seccion=' + codigoSeccion + ' email=' + emailAlumno);

    var ss = SpreadsheetApp.openById(CAMBIO_DB_SHEET_ID);
    var secSheet = ss.getSheetByName('Secciones');
    var secData = secSheet.getDataRange().getValues();

    var driveFolderId = '';
    for (var i = 1; i < secData.length; i++) {
      if (String(secData[i][0]) === codigoSeccion) {
        driveFolderId = String(secData[i][18] || ''); // col S (18) DriveFolderId
        break;
      }
    }
    if (!driveFolderId) {
      Logger.log('⚠️ [removerCarpeta] Sección sin carpeta Drive: ' + codigoSeccion);
      return;
    }

    var folder = DriveApp.getFolderById(driveFolderId);

    // Quitar de viewers y de editors (según cómo se haya compartido)
    var viewers = folder.getViewers().map(function(u) { return u.getEmail(); });
    if (viewers.indexOf(emailAlumno) !== -1) {
      folder.removeViewer(emailAlumno);
      Logger.log('✅ [removerCarpeta] Viewer removido: ' + emailAlumno);
    }
    var editors = folder.getEditors().map(function(u) { return u.getEmail(); });
    if (editors.indexOf(emailAlumno) !== -1) {
      folder.removeEditor(emailAlumno);
      Logger.log('✅ [removerCarpeta] Editor removido: ' + emailAlumno);
    }
  } catch (error) {
    Logger.log('⚠️ [removerCarpeta] Error (no bloquea): ' + error.toString());
  }
}

// ============================================
// CLASSROOM — QUITAR A UN ALUMNO DE LA CLASE DE UNA SECCIÓN
// Maneja dos casos:
//   1) Invitación pendiente (aún no aceptada) -> Classroom.Invitations.delete
//   2) Ya es estudiante del curso -> Classroom.Courses.Students.remove
// No bloquea ante error.
// ============================================
function removerAlumnoDeClassroom(codigoSeccion, emailAlumno) {
  try {
    if (!emailAlumno || !codigoSeccion) return;
    Logger.log('🎓 [removerClassroom] seccion=' + codigoSeccion + ' email=' + emailAlumno);

    var ss = SpreadsheetApp.openById(CAMBIO_DB_SHEET_ID);
    var secSheet = ss.getSheetByName('Secciones');
    var secData = secSheet.getDataRange().getValues();

    var classroomId = '';
    for (var i = 1; i < secData.length; i++) {
      if (String(secData[i][0]) === codigoSeccion) {
        classroomId = String(secData[i][21] || ''); // col V (21) ClassroomId
        break;
      }
    }
    if (!classroomId) {
      Logger.log('⚠️ [removerClassroom] Sección sin Classroom: ' + codigoSeccion);
      return;
    }

    // 1) Intentar borrar invitación pendiente
    try {
      var inv = Classroom.Invitations.list({ courseId: classroomId, userId: emailAlumno });
      if (inv && inv.invitations && inv.invitations.length > 0) {
        inv.invitations.forEach(function(invitacion) {
          Classroom.Invitations.remove(invitacion.id);
          Logger.log('✅ [removerClassroom] Invitación pendiente eliminada: ' + emailAlumno);
        });
        return; // si había invitación pendiente, no era estudiante todavía
      }
    } catch (invErr) {
      Logger.log('ℹ️ [removerClassroom] Sin invitación pendiente o error listando: ' + invErr.toString());
    }

    // 2) Quitar del roster si ya es estudiante
    try {
      Classroom.Courses.Students.remove(classroomId, emailAlumno);
      Logger.log('✅ [removerClassroom] Estudiante removido del curso: ' + emailAlumno);
    } catch (stuErr) {
      Logger.log('ℹ️ [removerClassroom] No era estudiante activo o error removiendo: ' + stuErr.toString());
    }
  } catch (error) {
    Logger.log('⚠️ [removerClassroom] Error (no bloquea): ' + error.toString());
  }
}

// ============================================
// RESINCRONIZAR CORREO EN TODAS LAS SECCIONES DEL ALUMNO
// Da de baja el correo viejo y de alta el nuevo en Drive/Classroom/Calendar.
// Reutiliza funciones existentes del CRM:
//   - agregarAlumnoAEventosCalendar / removerInvitadoDeEventosCalendar
//   - compartirCarpetaDriveConAlumno / removerAlumnoDeCarpetaDrive
//   - agregarAlumnoAClassroom / removerAlumnoDeClassroom
// ============================================
function resincronizarCorreoAlumno(alumnoId, emailViejo, emailNuevo) {
  var secciones = obtenerSeccionesDeAlumno(alumnoId);
  Logger.log('🔁 [resincronizarCorreo] alumno=' + alumnoId + ' secciones=' + secciones.length +
    ' | ' + emailViejo + ' -> ' + emailNuevo);

  secciones.forEach(function(codigoSeccion) {
    // Baja del correo viejo
    if (emailViejo) {
      removerAlumnoDeCarpetaDrive(codigoSeccion, emailViejo);
      removerAlumnoDeClassroom(codigoSeccion, emailViejo);
      removerInvitadoDeEventosCalendar(codigoSeccion, emailViejo);
    }
    // Alta del correo nuevo
    if (emailNuevo) {
      compartirCarpetaDriveConAlumno(codigoSeccion, emailNuevo);
      agregarAlumnoAClassroom(codigoSeccion, emailNuevo);
      agregarAlumnoAEventosCalendar(codigoSeccion, emailNuevo);
    }
    Utilities.sleep(500); // no saturar las APIs
  });

  return secciones.length;
}

// ============================================
// TRIGGER DIARIO (6:00 am) — PROCESAR SOLICITUDES DE CAMBIO
// Recorre la hoja SolicitudesCambio y ejecuta cada solicitud PENDIENTE.
// Idempotente: solo toca filas en estado PENDIENTE y las marca al terminar.
// Configurar como trigger diario en la consola de Apps Script.
// ============================================
function procesarSolicitudesCambio() {
  try {
    Logger.log('=== procesarSolicitudesCambio ===');
    var sheet = asegurarHojaSolicitudesCambio();
    var data = sheet.getDataRange().getValues();

    var procesadas = 0;
    var errores = 0;

    for (var i = 1; i < data.length; i++) {
      var estado = String(data[i][SC_COL.ESTADO] || '').trim().toUpperCase();
      if (estado !== 'PENDIENTE') continue;

      var alumnoId = String(data[i][SC_COL.ALUMNO_ID] || '').trim();
      var campo = String(data[i][SC_COL.CAMPO] || '').trim();
      var valorAnterior = String(data[i][SC_COL.VALOR_ANTERIOR] || '').trim();
      var valorNuevo = String(data[i][SC_COL.VALOR_NUEVO] || '').trim();
      var fila = i + 1;

      try {
        if (!alumnoId || !valorNuevo) {
          throw new Error('Solicitud incompleta (falta alumnoId o valorNuevo)');
        }

        var campoNorm = campo.toLowerCase();
        var detalle = '';

        if (campoNorm === 'email' || campoNorm === 'correo' || campoNorm === 'gmail') {
          // Resincronizar accesos y luego persistir el correo
          var n = resincronizarCorreoAlumno(alumnoId, valorAnterior, valorNuevo);
          updateAlumno(alumnoId, 'Email', valorNuevo);
          detalle = 'Correo actualizado y resincronizado en ' + n + ' secciones';
        } else if (campoNorm === 'telefono' || campoNorm === 'celular' || campoNorm === 'teléfono') {
          updateAlumno(alumnoId, 'Telefono', valorNuevo);
          detalle = 'Teléfono actualizado';
        } else {
          throw new Error('Campo no soportado: ' + campo);
        }

        sheet.getRange(fila, SC_COL.ESTADO + 1).setValue('PROCESADO');
        sheet.getRange(fila, SC_COL.FECHA_PROCESADO + 1).setValue(new Date());
        sheet.getRange(fila, SC_COL.DETALLE + 1).setValue(detalle);
        procesadas++;
        Logger.log('✅ Solicitud fila ' + fila + ': ' + detalle);
      } catch (e) {
        sheet.getRange(fila, SC_COL.ESTADO + 1).setValue('ERROR');
        sheet.getRange(fila, SC_COL.FECHA_PROCESADO + 1).setValue(new Date());
        sheet.getRange(fila, SC_COL.DETALLE + 1).setValue(String(e.message || e));
        errores++;
        Logger.log('❌ Solicitud fila ' + fila + ' ERROR: ' + (e.message || e));
      }

      Utilities.sleep(300);
    }

    var msg = 'Solicitudes procesadas: ' + procesadas + ' | errores: ' + errores;
    Logger.log('📋 ' + msg);
    return msg;
  } catch (error) {
    Logger.log('❌ ERROR en procesarSolicitudesCambio: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}

// ============================================
// INSTALAR EL TRIGGER DIARIO (6:00 am) POR CÓDIGO
// Ejecutar UNA VEZ desde el editor de Apps Script del CRM.
// Es idempotente: elimina cualquier trigger previo de procesarSolicitudesCambio
// antes de crear el nuevo, para no duplicarlo.
// ============================================
function instalarTriggerCambioDatos() {
  // Eliminar triggers previos de esta misma función
  var triggers = ScriptApp.getProjectTriggers();
  var eliminados = 0;
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'procesarSolicitudesCambio') {
      ScriptApp.deleteTrigger(t);
      eliminados++;
    }
  });

  // Crear el trigger diario a las 6 am (zona horaria del proyecto: America/Lima)
  ScriptApp.newTrigger('procesarSolicitudesCambio')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  var msg = 'Trigger diario 6am instalado para procesarSolicitudesCambio' +
    (eliminados ? ' (se eliminaron ' + eliminados + ' triggers previos)' : '');
  Logger.log('✅ ' + msg);
  return msg;
}

// ============================================
// DESINSTALAR EL TRIGGER (utilidad opcional)
// ============================================
function desinstalarTriggerCambioDatos() {
  var triggers = ScriptApp.getProjectTriggers();
  var eliminados = 0;
  triggers.forEach(function(t) {
    if (t.getHandlerFunction() === 'procesarSolicitudesCambio') {
      ScriptApp.deleteTrigger(t);
      eliminados++;
    }
  });
  Logger.log('🗑️ Triggers eliminados: ' + eliminados);
  return 'Triggers eliminados: ' + eliminados;
}
