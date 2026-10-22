/**
 * Validaciones comunes de formularios en Biblioteca-SQL
 */

export const validateRequired = (val, fieldName = 'Este campo') => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `${fieldName} es obligatorio.`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null; // Si no es requerido, se salta
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return 'Ingrese un correo electrónico válido.';
  }
  return null;
};

export const validateISBN = (isbn) => {
  if (!isbn || !isbn.trim()) {
    return 'El código ISBN es obligatorio.';
  }
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 10 && clean.length !== 13) {
    return 'El ISBN debe contener 10 o 13 dígitos numéricos (puede incluir guiones).';
  }
  return null;
};

export const validateDateOrder = (startDate, endDate, errorMsg = 'La fecha final no puede ser anterior a la inicial.') => {
  if (!startDate || !endDate) return null;
  if (endDate < startDate) {
    return errorMsg;
  }
  return null;
};
