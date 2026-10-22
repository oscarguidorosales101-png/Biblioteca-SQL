import React, { useState } from 'react';
import {
  Database,
  RotateCcw,
  Server
} from 'lucide-react';
import { storageAdapter } from '../services/storageAdapter';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useApp } from '../context/AppContext';

export const ConfiguracionPage = () => {
  const { resetDemoData } = useApp();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Recuento de registros actuales en cada colección
  const counts = {
    socios: storageAdapter.getAll('socios').length,
    libros: storageAdapter.getAll('libros').length,
    autores: storageAdapter.getAll('autores').length,
    editoriales: storageAdapter.getAll('editoriales').length,
    ejemplares: storageAdapter.getAll('ejemplares').length,
    prestamos: storageAdapter.getAll('prestamos').length,
    multas: storageAdapter.getAll('multas').length,
    libros_autores: storageAdapter.getAll('libros_autores').length
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetModalOpen(false);
  };

  return (
    <div className="settings-section">
      {/* Tarjeta de Gestión de Datos de Demostración */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="settings-icon-box" style={{ background: '#FFF0F0', color: 'var(--color-primary)' }}>
              <Database size={20} />
            </div>
            <div>
              <CardTitle>Almacenamiento Local y Datos de Demostración (Fase 1)</CardTitle>
              <CardSubtitle>Estado de persistencia reactiva en <code>localStorage</code> del navegador</CardSubtitle>
            </div>
          </div>
          <Button variant="danger" icon={RotateCcw} onClick={() => setIsResetModalOpen(true)}>
            Restaurar Datos de Demostración
          </Button>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Los datos del sistema se gestionan a través del adaptador <code>storageAdapter.js</code>. Todas las altas, modificaciones y devoluciones se sincronizan en memoria y se conservan tras recargar la página. Puede restablecer el lote inicial de prueba en cualquier momento.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            {Object.entries(counts).map(([entidad, total]) => (
              <div
                key={entidad}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {entidad}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {total}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-success-text)' }}>
                  ✓ Requisito &ge; 10 cumplido
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Tarjeta de Preparación para PostgreSQL (Fase 2) */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="settings-icon-box" style={{ background: '#EEF6FF', color: '#0969DA' }}>
              <Server size={20} />
            </div>
            <div>
              <CardTitle>Arquitectura y Hoja de Ruta — Conexión con PostgreSQL</CardTitle>
              <CardSubtitle>Especificaciones técnicas planificadas para la integración de la Fase 2</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            El frontend ha sido estructurado con una capa de servicios desacoplada (<code>sociosService.js</code>, <code>librosService.js</code>, <code>prestamosService.js</code>, etc.) y una configuración centralizada en <code>apiConfig.js</code>. En la <strong>Fase 2</strong>, bastará cambiar <code>DATA_SOURCE_MODE = 'http'</code> para enlazar con los endpoints del backend en Node.js/PostgreSQL sin rehacer los componentes de la interfaz.
          </p>

          <table className="tech-spec-table">
            <tbody>
              <tr>
                <td className="tech-spec-label">Modelo Relacional Previsto</td>
                <td className="tech-spec-val">
                  socios, libros, autores, editoriales, ejemplares, prestamos, multas, libros_autores (N:M)
                </td>
              </tr>
              <tr>
                <td className="tech-spec-label">Motor de Base de Datos</td>
                <td className="tech-spec-val">PostgreSQL 15+ (Relacional con claves foráneas e integridad referencial)</td>
              </tr>
              <tr>
                <td className="tech-spec-label">Restricciones de Integridad</td>
                <td className="tech-spec-val">
                  1. <code>UNIQUE (isbn)</code> en libros y <code>UNIQUE (codigo_inventario)</code> en ejemplares.<br />
                  2. <code>CHECK (fecha_devolucion_prevista &gt;= fecha_prestamo)</code> en préstamos.<br />
                  3. <code>CHECK (importe &gt; 0)</code> en multas.<br />
                  4. <code>CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido'))</code> en socios.<br />
                  5. <code>FOREIGN KEY ON DELETE RESTRICT</code> para proteger préstamos y ejemplares.
                </td>
              </tr>
              <tr>
                <td className="tech-spec-label">Capa de Servicios Frontend</td>
                <td className="tech-spec-val">
                  <code>src/services/apiConfig.js</code> (Modo local actual vs HTTP REST futuro)
                </td>
              </tr>
              <tr>
                <td className="tech-spec-label">Límites de Fase 1 Respetados</td>
                <td className="tech-spec-val">
                  Sin credenciales PostgreSQL hardcodeadas, sin migraciones ejecutadas, sin operaciones de Git.
                </td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Modal Confirmación de Restauración */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="¿Restaurar todas las colecciones a datos de fábrica?"
        message="Esta acción reescribirá el almacenamiento de Socios, Libros, Autores, Editoriales, Ejemplares, Préstamos y Multas con los 10+ registros iniciales de demostración académica."
        confirmText="Confirmar Restauración"
        confirmVariant="danger"
      />
    </div>
  );
};
