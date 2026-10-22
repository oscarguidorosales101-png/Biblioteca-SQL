import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const editorialesService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.editoriales}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('editoriales');

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          (e.pais && e.pais.toLowerCase().includes(q))
      );
    }

    return items;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.editoriales}/${id}`);
      return await res.json();
    }

    const editorial = storageAdapter.getById('editoriales', id);
    if (!editorial) return null;

    const libros = storageAdapter.getAll('libros').filter((l) => Number(l.editorial_id) === Number(id));

    return {
      ...editorial,
      libros
    };
  },

  async create(data) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.editoriales}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    }

    return storageAdapter.create('editoriales', data);
  },

  async update(id, updates) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.editoriales}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    }

    return storageAdapter.update('editoriales', id, updates);
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.editoriales}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    // Regla de integridad conceptual: no eliminar editorial si tiene libros asociados
    const libros = storageAdapter.getAll('libros');
    const librosAsociados = libros.some((l) => Number(l.editorial_id) === Number(id));

    if (librosAsociados) {
      throw new Error('No es posible eliminar la editorial porque tiene libros vinculados en el catálogo.');
    }

    return storageAdapter.delete('editoriales', id);
  }
};
