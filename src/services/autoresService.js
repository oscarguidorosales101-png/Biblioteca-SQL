import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const autoresService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.autores}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('autores');

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (a) =>
          a.nombre.toLowerCase().includes(q) ||
          a.apellidos.toLowerCase().includes(q) ||
          (a.nacionalidad && a.nacionalidad.toLowerCase().includes(q))
      );
    }

    return items;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.autores}/${id}`);
      return await res.json();
    }

    const autor = storageAdapter.getById('autores', id);
    if (!autor) return null;

    // Obtener libros asociados mediante la tabla intermedia libros_autores
    const relaciones = storageAdapter.getAll('libros_autores');
    const todosLibros = storageAdapter.getAll('libros');

    const librosIds = relaciones
      .filter((r) => Number(r.autor_id) === Number(id))
      .map((r) => Number(r.libro_id));

    const libros = todosLibros.filter((l) => librosIds.includes(Number(l.id)));

    return {
      ...autor,
      libros
    };
  },

  async create(data) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.autores}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    }

    return storageAdapter.create('autores', data);
  },

  async update(id, updates) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.autores}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    }

    return storageAdapter.update('autores', id, updates);
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.autores}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    // Regla de integridad conceptual: no eliminar autor si tiene libros registrados
    const relaciones = storageAdapter.getAll('libros_autores');
    const tieneObras = relaciones.some((r) => Number(r.autor_id) === Number(id));

    if (tieneObras) {
      throw new Error('No es posible eliminar el autor porque tiene obras literarias registradas en el catálogo.');
    }

    return storageAdapter.delete('autores', id);
  }
};
