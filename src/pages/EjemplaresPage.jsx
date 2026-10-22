import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  MapPin
} from 'lucide-react';
import { ejemplaresService } from '../services/ejemplaresService';
import { librosService } from '../services/librosService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate, getStatusBadgeVariant } from '../utils/formatters';
import { validateRequired } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const EjemplaresPage = () => {
  const location = useLocation();
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [ejemplares, setEjemplares] = useState([]);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [disponibilidadFilter, setDisponibilidadFilter] = useState('todas');
  const [libroFilter, setLibroFilter] = useState('todos');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedEjemplar, setSelectedEjemplar] = useState(null);
  const [detailedEjemplar, setDetailedEjemplar] = useState(null);

  // Formulario
  const initialFormData = {
    libro_id: '',
    codigo_inventario: '',
    ubicacion_estante: '',
    estado_conservacion: 'Excelente',
    disponibilidad: 'Disponible',
    fecha_adquisicion: new Date().toISOString().slice(0, 10)
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ejData, librosData] = await Promise.all([
        ejemplaresService.getAll({
          search,
          disponibilidad: disponibilidadFilter,
          libro_id: libroFilter
        }),
        librosService.getAll()
      ]);
      setEjemplares(ejData);
      setLibros(librosData);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar ejemplares físicos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, disponibilidadFilter, libroFilter, dataVersion]);

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setSelectedEjemplar(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (ejemplar) => {
    setSelectedEjemplar(ejemplar);
    setFormData({
      libro_id: ejemplar.libro_id,
      codigo_inventario: ejemplar.codigo_inventario,
      ubicacion_estante: ejemplar.ubicacion_estante || '',
      estado_conservacion: ejemplar.estado_conservacion || 'Bueno',
      disponibilidad: ejemplar.disponibilidad || 'Disponible',
      fecha_adquisicion: ejemplar.fecha_adquisicion || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (ejemplar) => {
    try {
      const full = await ejemplaresService.getById(ejemplar.id);
      setDetailedEjemplar(full);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al consultar historial del ejemplar.', 'error');
    }
  };

  const handleOpenDelete = (ejemplar) => {
    setSelectedEjemplar(ejemplar);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.libro_id) {
      errors.libro_id = 'Debe vincular el ejemplar a un libro del catálogo.';
    }

    const errCodigo = validateRequired(formData.codigo_inventario, 'El código de inventario');
    if (errCodigo) errors.codigo_inventario = errCodigo;

    const errUbicacion = validateRequired(formData.ubicacion_estante, 'La ubicación en estante');
    if (errUbicacion) errors.ubicacion_estante = errUbicacion;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        libro_id: Number(formData.libro_id)
      };

      if (selectedEjemplar) {
        await ejemplaresService.update(selectedEjemplar.id, payload);
        showToast('Ejemplar físico actualizado exitosamente.', 'success');
      } else {
        await ejemplaresService.create(payload);
        showToast('Nuevo ejemplar ingresado al inventario.', 'success');
      }
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al guardar el ejemplar.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEjemplar) return;
    try {
      setSubmitting(true);
      await ejemplaresService.delete(selectedEjemplar.id);
      showToast('Ejemplar físico eliminado del acervo.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar ejemplar.', 'error');
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
      header: 'Código de Inventario',
      accessor: 'codigo_inventario',
      render: (row) => (
        <span className="text-mono" style={{ fontWeight: 600, color: 'var(--color-primary-hover)' }}>
          {row.codigo_inventario}
        </span>
      )
    },
    {
      header: 'Título del Libro (Relación 1:N)',
      accessor: (row) => row.libro?.titulo || '—',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.libro?.titulo}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            ISBN: {row.libro?.isbn}
          </div>
        </div>
      )
    },
    {
      header: 'Ubicación Física',
      accessor: 'ubicacion_estante',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
          <MapPin size={13} color="var(--color-text-muted)" />
          {row.ubicacion_estante || '—'}
        </span>
      )
    },
    {
      header: 'Conservación',
      accessor: 'estado_conservacion',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.estado_conservacion)}>
          {row.estado_conservacion}
        </Badge>
      )
    },
    {
      header: 'Disponibilidad Operativa',
      accessor: 'disponibilidad',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.disponibilidad)} dot>
          {row.disponibilidad}
        </Badge>
      )
    },
    {
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <div className="table-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenDetail(row)}
            title="Ver trazabilidad del ejemplar"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Editar ejemplar"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => handleOpenDelete(row)}
            title="Eliminar ejemplar"
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
            placeholder="Buscar por código de inventario o título de libro..."
            onClear={() => setSearch('')}
          />
          <Select
            value={disponibilidadFilter}
            onChange={setDisponibilidadFilter}
            options={[
              { value: 'todas', label: 'Todos los estados' },
              { value: 'Disponible', label: 'Disponible' },
              { value: 'Prestado', label: 'Prestado' },
              { value: 'En mantenimiento', label: 'En mantenimiento' },
              { value: 'Extraviado', label: 'Extraviado' }
            ]}
          />
          <Select
            value={libroFilter}
            onChange={setLibroFilter}
            options={[
              { value: 'todos', label: 'Todos los títulos' },
              ...libros.map((l) => ({ value: String(l.id), label: l.titulo }))
            ]}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={PlusCircle} onClick={handleOpenCreate}>
            Nuevo Ejemplar
          </Button>
        </div>
      </div>

      {/* Tabla de Ejemplares */}
      <DataTable
        columns={columns}
        data={ejemplares}
        loading={loading}
        emptyTitle="No se encontraron ejemplares"
        emptyDescription="No existen ejemplares que cumplan los filtros seleccionados."
        emptyAction={
          <Button size="sm" icon={PlusCircle} onClick={handleOpenCreate}>
            Registrar el primer ejemplar
          </Button>
        }
      />

      {/* Modal Formulario Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedEjemplar ? `Editar Ejemplar: ${selectedEjemplar.codigo_inventario}` : 'Registrar Nuevo Ejemplar Físico'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {selectedEjemplar ? 'Guardar Cambios' : 'Registrar Ejemplar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label required">Título Asociado del Catálogo (1:N)</label>
              <select
                className={`form-select ${formErrors.libro_id ? 'error' : ''}`}
                value={formData.libro_id}
                onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })}
              >
                <option value="">Seleccione el libro de catálogo...</option>
                {libros.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titulo} (ISBN: {l.isbn})
                  </option>
                ))}
              </select>
              {formErrors.libro_id && <span className="form-error">{formErrors.libro_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Código de Inventario / Barra</label>
              <input
                type="text"
                className={`form-input ${formErrors.codigo_inventario ? 'error' : ''}`}
                value={formData.codigo_inventario}
                onChange={(e) => setFormData({ ...formData, codigo_inventario: e.target.value })}
                placeholder="Ej. EJ-01-04"
              />
              <span className="form-help">Código único de identificación de esta unidad física.</span>
              {formErrors.codigo_inventario && <span className="form-error">{formErrors.codigo_inventario}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Ubicación en Estante / Sala</label>
              <input
                type="text"
                className={`form-input ${formErrors.ubicacion_estante ? 'error' : ''}`}
                value={formData.ubicacion_estante}
                onChange={(e) => setFormData({ ...formData, ubicacion_estante: e.target.value })}
                placeholder="Ej. Estante A-1, Nivel 2"
              />
              {formErrors.ubicacion_estante && <span className="form-error">{formErrors.ubicacion_estante}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Estado de Conservación</label>
              <select
                className="form-select"
                value={formData.estado_conservacion}
                onChange={(e) => setFormData({ ...formData, estado_conservacion: e.target.value })}
              >
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Deteriorado">Deteriorado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Disponibilidad Inicial</label>
              <select
                className="form-select"
                value={formData.disponibilidad}
                onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
              >
                <option value="Disponible">Disponible (Apto para préstamo)</option>
                <option value="Prestado">Prestado</option>
                <option value="En mantenimiento">En mantenimiento / Reparación</option>
                <option value="Extraviado">Extraviado</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Fecha de Adquisición o Ingreso</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha_adquisicion}
                onChange={(e) => setFormData({ ...formData, fecha_adquisicion: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle del Ejemplar */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Trazabilidad del Ejemplar Físico"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {detailedEjemplar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Código de Inventario</span>
                <span className="detail-value text-mono" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {detailedEjemplar.codigo_inventario}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Título Asociado</span>
                <span className="detail-value">{detailedEjemplar.libro?.titulo || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ubicación en Acervo</span>
                <span className="detail-value">{detailedEjemplar.ubicacion_estante}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Adquisición</span>
                <span className="detail-value">{formatDate(detailedEjemplar.fecha_adquisicion)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado Físico</span>
                <span className="detail-value">
                  <Badge variant={getStatusBadgeVariant(detailedEjemplar.estado_conservacion)}>
                    {detailedEjemplar.estado_conservacion}
                  </Badge>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Disponibilidad</span>
                <span className="detail-value">
                  <Badge variant={getStatusBadgeVariant(detailedEjemplar.disponibilidad)} dot>
                    {detailedEjemplar.disponibilidad}
                  </Badge>
                </span>
              </div>
            </div>

            {/* Historial de Préstamos */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                Historial de Circulación ({detailedEjemplar.historialPrestamos?.length || 0})
              </h4>
              {detailedEjemplar.historialPrestamos?.length > 0 ? (
                <div className="copies-mini-list">
                  {detailedEjemplar.historialPrestamos.map((p) => (
                    <div key={p.id} className="copy-mini-item">
                      <div>
                        <strong>Préstamo #{p.id} — Socio ID: {p.socio_id}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Prestado: {formatDate(p.fecha_prestamo)} | Devuelto: {formatDate(p.fecha_devolucion_real) || 'Pendiente'}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(p.estado)} dot>
                        {p.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  Este ejemplar no registra movimientos de circulación histórica.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Dar de baja ejemplar físico?"
        message={`¿Confirma que desea retirar del inventario el ejemplar "${selectedEjemplar?.codigo_inventario}"? No podrá eliminarse si se encuentra actualmente prestado.`}
        confirmText="Eliminar Ejemplar"
        loading={submitting}
      />
    </div>
  );
};
