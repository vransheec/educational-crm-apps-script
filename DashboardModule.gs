/**
 * DASHBOARD MODULE
 * Funciones para el dashboard y reportes
 */

/**
 * Obtiene datos del dashboard principal
 */
function getDashboardData() {
  try {
    Logger.log('=== getDashboardData ===');
    
    const ventasData = getCobranzaData();
    const alumnos = getAlumnos();
    const cursos = getCursos();
    const docentes = getDocentes();
    const secciones = getSecciones();
    
    // Calcular estadísticas
    const totalVentas = ventasData.ventas.length;
    const totalAlumnos = alumnos.length;
    const totalCursos = cursos.length;
    const totalDocentes = docentes.length;
    const totalSecciones = secciones.length;
    
    // Calcular ingresos
    const ingresosTotales = ventasData.ventas.reduce((sum, venta) => sum + (parseFloat(venta.Precio) || 0), 0);
    const pagosTotales = ventasData.pagos.reduce((sum, pago) => sum + (parseFloat(pago.Monto) || 0), 0);
    
    // Ventas por mes (últimos 6 meses)
    const ventasPorMes = calcularVentasPorMes(ventasData.ventas);
    
    // Cursos más populares
    const cursosPopulares = calcularCursosPopulares(ventasData.ventas);
    
    // Docentes más activos
    const docentesActivos = calcularDocentesActivos(secciones);
    
    const dashboard = {
      resumen: {
        totalVentas: totalVentas,
        totalAlumnos: totalAlumnos,
        totalCursos: totalCursos,
        totalDocentes: totalDocentes,
        totalSecciones: totalSecciones,
        ingresosTotales: ingresosTotales,
        pagosTotales: pagosTotales,
        saldoPendiente: ingresosTotales - pagosTotales
      },
      graficos: {
        ventasPorMes: ventasPorMes,
        cursosPopulares: cursosPopulares,
        docentesActivos: docentesActivos
      },
      alertas: generarAlertas(ventasData, alumnos, secciones)
    };
    
    Logger.log('Dashboard generado correctamente');
    return dashboard;
  } catch (error) {
    Logger.log('ERROR en getDashboardData: ' + error.toString());
    return {
      resumen: {},
      graficos: {},
      alertas: []
    };
  }
}

/**
 * Calcula ventas por mes
 */
function calcularVentasPorMes(ventas) {
  try {
    const ventasPorMes = {};
    const hoy = new Date();
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const clave = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
      ventasPorMes[clave] = { ventas: 0, ingresos: 0 };
    }
    
    // Contar ventas
    ventas.forEach(venta => {
      if (venta.Fecha) {
        const fecha = new Date(venta.Fecha);
        const clave = fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0');
        
        if (ventasPorMes[clave]) {
          ventasPorMes[clave].ventas++;
          ventasPorMes[clave].ingresos += parseFloat(venta.Precio) || 0;
        }
      }
    });
    
    return ventasPorMes;
  } catch (error) {
    Logger.log('ERROR en calcularVentasPorMes: ' + error.toString());
    return {};
  }
}

/**
 * Calcula cursos más populares
 */
function calcularCursosPopulares(ventas) {
  try {
    const cursosCount = {};
    
    ventas.forEach(venta => {
      const curso = venta.Curso || 'Sin especificar';
      cursosCount[curso] = (cursosCount[curso] || 0) + 1;
    });
    
    // Convertir a array y ordenar
    const cursosArray = Object.entries(cursosCount)
      .map(([curso, count]) => ({ curso: curso, ventas: count }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 5); // Top 5
    
    return cursosArray;
  } catch (error) {
    Logger.log('ERROR en calcularCursosPopulares: ' + error.toString());
    return [];
  }
}

/**
 * Calcula docentes más activos
 */
function calcularDocentesActivos(secciones) {
  try {
    const docentesCount = {};
    
    secciones.forEach(seccion => {
      const docente = seccion.Docente || 'Sin asignar';
      docentesCount[docente] = (docentesCount[docente] || 0) + 1;
    });
    
    // Convertir a array y ordenar
    const docentesArray = Object.entries(docentesCount)
      .map(([docente, count]) => ({ docente: docente, secciones: count }))
      .sort((a, b) => b.secciones - a.secciones)
      .slice(0, 5); // Top 5
    
    return docentesArray;
  } catch (error) {
    Logger.log('ERROR en calcularDocentesActivos: ' + error.toString());
    return [];
  }
}

/**
 * Genera alertas del sistema
 */
function generarAlertas(ventasData, alumnos, secciones) {
  try {
    const alertas = [];
    
    // Alertas de pagos pendientes
    const pagosPendientes = ventasData.ventas.filter(v => v.Estado === 'Pendiente');
    if (pagosPendientes.length > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Pagos Pendientes',
        mensaje: `Hay ${pagosPendientes.length} pagos pendientes por procesar`,
        accion: 'Ver Cobranza'
      });
    }
    
    // Alertas de secciones próximas a iniciar
    const hoy = new Date();
    const proximasSecciones = secciones.filter(s => {
      if (s.FechaInicio) {
        const fechaInicio = new Date(s.FechaInicio);
        const diasHastaInicio = Math.ceil((fechaInicio - hoy) / (1000 * 60 * 60 * 24));
        return diasHastaInicio > 0 && diasHastaInicio <= 7;
      }
      return false;
    });
    
    if (proximasSecciones.length > 0) {
      alertas.push({
        tipo: 'info',
        titulo: 'Secciones Próximas',
        mensaje: `${proximasSecciones.length} secciones iniciarán en los próximos 7 días`,
        accion: 'Ver Secciones'
      });
    }
    
    // Alertas de secciones con pocos alumnos
    const seccionesPocoAlumnos = secciones.filter(s => 
      (s.AlumnosInscritos || 0) < 3 && s.Estado === 'Activa'
    );
    
    if (seccionesPocoAlumnos.length > 0) {
      alertas.push({
        tipo: 'warning',
        titulo: 'Secciones con Pocos Alumnos',
        mensaje: `${seccionesPocoAlumnos.length} secciones tienen menos de 3 alumnos inscritos`,
        accion: 'Ver Secciones'
      });
    }
    
    return alertas;
  } catch (error) {
    Logger.log('ERROR en generarAlertas: ' + error.toString());
    return [];
  }
}

/**
 * Obtiene reporte de ventas por período
 */
function getReporteVentas(fechaInicio, fechaFin) {
  try {
    Logger.log('=== getReporteVentas ===');
    Logger.log('Período: ' + fechaInicio + ' - ' + fechaFin);
    
    const ventasData = getCobranzaData();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    const ventasPeriodo = ventasData.ventas.filter(venta => {
      if (venta.Fecha) {
        const fechaVenta = new Date(venta.Fecha);
        return fechaVenta >= inicio && fechaVenta <= fin;
      }
      return false;
    });
    
    const pagosPeriodo = ventasData.pagos.filter(pago => {
      if (pago.Fecha) {
        const fechaPago = new Date(pago.Fecha);
        return fechaPago >= inicio && fechaPago <= fin;
      }
      return false;
    });
    
    const reporte = {
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      ventas: {
        total: ventasPeriodo.length,
        monto: ventasPeriodo.reduce((sum, v) => sum + (parseFloat(v.Precio) || 0), 0),
        detalle: ventasPeriodo
      },
      pagos: {
        total: pagosPeriodo.length,
        monto: pagosPeriodo.reduce((sum, p) => sum + (parseFloat(p.Monto) || 0), 0),
        detalle: pagosPeriodo
      }
    };
    
    Logger.log('Reporte generado - Ventas: ' + reporte.ventas.total + ', Pagos: ' + reporte.pagos.total);
    return reporte;
  } catch (error) {
    Logger.log('ERROR en getReporteVentas: ' + error.toString());
    return {
      periodo: { inicio: fechaInicio, fin: fechaFin },
      ventas: { total: 0, monto: 0, detalle: [] },
      pagos: { total: 0, monto: 0, detalle: [] }
    };
  }
}

/**
 * Obtiene estadísticas de cursos
 */
function getEstadisticasCursos() {
  try {
    Logger.log('=== getEstadisticasCursos ===');
    
    const cursos = getCursos();
    const secciones = getSecciones();
    const ventasData = getCobranzaData();
    
    const estadisticas = cursos.map(curso => {
      const seccionesCurso = secciones.filter(s => s.CodigoCurso === curso.Codigo);
      const ventasCurso = ventasData.ventas.filter(v => v.Curso && v.Curso.includes(curso.Codigo));
      
      return {
        codigo: curso.Codigo,
        nombre: curso.Nombre,
        tecnologia: curso.Tecnologia,
        nivel: curso.Nivel,
        secciones: seccionesCurso.length,
        ventas: ventasCurso.length,
        ingresos: ventasCurso.reduce((sum, v) => sum + (parseFloat(v.Precio) || 0), 0),
        alumnosInscritos: seccionesCurso.reduce((sum, s) => sum + (s.AlumnosInscritos || 0), 0)
      };
    });
    
    // Ordenar por ventas
    estadisticas.sort((a, b) => b.ventas - a.ventas);
    
    Logger.log('Estadísticas de cursos generadas: ' + estadisticas.length);
    return estadisticas;
  } catch (error) {
    Logger.log('ERROR en getEstadisticasCursos: ' + error.toString());
    return [];
  }
}