import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookX, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          backgroundColor: '#FFF0F0',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          border: '1px solid var(--color-accent-light)'
        }}
      >
        <BookX size={36} />
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
        Página no encontrada (404)
      </h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: 460, marginBottom: '1.5rem', lineHeight: 1.5 }}>
        La ruta solicitada no forma parte de los módulos del sistema de gestión bibliotecaria.
      </p>
      <Button icon={Home} onClick={() => navigate('/')}>
        Volver al Panel Principal
      </Button>
    </div>
  );
};
