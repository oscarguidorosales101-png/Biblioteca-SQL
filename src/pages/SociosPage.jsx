import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Mail
} from 'lucide-react';
import { sociosService } from '../services/sociosService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate, getStatusBadgeVariant, formatCurrency } from '../utils/formatters';
import { validateRequired, validateEmail } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const SociosPage = () => {
  const location = useLocation();
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedSocio, setSelectedSocio] = useState(null);
  const [detailedSocio, setDetailedSocio] = useState(null);

  // Form State
  const initialFormData = {
    nombre: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    estado: 'Activo'
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Carga de datos
  const loadSocios = async () => {
    try {
      setLoading(true);
      const data = await sociosService.getAll({ search, estado: estadoFilter });
      setSocios(data);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar la lista de socios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocios();
  }, [search, estadoFilter, dataVersion]);

  // Si se navegó con { state: { openCreate: true } }
  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setSelectedSocio(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (socio) => {
    setSelectedSocio(socio);
    setFormData({
      nombre: socio.nombre,
      apellidos: socio.apellidos,
      dni: socio.dni,
      email: socio.email,
      telefono: socio.telefono || '',
      direccion: socio.direccion || '',
      estado: socio.estado || 'Activo'
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (socio) => {
    try {
      const fullDetail = await sociosService.getById(socio.id);
      setDetailedSocio(fullDetail);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al cargar detalle del socio.', 'error');
    }
  };

  const handleOpenDelete = (socio) => {
    setSelectedSocio(socio);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const errNombre = validateRequired(formData.nombre, 'El nombre');
    if (errNombre) errors.nombre = errNombre;

    const errApellidos = validateRequired(formData.apellidos, 'Los apellidos');
    if (errApellidos) errors.apellidos = errApellidos;

    const errDni = validateRequired(formData.dni, 'El documento de identidad');
    if (errDni) errors.dni = errDni;

    const errEmail = validateEmail(formData.email);
    if (errEmail) errors.email = errEmail;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedSocio) {
        await sociosService.update(selectedSocio.id, formData);
        showToast('Socio actualizado exitosamente.', 'success');
      } else {
        await sociosService.create(formData);
        showToast('Nuevo socio registrado con éxito.', 'success');
      }
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al procesar el formulario.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSocio) return;
    try {
      setSubmitting(true);
      await sociosService.delete(selectedSocio.id);
      showToast('Registro de socio eliminado.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar el socio.', 'error');
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
      header: 'Socio / Lector',
      accessor: (row) => `${row.nombre} ${row.apellidos}`,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.nombre} {row.apellidos}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={12} /> {row.email}
          </div>
        </div>
      )
    },
    {
      header: 'Documento (DNI/CI)',
      accessor: 'dni',
      render: (row) => <span className="text-mono">{row.dni}</span>
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
      render: (row) => row.telefono || '—'
    },
    {
      header: 'Inscripción',
      accessor: (row) => formatDate(row.fecha_inscripcion)
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
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenDetail(row)}
            title="Ver expediente y préstamos"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Editar socio"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => handleOpenDelete(row)}
            title="Eliminar socio"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Barra de Filtros y Acciones */}
      <div className="action-bar">
        <div className="action-bar-left">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, apellidos, DNI o correo..."
            onClear={() => setSearch('')}
          />
          <Select
            value={estadoFilter}
            onChange={setEstadoFilter}
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'Activo', label: 'Activo' },
              { value: 'Inactivo', label: 'Inactivo' },
              { value: 'Suspendido', label: 'Suspendido' }
            ]}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={UserPlus} onClick={handleOpenCreate}>
            Nuevo Socio
          </Button>
        </div>
      </div>

      {/* Tabla de Socios */}
      <DataTable
        columns={columns}
        data={socios}
        loading={loading}
        emptyTitle="No se encontraron socios"
        emptyDescription="No existen socios registrados que coincidan con la búsqueda actual."
        emptyAction={
          <Button size="sm" icon={UserPlus} onClick={handleOpenCreate}>
            Registrar el primer socio
          </Button>
        }
      />

      {/* Modal Formulario Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedSocio ? `Editar Socio: ${selectedSocio.nombre} ${selectedSocio.apellidos}` : 'Registrar Nuevo Socio'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {selectedSocio ? 'Guardar Cambios' : 'Registrar Socio'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Nombres</label>
              <input
                type="text"
                className={`form-input ${formErrors.nombre ? 'error' : ''}`}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Carlos"
              />
              {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Apellidos</label>
              <input
                type="text"
                className={`form-input ${formErrors.apellidos ? 'error' : ''}`}
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                placeholder="Ej. Mendoza Silva"
              />
              {formErrors.apellidos && <span className="form-error">{formErrors.apellidos}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Documento de Identidad (DNI/CI)</label>
              <input
                type="text"
                className={`form-input ${formErrors.dni ? 'error' : ''}`}
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej. 08472910"
              />
              {formErrors.dni && <span className="form-error">{formErrors.dni}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
              {formErrors.email && <span className="form-error">{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+51 984 123 456"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado del Socio</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido (Restringe préstamos)</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Dirección Domiciliaria</label>
              <input
                type="text"
                className="form-input"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Calle o Avenida, Distrito"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Detalles del Socio */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Expediente del Socio"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {detailedSocio && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Nombre Completo</span>
                <span className="detail-value">{detailedSocio.nombre} {detailedSocio.apellidos}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Documento</span>
                <span className="detail-value text-mono">{detailedSocio.dni}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correo</span>
                <span className="detail-value">{detailedSocio.email || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">{detailedSocio.telefono || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Inscripción</span>
                <span className="detail-value">{formatDate(detailedSocio.fecha_inscripcion)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado Actual</span>
                <span className="detail-value">
                  <Badge variant={getStatusBadgeVariant(detailedSocio.estado)} dot>
                    {detailedSocio.estado}
                  </Badge>
                </span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Dirección</span>
                <span className="detail-value">{detailedSocio.direccion || 'No registrada'}</span>
              </div>
            </div>

            {/* Préstamos del socio */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                Historial de Préstamos ({detailedSocio.prestamos?.length || 0})
              </h4>
              {detailedSocio.prestamos?.length > 0 ? (
                <div className="copies-mini-list">
                  {detailedSocio.prestamos.map((p) => (
                    <div key={p.id} className="copy-mini-item">
                      <div>
                        <strong>{p.libro?.titulo || 'Material bibliográfico'}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Ejemplar: {p.ejemplar?.codigo_inventario} | Desde: {formatDate(p.fecha_prestamo)} hasta: {formatDate(p.fecha_devolucion_prevista)}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(p.estado)} dot>
                        {p.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>El socio no tiene préstamos registrados.</p>
              )}
            </div>

            {/* Multas del socio */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                Multas Registradas ({detailedSocio.multas?.length || 0})
              </h4>
              {detailedSocio.multas?.length > 0 ? (
                <div className="copies-mini-list">
                  {detailedSocio.multas.map((m) => (
                    <div key={m.id} className="copy-mini-item">
                      <div>
                        <strong>{m.motivo}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Emisión: {formatDate(m.fecha_emision)} | Importe: {formatCurrency(m.importe)}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(m.estado)} dot>
                        {m.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>El socio no posee sanciones ni multas registradas.</p>
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
        title="¿Eliminar socio del sistema?"
        message={`¿Confirma que desea eliminar el registro de ${selectedSocio?.nombre} ${selectedSocio?.apellidos} (DNI: ${selectedSocio?.dni})? No se permitirá si el socio tiene préstamos activos.`}
        confirmText="Eliminar Socio"
        loading={submitting}
      />
    </div>
  );
};
