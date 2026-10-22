import { storageAdapter } from './storageAdapter';
import { prestamosService } from './prestamosService';

export const dashboardService = {
  async getMetrics() {
    const libros = storageAdapter.getAll('libros');
    const ejemplares = storageAdapter.getAll('ejemplares');
    const socios = storageAdapter.getAll('socios');
    const prestamos = await prestamosService.getAll();
    const multas = storageAdapter.getAll('multas');

    // Totales principales
    const totalTitulos = libros.length;
    const totalEjemplares = ejemplares.length;
    const totalSocios = socios.length;
    const prestamosActivos = prestamos.filter((p) => p.estado === 'Activo').length;
    const prestamosVencidos = prestamos.filter((p) => p.estado === 'Vencido').length;
    const multasPendientes = multas.filter((m) => m.estado === 'Pendiente').length;

    // Suma monetaria de multas pendientes
    const montoMultasPendientes = multas
      .filter((m) => m.estado === 'Pendiente')
      .reduce((sum, m) => sum + (Number(m.importe) || 0), 0);

    // Distribución de préstamos por estado
    const prestamosPorEstado = [
      { name: 'Activos', valor: prestamosActivos, color: '#0969DA' },
      { name: 'Vencidos', valor: prestamosVencidos, color: '#D93838' },
      { name: 'Devueltos', valor: prestamos.filter((p) => p.estado === 'Devuelto').length, color: '#22863A' }
    ];

    // Distribución de ejemplares por disponibilidad
    const disponiblesCount = ejemplares.filter((e) => e.disponibilidad === 'Disponible').length;
    const prestadosCount = ejemplares.filter((e) => e.disponibilidad === 'Prestado').length;
    const mantCount = ejemplares.filter((e) => e.disponibilidad === 'En mantenimiento').length;
    const extraviadosCount = ejemplares.filter((e) => e.disponibilidad === 'Extraviado').length;

    const ejemplaresPorEstado = [
      { name: 'Disponible', valor: disponiblesCount, color: '#22863A' },
      { name: 'Prestado', valor: prestadosCount, color: '#E66A6A' },
      { name: 'Mantenimiento', valor: mantCount, color: '#B07D05' },
      { name: 'Extraviado', valor: extraviadosCount, color: '#8E8E93' }
    ];

    // Préstamos recientes (últimos 5)
    const ultimosPrestamos = [...prestamos]
      .sort((a, b) => new Date(b.fecha_prestamo) - new Date(a.fecha_prestamo))
      .slice(0, 5);

    return {
      kpis: {
        totalTitulos,
        totalEjemplares,
        totalSocios,
        prestamosActivos,
        prestamosVencidos,
        multasPendientes,
        montoMultasPendientes
      },
      charts: {
        prestamosPorEstado,
        ejemplaresPorEstado
      },
      ultimosPrestamos
    };
  }
};
