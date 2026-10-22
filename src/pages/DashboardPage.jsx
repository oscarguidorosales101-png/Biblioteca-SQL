import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Users,
  ArrowRightLeft,
  AlertCircle,
  Receipt,
  PlusCircle,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { prestamosService } from '../services/prestamosService';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '../utils/formatters';
import { useApp } from '../context/AppContext';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { dataVersion, showToast, notifyDataChanged } = useApp();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [returningId, setReturningId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error cargando métricas del dashboard:', err);
      showToast('Error al cargar datos del panel.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dataVersion]);

  const handleDevolverPrestamo = async (id) => {
    try {
      setReturningId(id);
      await prestamosService.registrarDevolucion(id);
      showToast('Devolución registrada exitosamente. El ejemplar ahora está disponible.', 'success');
      notifyDataChanged();
    } catch (err) {
      showToast(err.message || 'Error al registrar devolución.', 'error');
    } finally {
      setReturningId(null);
    }
  };

  const columnsPrestamos = [
    {
      header: 'ID',
      accessor: 'id',
      width: '60px',
      render: (row) => <span className="table-cell-id">#{row.id}</span>
    },
    {
      header: 'Socio',
      accessor: (row) => `${row.socio?.nombre} ${row.socio?.apellidos}`,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.socio?.nombre} {row.socio?.apellidos}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>DNI: {row.socio?.dni}</div>
        </div>
      )
    },
    {
      header: 'Libro y Ejemplar',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.libro?.titulo}</div>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem', marginTop: 2 }}>
            {row.ejemplar?.codigo_inventario}
          </span>
        </div>
      )
    },
    {
      header: 'Fecha Préstamo',
      accessor: (row) => formatDate(row.fecha_prestamo)
    },
    {
      header: 'Fecha Límite',
      accessor: (row) => formatDate(row.fecha_devolucion_prevista)
    },
    {
      header: 'Estado',
      accessor: 'estado',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.estado)} dot>
          {row.estado}
        </Badge>
      )
    },
    {
      header: 'Acción',
      align: 'right',
      render: (row) => {
        if (row.estado === 'Activo' || row.estado === 'Vencido') {
          return (
            <Button
              size="sm"
              variant="outline"
              loading={returningId === row.id}
              onClick={() => handleDevolverPrestamo(row.id)}
              title="Registrar devolución física del ejemplar"
            >
              Devolver
            </Button>
          );
        }
        return (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Completado
          </span>
        );
      }
    }
  ];

  if (loading && !metrics) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <p>Cargando panel de gestión bibliotecaria...</p>
      </div>
    );
  }

  const kpis = metrics?.kpis || {};
  const charts = metrics?.charts || {};

  return (
    <div className="dashboard-grid">
      {/* Banner Informativo de Fase 1 */}
      <div className="info-banner">
        <div className="info-banner-icon">
          <TrendingUp size={22} />
        </div>
        <div className="info-banner-content">
          <h2 className="info-banner-title">Sistema de Gestión de Biblioteca — Fase 1 (Frontend & Datos Reactivos)</h2>
          <p className="info-banner-text">
            Este panel calcula en tiempo real todos los indicadores a partir de las entidades relacionales simuladas en memoria y <code>localStorage</code>.
            Cada préstamo activo altera la disponibilidad de los ejemplares físicos y las reglas de devolución liberan el inventario de forma consistente.
            En la <strong>Fase 2</strong>, estas operaciones se vincularán directamente a la base de datos PostgreSQL.
          </p>
        </div>
      </div>

      {/* Grid de KPIs principales */}
      <div className="stats-grid">
        <StatCard
          label="Títulos Registrados"
          value={kpis.totalTitulos || 0}
          subtext="Catálogo bibliográfico"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          label="Total Ejemplares"
          value={kpis.totalEjemplares || 0}
          subtext="Unidades físicas en acervo"
          icon={Layers}
          color="amber"
        />
        <StatCard
          label="Socios Activos"
          value={kpis.totalSocios || 0}
          subtext="Lectores registrados"
          icon={Users}
          color="green"
        />
        <StatCard
          label="Préstamos Activos"
          value={kpis.prestamosActivos || 0}
          subtext="En circulación actual"
          icon={ArrowRightLeft}
          color="blue"
        />
        <StatCard
          label="Préstamos Vencidos"
          value={kpis.prestamosVencidos || 0}
          subtext="Excedieron plazo pactado"
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          label="Multas Pendientes"
          value={`${kpis.multasPendientes || 0} (${formatCurrency(kpis.montoMultasPendientes)})`}
          subtext="Por regularizar"
          icon={Receipt}
          color="red"
        />
      </div>

      {/* Barra de accesos rápidos */}
      <Card>
        <CardBody style={{ padding: '1rem 1.5rem' }}>
          <div className="quick-actions-bar">
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Accesos Rápidos:
            </span>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate('/prestamos', { state: { openCreate: true } })}
            >
              <PlusCircle size={16} color="var(--color-primary)" />
              <span>Nuevo Préstamo</span>
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate('/socios', { state: { openCreate: true } })}
            >
              <Users size={16} color="var(--color-primary)" />
              <span>Registrar Socio</span>
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate('/libros', { state: { openCreate: true } })}
            >
              <BookOpen size={16} color="var(--color-primary)" />
              <span>Agregar Libro</span>
            </button>
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate('/ejemplares', { state: { openCreate: true } })}
            >
              <Layers size={16} color="var(--color-primary)" />
              <span>Registrar Ejemplar</span>
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Gráficos de visualización */}
      <div className="dashboard-charts-grid">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Circulación de Préstamos por Estado</CardTitle>
              <CardSubtitle>Distribución de préstamos activos, devueltos y vencidos</CardSubtitle>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.prestamosPorEstado || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="valor"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(charts.prestamosPorEstado || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} préstamos`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
              {(charts.prestamosPorEstado || []).map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}:</span>
                  <strong>{item.valor}</strong>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Disponibilidad de Ejemplares Físicos</CardTitle>
              <CardSubtitle>Estado operativo del inventario bibliográfico</CardSubtitle>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.ejemplaresPorEstado || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} ejemplares`, 'Cantidad']} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {(charts.ejemplaresPorEstado || []).map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {(charts.ejemplaresPorEstado || []).map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}:</span>
                  <strong>{item.valor}</strong>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabla de préstamos recientes */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Actividad Reciente de Préstamos</CardTitle>
            <CardSubtitle>Últimos registros de circulación en sala y domicilio</CardSubtitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/prestamos')}>
            <span>Ver todos</span>
            <ExternalLink size={14} />
          </Button>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <DataTable
            columns={columnsPrestamos}
            data={metrics?.ultimosPrestamos || []}
            emptyTitle="No hay préstamos recientes"
          />
        </CardBody>
      </Card>
    </div>
  );
};
