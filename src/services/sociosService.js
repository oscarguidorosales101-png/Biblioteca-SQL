import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const sociosService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.socios}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('socios');

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          s.apellidos.toLowerCase().includes(q) ||
          s.dni.includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (params.estado && params.estado !== 'todos') {
      items = items.filter((s) => s.estado === params.estado);
    }

    return items;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.socios}/${id}`);
      return await res.json();
    }

    const socio = storageAdapter.getById('socios', id);
    if (!socio) return null;

    // Relacionar préstamos y multas del socio
    const todosPrestamos = storageAdapter.getAll('prestamos');
    const todosEjemplares = storageAdapter.getAll('ejemplares');
    const todosLibros = storageAdapter.getAll('libros');
    const todasMultas = storageAdapter.getAll('multas');

    const prestamosSocio = todosPrestamos
      .filter((p) => Number(p.socio_id) === Number(id))
      .map((p) => {
        const ejemplar = todosEjemplares.find((e) => Number(e.id) === Number(p.ejemplar_id));
        const libro = ejemplar ? todosLibros.find((l) => Number(l.id) === Number(ejemplar.libro_id)) : null;
        return { ...p, ejemplar, libro };
      });

    const multasSocio = todasMultas.filter((m) => Number(m.socio_id) === Number(id));

    return {
      ...socio,
      prestamos: prestamosSocio,
      multas: multasSocio
    };
  },

  async create(socioData) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.socios}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socioData)
      });
      return await res.json();
    }

    const nuevoSocio = {
      ...socioData,
      fecha_inscripcion: socioData.fecha_inscripcion || new Date().toISOString().slice(0, 10),
      estado: socioData.estado || 'Activo'
    };

    return storageAdapter.create('socios', nuevoSocio);
  },

  async update(id, updates) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.socios}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    }

    return storageAdapter.update('socios', id, updates);
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.socios}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    // Regla de integridad conceptual: no eliminar socio con préstamos activos
    const prestamos = storageAdapter.getAll('prestamos');
    const tieneActivos = prestamos.some(
      (p) => Number(p.socio_id) === Number(id) && (p.estado === 'Activo' || p.estado === 'Vencido')
    );

    if (tieneActivos) {
      throw new Error('No es posible eliminar el socio porque tiene préstamos activos o pendientes de devolución.');
    }

    return storageAdapter.delete('socios', id);
  }
};
