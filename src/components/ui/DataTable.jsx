import React from 'react';
import { Inbox } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle = 'No se encontraron registros',
  emptyDescription = 'No hay datos disponibles para mostrar con los filtros aplicados.',
  emptyAction = null,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="data-table-container">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div className="spinner" style={{ width: 24, height: 24, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '0.88rem' }}>Cargando registros...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        <div className="empty-state">
          <div className="empty-icon-box">
            <Inbox size={26} />
          </div>
          <h4 className="empty-title">{emptyTitle}</h4>
          <p className="empty-description">{emptyDescription}</p>
          {emptyAction}
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`.trim()}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  width: col.width || 'auto',
                  textAlign: col.align || 'left'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => {
            const rowKey = row[keyField] !== undefined ? row[keyField] : rowIdx;
            return (
              <tr key={rowKey}>
                {columns.map((col, colIdx) => {
                  let content = null;
                  if (typeof col.render === 'function') {
                    content = col.render(row, rowIdx);
                  } else if (typeof col.accessor === 'function') {
                    content = col.accessor(row);
                  } else if (col.accessor) {
                    content = row[col.accessor];
                  }

                  return (
                    <td
                      key={col.key || colIdx}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {content !== undefined && content !== null ? content : '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
