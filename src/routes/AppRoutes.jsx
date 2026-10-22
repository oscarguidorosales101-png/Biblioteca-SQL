import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { DashboardPage } from '../pages/DashboardPage';
import { SociosPage } from '../pages/SociosPage';
import { LibrosPage } from '../pages/LibrosPage';
import { AutoresPage } from '../pages/AutoresPage';
import { EditorialesPage } from '../pages/EditorialesPage';
import { EjemplaresPage } from '../pages/EjemplaresPage';
import { PrestamosPage } from '../pages/PrestamosPage';
import { MultasPage } from '../pages/MultasPage';
import { ConfiguracionPage } from '../pages/ConfiguracionPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="socios" element={<SociosPage />} />
        <Route path="libros" element={<LibrosPage />} />
        <Route path="autores" element={<AutoresPage />} />
        <Route path="editoriales" element={<EditorialesPage />} />
        <Route path="ejemplares" element={<EjemplaresPage />} />
        <Route path="prestamos" element={<PrestamosPage />} />
        <Route path="multas" element={<MultasPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
