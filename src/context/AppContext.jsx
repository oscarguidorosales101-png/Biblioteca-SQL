import React, { createContext, useContext, useState, useCallback } from 'react';
import { storageAdapter } from '../services/storageAdapter';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generador de notificaciones Toast discretas
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fuerza refresco de datos en componentes suscritos
  const notifyDataChanged = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  // Restaurar datos de fábrica
  const resetDemoData = useCallback(() => {
    const success = storageAdapter.resetAll();
    if (success) {
      notifyDataChanged();
      showToast('Datos de demostración restaurados exitosamente al estado inicial.', 'success');
    } else {
      showToast('Error al restaurar los datos de demostración.', 'error');
    }
    return success;
  }, [notifyDataChanged, showToast]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        dataVersion,
        notifyDataChanged,
        resetDemoData,
        sidebarOpen,
        toggleSidebar,
        closeSidebar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un AppProvider');
  }
  return context;
};
