import {
  INITIAL_EDITORIALES,
  INITIAL_AUTORES,
  INITIAL_LIBROS,
  INITIAL_LIBROS_AUTORES,
  INITIAL_SOCIOS,
  INITIAL_EJEMPLARES,
  INITIAL_PRESTAMOS,
  INITIAL_MULTAS
} from '../data/initialData';

const STORAGE_KEYS = {
  editoriales: 'biblioteca_sql_editoriales',
  autores: 'biblioteca_sql_autores',
  libros: 'biblioteca_sql_libros',
  libros_autores: 'biblioteca_sql_libros_autores',
  socios: 'biblioteca_sql_socios',
  ejemplares: 'biblioteca_sql_ejemplares',
  prestamos: 'biblioteca_sql_prestamos',
  multas: 'biblioteca_sql_multas'
};

const INITIAL_COLLECTIONS = {
  editoriales: INITIAL_EDITORIALES,
  autores: INITIAL_AUTORES,
  libros: INITIAL_LIBROS,
  libros_autores: INITIAL_LIBROS_AUTORES,
  socios: INITIAL_SOCIOS,
  ejemplares: INITIAL_EJEMPLARES,
  prestamos: INITIAL_PRESTAMOS,
  multas: INITIAL_MULTAS
};

class StorageAdapter {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    try {
      Object.keys(STORAGE_KEYS).forEach((key) => {
        const storageKey = STORAGE_KEYS[key];
        const existing = localStorage.getItem(storageKey);
        if (!existing) {
          localStorage.setItem(storageKey, JSON.stringify(INITIAL_COLLECTIONS[key]));
        }
      });
    } catch (err) {
      console.warn('[StorageAdapter] No se pudo acceder a localStorage. Operando con datos en memoria:', err);
    }
  }

  getCollection(entityName) {
    const storageKey = STORAGE_KEYS[entityName];
    if (!storageKey) throw new Error(`Entidad no reconocida: ${entityName}`);
    try {
      const data = localStorage.getItem(storageKey);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error(`[StorageAdapter] Error al leer ${entityName}:`, err);
    }
    return INITIAL_COLLECTIONS[entityName] || [];
  }

  setCollection(entityName, items) {
    const storageKey = STORAGE_KEYS[entityName];
    if (!storageKey) throw new Error(`Entidad no reconocida: ${entityName}`);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error(`[StorageAdapter] Error al escribir en ${entityName}:`, err);
    }
  }

  getAll(entityName) {
    return this.getCollection(entityName);
  }

  getById(entityName, id) {
    const items = this.getCollection(entityName);
    return items.find((item) => Number(item.id) === Number(id)) || null;
  }

  create(entityName, itemData) {
    const items = this.getCollection(entityName);
    // Calcular siguiente ID numérico autoincremental
    const maxId = items.reduce((max, cur) => (cur.id && cur.id > max ? cur.id : max), 0);
    const newItem = {
      ...itemData,
      id: Number(itemData.id) || (maxId + 1)
    };
    const updated = [newItem, ...items];
    this.setCollection(entityName, updated);
    return newItem;
  }

  update(entityName, id, updates) {
    const items = this.getCollection(entityName);
    let updatedItem = null;
    const updated = items.map((item) => {
      if (Number(item.id) === Number(id)) {
        updatedItem = { ...item, ...updates, id: item.id };
        return updatedItem;
      }
      return item;
    });
    this.setCollection(entityName, updated);
    return updatedItem;
  }

  delete(entityName, id) {
    const items = this.getCollection(entityName);
    const filtered = items.filter((item) => Number(item.id) !== Number(id));
    this.setCollection(entityName, filtered);
    return true;
  }

  resetAll() {
    try {
      Object.keys(STORAGE_KEYS).forEach((key) => {
        const storageKey = STORAGE_KEYS[key];
        localStorage.setItem(storageKey, JSON.stringify(INITIAL_COLLECTIONS[key]));
      });
      return true;
    } catch (err) {
      console.error('[StorageAdapter] Error al restaurar datos de demostración:', err);
      return false;
    }
  }
}

export const storageAdapter = new StorageAdapter();
