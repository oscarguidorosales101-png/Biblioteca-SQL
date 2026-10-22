import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { prestamosService } from '../services/prestamosService';
import { sociosService } from '../services/sociosService';
import { ejemplaresService } from '../services/ejemplaresService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate, getStatusBadgeVariant } from '../utils/formatters';
import { validateRequired, validateDateOrder } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const PrestamosPage = () => {
  const location = useLocation();
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [prestamos, setPrestamos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [ejemplaresDisponibles, setEjemplaresDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDevolucionModalOpen, setIsDevolucionModalOpen] = useState(false);

  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [detailedPrestamo, setDetailedPrestamo] = useState(null);
  const [fechaDevolucionInput, setFechaDevolucionInput] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Form State
  const getFutureDateStr = (days = 14) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const initialFormData = {
    socio_id: '',
    ejemplar_id: '',
    fecha_prestamo: new Date().toISOString().slice(0, 10),
    fecha_devolucion_prevista: getFutureDateStr(14),
    observaciones: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prestamosData, sociosData, ejData] = await Promise.all([
        prestamosService.getAll({ search, estado: estadoFilter }),
        sociosService.getAll(),
        ejemplaresService.getAll({ disponibilidad: 'Disponible' })
      ]);
      setPrestamos(prestamosData);
      setSocios(sociosData);
      setEjemplaresDisponibles(ejData);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar préstamos de circulación.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, estadoFilter, dataVersion]);

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setSelectedPrestamo(null);
    setFormData({
      ...initialFormData,
      fecha_prestamo: new Date().toISOString().slice(0, 10),
      fecha_devolucion_prevista: getFutureDateStr(14)
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (prestamo) => {
    try {
      const full = await prestamosService.getById(prestamo.id);
      setDetailedPrestamo(full);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al cargar detalle del préstamo.', 'error');
    }
  };

  const handleOpenDevolucion = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setFechaDevolucionInput(new Date().toISOString().slice(0, 10));
    setIsDevolucionModalOpen(true);
  };

  const handleOpenDelete = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.socio_id) {
      errors.socio_id = 'Debe seleccionar un socio.';
    }

    if (!formData.ejemplar_id) {
      errors.ejemplar_id = 'Debe seleccionar un ejemplar disponible.';
    }

    const errFechaP = validateRequired(formData.fecha_prestamo, 'La fecha del préstamo');
    if (errFechaP) errors.fecha_prestamo = errFechaP;

    const errFechaDev = validateRequired(formData.fecha_devolucion_prevista, 'La fecha límite de devolución');
    if (errFechaDev) errors.fecha_devolucion_prevista = errFechaDev;

    const errOrden = validateDateOrder(
      formData.fecha_prestamo,
      formData.fecha_devolucion_prevista,
      'La fecha de devolución no puede ser anterior a la fecha del préstamo.'
    );
    if (errOrden) errors.fecha_devolucion_prevista = errOrden;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await prestamosService.create(formData);
      showToast('Préstamo registrado exitosamente. El ejemplar pasa a estar prestado.', 'success');
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al procesar el préstamo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDevolucion = async () => {
    if (!selectedPrestamo) return;
    try {
      setSubmitting(true);
      await prestamosService.registrarDevolucion(selectedPrestamo.id, fechaDevolucionInput);
      showToast('Devolución completada. El ejemplar se ha reintegrado al acervo como disponible.', 'success');
      setIsDevolucionModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al registrar devolución.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPrestamo) return;
    try {
      setSubmitting(true);
      await prestamosService.delete(selectedPrestamo.id);
      showToast('Préstamo eliminado del registro.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar préstamo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '60px',
      render: (row) => <span className="table-cell-id">#{row.id}</span>
    },
    {
      header: 'Lector / Socio (1:N)',
      accessor: (row) => `${row.socio?.nombre} ${row.socio?.apellidos}`,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.socio?.nombre} {row.socio?.apellidos}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            DNI: {row.socio?.dni}
          </div>
        </div>
      )
    },
    {
      header: 'Libro y Ejemplar (1:N)',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.libro?.titulo}</div>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem', marginTop: 2 }}>
            Ejemplar: {row.ejemplar?.codigo_inventario}
          </span>
        </div>
      )
    },
    {
      header: 'Fecha Préstamo',
      accessor: (row) => formatDate(row.fecha_prestamo)
    },
    {
      header: 'Devolución Prevista',
      accessor: (row) => formatDate(row.fecha_devolucion_prevista)
    },
    {
      header: 'Devolución Real',
      accessor: (row) => formatDate(row.fecha_devolucion_real)
    },
    {
      header: 'Estado',
      accessor: 'estado',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.estado)} dot>
          {row.estado}
        </Badge>
      )
    },
    {
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <div className="table-actions">
          {(row.estado === 'Activo' || row.estado === 'Vencido') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDevolucion(row)}
              title="Registrar devolución física"
            >
              Devolver
            </Button>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenDetail(row)}
            title="Ver detalle del préstamo"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => handleOpenDelete(row)}
            title="Eliminar registro"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Barra de Filtros */}
      <div className="action-bar">
        <div className="action-bar-left">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por socio, libro, DNI o código de ejemplar..."
            onClear={() => setSearch('')}
          />
          <Select
            value={estadoFilter}
            onChange={setEstadoFilter}
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'Activo', label: 'Activo' },
              { value: 'Devuelto', label: 'Devuelto' },
              { value: 'Vencido', label: 'Vencido' }
            ]}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={PlusCircle} onClick={handleOpenCreate}>
            Nuevo Préstamo
          </Button>
        </div>
      </div>

      {/* Tabla de Préstamos */}
      <DataTable
        columns={columns}
        data={prestamos}
        loading={loading}
        emptyTitle="No se encontraron préstamos"
        emptyDescription="No existen registros de circulación con los filtros aplicados."
        emptyAction={
          <Button size="sm" icon={PlusCircle} onClick={handleOpenCreate}>
            Crear el primer préstamo
          </Button>
        }
      />

      {/* Modal Registrar Préstamo */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Registrar Préstamo de Material Bibliográfico"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Conceder Préstamo
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label required">Socio Solicitante</label>
              <select
                className={`form-select ${formErrors.socio_id ? 'error' : ''}`}
                value={formData.socio_id}
                onChange={(e) => setFormData({ ...formData, socio_id: e.target.value })}
              >
                <option value="">Seleccione socio lector...</option>
                {socios.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={s.estado === 'Suspendido'}
                  >
                    {s.nombre} {s.apellidos} (DNI: {s.dni}) — {s.estado}
                    {s.estado === 'Suspendido' ? ' [NO APTO]' : ''}
                  </option>
                ))}
              </select>
              <span className="form-help">Los socios con sanción o estado suspendido no pueden solicitar material.</span>
              {formErrors.socio_id && <span className="form-error">{formErrors.socio_id}</span>}
            </div>

            <div className="form-group col-span-2">
              <label className="form-label required">Ejemplar Físico Disponible</label>
              <select
                className={`form-select ${formErrors.ejemplar_id ? 'error' : ''}`}
                value={formData.ejemplar_id}
                onChange={(e) => setFormData({ ...formData, ejemplar_id: e.target.value })}
              >
                <option value="">Seleccione ejemplar disponible en inventario...</option>
                {ejemplaresDisponibles.map((ej) => (
                  <option key={ej.id} value={ej.id}>
                    [{ej.codigo_inventario}] {ej.libro?.titulo} — {ej.ubicacion_estante} ({ej.estado_conservacion})
                  </option>
                ))}
              </select>
              <span className="form-help">Solo se listan ejemplares con disponibilidad operativa "Disponible".</span>
              {formErrors.ejemplar_id && <span className="form-error">{formErrors.ejemplar_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Fecha de Inicio del Préstamo</label>
              <input
                type="date"
                className={`form-input ${formErrors.fecha_prestamo ? 'error' : ''}`}
                value={formData.fecha_prestamo}
                onChange={(e) => setFormData({ ...formData, fecha_prestamo: e.target.value })}
              />
              {formErrors.fecha_prestamo && <span className="form-error">{formErrors.fecha_prestamo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Fecha Límite Prevista de Devolución</label>
              <input
                type="date"
                className={`form-input ${formErrors.fecha_devolucion_prevista ? 'error' : ''}`}
                value={formData.fecha_devolucion_prevista}
                onChange={(e) => setFormData({ ...formData, fecha_devolucion_prevista: e.target.value })}
              />
              <span className="form-help">Regla académica: fecha límite &ge; fecha de inicio (estándar 14 días).</span>
              {formErrors.fecha_devolucion_prevista && (
                <span className="form-error">{formErrors.fecha_devolucion_prevista}</span>
              )}
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Observaciones o Condiciones de Entrega</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Anotaciones sobre el estado del libro al momento de entregarlo..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Devolución */}
      <Modal
        isOpen={isDevolucionModalOpen}
        onClose={() => setIsDevolucionModalOpen(false)}
        title="Registrar Devolución de Ejemplar"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDevolucionModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmDevolucion} loading={submitting}>
              Confirmar Devolución
            </Button>
          </>
        }
      >
        {selectedPrestamo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Confirmar la entrega física de <strong>{selectedPrestamo.libro?.titulo}</strong> ({selectedPrestamo.ejemplar?.codigo_inventario}) por parte de <strong>{selectedPrestamo.socio?.nombre} {selectedPrestamo.socio?.apellidos}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label required">Fecha de Recepción Real</label>
              <input
                type="date"
                className="form-input"
                value={fechaDevolucionInput}
                onChange={(e) => setFechaDevolucionInput(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-success-text)', backgroundColor: 'var(--color-success-bg)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
              ✓ Al confirmar, el ejemplar quedará automáticamente marcado como <strong>"Disponible"</strong> en el catálogo.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal Detalle del Préstamo */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha del Préstamo de Circulación"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {detailedPrestamo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">N° de Préstamo</span>
                <span className="detail-value text-mono" style={{ fontWeight: 700 }}>
                  #{detailedPrestamo.id}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado</span>
                <span className="detail-value">
                  <Badge variant={getStatusBadgeVariant(detailedPrestamo.estado)} dot>
                    {detailedPrestamo.estado}
                  </Badge>
                </span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Socio Beneficiario</span>
                <span className="detail-value">
                  {detailedPrestamo.socio?.nombre} {detailedPrestamo.socio?.apellidos} (DNI: {detailedPrestamo.socio?.dni})
                </span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Material Prestado</span>
                <span className="detail-value">
                  {detailedPrestamo.libro?.titulo} — Código {detailedPrestamo.ejemplar?.codigo_inventario}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Inicio</span>
                <span className="detail-value">{formatDate(detailedPrestamo.fecha_prestamo)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha Límite Prevista</span>
                <span className="detail-value">{formatDate(detailedPrestamo.fecha_devolucion_prevista)}</span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Fecha de Entrega Efectiva</span>
                <span className="detail-value">
                  {detailedPrestamo.fecha_devolucion_real
                    ? formatDate(detailedPrestamo.fecha_devolucion_real)
                    : 'Pendiente de entrega en biblioteca'}
                </span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Observaciones</span>
                <span className="detail-value" style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)' }}>
                  {detailedPrestamo.observaciones || 'Sin anotaciones especiales.'}
                </span>
              </div>
            </div>

            {/* Multas vinculadas */}
            {detailedPrestamo.multas && detailedPrestamo.multas.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-danger-text)' }}>
                  Multas Vinculadas a este Préstamo ({detailedPrestamo.multas.length})
                </h4>
                <div className="copies-mini-list">
                  {detailedPrestamo.multas.map((m) => (
                    <div key={m.id} className="copy-mini-item">
                      <div>
                        <strong>{m.motivo}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Importe: {formatCurrency(m.importe)} | Emisión: {formatDate(m.fecha_emision)}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(m.estado)} dot>
                        {m.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar registro de préstamo?"
        message={`¿Confirma que desea anular el préstamo #${selectedPrestamo?.id}? Si el préstamo está activo, el ejemplar asociado volverá a estar disponible.`}
        confirmText="Eliminar Préstamo"
        loading={submitting}
      />
    </div>
  );
};
