import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const multasService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.multas}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('multas');
    const socios = storageAdapter.getAll('socios');
    const prestamos = storageAdapter.getAll('prestamos');
    const ejemplares = storageAdapter.getAll('ejemplares');
    const libros = storageAdapter.getAll('libros');

    let hydrated = items.map((m) => {
      const socio = socios.find((s) => Number(s.id) === Number(m.socio_id));
      const prestamo = prestamos.find((p) => Number(p.id) === Number(m.prestamo_id));
      const ejemplar = prestamo ? ejemplares.find((e) => Number(e.id) === Number(prestamo.ejemplar_id)) : null;
      const libro = ejemplar ? libros.find((l) => Number(l.id) === Number(ejemplar.libro_id)) : null;

      return {
        ...m,
        socio: socio || { nombre: 'Socio no registrado', apellidos: '', dni: '-' },
        prestamo: prestamo || { id: m.prestamo_id, fecha_prestamo: '-' },
        libro: libro || { titulo: 'Material bibliográfico' }
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      hydrated = hydrated.filter(
        (m) =>
          `${m.socio.nombre} ${m.socio.apellidos}`.toLowerCase().includes(q) ||
          m.socio.dni.includes(q) ||
          m.motivo.toLowerCase().includes(q) ||
          String(m.prestamo_id).includes(q)
      );
    }

    if (params.estado && params.estado !== 'todos') {
      hydrated = hydrated.filter((m) => m.estado === params.estado);
    }

    return hydrated;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.multas}/${id}`);
      return await res.json();
    }

    const multa = storageAdapter.getById('multas', id);
    if (!multa) return null;

    const socio = storageAdapter.getById('socios', multa.socio_id);
    const prestamo = storageAdapter.getById('prestamos', multa.prestamo_id);

    return {
      ...multa,
      socio,
      prestamo
    };
  },

  async create(data) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.multas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    }

    // Validar préstamo existente
    const prestamo = storageAdapter.getById('prestamos', data.prestamo_id);
    if (!prestamo) {
      throw new Error('El préstamo seleccionado no existe.');
    }

    const importe = parseFloat(data.importe);
    if (isNaN(importe) || importe <= 0) {
      throw new Error('El importe de la multa debe ser un valor monetario positivo mayor a 0.');
    }

    const nuevaMulta = {
      prestamo_id: Number(data.prestamo_id),
      socio_id: Number(prestamo.socio_id), // Llave foránea coherente derivada del préstamo
      importe: Number(importe.toFixed(2)),
      fecha_emision: data.fecha_emision || new Date().toISOString().slice(0, 10),
      motivo: data.motivo || 'Retraso en devolución de ejemplar',
      estado: data.estado || 'Pendiente',
      fecha_pago: data.estado === 'Pagada' ? (data.fecha_pago || new Date().toISOString().slice(0, 10)) : null
    };

    return storageAdapter.create('multas', nuevaMulta);
  },

  async cambiarEstado(id, nuevoEstado) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.multas}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      return await res.json();
    }

    const fechaPago = nuevoEstado === 'Pagada' ? new Date().toISOString().slice(0, 10) : null;

    return storageAdapter.update('multas', id, {
      estado: nuevoEstado,
      fecha_pago: fechaPago
    });
  },

  async update(id, updates) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.multas}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    }

    return storageAdapter.update('multas', id, updates);
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.multas}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    return storageAdapter.delete('multas', id);
  }
};
