# Changelog

## @502 - Mayo 2026
- Finalización automática de secciones (trigger diario, consulta Calendar)
- Dashboard incluye ventas de simulador en ingresos totales
- Recordatorios de pago automáticos (2 días, 1 día, mismo día antes del inicio)
- getLogs function para módulo de Mantenimiento
- Eliminar Venta actualizada (limpia BeneficiosCustom)

## @501 - Mayo 2026
- Venta Custom (paquete a medida con beneficios por curso)
- Hoja BeneficiosCustom
- Modalidad Custom en gatillarSimulador y compartirDrive

## @500 - Mayo 2026
- Certify: recursos se desbloquean al pagar parte del curso (precio - examen)
- Corregir Modalidad: gatilla simulador + Drive + email credenciales
- gatillarSimuladorConDias con email de credenciales

## @499 - Mayo 2026
- Remarketing 22h reales (sin excluir días)
- Fix drag & drop leads (movidosManualmente Set)
- Margen excluye MontoExamen para Certify
- Checkbox examen solo visible para Pro

## @498 - Mayo 2026
- Fix retroceso columnas tempranas en leads
- REMARKETING_FALLIDO mapea a REMARKETING
- REMARKETING como columna protegida

## @497 - Mayo 2026
- Columna CONFIRMO_MEET reemplaza FINALIZADO
- RECONFIRMO_MEET mapea FINALIZADO del bot
- Batch sync para leads (evita "too many scripts")
- Lógica de retroceso: tempranas no protegen, desde NO_CONFIRMO_MEET sí

## @496 - Mayo 2026
- Lead Scoring (renombrado de Leads)
- Columnas kanban: NO_E_NUBE, NO_E_CERT, NO_E_URGENCIA, MAS_DE_60_DIAS, NO_CONFIRMO_MEET, CONFIRMO_MEET, RECONFIRMO_MEET, ASISTIO_MEET PC/CP, CONVERTIDO, REMARKETING
- Click derecho con menú contextual
- Botón CONTACTADO/NO CONTACTO por tarjeta
- Periodo personalizado con date pickers
- Columnas ocultables

## @495 - Mayo 2026
- Modalidades Basic/Pro/Certify implementadas
- Meet RESTRICTED + auto-record + co-host docente
- Calendar sync (sincronizar alumnos existentes)
- Classroom URL fix (btoa para ID numérico)
- Reprogramaciones visibles en tabla de alumnos
- Constancias migradas al CRM

## Anteriores (hasta @493)
- Sistema base: Ventas, Pagos, Secciones, Alumnos, Docentes
- Google Calendar series recurrentes con Meet
- Google Classroom invitaciones
- Google Drive carpetas por sección
- Simulador online (AWS Lambda)
- Leads Kanban (Meta/WhatsApp)
- Dashboard con margen por sección
- Plantillas de email con logo y redes sociales
- Cuotas programadas, ID_Venta
- Reprogramar, Fusionar, Mover alumno
- Modo Test con limpieza
