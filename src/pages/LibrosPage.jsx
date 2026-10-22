import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BookPlus,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { librosService } from '../services/librosService';
import { editorialesService } from '../services/editorialesService';
import { autoresService } from '../services/autoresService';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { getStatusBadgeVariant } from '../utils/formatters';
import { validateRequired, validateISBN } from '../utils/validators';
import { useApp } from '../context/AppContext';

export const LibrosPage = () => {
  const location = useLocation();
  const { showToast, dataVersion, notifyDataChanged } = useApp();

  const [libros, setLibros] = useState([]);
  const [editoriales, setEditoriales] = useState([]);
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [editorialFilter, setEditorialFilter] = useState('todas');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedLibro, setSelectedLibro] = useState(null);
  const [detailedLibro, setDetailedLibro] = useState(null);

  // Formulario
  const initialFormData = {
    titulo: '',
    isbn: '',
    editorial_id: '',
    anio_publicacion: new Date().getFullYear(),
    genero: '',
    descripcion: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [librosData, edData, autData] = await Promise.all([
        librosService.getAll({ search, editorial_id: editorialFilter }),
        editorialesService.getAll(),
        autoresService.getAll()
      ]);
      setLibros(librosData);
      setEditoriales(edData);
      setAutores(autData);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar datos del catálogo de libros.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, editorialFilter, dataVersion]);

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenCreate = () => {
    setSelectedLibro(null);
    setFormData(initialFormData);
    setSelectedAuthorIds([]);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = async (libro) => {
    try {
      const fullDetail = await librosService.getById(libro.id);
      setSelectedLibro(fullDetail);
      setFormData({
        titulo: fullDetail.titulo,
        isbn: fullDetail.isbn,
        editorial_id: fullDetail.editorial_id || '',
        anio_publicacion: fullDetail.anio_publicacion || '',
        genero: fullDetail.genero || '',
        descripcion: fullDetail.descripcion || ''
      });
      setSelectedAuthorIds(fullDetail.autoresIds || []);
      setFormErrors({});
      setIsFormModalOpen(true);
    } catch (err) {
      showToast('Error al cargar datos del libro para edición.', 'error');
    }
  };

  const handleOpenDetail = async (libro) => {
    try {
      const fullDetail = await librosService.getById(libro.id);
      setDetailedLibro(fullDetail);
      setIsDetailModalOpen(true);
    } catch (err) {
      showToast('Error al cargar información detallada del libro.', 'error');
    }
  };

  const handleOpenDelete = (libro) => {
    setSelectedLibro(libro);
    setIsDeleteModalOpen(true);
  };

  const toggleAuthorSelection = (authorId) => {
    const id = Number(authorId);
    setSelectedAuthorIds((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
    );
  };

  const validateForm = () => {
    const errors = {};
    const errTitulo = validateRequired(formData.titulo, 'El título del libro');
    if (errTitulo) errors.titulo = errTitulo;

    const errIsbn = validateISBN(formData.isbn);
    if (errIsbn) errors.isbn = errIsbn;

    if (!formData.editorial_id) {
      errors.editorial_id = 'Debe seleccionar una casa editorial.';
    }

    if (selectedAuthorIds.length === 0) {
      errors.autores = 'Debe vincular al menos un autor a la obra.';
    }

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
        editorial_id: Number(formData.editorial_id),
        anio_publicacion: Number(formData.anio_publicacion)
      };

      if (selectedLibro) {
        await librosService.update(selectedLibro.id, payload, selectedAuthorIds);
        showToast('Título bibliográfico actualizado exitosamente.', 'success');
      } else {
        await librosService.create(payload, selectedAuthorIds);
        showToast('Nuevo título registrado en el catálogo.', 'success');
      }
      setIsFormModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al guardar el libro.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLibro) return;
    try {
      setSubmitting(true);
      await librosService.delete(selectedLibro.id);
      showToast('Título bibliográfico eliminado del catálogo.', 'info');
      setIsDeleteModalOpen(false);
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al eliminar el libro.', 'error');
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
      header: 'Título de la Obra',
      accessor: 'titulo',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.titulo}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            {row.genero ? `${row.genero} • ` : ''}{row.anio_publicacion}
          </div>
        </div>
      )
    },
    {
      header: 'ISBN (Restricción UNIQUE)',
      accessor: 'isbn',
      render: (row) => <span className="text-mono" style={{ fontSize: '0.82rem' }}>{row.isbn}</span>
    },
    {
      header: 'Editorial',
      accessor: (row) => row.editorial?.nombre || '—',
      render: (row) => (
        <span style={{ fontSize: '0.86rem', color: 'var(--color-text-primary)' }}>
          {row.editorial?.nombre}
        </span>
      )
    },
    {
      header: 'Autores (Relación N:M)',
      render: (row) => (
        <div className="author-pill-list">
          {row.autores && row.autores.length > 0 ? (
            row.autores.map((a) => (
              <span key={a.id} className="author-pill">
                {a.nombre} {a.apellidos}
              </span>
            ))
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Sin autores</span>
          )}
        </div>
      )
    },
    {
      header: 'Ejemplares',
      align: 'center',
      render: (row) => {
        const disponibles = row.ejemplaresDisponibles || 0;
        const total = row.totalEjemplares || 0;
        return (
          <span
            className={`badge ${disponibles > 0 ? 'badge-success' : 'badge-danger'}`}
            title={`${disponibles} de ${total} ejemplares disponibles`}
          >
            {disponibles} / {total} disp.
          </span>
        );
      }
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
            title="Ver ficha técnica y ejemplares físicos"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Editar libro"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => handleOpenDelete(row)}
            title="Eliminar título"
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
            placeholder="Buscar por título, ISBN, género o autor..."
            onClear={() => setSearch('')}
          />
          <Select
            value={editorialFilter}
            onChange={setEditorialFilter}
            options={[
              { value: 'todas', label: 'Todas las editoriales' },
              ...editoriales.map((ed) => ({ value: String(ed.id), label: ed.nombre }))
            ]}
          />
        </div>
        <div className="action-bar-right">
          <Button icon={BookPlus} onClick={handleOpenCreate}>
            Agregar Libro
          </Button>
        </div>
      </div>

      {/* Tabla de Libros */}
      <DataTable
        columns={columns}
        data={libros}
        loading={loading}
        emptyTitle="No se encontraron libros"
        emptyDescription="No hay títulos en el catálogo que coincidan con los criterios de búsqueda."
        emptyAction={
          <Button size="sm" icon={BookPlus} onClick={handleOpenCreate}>
            Registrar el primer libro
          </Button>
        }
      />

      {/* Modal Formulario Crear / Editar */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedLibro ? `Editar Título: ${selectedLibro.titulo}` : 'Registrar Nuevo Título Bibliográfico'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {selectedLibro ? 'Guardar Cambios' : 'Registrar Libro'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label required">Título de la Obra</label>
              <input
                type="text"
                className={`form-input ${formErrors.titulo ? 'error' : ''}`}
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej. Cien años de soledad"
              />
              {formErrors.titulo && <span className="form-error">{formErrors.titulo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Código Bibliográfico ISBN</label>
              <input
                type="text"
                className={`form-input ${formErrors.isbn ? 'error' : ''}`}
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="Ej. 978-0307474728"
              />
              <span className="form-help">Identificador único internacional (10 o 13 dígitos).</span>
              {formErrors.isbn && <span className="form-error">{formErrors.isbn}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Casa Editorial (Relación 1:N)</label>
              <select
                className={`form-select ${formErrors.editorial_id ? 'error' : ''}`}
                value={formData.editorial_id}
                onChange={(e) => setFormData({ ...formData, editorial_id: e.target.value })}
              >
                <option value="">Seleccione editorial...</option>
                {editoriales.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.nombre} ({ed.pais})
                  </option>
                ))}
              </select>
              {formErrors.editorial_id && <span className="form-error">{formErrors.editorial_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Año de Publicación</label>
              <input
                type="number"
                className="form-input"
                value={formData.anio_publicacion}
                onChange={(e) => setFormData({ ...formData, anio_publicacion: e.target.value })}
                min="1000"
                max="2099"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Género o Categoría</label>
              <input
                type="text"
                className="form-input"
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                placeholder="Ej. Realismo Mágico, Ensayo, Poesía"
              />
            </div>

            {/* Selector de Autores (Relación N:M) */}
            <div className="form-group col-span-2">
              <label className="form-label required">
                Autores Relacionados (Tabla Intermedia: libros_autores)
              </label>
              <div
                style={{
                  maxHeight: 140,
                  overflowY: 'auto',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
              >
                {autores.map((autor) => {
                  const isChecked = selectedAuthorIds.includes(Number(autor.id));
                  return (
                    <label
                      key={autor.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isChecked ? 'var(--color-bg-accent-soft)' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAuthorSelection(autor.id)}
                      />
                      <span>{autor.nombre} {autor.apellidos}</span>
                    </label>
                  );
                })}
              </div>
              <span className="form-help">Seleccione uno o más autores para representar la relación muchos a muchos.</span>
              {formErrors.autores && <span className="form-error">{formErrors.autores}</span>}
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Sinopsis o Descripción Bibliográfica</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Resumen o anotaciones catalográficas de la obra..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Ficha Técnica y Ejemplares Físicos */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha Técnica Bibliográfica"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
            Cerrar Ficha
          </Button>
        }
      >
        {detailedLibro && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="details-grid">
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Título de la Obra</span>
                <span className="detail-value" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {detailedLibro.titulo}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Código ISBN</span>
                <span className="detail-value text-mono">{detailedLibro.isbn}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Casa Editorial</span>
                <span className="detail-value">{detailedLibro.editorial?.nombre || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Año de Publicación</span>
                <span className="detail-value">{detailedLibro.anio_publicacion}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Género Literario</span>
                <span className="detail-value">{detailedLibro.genero || 'No especificado'}</span>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Autores Asociados</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 4 }}>
                  {detailedLibro.autores?.map((a) => (
                    <span key={a.id} className="badge badge-coral">
                      {a.nombre} {a.apellidos} ({a.nacionalidad})
                    </span>
                  ))}
                </div>
              </div>
              <div className="detail-item col-span-2" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Sinopsis</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                  {detailedLibro.descripcion || 'Sin descripción registrada.'}
                </p>
              </div>
            </div>

            {/* Ejemplares Físicos del Libro */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Ejemplares Físicos en Inventario ({detailedLibro.ejemplares?.length || 0})
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Relación 1:N Libros → Ejemplares
                </span>
              </div>

              {detailedLibro.ejemplares?.length > 0 ? (
                <div className="copies-mini-list">
                  {detailedLibro.ejemplares.map((ej) => (
                    <div key={ej.id} className="copy-mini-item">
                      <div>
                        <strong>Código: {ej.codigo_inventario}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          Ubicación: {ej.ubicacion_estante} | Conservación: {ej.estado_conservacion}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(ej.disponibilidad)} dot>
                        {ej.disponibilidad}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  No hay ejemplares físicos asignados a este título todavía.
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
        title="¿Eliminar título bibliográfico?"
        message={`¿Confirma que desea eliminar "${selectedLibro?.titulo}"? No podrá eliminarse si tiene unidades físicas registradas en el módulo de ejemplares.`}
        confirmText="Eliminar Libro"
        loading={submitting}
      />
    </div>
  );
};
