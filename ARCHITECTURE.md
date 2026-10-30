# Arquitectura del Sistema

## Base de Datos (Google Sheets)
Spreadsheet ID: `YOUR_DATABASE_SPREADSHEET_ID`

### Hojas Principales
| Hoja | Descripción |
|---|---|
| Alumnos | ID, Nombre, Gmail, Telefono, Pais, LinkedIn, EsTest |
| Matriculas | ID, AlumnoID, Seccion, Precio, IncluyeExamen, EstadoPago, TotalPagado, EstadoMatricula, Saldo, FechaMatricula, Observaciones, EsTest, ID_Venta, FechaInicioComprometida, Modalidad, MontoExamen, ConstanciaGenerada, ConstanciaEnviada |
| Pagos | ID, MatriculaId, NumeroCuota, Monto, MedioPago, TipoPago, IdOperacion, Fecha, EsTest |
| Secciones | Codigo, NombreCurso, Tecnologia, Provider, Nivel, DocenteID, DocenteNombre, HorasTotales, Mes, Año, Frecuencia, PuestoEnMes, Estado, FechaInicio, FechaFin, Confirmada, FechaCreacion, EsTest, DriveFolderId, CodigoCursoBD, CalendarEventId, ClassroomId |
| Cursos | Codigo, Nombre, Tecnologia, Provider, Nivel, Horas, PrecioBase, Frecuencia, Beneficios, Requisitos_Clase, URLImagen, FileId |
| Docentes | ID, Nombre, Email, Telefono, LinkedIn, Certificaciones, CursosQueDicta, TarifaHora, Foto, FileId |
| Ventas | ID_Venta, ID_Alumno, Fecha, PrecioTotal, TipoPago, CantidadCursos, MedioPago, ID_Operacion, Secciones, EsTest |
| CuotasProgramadas | ID_Venta, NumeroCuota, Monto, FechaVencimiento |
| VentasSimulador | ID, AlumnoID, Cursos, Meses, PrecioTotal, MedioPago, IdOperacion, FechaVenta, FechaInicio, FechaFin, Password, EsTest |
| BeneficiosCustom | ID_Matricula, Beneficio, Meses, FechaInicio, MontoExamen, Sesiones, Seccion |
| HistorialReprogramaciones | Seccion, CodigoAnterior, CodigoNuevo, FechaAnterior, FechaNueva, FechaDelCambio |
| Logs | Fecha, Accion, Tabla, ID, Detalle, Usuario |

### Hoja Externa (Leads)
Spreadsheet ID: `YOUR_LEADS_SPREADSHEET_ID`
Columnas: TIMESTAMP(A), TEL(B), PROVIDER(C), CURSO(D), CTA(E), MEDIO_PAGO(F), ASESOR(G), ACCION(H), MENSAJES_CLIENTE(I), ULTIMO_MSG_BOT(J), ESTADO_BOT(K), MENSAJE/CONTACTO(L), LLAMADA(M), KANBA(N)

## Modalidades de Compra
| Modalidad | Precio Default | Simulador | Beneficios |
|---|---|---|---|
| Basic | $99 | No | Clases en vivo, material, guía examen, grabaciones 1 mes |
| Pro | PrecioBase BD | 60 días | Todos los beneficios estándar del curso |
| Certify | $300 | 120 días | Estándar + Examen pagado + 4 meses simulador + 2 sesiones 1:1 |
| Custom | Libre | Configurable | Beneficios individuales por curso |

## Reglas de Negocio
- Simulador se gatilla SOLO cuando el alumno completa el pago del curso
- Para Certify: recursos se desbloquean cuando totalPagado >= (precio - montoExamen)
- Basic NO tiene acceso a simulador ni Banco de Preguntas
- Remarketing: leads con ESTADO_BOT FINALIZADO/CONFIRMO_MEET + 22h reales → REMARKETING
- Constancias: se generan 3 días después de la última clase, solo para alumnos con Pago Completo
- Reprogramaciones: máximo 2-4 por alumno según caso

## Integraciones
- **Google Calendar:** Series recurrentes con Meet (RESTRICTED + auto-record + co-host docente)
- **Google Classroom:** Invitaciones a estudiantes y docentes
- **Google Drive:** Carpeta por sección copiada de CARPETA MAESTRA, Banco de Preguntas compartido individualmente
- **Google Meet API:** Access type RESTRICTED, grabación automática
- **AWS Lambda:** Creación de usuarios en simulador de examen
- **Meta/WhatsApp:** Leads desde bot (sheet externo)

## Modelo de Ejecución y Propiedad de Recursos
- **Web app config (`appsscript.json`):** `executeAs: "USER_DEPLOYING"`, `access: "ANYONE_ANONYMOUS"`.
- **Cuenta propietaria:** `admin@example.com` (cuenta que despliega el proyecto y con la que se autentica clasp).
- **Implicancia clave:** todo el código del backend se ejecuta con la identidad de la cuenta que hizo el **deployment** (`admin@example.com`), NO con la del usuario que abre el CRM en ese momento (p. ej. `contact@example.com`). El acceso es anónimo, pero la ejecución siempre es como el deployer.
- **Por lo tanto, todos los recursos se crean bajo `admin@example.com`:**
  - **Drive:** las carpetas de sección (`crearCarpetaSeccionDrive`) quedan en el Drive de esa cuenta.
  - **Classroom:** los cursos se crean con `ownerId: 'me'`, que se resuelve a `admin@example.com` (es el profesor/propietario del curso).
  - **Calendar:** los eventos se crean en el calendario `primary` de esa cuenta (organizador).
- **Requisitos de la cuenta propietaria:** debe tener acceso de edición a la carpeta maestra de Drive, permisos de profesor en Classroom, y ser el organizador en Calendar.
- **Advertencia:** si se reautentica clasp o se re-despliega el web app con OTRA cuenta, los recursos nuevos empezarían a crearse en esa otra cuenta y se fragmentaría la propiedad. Mantener siempre el deployment bajo `admin@example.com`.

## Flujo de Carpetas Drive
- Origen: `My Drive/A. ACADÉMICA/Contenido Académico/CARPETA MAESTRA/[Provider]/[CodigoCurso] (maestra)`
- Destino: `My Drive/A. ACADÉMICA/Contenido Académico/Classroom/[Provider]/[CodigoCursoBD]/[Seccion] [NombreCurso] [Frecuencia]`
- Banco de Preguntas: se comparte desde la maestra directamente (no se copia)
