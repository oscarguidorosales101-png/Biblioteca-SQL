import { storageAdapter } from './storageAdapter';
import { isLocalMode, API_CONFIG } from './apiConfig';

export const librosService = {
  async getAll(params = {}) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.libros}`);
      return await res.json();
    }

    let items = storageAdapter.getAll('libros');
    const editoriales = storageAdapter.getAll('editoriales');
    const autores = storageAdapter.getAll('autores');
    const librosAutores = storageAdapter.getAll('libros_autores');
    const ejemplares = storageAdapter.getAll('ejemplares');

    // Hidratar con editorial, autores y conteo de ejemplares
    let hydrated = items.map((libro) => {
      const editorial = editoriales.find((e) => Number(e.id) === Number(libro.editorial_id));
      const authorRel = librosAutores.filter((r) => Number(r.libro_id) === Number(libro.id));
      const autoresList = authorRel
        .map((r) => autores.find((a) => Number(a.id) === Number(r.autor_id)))
        .filter(Boolean);

      const ejemplaresLibro = ejemplares.filter((e) => Number(e.libro_id) === Number(libro.id));
      const ejemplaresDisponibles = ejemplaresLibro.filter((e) => e.disponibilidad === 'Disponible').length;

      return {
        ...libro,
        editorial: editorial || { nombre: 'Sin editorial asignada' },
        autores: autoresList,
        totalEjemplares: ejemplaresLibro.length,
        ejemplaresDisponibles
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      hydrated = hydrated.filter(
        (l) =>
          l.titulo.toLowerCase().includes(q) ||
          l.isbn.toLowerCase().includes(q) ||
          (l.genero && l.genero.toLowerCase().includes(q)) ||
          l.autores.some((a) => `${a.nombre} ${a.apellidos}`.toLowerCase().includes(q))
      );
    }

    if (params.editorial_id && params.editorial_id !== 'todas') {
      hydrated = hydrated.filter((l) => Number(l.editorial_id) === Number(params.editorial_id));
    }

    return hydrated;
  },

  async getById(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.libros}/${id}`);
      return await res.json();
    }

    const libro = storageAdapter.getById('libros', id);
    if (!libro) return null;

    const editoriales = storageAdapter.getAll('editoriales');
    const autores = storageAdapter.getAll('autores');
    const librosAutores = storageAdapter.getAll('libros_autores');
    const ejemplares = storageAdapter.getAll('ejemplares');

    const editorial = editoriales.find((e) => Number(e.id) === Number(libro.editorial_id));
    const authorRel = librosAutores.filter((r) => Number(r.libro_id) === Number(id));
    const autoresList = authorRel
      .map((r) => autores.find((a) => Number(a.id) === Number(r.autor_id)))
      .filter(Boolean);

    const ejemplaresList = ejemplares.filter((e) => Number(e.libro_id) === Number(id));

    return {
      ...libro,
      editorial,
      autores: autoresList,
      autoresIds: authorRel.map((r) => r.autor_id),
      ejemplares: ejemplaresList
    };
  },

  async create(data, authorIds = []) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.libros}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, authorIds })
      });
      return await res.json();
    }

    // Validación de unicidad de ISBN (restricción relacional UNIQUE)
    const existing = storageAdapter.getAll('libros');
    const isbnExists = existing.some(
      (l) => l.isbn.replace(/[-\s]/g, '') === (data.isbn || '').replace(/[-\s]/g, '')
    );
    if (isbnExists) {
      throw new Error(`El código ISBN "${data.isbn}" ya se encuentra registrado en otro título.`);
    }

    const nuevoLibro = storageAdapter.create('libros', data);

    // Guardar relaciones en libros_autores
    if (Array.isArray(authorIds) && authorIds.length > 0) {
      const relaciones = storageAdapter.getAll('libros_autores');
      const nuevasRel = authorIds.map((autorId, index) => ({
        libro_id: nuevoLibro.id,
        autor_id: Number(autorId),
        orden_autoria: index + 1
      }));
      storageAdapter.setCollection('libros_autores', [...relaciones, ...nuevasRel]);
    }

    return nuevoLibro;
  },

  async update(id, updates, authorIds = null) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.libros}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, authorIds })
      });
      return await res.json();
    }

    // Validación de unicidad de ISBN excluyendo el registro actual
    if (updates.isbn) {
      const existing = storageAdapter.getAll('libros');
      const isbnConflict = existing.some(
        (l) =>
          Number(l.id) !== Number(id) &&
          l.isbn.replace(/[-\s]/g, '') === updates.isbn.replace(/[-\s]/g, '')
      );
      if (isbnConflict) {
        throw new Error(`El código ISBN "${updates.isbn}" ya está asignado a otro libro.`);
      }
    }

    const updated = storageAdapter.update('libros', id, updates);

    // Actualizar relaciones en libros_autores si se suministraron authorIds
    if (Array.isArray(authorIds)) {
      const relaciones = storageAdapter.getAll('libros_autores');
      const filtered = relaciones.filter((r) => Number(r.libro_id) !== Number(id));
      const nuevasRel = authorIds.map((autorId, index) => ({
        libro_id: Number(id),
        autor_id: Number(autorId),
        orden_autoria: index + 1
      }));
      storageAdapter.setCollection('libros_autores', [...filtered, ...nuevasRel]);
    }

    return updated;
  },

  async delete(id) {
    if (!isLocalMode()) {
      const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.libros}/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    }

    // Regla de integridad: No eliminar libro con ejemplares físicos existentes
    const ejemplares = storageAdapter.getAll('ejemplares');
    const tieneEjemplares = ejemplares.some((e) => Number(e.libro_id) === Number(id));
    if (tieneEjemplares) {
      throw new Error('No se puede eliminar el título mientras tenga ejemplares físicos registrados en inventario.');
    }

    // Limpiar tabla intermedia libros_autores
    const relaciones = storageAdapter.getAll('libros_autores');
    const filteredRel = relaciones.filter((r) => Number(r.libro_id) !== Number(id));
    storageAdapter.setCollection('libros_autores', filteredRel);

    return storageAdapter.delete('libros', id);
  }
};
