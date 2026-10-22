import React, { useState, useEffect } from 'react';
import {
  Building2,
  Eye,
  Edit2,
  Trash2,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { editorialesService } from '../services/editorialesService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { validateRequired, validateEmail } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const EditorialesPage = () => {
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [editoriales, setEditoriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedEditorial, setSelectedEditorial] = useState(null);
  const [detailedEditorial, setDetailedEditorial] = useState(null);

  // Formulario
  const initialFormData = {
    nombre: '',
    pais: '',
    email: '',
    telefono: '',
    sitio_web: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadEditoriales = async () => {
    try {
      setLoading(true);
      const data = await editorialesService.getAll({ search });
      setEditoriales(data);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar casas editoriales.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditoriales();
  }, [search, dataVersion]);

  const handleOpenCreate = () => {
    setSelectedEditorial(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (editorial) => {
    setSelectedEditorial(editorial);
    setFormData({
      nombre: editorial.nombre,
      pais: editorial.pais || '',
      email: editorial.email || '',
      telefono: editorial.telefono || '',
      sitio_web: editorial.sitio_web || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (editorial) => {
    try {
      const full = await editorialesService.getById(editorial.id);
      setDetailedEditorial(full);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al cargar detalle de la editorial.', 'error');
    }
  };

  const handleOpenDelete = (editorial) => {
    setSelectedEditorial(editorial);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const errNombre = validateRequired(formData.nombre, 'El nombre de la editorial');
    if (errNombre) errors.nombre = errNombre;

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
      if (selectedEditorial) {
        await editorialesService.update(selectedEditorial.id, formData);
        showToast('Editorial actualizada correctamente.', 'success');
      } else {
        await editorialesService.create(formData);
        showToast('Nueva editorial registrada en el sistema.', 'success');
      }
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al guardar la editorial.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEditorial) return;
    try {
      setSubmitting(true);
      await editorialesService.delete(selectedEditorial.id);
      showToast('Editorial eliminada.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar la editorial.', 'error');
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
      header: 'Casa Editorial',
      accessor: 'nombre',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.nombre}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {row.pais || 'País no registrado'}
          </div>
        </div>
      )
    },
    {
      header: 'Contacto',
      render: (row) => (
        <div style={{ fontSize: '0.82rem' }}>
          {row.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
              <Mail size={12} /> {row.email}
            </div>
          )}
          {row.telefono && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)' }}>
              <Phone size={12} /> {row.telefono}
            </div>
          )}
          {!row.email && !row.telefono && '—'}
        </div>
      )
    },
    {
      header: 'Sitio Web',
      accessor: 'sitio_web',
      render: (row) =>
        row.sitio_web ? (
          <a
            href={row.sitio_web}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-primary-hover)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Globe size={13} /> Visitar portal
          </a>
        ) : (
          '—'
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
            title="Ver catálogo de libros editados"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Editar editorial"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => handleOpenDelete(row)}
            title="Eliminar editorial"
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
            placeholder="Buscar por nombre o país de la editorial..."
            onClear={() => setSearch('')}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={Building2} onClick={handleOpenCreate}>
            Nueva Editorial
          </Button>
        </div>
      </div>

      {/* Tabla de Editoriales */}
      <DataTable
        columns={columns}
        data={editoriales}
        loading={loading}
        emptyTitle="No se encontraron editoriales"
        emptyDescription="No existen casas editoriales que coincidan con la búsqueda."
        emptyAction={
          <Button size="sm" icon={Building2} onClick={handleOpenCreate}>
            Registrar editorial
          </Button>
        }
      />

      {/* Modal Formulario Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedEditorial ? `Editar Editorial: ${selectedEditorial.nombre}` : 'Registrar Nueva Casa Editorial'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {selectedEditorial ? 'Guardar Cambios' : 'Registrar Editorial'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label required">Nombre de la Editorial</label>
              <input
                type="text"
                className={`form-input ${formErrors.nombre ? 'error' : ''}`}
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Editorial Sudamericana"
              />
              {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">País de Origen</label>
              <input
                type="text"
                className="form-input"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                placeholder="Ej. Argentina, España, México"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@editorial.com"
              />
              {formErrors.email && <span className="form-error">{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+54 11 4312-8900"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sitio Web / Portal</label>
              <input
                type="url"
                className="form-input"
                value={formData.sitio_web}
                onChange={(e) => setFormData({ ...formData, sitio_web: e.target.value })}
                placeholder="https://editorial.com"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Ficha de la Editorial */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha de la Casa Editorial"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {detailedEditorial && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Nombre de Editorial</span>
                <span className="detail-value" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {detailedEditorial.nombre}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">País</span>
                <span className="detail-value">{detailedEditorial.pais || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correo Electrónico</span>
                <span className="detail-value">{detailedEditorial.email || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Teléfono</span>
                <span className="detail-value">{detailedEditorial.telefono || '—'}</span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Portal Web</span>
                <span className="detail-value">
                  {detailedEditorial.sitio_web ? (
                    <a href={detailedEditorial.sitio_web} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-hover)' }}>
                      {detailedEditorial.sitio_web}
                    </a>
                  ) : (
                    'No registrado'
                  )}
                </span>
              </div>
            </div>

            {/* Catálogo de libros asociados (Relación 1:N) */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                Títulos en Catálogo Publicados por esta Editorial ({detailedEditorial.libros?.length || 0})
              </h4>
              {detailedEditorial.libros?.length > 0 ? (
                <div className="copies-mini-list">
                  {detailedEditorial.libros.map((l) => (
                    <div key={l.id} className="copy-mini-item">
                      <div>
                        <strong>{l.titulo}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          ISBN: {l.isbn} | Año: {l.anio_publicacion} | Género: {l.genero || '—'}
                        </div>
                      </div>
                      <span className="badge badge-coral">Catálogo</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  No existen títulos asociados a esta editorial en el catálogo.
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
        title="¿Eliminar editorial del sistema?"
        message={`¿Confirma que desea eliminar "${selectedEditorial?.nombre}"? No se permitirá si tiene libros vinculados en el catálogo general.`}
        confirmText="Eliminar Editorial"
        loading={submitting}
      />
    </div>
  );
};
