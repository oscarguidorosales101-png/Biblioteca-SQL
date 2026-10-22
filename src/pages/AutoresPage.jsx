import React, { useState, useEffect } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  PenTool
} from 'lucide-react';
import { autoresService } from '../services/autoresService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatDate } from '../utils/formatters';
import { validateRequired } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const AutoresPage = () => {
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedAutor, setSelectedAutor] = useState(null);
  const [detailedAutor, setDetailedAutor] = useState(null);

  // Formulario
  const initialFormData = {
    nombre: '',
    apellidos: '',
    nacionalidad: '',
    fecha_nacimiento: '',
    biografia: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadAutores = async () => {
    try {
      setLoading(true);
      const data = await autoresService.getAll({ search });
      setAutores(data);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar la lista de autores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAutores();
  }, [search, dataVersion]);

  const handleOpenCreate = () => {
    setSelectedAutor(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (autor) => {
    setSelectedAutor(autor);
    setFormData({
      nombre: autor.nombre,
      apellidos: autor.apellidos,
      nacionalidad: autor.nacionalidad || '',
      fecha_nacimiento: autor.fecha_nacimiento || '',
      biografia: autor.biografia || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = async (autor) => {
    try {
      const full = await autoresService.getById(autor.id);
      setDetailedAutor(full);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al cargar el expediente del autor.', 'error');
    }
  };

  const handleOpenDelete = (autor) => {
    setSelectedAutor(autor);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const errNombre = validateRequired(formData.nombre, 'El nombre del autor');
    if (errNombre) errors.nombre = errNombre;

    const errApellidos = validateRequired(formData.apellidos, 'Los apellidos');
    if (errApellidos) errors.apellidos = errApellidos;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedAutor) {
        await autoresService.update(selectedAutor.id, formData);
        showToast('Autor actualizado correctamente.', 'success');
      } else {
        await autoresService.create(formData);
        showToast('Nuevo autor registrado.', 'success');
      }
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al guardar el autor.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAutor) return;
    try {
      setSubmitting(true);
      await autoresService.delete(selectedAutor.id);
      showToast('Autor eliminado del directorio.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar el autor.', 'error');
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
      header: 'Nombre del Autor',
      accessor: (row) => `${row.nombre} ${row.apellidos}`,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.nombre} {row.apellidos}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {row.nacionalidad || 'Nacionalidad no registrada'}
          </div>
        </div>
      )
    },
    {
      header: 'Nacimiento',
      accessor: (row) => formatDate(row.fecha_nacimiento)
    },
    {
      header: 'Biografía Sintética',
      accessor: 'biografia',
      render: (row) => (
        <span className="text-truncate" style={{ maxWidth: 380, display: 'inline-block' }} title={row.biografia}>
          {row.biografia || '—'}
        </span>
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
            title="Ver obras literarias asociadas"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Editar autor"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => handleOpenDelete(row)}
            title="Eliminar autor"
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
            placeholder="Buscar autor por nombre, apellidos o nacionalidad..."
            onClear={() => setSearch('')}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={PenTool} onClick={handleOpenCreate}>
            Nuevo Autor
          </Button>
        </div>
      </div>

      {/* Tabla de Autores */}
      <DataTable
        columns={columns}
        data={autores}
        loading={loading}
        emptyTitle="No se encontraron autores"
        emptyDescription="No existen autores que coincidan con la búsqueda ingresada."
        emptyAction={
          <Button size="sm" icon={PenTool} onClick={handleOpenCreate}>
            Registrar autor
          </Button>
        }
      />

      {/* Modal Formulario Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedAutor ? `Editar Autor: ${selectedAutor.nombre} ${selectedAutor.apellidos}` : 'Registrar Nuevo Autor'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {selectedAutor ? 'Guardar Cambios' : 'Registrar Autor'}
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
                placeholder="Ej. Gabriel"
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
                placeholder="Ej. García Márquez"
              />
              {formErrors.apellidos && <span className="form-error">{formErrors.apellidos}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Nacionalidad</label>
              <input
                type="text"
                className="form-input"
                value={formData.nacionalidad}
                onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                placeholder="Ej. Colombiana, Argentina, Española"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Nacimiento</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Reseña Biográfica</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={formData.biografia}
                onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                placeholder="Breve reseña sobre la trayectoria y reconocimientos del autor..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Ficha del Autor */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha del Autor"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {detailedAutor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Nombre Completo</span>
                <span className="detail-value" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {detailedAutor.nombre} {detailedAutor.apellidos}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Nacionalidad</span>
                <span className="detail-value">{detailedAutor.nacionalidad || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de Nacimiento</span>
                <span className="detail-value">{formatDate(detailedAutor.fecha_nacimiento)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Obras en Biblioteca</span>
                <span className="detail-value">{detailedAutor.libros?.length || 0} títulos</span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Biografía</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                  {detailedAutor.biografia || 'Sin reseña biográfica registrada.'}
                </p>
              </div>
            </div>

            {/* Obras Literarias Asociadas (Relación N:M) */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--color-text-primary)' }}>
                Títulos en Catálogo ({detailedAutor.libros?.length || 0})
              </h4>
              {detailedAutor.libros?.length > 0 ? (
                <div className="copies-mini-list">
                  {detailedAutor.libros.map((l) => (
                    <div key={l.id} className="copy-mini-item">
                      <div>
                        <strong>{l.titulo}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          ISBN: {l.isbn} | Año: {l.anio_publicacion} | Género: {l.genero || '—'}
                        </div>
                      </div>
                      <span className="badge badge-coral">En Catálogo</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  Este autor no tiene libros registrados en el catálogo actualmente.
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
        title="¿Eliminar autor del directorio?"
        message={`¿Confirma que desea eliminar a "${selectedAutor?.nombre} ${selectedAutor?.apellidos}"? No se permitirá si tiene obras literarias registradas en el catálogo.`}
        confirmText="Eliminar Autor"
        loading={submitting}
      />
    </div>
  );
};
