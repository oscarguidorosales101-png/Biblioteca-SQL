/**
 * Configuración centralizada de la capa de datos para Biblioteca-SQL
 * Permite alternar limpiamente entre 'local' (localStorage / datos en memoria)
 * y 'http' (futura API REST conectada a PostgreSQL).
 */

export const DATA_SOURCE_MODE = 'local'; // 'local' | 'http'

export const API_CONFIG = {
  mode: DATA_SOURCE_MODE,
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  timeoutMs: 8000,
  endpoints: {
    socios: '/socios',
    libros: '/libros',
    autores: '/autores',
    editoriales: '/editoriales',
    ejemplares: '/ejemplares',
    prestamos: '/prestamos',
    multas: '/multas',
    librosAutores: '/libros-autores',
    dashboard: '/dashboard/metrics'
  }
};

/**
 * Contrato HTTP que deberá implementar el backend en la Fase 2 (PostgreSQL):
 * 
 * GET    /api/v1/socios               -> Lista de socios
 * GET    /api/v1/socios/:id           -> Detalle de socio
 * POST   /api/v1/socios               -> Crear socio
 * PUT    /api/v1/socios/:id           -> Actualizar socio
 * DELETE /api/v1/socios/:id           -> Eliminar socio
 * 
 * GET    /api/v1/libros               -> Lista de libros con editorial y autores
 * POST   /api/v1/libros               -> Crear libro
 * PUT    /api/v1/libros/:id           -> Actualizar libro
 * DELETE /api/v1/libros/:id           -> Eliminar libro
 * 
 * GET    /api/v1/autores              -> Lista de autores
 * POST   /api/v1/autores              -> Crear autor
 * PUT    /api/v1/autores/:id          -> Actualizar autor
 * DELETE /api/v1/autores/:id          -> Eliminar autor
 * 
 * GET    /api/v1/editoriales          -> Lista de editoriales
 * POST   /api/v1/editoriales          -> Crear editorial
 * PUT    /api/v1/editoriales/:id      -> Actualizar editorial
 * DELETE /api/v1/editoriales/:id      -> Eliminar editorial
 * 
 * GET    /api/v1/ejemplares           -> Lista de ejemplares con libro asociado
 * POST   /api/v1/ejemplares           -> Registrar ejemplar
 * PUT    /api/v1/ejemplares/:id       -> Actualizar ejemplar (estado/ubicación)
 * DELETE /api/v1/ejemplares/:id       -> Eliminar ejemplar
 * 
 * GET    /api/v1/prestamos            -> Lista de préstamos con socio y ejemplar
 * POST   /api/v1/prestamos            -> Registrar nuevo préstamo (transaccional)
 * PUT    /api/v1/prestamos/:id/return -> Registrar devolución de ejemplar
 * 
 * GET    /api/v1/multas               -> Lista de multas
 * POST   /api/v1/multas               -> Registrar multa
 * PATCH  /api/v1/multas/:id/status    -> Cambiar estado de pago (Pagada, Anulada)
 */
export const isLocalMode = () => API_CONFIG.mode === 'local';
