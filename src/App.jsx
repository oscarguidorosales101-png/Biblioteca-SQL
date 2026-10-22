import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app-container">
          <AppRoutes />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
