import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Eye,
  CheckCircle,
  Ban,
  Trash2
} from 'lucide-react';
import { multasService } from '../services/multasService';
import { prestamosService } from '../services/prestamosService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '../utils/formatters';
import { validateRequired } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const MultasPage = () => {
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [multas, setMultas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedMulta, setSelectedMulta] = useState(null);
  const [detailedMulta, setDetailedMulta] = useState(null);

  // Formulario
  const initialFormData = {
    prestamo_id: '',
    importe: '15.00',
    fecha_emision: new Date().toISOString().slice(0, 10),
    motivo: 'Retraso en devolución de ejemplar',
    estado: 'Pendiente'
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [multasData, prestamosData] = await Promise.all([
        multasService.getAll({ search, estado: estadoFilter }),
        prestamosService.getAll()
      ]);
      setMultas(multasData);
      setPrestamos(prestamosData);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar multas y sanciones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, estadoFilter, dataVersion]);

  const handleOpenCreate = () => {
    setSelectedMulta(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (multa) => {
    try {
      const full = await multasService.getById(multa.id);
      setDetailedMulta(full);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al cargar detalle de la multa.', 'error');
    }
  };

  const handleOpenDelete = (multa) => {
    setSelectedMulta(multa);
    setIsDeleteModalOpen(true);
  };

  const handleCambiarEstado = async (multa, nuevoEstado) => {
    try {
      await multasService.cambiarEstado(multa.id, nuevoEstado);
      showToast(`Multa #${multa.id} marcada como ${nuevoEstado}.`, 'success');
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al actualizar estado de la multa.', 'error');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.prestamo_id) {
      errors.prestamo_id = 'Debe vincular la sanción a un préstamo.';
    }

    const valImporte = parseFloat(formData.importe);
    if (isNaN(valImporte) || valImporte <= 0) {
      errors.importe = 'Ingrese un importe monetario válido mayor a cero.';
    }

    const errMotivo = validateRequired(formData.motivo, 'El motivo de la multa');
    if (errMotivo) errors.motivo = errMotivo;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await multasService.create(formData);
      showToast('Multa registrada correctamente.', 'success');
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al registrar la multa.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMulta) return;
    try {
      setSubmitting(true);
      await multasService.delete(selectedMulta.id);
      showToast('Registro de multa eliminado.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar la multa.', 'error');
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
      header: 'Socio Infractor',
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
      header: 'Préstamo y Obra',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
            Préstamo #{row.prestamo_id}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {row.libro?.titulo}
          </div>
        </div>
      )
    },
    {
      header: 'Importe',
      accessor: 'importe',
      render: (row) => (
        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
          {formatCurrency(row.importe)}
        </span>
      )
    },
    {
      header: 'Fecha Emisión',
      accessor: (row) => formatDate(row.fecha_emision)
    },
    {
      header: 'Motivo de Sanción',
      accessor: 'motivo',
      render: (row) => (
        <span className="text-truncate" style={{ maxWidth: 240, display: 'inline-block' }} title={row.motivo}>
          {row.motivo}
        </span>
      )
    },
    {
      header: 'Estado de Pago',
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
          {row.estado === 'Pendiente' && (
            <>
              <button
                type="button"
                className="btn-icon"
                style={{ color: 'var(--color-success-text)' }}
                onClick={() => handleCambiarEstado(row, 'Pagada')}
                title="Registrar pago de la multa"
              >
                <CheckCircle size={15} />
              </button>
              <button
                type="button"
                className="btn-icon"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => handleCambiarEstado(row, 'Anulada')}
                title="Anular multa administrativamente"
              >
                <Ban size={15} />
              </button>
            </>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenDetail(row)}
            title="Ver detalle"
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
            placeholder="Buscar por socio, DNI, motivo o N° de préstamo..."
            onClear={() => setSearch('')}
          />
          <Select
            value={estadoFilter}
            onChange={setEstadoFilter}
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Pagada', label: 'Pagada' },
              { value: 'Anulada', label: 'Anulada' }
            ]}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={Receipt} onClick={handleOpenCreate}>
            Registrar Multa
          </Button>
        </div>
      </div>

      {/* Tabla de Multas */}
      <DataTable
        columns={columns}
        data={multas}
        loading={loading}
        emptyTitle="No se encontraron multas"
        emptyDescription="No existen sanciones registradas que correspondan con los filtros activos."
        emptyAction={
          <Button size="sm" icon={Receipt} onClick={handleOpenCreate}>
            Registrar multa
          </Button>
        }
      />

      {/* Modal Registrar Multa */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Registrar Sanción / Multa a Préstamo"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Emitir Multa
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label required">Préstamo Vinculado (Relación 1:N)</label>
              <select
                className={`form-select ${formErrors.prestamo_id ? 'error' : ''}`}
                value={formData.prestamo_id}
                onChange={(e) => setFormData({ ...formData, prestamo_id: e.target.value })}
              >
                <option value="">Seleccione el préstamo asociado...</option>
                {prestamos.map((p) => (
                  <option key={p.id} value={p.id}>
                    Préstamo #{p.id} — {p.socio?.nombre} {p.socio?.apellidos} ({p.libro?.titulo} / {p.estado})
                  </option>
                ))}
              </select>
              <span className="form-help">El socio infractor se derivará automáticamente del registro del préstamo.</span>
              {formErrors.prestamo_id && <span className="form-error">{formErrors.prestamo_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Importe de la Multa ($)</label>
              <input
                type="number"
                step="0.50"
                min="1"
                className={`form-input ${formErrors.importe ? 'error' : ''}`}
                value={formData.importe}
                onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                placeholder="Ej. 15.00"
              />
              <span className="form-help">Tarifa referencial en moneda configurada.</span>
              {formErrors.importe && <span className="form-error">{formErrors.importe}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Fecha de Emisión</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha_emision}
                onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label required">Motivo o Causal de la Sanción</label>
              <input
                type="text"
                className={`form-input ${formErrors.motivo ? 'error' : ''}`}
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej. Retraso en devolución, deterioro de portada, extravío"
              />
              {formErrors.motivo && <span className="form-error">{formErrors.motivo}</span>}
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Estado Inicial de Pago</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="Pendiente">Pendiente (Por abonar)</option>
                <option value="Pagada">Pagada (Cancelada en caja)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle de la Multa */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha de Sanción / Multa"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {detailedMulta && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Folio de Multa</span>
                <span className="detail-value text-mono" style={{ fontWeight: 700 }}>
                  #{detailedMulta.id}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado de Pago</span>
                <span className="detail-value">
                  <Badge variant={getStatusBadgeVariant(detailedMulta.estado)} dot>
                    {detailedMulta.estado}
                  </Badge>
                </span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Socio Correspondiente (Derivado)</span>
                <span className="detail-value">
                  {detailedMulta.socio?.nombre} {detailedMulta.socio?.apellidos} (DNI: {detailedMulta.socio?.dni})
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Préstamo Vinculado</span>
                <span className="detail-value text-mono">Préstamo #{detailedMulta.prestamo_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Importe Liquidado</span>
                <span className="detail-value" style={{ fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                  {formatCurrency(detailedMulta.importe)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Emisión</span>
                <span className="detail-value">{formatDate(detailedMulta.fecha_emision)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Pago Efectivo</span>
                <span className="detail-value">{formatDate(detailedMulta.fecha_pago) || 'Pendiente de cobro'}</span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Motivo de Sanción</span>
                <span className="detail-value" style={{ fontSize: '0.88rem' }}>
                  {detailedMulta.motivo}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar registro de multa?"
        message={`¿Confirma que desea anular el registro de la multa #${selectedMulta?.id} por importe de ${formatCurrency(selectedMulta?.importe)}?`}
        confirmText="Eliminar Multa"
        loading={submitting}
      />
    </div>
  );
};
