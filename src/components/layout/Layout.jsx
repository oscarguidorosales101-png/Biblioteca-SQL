import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useApp } from '../../context/AppContext';

export const Layout = () => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { resetDemoData } = useApp();

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetModalOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar onOpenResetModal={() => setIsResetModalOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <ToastContainer />

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="¿Restaurar datos de demostración?"
        message="Esta acción restablecerá todas las tablas (Socios, Libros, Autores, Editoriales, Ejemplares, Préstamos y Multas) a su estado de fábrica inicial. Los cambios y nuevos registros guardados en localStorage se reiniciarán."
        confirmText="Restaurar ahora"
        confirmVariant="danger"
      />
    </div>
  );
};
