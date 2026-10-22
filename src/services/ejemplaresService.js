import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const ejemplaresService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ejemplares}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('ejemplares');
    const libros = storageAdapter.getAll('libros');

    // Hidratar con libro vinculado
    let hydrated = items.map((ej) => {
      const libro = libros.find((l) => Number(l.id) === Number(ej.libro_id));
      return {
        ...ej,
        libro: libro || { titulo: 'Libro no identificado', isbn: '-' }
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      hydrated = hydrated.filter(
        (e) =>
          e.codigo_inventario.toLowerCase().includes(q) ||
          e.ubicacion_estante.toLowerCase().includes(q) ||
          e.libro.titulo.toLowerCase().includes(q)
      );
    }

    if (params.disponibilidad && params.disponibilidad !== 'todas') {
      hydrated = hydrated.filter((e) => e.disponibilidad === params.disponibilidad);
    }

    if (params.libro_id && params.libro_id !== 'todos') {
      hydrated = hydrated.filter((e) => Number(e.libro_id) === Number(params.libro_id));
    }

    return hydrated;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ejemplares}/${id}`);
      return await res.json();
    }

    const ejemplar = storageAdapter.getById('ejemplares', id);
    if (!ejemplar) return null;

    const libro = storageAdapter.getById('libros', ejemplar.libro_id);
    const prestamos = storageAdapter.getAll('prestamos').filter((p) => Number(p.ejemplar_id) === Number(id));

    return {
      ...ejemplar,
      libro,
      historialPrestamos: prestamos
    };
  },

  async create(data) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ejemplares}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    }

    // Validar código de inventario único
    const existing = storageAdapter.getAll('ejemplares');
    const codeExists = existing.some(
      (e) => e.codigo_inventario.toLowerCase() === (data.codigo_inventario || '').toLowerCase()
    );
    if (codeExists) {
      throw new Error(`El código de inventario "${data.codigo_inventario}" ya se encuentra asignado.`);
    }

    const nuevoEjemplar = {
      ...data,
      disponibilidad: data.disponibilidad || 'Disponible',
      estado_conservacion: data.estado_conservacion || 'Excelente',
      fecha_adquisicion: data.fecha_adquisicion || new Date().toISOString().slice(0, 10)
    };

    return storageAdapter.create('ejemplares', nuevoEjemplar);
  },

  async update(id, updates) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ejemplares}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    }

    // Validar código de inventario único excluyendo actual
    if (updates.codigo_inventario) {
      const existing = storageAdapter.getAll('ejemplares');
      const conflict = existing.some(
        (e) =>
          Number(e.id) !== Number(id) &&
          e.codigo_inventario.toLowerCase() === updates.codigo_inventario.toLowerCase()
      );
      if (conflict) {
        throw new Error(`El código de inventario "${updates.codigo_inventario}" ya pertenece a otro ejemplar.`);
      }
    }

    return storageAdapter.update('ejemplares', id, updates);
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ejemplares}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    // Regla de integridad: No eliminar si está actualmente prestado
    const ejemplar = storageAdapter.getById('ejemplares', id);
    if (ejemplar && ejemplar.disponibilidad === 'Prestado') {
      throw new Error('No es posible eliminar un ejemplar que se encuentra actualmente prestado.');
    }

    return storageAdapter.delete('ejemplares', id);
  }
};
