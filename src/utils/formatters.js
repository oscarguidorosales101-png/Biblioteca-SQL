/**
 * Utilidades de formateo para el frontend de Biblioteca-SQL
 */

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(num).replace('USD', '$');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2].slice(0, 2);
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-ES');
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'Activo':
    case 'Disponible':
    case 'Pagada':
    case 'Devuelto':
      return 'success';
    case 'Vencido':
    case 'Pendiente':
    case 'Suspendido':
    case 'Deteriorado':
      return 'danger';
    case 'Prestado':
    case 'En mantenimiento':
      return 'warning';
    case 'Inactivo':
    case 'Anulada':
    case 'Extraviado':
    default:
      return 'neutral';
  }
};

export const getInitials = (nombre = '', apellidos = '') => {
  const n = (nombre[0] || '').toUpperCase();
  const a = (apellidos[0] || '').toUpperCase();
  return `${n}${a}` || 'B';
};
