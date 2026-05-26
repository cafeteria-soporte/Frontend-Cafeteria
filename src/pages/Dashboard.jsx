/**
 * Dashboard Page - Sprint 2 DSS - Día 1
 * Main analytics dashboard entry point
 * Maquetado visual limpio sin lógica de datos
 */
import { useState, useEffect } from 'react';
import { Clock, CreditCard, ShoppingCart, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [ventasDelDia, setVentasDelDia] = useState(0);
  const [ordenesTotales, setOrdenesTotales] = useState(0);
  const [stockCritico, setStockCritico] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadKpis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [ordersRes, lowStockRes] = await Promise.all([
          fetch('/api/cafeteria/user-orders'),
          fetch('/api/cafeteria/products/low-stock'),
        ]);

        if (!ordersRes.ok) throw new Error('Error fetching orders');
        if (!lowStockRes.ok) throw new Error('Error fetching low stock');

        const ordersData = await ordersRes.json();
        const lowStockData = await lowStockRes.json();

        const totalIngresos = Array.isArray(ordersData)
          ? ordersData.reduce((sum, order) => sum + Number(order.total ?? 0), 0)
          : 0;

        setVentasDelDia(totalIngresos);
        setOrdenesTotales(Array.isArray(ordersData) ? ordersData.length : 0);
        setStockCritico(Array.isArray(lowStockData) ? lowStockData.length : 0);
      } catch (err) {
        setError('No se pudieron cargar los datos. Reintenta más tarde.');
        setVentasDelDia(0);
        setOrdenesTotales(0);
        setStockCritico(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadKpis();
  }, []);

  const ventasPorHora = [
    { hour: '08:00', sales: 120 },
    { hour: '10:00', sales: 210 },
    { hour: '12:00', sales: 360 },
    { hour: '14:00', sales: 280 },
    { hour: '16:00', sales: 390 },
    { hour: '18:00', sales: 470 },
    { hour: '20:00', sales: 420 },
  ];

  const topProductos = [
    { name: 'Café expreso', value: 112 },
    { name: 'Capuchino', value: 98 },
    { name: 'Sandwich club', value: 76 },
    { name: 'Smoothie frutal', value: 58 },
    { name: 'Brownie', value: 44 },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <section className="mb-6 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Panel de control</p>
            <h1 className="mt-2 text-3xl font-semibold">Resumen operativo</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Monitorea ingresos, órdenes y stock crítico en tiempo real para tomar decisiones rápidas y precisas.
            </p>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Actualizado automáticamente
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 mb-6 animate-slide-up">
        <article className="card border border-border bg-card p-5 shadow-sm hover-lift">
          <div className="card-header flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <DollarSign size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Ventas</p>
              <p className="mt-2 text-2xl font-semibold">
                {isLoading ? 'Cargando...' : `S/${ventasDelDia.toFixed(2)}`}
              </p>
            </div>
          </div>
          <div className="card-content mt-4 text-sm text-muted-foreground">
            <p>Ingresos estimados del día en base a pedidos registrados.</p>
          </div>
        </article>

        <article className="card border border-border bg-card p-5 shadow-sm hover-lift">
          <div className="card-header flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <ShoppingCart size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Órdenes</p>
              <p className="mt-2 text-2xl font-semibold">
                {isLoading ? 'Cargando...' : ordenesTotales}
              </p>
            </div>
          </div>
          <div className="card-content mt-4 text-sm text-muted-foreground">
            <p>Total de ventas registradas por el equipo de caja y pedidos en línea.</p>
          </div>
        </article>

        <article className="card border border-border bg-card p-5 shadow-sm hover-lift">
          <div className="card-header flex items-center justify-between gap-3">
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <AlertTriangle size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Stock crítico</p>
              <p className="mt-2 text-2xl font-semibold">
                {isLoading ? 'Cargando...' : stockCritico}
              </p>
            </div>
          </div>
          <div className="card-content mt-4 text-sm text-muted-foreground">
            <p>Productos con inventario bajo que requieren reposición urgente.</p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="card border border-border bg-card p-5 shadow-sm hover-lift animate-fade-in">
          <div className="card-header mb-4 flex items-center justify-between">
            <div>
              <p className="card-title text-lg font-semibold">Ventas por hora</p>
              <p className="text-sm text-muted-foreground">Tendencia de demanda durante el día.</p>
            </div>
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <Clock size={20} />
            </div>
          </div>
          <div className="card-content h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ventasPorHora} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-border)" />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted-foreground)' }} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted-foreground)' }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-border)', color: 'var(--text-foreground)' }} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card border border-border bg-card p-5 shadow-sm hover-lift animate-fade-in">
          <div className="card-header mb-4 flex items-center justify-between">
            <div>
              <p className="card-title text-lg font-semibold">Top 5 productos</p>
              <p className="text-sm text-muted-foreground">Los artículos más vendidos en la última jornada.</p>
            </div>
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-content h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProductos} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-border)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted-foreground)' }} axisLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'var(--text-muted-foreground)' }} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-border)', color: 'var(--text-foreground)' }} />
                <Bar dataKey="value" fill="var(--color-secondary)" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card border border-border bg-card p-5 shadow-sm hover-lift animate-slide-up">
          <div className="card-header mb-4 flex items-center justify-between">
            <div>
              <p className="card-title text-lg font-semibold">Métodos de pago</p>
              <p className="text-sm text-muted-foreground">Análisis de pago disponible próximamente.</p>
            </div>
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="card-content flex h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-background text-center text-sm text-muted-foreground">
            Gráfico de métodos de pago en desarrollo. Esta vista se actualizará cuando el endpoint esté listo.
          </div>
        </article>

        <article className="card border border-border bg-card p-5 shadow-sm hover-lift animate-slide-up">
          <div className="card-header mb-4 flex items-center justify-between">
            <div>
              <p className="card-title text-lg font-semibold">Tendencias</p>
              <p className="text-sm text-muted-foreground">Visión general de la dirección del negocio.</p>
            </div>
            <div className="rounded-2xl bg-background p-3 text-foreground">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-content flex h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-background text-center text-sm text-muted-foreground">
            Componente de tendencias pendiente de integración. Se conservará la estructura para enlazar métricas reales.
          </div>
        </article>
      </section>
    </main>
  );
};

export default Dashboard;