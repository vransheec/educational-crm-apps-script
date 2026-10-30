# Educational CRM — Google Apps Script

CRM educativo para la gestión de certificaciones profesionales en tecnología, construido íntegramente sobre **Google Apps Script** (backend `.gs` + frontend `.html`) y el ecosistema de Google Workspace (Sheets como base de datos, Calendar, Classroom, Drive y Gmail).

> Proyecto de portafolio. Todos los identificadores, URLs, correos y datos han sido reemplazados por **placeholders**. No contiene credenciales ni información real.

## Características

- **Ventas y matrículas:** registro de ventas (curso, simulador, paquete a medida), generación de matrículas y cuotas programadas.
- **Cobranza:** recordatorios de pago automáticos y seguimiento de saldos.
- **Secciones:** programación de secciones con sincronización a Google Calendar (eventos recurrentes con Meet) y Classroom.
- **Gestión de leads:** tablero Kanban de leads provenientes de un bot externo, con remarketing automático.
- **Dashboard:** reportes de ingresos y margen por sección.
- **Plantillas de email:** editor de plantillas con preview y envío vía Gmail.
- **Integración con Drive:** creación automática de carpetas por sección a partir de una carpeta maestra.

## Arquitectura

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para el detalle del modelo de datos, reglas de negocio e integraciones.

### Backend (`.gs`)
| Módulo | Responsabilidad |
|---|---|
| `_Code.gs` | Routing, `saveVenta`, `savePago`, funciones principales |
| `DatabaseModule.gs` | Acceso a la base de datos (Sheets), logs, `getSheet` |
| `VentasModule.gs` | Ventas, simuladores, alumnos por sección |
| `CobranzaModule.gs` | Cobranza y recordatorios de pago |
| `SeccionesModule.gs` | Secciones, Calendar, finalización automática |
| `CursosModule.gs` / `DocentesModule.gs` / `CertificacionesModule.gs` | CRUD |
| `FileSystemModule.gs` | Drive, carpetas, imágenes |
| `LeadsModule.gs` | Remarketing y sync de leads |
| `PlantillasModule.gs` | Emails (templates, preview, envío) |
| `DashboardModule.gs` / `FinanzasModule.gs` | Reportes e indicadores |
| `CoreFunctions.gs` | Auxiliares compartidas |

### Frontend (`.html`)
`index.html` (ventas), `script.html` (JS del formulario), `styles.html` (CSS), `nav.html`, `footer.html`, `config.html`, y páginas por módulo: alumnos, cobranza, cursos, dashboard, docentes, leads, mantenimiento, pagos, plantillas, secciones, documentacion, etc.

## Puesta en marcha

Requiere [clasp](https://github.com/google/clasp) y una cuenta de Google.

```bash
# 1. Instalar clasp
npm install -g @google/clasp

# 2. Autenticarse
clasp login

# 3. Configurar el proyecto
cp .clasp.json.example .clasp.json
# edita .clasp.json y coloca tu scriptId real

# 4. Subir el código
clasp push --force

# 5. Desplegar como web app
clasp deploy -i YOUR_DEPLOYMENT_ID -d "Descripción del deploy"
```

### Configuración necesaria

Antes de usar, reemplaza los placeholders por tus propios valores:

| Placeholder | Dónde | Qué es |
|---|---|---|
| `YOUR_SCRIPT_ID` | `.clasp.json` | ID del proyecto de Apps Script |
| `YOUR_DATABASE_SPREADSHEET_ID` | código `.gs` | Spreadsheet que actúa como base de datos |
| `YOUR_LEADS_SPREADSHEET_ID` | código `.gs` | Spreadsheet externo de leads |
| `YOUR_DRIVE_FILE_ID` / `YOUR_FOLDER_ID` | código `.gs` | Archivos/carpetas de Drive |
| `YOUR_DEPLOYMENT_ID` | deploy / URLs | ID de deployment de la web app |
| `YOUR_GCP_PROJECT_NUMBER` | GCP | Número de proyecto de Google Cloud |
| `admin@example.com` / `contact@example.com` / `owner@example.com` | código | Correos de la organización |

## Triggers

| Función | Frecuencia |
|---|---|
| `enviarRecordatoriosPago` | Diario (1pm–2pm) |
| `moverLeadsARemarketing` | Cada hora |
| `finalizarSeccionesTerminadas` | Diario (6am–7am) |

## GCP y APIs

Requiere un proyecto de Google Cloud (`YOUR_GCP_PROJECT_NUMBER`) con las APIs habilitadas: Calendar, Drive, Sheets, Classroom y Meet.

## Licencia

Código de ejemplo para portafolio. Úsalo libremente como referencia.
