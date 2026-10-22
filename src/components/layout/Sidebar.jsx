import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PenTool,
  Building2,
  Layers,
  ArrowRightLeft,
  Receipt,
  Settings,
  BookMarked,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const { sidebarOpen, closeSidebar } = useApp();

  const navItems = [
    { to: '/', label: 'Panel Principal', icon: LayoutDashboard },
    { to: '/socios', label: 'Socios', icon: Users },
    { to: '/libros', label: 'Libros', icon: BookOpen },
    { to: '/autores', label: 'Autores', icon: PenTool },
    { to: '/editoriales', label: 'Editoriales', icon: Building2 },
    { to: '/ejemplares', label: 'Ejemplares', icon: Layers },
    { to: '/prestamos', label: 'Préstamos', icon: ArrowRightLeft },
    { to: '/multas', label: 'Multas', icon: Receipt },
    { to: '/configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="brand-link" onClick={closeSidebar}>
            <div className="brand-icon-wrapper">
              <BookMarked size={20} />
            </div>
            <div>
              <span>Biblioteca-SQL</span>
              <span className="brand-subtitle">Gestión Bibliotecaria</span>
            </div>
          </NavLink>
          <button
            type="button"
            className="mobile-menu-btn"
            style={{ width: 32, height: 32 }}
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Módulos del Sistema</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={closeSidebar}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="nav-indicator" />}
                    <Icon size={18} className="nav-icon" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-db-status">
            <div className="db-status-header">
              <span>Almacenamiento</span>
              <span className="db-pill">Local / Demo</span>
            </div>
            <p className="db-status-desc">
              Fase 1: Frontend reactivo. Preparado para conexión con PostgreSQL en Fase 2.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
