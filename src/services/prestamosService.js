import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const prestamosService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.prestamos}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('prestamos');
    const socios = storageAdapter.getAll('socios');
    const ejemplares = storageAdapter.getAll('ejemplares');
    const libros = storageAdapter.getAll('libros');

    const todayStr = new Date().toISOString().slice(0, 10);

    // Hidratar préstamos y verificar si vencieron
    let hydrated = items.map((p) => {
      const socio = socios.find((s) => Number(s.id) === Number(p.socio_id));
      const ejemplar = ejemplares.find((e) => Number(e.id) === Number(p.ejemplar_id));
      const libro = ejemplar ? libros.find((l) => Number(l.id) === Number(ejemplar.libro_id)) : null;

      // Cálculo dinámico de vencimiento si sigue activo y la fecha límite ya pasó
      let estadoActual = p.estado;
      if (p.estado === 'Activo' && p.fecha_devolucion_prevista < todayStr) {
        estadoActual = 'Vencido';
      }

      return {
        ...p,
        estado: estadoActual,
        socio: socio || { nombre: 'Socio no registrado', apellidos: '', dni: '-' },
        ejemplar: ejemplar || { codigo_inventario: 'EJ-DESC' },
        libro: libro || { titulo: 'Libro no identificado' }
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      hydrated = hydrated.filter(
        (p) =>
          `${p.socio.nombre} ${p.socio.apellidos}`.toLowerCase().includes(q) ||
          p.socio.dni.includes(q) ||
          p.libro.titulo.toLowerCase().includes(q) ||
          p.ejemplar.codigo_inventario.toLowerCase().includes(q)
      );
    }

    if (params.estado && params.estado !== 'todos') {
      hydrated = hydrated.filter((p) => p.estado === params.estado);
    }

    return hydrated;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.prestamos}/${id}`);
      return await res.json();
    }

    const prestamo = storageAdapter.getById('prestamos', id);
    if (!prestamo) return null;

    const socio = storageAdapter.getById('socios', prestamo.socio_id);
    const ejemplar = storageAdapter.getById('ejemplares', prestamo.ejemplar_id);
    const libro = ejemplar ? storageAdapter.getById('libros', ejemplar.libro_id) : null;
    const multas = storageAdapter.getAll('multas').filter((m) => Number(m.prestamo_id) === Number(id));

    return {
      ...prestamo,
      socio,
      ejemplar,
      libro,
      multas
    };
  },

  async create(data) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.prestamos}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    }

    // Regla 1: Validar socio existente
    const socio = storageAdapter.getById('socios', data.socio_id);
    if (!socio) {
      throw new Error('El socio especificado no existe.');
    }
    if (socio.estado === 'Suspendido') {
      throw new Error(`El socio ${socio.nombre} ${socio.apellidos} se encuentra con estado "Suspendido". No puede realizar préstamos.`);
    }

    // Regla 2: Validar ejemplar existente y disponible
    const ejemplar = storageAdapter.getById('ejemplares', data.ejemplar_id);
    if (!ejemplar) {
      throw new Error('El ejemplar especificado no existe.');
    }
    if (ejemplar.disponibilidad !== 'Disponible') {
      throw new Error(`El ejemplar "${ejemplar.codigo_inventario}" no está disponible (Estado actual: ${ejemplar.disponibilidad}).`);
    }

    // Regla 3: Validar coherencia de fechas
    const fechaPrestamo = data.fecha_prestamo || new Date().toISOString().slice(0, 10);
    if (data.fecha_devolucion_prevista && data.fecha_devolucion_prevista < fechaPrestamo) {
      throw new Error('La fecha límite de devolución no puede ser anterior a la fecha del préstamo.');
    }

    const nuevoPrestamo = {
      socio_id: Number(data.socio_id),
      ejemplar_id: Number(data.ejemplar_id),
      fecha_prestamo: fechaPrestamo,
      fecha_devolucion_prevista: data.fecha_devolucion_prevista,
      fecha_devolucion_real: null,
      estado: 'Activo',
      observaciones: data.observaciones || ''
    };

    const creado = storageAdapter.create('prestamos', nuevoPrestamo);

    // Regla 4: Al registrar préstamo, el estado del ejemplar pasa a 'Prestado'
    storageAdapter.update('ejemplares', ejemplar.id, { disponibilidad: 'Prestado' });

    return creado;
  },

  async registrarDevolucion(id, fechaDevolucion = null) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.prestamos}/${id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaDevolucion })
      });
      return await res.json();
    }

    const prestamo = storageAdapter.getById('prestamos', id);
    if (!prestamo) {
      throw new Error('Préstamo no encontrado.');
    }

    if (prestamo.estado === 'Devuelto') {
      throw new Error('Este préstamo ya fue registrado como devuelto con anterioridad.');
    }

    const fechaReal = fechaDevolucion || new Date().toISOString().slice(0, 10);

    // Actualizar préstamo a devuelto
    const prestamoActualizado = storageAdapter.update('prestamos', id, {
      estado: 'Devuelto',
      fecha_devolucion_real: fechaReal
    });

    // Regla 5: El ejemplar vuelve a quedar disponible
    storageAdapter.update('ejemplares', prestamo.ejemplar_id, {
      disponibilidad: 'Disponible'
    });

    return prestamoActualizado;
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.prestamos}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    const prestamo = storageAdapter.getById('prestamos', id);
    if (prestamo && prestamo.estado === 'Activo') {
      // Liberar ejemplar si se cancela un préstamo activo
      storageAdapter.update('ejemplares', prestamo.ejemplar_id, { disponibilidad: 'Disponible' });
    }

    return storageAdapter.delete('prestamos', id);
  }
};
