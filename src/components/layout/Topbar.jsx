import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Database, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar = ({ onOpenResetModal }) => {
  const location = useLocation();
  const { toggleSidebar } = useApp();

  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
        return { title: 'Panel Principal', breadcrumb: 'Sistema / Panel' };
      case '/socios':
        return { title: 'Gestión de Socios', breadcrumb: 'Sistema / Socios' };
      case '/libros':
        return { title: 'Catálogo de Libros', breadcrumb: 'Sistema / Libros' };
      case '/autores':
        return { title: 'Directorio de Autores', breadcrumb: 'Sistema / Autores' };
      case '/editoriales':
        return { title: 'Casas Editoriales', breadcrumb: 'Sistema / Editoriales' };
      case '/ejemplares':
        return { title: 'Control de Ejemplares Físicos', breadcrumb: 'Sistema / Ejemplares' };
      case '/prestamos':
        return { title: 'Circulación y Préstamos', breadcrumb: 'Sistema / Préstamos' };
      case '/multas':
        return { title: 'Administración de Multas', breadcrumb: 'Sistema / Multas' };
      case '/configuracion':
        return { title: 'Configuración y Entorno', breadcrumb: 'Sistema / Configuración' };
      default:
        return { title: 'Biblioteca-SQL', breadcrumb: 'Sistema' };
    }
  };

  const { title, breadcrumb } = getPageMeta(location.pathname);

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-titles">
          <span className="topbar-breadcrumb">{breadcrumb}</span>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        {onOpenResetModal && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenResetModal}
            title="Restaurar datos iniciales de prueba"
          >
            <RotateCcw size={14} />
            <span>Restaurar Demo</span>
          </button>
        )}

        <div className="topbar-mode-badge" title="Fase 1: Capa de almacenamiento local. No conectado a PostgreSQL.">
          <span className="topbar-mode-dot" />
          <Database size={13} />
          <span className="long-text">Datos Demo</span>
          <span>(Fase 1)</span>
        </div>

        <div className="user-profile-badge">
          <div className="user-avatar" title="Elena Ramos">
            ER
          </div>
          <div className="user-meta">
            <span className="user-name">Elena Ramos</span>
            <span className="user-role">Bibliotecaria Jefa</span>
          </div>
        </div>
      </div>
    </header>
  );
};
