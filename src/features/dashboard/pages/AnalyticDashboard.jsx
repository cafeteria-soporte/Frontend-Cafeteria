import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Calendar, RefreshCw, DollarSign, ShoppingCart, TrendingUp, CreditCard, Download } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ChartLoader, SkeletonBar } from '../components/ChartLoader';
import SpinnerLoader from '@/components/ui/SpinnerLoader';

const PAYMENT_METHOD_COLORS = {
  Efectivo: '#10B981',
  'Transferencia/QR': '#3B82F6',
  Mixto: '#F59E0B',
};

// Note: Removed static mockDashboardData; charts use `chartData` populated from API with safe fallbacks.

/**
 * Dashboard Analítico Principal - Sprint 2 DSS
 * PARTE 1: Lógica y Datos - Refactorización con peticiones reales
 */
const AnalyticDashboard = () => {
  /**
   * ────────────────────────────────────────────────────────────────────
   * ESTADOS
   * ────────────────────────────────────────────────────────────────────
   */

  /**
   * kpis: Métricas principales del día
   */
  const [kpis, setKpis] = useState({
    totalSales: 0,
    totalOrders: 0,
    criticalStockProducts: 0,
    averageTicket: 0,
    dayVariation: 0,
  });

  /**
   * chartData: Datos para los 4 gráficos
   */
  const [chartData, setChartData] = useState({
    salesByHour: [],
    paymentMethods: [],
    topProducts: [],
    trendComparison: [],
  });
  const [paymentMethodsData, setPaymentMethodsData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fecha seleccionada (puede venir de DatePicker como Date u "YYYY-MM-DD")
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');

  /**
   * ────────────────────────────────────────────────────────────────────
   * Helper: Formatea Date / estado de DatePicker a YYYY-MM-DD
   * ────────────────────────────────────────────────────────────────────
   */
  const formatDateForQuery = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
      return localDate.toISOString().split('T')[0];
    }
    return null;
  };

  /**
   * ────────────────────────────────────────────────────────────────────
   * USEEFFECT: Cargar datos al montar el componente
   * ────────────────────────────────────────────────────────────────────
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      const formattedFrom = formatDateForQuery(startDate);
      const formattedTo = formatDateForQuery(endDate);

      // Helper para extraer arrays de una respuesta robustamente
      const extractArray = (resp) => {
        const maybe = resp?.data?.data ?? resp?.data ?? resp;
        if (Array.isArray(maybe)) return maybe;
        if (maybe && Array.isArray(maybe.items)) return maybe.items;
        return [];
      };

      try {
        const [byPeriodResp, topProductsResp, byCategoryResp, paymentMethodsResp, lowStockResp] = await Promise.all([
          axiosInstance.get('/analytics/sales/by-period', { params: { from: formattedFrom, to: formattedTo } }),
          axiosInstance.get('/analytics/sales/top-products', { params: { from: formattedFrom, to: formattedTo } }),
          axiosInstance.get('/analytics/sales/by-category', { params: { from: formattedFrom, to: formattedTo } }),
          axiosInstance.get('/analytics/sales/payment-methods', { params: { from: formattedFrom, to: formattedTo } }),
          axiosInstance.get('/products/low-stock'),
        ]);

        const salesByHour = extractArray(byPeriodResp);
        const topProducts = extractArray(topProductsResp);
        const paymentMethods = extractArray(byCategoryResp);
        const paymentMethodsRaw = paymentMethodsResp?.data?.data ?? paymentMethodsResp?.data ?? [];
        const lowStockProducts = extractArray(lowStockResp);

        const firstPeriod = Array.isArray(salesByHour) && salesByHour.length > 0 ? salesByHour[0] : {};
        const totalSales = firstPeriod.revenue ?? 0;
        const totalOrders = firstPeriod.orderCount ?? 0;
        const averageTicket = firstPeriod.avgTicket ?? (totalOrders > 0 ? totalSales / totalOrders : 0);
        const criticalStockProducts = Array.isArray(lowStockProducts) ? lowStockProducts.length : 0;

        const mappedSalesByHour = Array.isArray(salesByHour)
          ? salesByHour.map((item) => ({
              time: item.period || item.time || item.label || '',
              amount: item.revenue ?? item.amount ?? 0,
              transactions: item.orderCount ?? item.transactions ?? 0,
              today: item.revenue ?? item.amount ?? 0,
              yesterday: item.yesterday ?? 0,
            }))
          : [];

        const mappedTopProducts = Array.isArray(topProducts)
          ? topProducts.map((item) => ({
              name: item.name ?? item.productName ?? 'Producto',
              sales: item.totalQuantity ?? item.quantity ?? item.sales ?? 0,
              revenue: item.totalRevenue ?? item.revenue ?? 0,
            }))
          : [];

        const mappedPaymentMethods = Array.isArray(paymentMethods)
          ? paymentMethods.map((item) => ({
              ...item,
              name: item.name,
              porcentaje: Math.round(Number(item.percentage || 0)),
              value: Math.round(Number(item.percentage || 0)),
            }))
          : [];

        const mappedPaymentMethodsData = Array.isArray(paymentMethodsRaw)
          ? paymentMethodsRaw.map((item) => ({
              name:
                item.method === 'cash' ? 'Efectivo' :
                item.method === 'mixed' ? 'Mixto' :
                item.method === 'transfer' ? 'Transferencia/QR' :
                item.method,
              value: Math.round(Number(item.percentage || 0)),
            }))
          : [];

        setKpis({
          totalSales,
          totalOrders,
          criticalStockProducts,
          averageTicket: parseFloat(averageTicket.toFixed(2)),
          dayVariation: 0,
        });

        setChartData({
          salesByHour: mappedSalesByHour,
          paymentMethods: mappedPaymentMethods,
          topProducts: mappedTopProducts,
          trendComparison: mappedSalesByHour,
        });
        setPaymentMethodsData(mappedPaymentMethodsData);

      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Error al cargar los datos';
        setError(errorMsg);
        setChartData({ salesByHour: [], paymentMethods: [], topProducts: [], trendComparison: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [startDate, endDate]);

  // Usar datos provistos por la API (fallback a arrays vacíos para evitar errores)
  const displaySalesData = Array.isArray(chartData.salesByHour) ? chartData.salesByHour : [];
  const displayProductsData = Array.isArray(chartData.topProducts) ? chartData.topProducts : [];

  /**
   * Maneja cambios en el rango de fechas
   */
  const handleDateChange = (field, value) => {
    if (field === 'from') setStartDate(formatDateForQuery(value));
    if (field === 'to') setEndDate(formatDateForQuery(value));
  };

  /**
   * Maneja la actualización manual de datos
   */
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    const extractArray = (resp) => {
      const maybe = resp?.data?.data ?? resp?.data ?? resp;
      if (Array.isArray(maybe)) return maybe;
      if (maybe && Array.isArray(maybe.items)) return maybe.items;
      return [];
    };

    const formattedFrom = formatDateForQuery(startDate);
    const formattedTo = formatDateForQuery(endDate);

    try {
      const [byPeriodResp, topProductsResp, byCategoryResp, paymentMethodsResp, lowStockResp] = await Promise.all([
        axiosInstance.get('/analytics/sales/by-period', { params: { from: formattedFrom, to: formattedTo } }),
        axiosInstance.get('/analytics/sales/top-products', { params: { from: formattedFrom, to: formattedTo } }),
        axiosInstance.get('/analytics/sales/by-category', { params: { from: formattedFrom, to: formattedTo } }),
        axiosInstance.get('/analytics/sales/payment-methods', { params: { from: formattedFrom, to: formattedTo } }),
        axiosInstance.get('/products/low-stock'),
      ]);

      const salesByHour = extractArray(byPeriodResp);
      const topProducts = extractArray(topProductsResp);
      const paymentMethods = extractArray(byCategoryResp);
      const paymentMethodsRaw = paymentMethodsResp?.data?.data ?? paymentMethodsResp?.data ?? [];
      const lowStockProducts = extractArray(lowStockResp);

      const firstPeriod = Array.isArray(salesByHour) && salesByHour.length > 0 ? salesByHour[0] : {};
      const totalSales = firstPeriod.revenue ?? 0;
      const totalOrders = firstPeriod.orderCount ?? 0;
      const averageTicket = firstPeriod.avgTicket ?? (totalOrders > 0 ? totalSales / totalOrders : 0);
      const criticalStockProducts = Array.isArray(lowStockProducts) ? lowStockProducts.length : 0;

      const mappedSalesByHour = Array.isArray(salesByHour)
        ? salesByHour.map((item) => ({
            time: item.period || item.time || item.label || '',
            amount: item.revenue ?? item.amount ?? 0,
            transactions: item.orderCount ?? item.transactions ?? 0,
            today: item.revenue ?? item.amount ?? 0,
            yesterday: item.yesterday ?? 0,
          }))
        : [];

      const mappedTopProducts = Array.isArray(topProducts)
        ? topProducts.map((item) => ({
            name: item.name ?? item.productName ?? 'Producto',
            sales: item.totalQuantity ?? item.quantity ?? item.sales ?? 0,
            revenue: item.totalRevenue ?? item.revenue ?? 0,
          }))
        : [];

      const mappedPaymentMethods = Array.isArray(paymentMethods)
        ? paymentMethods.map((item) => ({
            ...item,
            name: item.name,
            porcentaje: Math.round(Number(item.percentage || 0)),
            value: Math.round(Number(item.percentage || 0)),
          }))
        : [];

      const mappedPaymentMethodsData = Array.isArray(paymentMethodsRaw)
        ? paymentMethodsRaw.map((item) => ({
            name:
              item.method === 'cash' ? 'Efectivo' :
              item.method === 'mixed' ? 'Mixto' :
              item.method === 'transfer' ? 'Transferencia/QR' :
              item.method,
            value: Math.round(Number(item.percentage || 0)),
          }))
        : [];

      setKpis({
        totalSales,
        totalOrders,
        criticalStockProducts,
        averageTicket: parseFloat(averageTicket.toFixed(2)),
        dayVariation: 0,
      });

      setChartData({
        salesByHour: mappedSalesByHour,
        paymentMethods: mappedPaymentMethods,
        topProducts: mappedTopProducts,
        trendComparison: mappedSalesByHour,
      });
      setPaymentMethodsData(mappedPaymentMethodsData);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar los datos';
      setError(errorMsg);
      setChartData({ salesByHour: [], paymentMethods: [], topProducts: [], trendComparison: [] });
    } finally {
      setIsLoading(false);
    }
  };
  const handleExportReport = async (format) => {
    // TODO: Implementar cuando endpoint esté disponible
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-background min-h-screen text-foreground transition-base">
        <SpinnerLoader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen text-foreground transition-base">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard Analítico</h1>
            <p className="text-muted-foreground mt-1">
              Sprint 2 DSS - Análisis en tiempo real de la cafetería
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isLoading}
            title="Actualizar datos"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Date Range Selector - HARDCODED para DEBUG */}
        <div className="flex items-center gap-4 mt-4 bg-card p-4 rounded-lg border border-border">
          <Calendar size={18} className="text-muted-foreground" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground" htmlFor="startDate">Desde</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground" htmlFor="endDate">Hasta</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleExportReport('csv')}
              className="px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors flex items-center gap-1"
              title="Descargar reporte en CSV"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              onClick={() => handleExportReport('pdf')}
              className="px-3 py-1 text-sm bg-secondary/10 text-secondary rounded hover:bg-secondary/20 transition-colors flex items-center gap-1"
              title="Descargar reporte en PDF"
            >
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards - Fila Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 animate-slide-up">
        <div className="card p-6 flex items-center justify-between hover-lift">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Ventas del día</h3>
            <p className="text-2xl font-bold mt-1">Bs. {kpis.totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between hover-lift">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Transacciones</h3>
            <p className="text-2xl font-bold mt-1">{kpis.totalOrders}</p>
          </div>
          <div className="bg-secondary/10 p-3 rounded-full text-secondary">
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between hover-lift">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Ticket promedio</h3>
            <p className="text-2xl font-bold mt-1">Bs. {kpis.averageTicket.toFixed(2)}</p>
          </div>
          <div className="bg-accent/10 p-3 rounded-full text-accent">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between hover-lift">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Variación vs ayer</h3>
            <p className="text-2xl font-bold mt-1">{kpis.dayVariation}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <CreditCard size={24} />
          </div>
        </div>

        <div className={`card p-6 flex items-center justify-between hover-lift ${kpis.criticalStockProducts > 0 ? 'border-l-4 border-l-destructive' : ''}`}>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Stock Crítico</h3>
            <p className={`text-2xl font-bold mt-1 ${kpis.criticalStockProducts > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {kpis.criticalStockProducts}
            </p>
          </div>
          <div className={`p-3 rounded-full ${kpis.criticalStockProducts > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted/10 text-muted-foreground'}`}>
            <ShoppingCart size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico 1: Ventas por hora */}
        <div className="card hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="card-header border-b border-border p-6 pb-4">
            <h2 className="card-title text-lg">Tendencia de Ventas</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Evolución histórica de ingresos
            </p>
          </div>
          <div className="card-content p-6">
            {isLoading ? (
              <ChartLoader height="h-64" />
            ) : error ? (
              <div className="h-64 bg-destructive/10 rounded-md border border-destructive/30 flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium text-destructive">Error al cargar datos</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displaySalesData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="time"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => `Bs. ${value}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--color-primary)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Métodos de pago */}
        <div className="card hover-lift animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="card-header border-b border-border p-6 pb-4">
            <h2 className="card-title text-lg">"Ventas por Categoría"</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Porcentaje de ventas según la categoría
            </p>
          </div>
          <div className="card-content p-6">
            {isLoading ? (
              <ChartLoader height="h-64" />
            ) : error ? (
              <div className="h-64 bg-destructive/10 rounded-md border border-destructive/30 flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium text-destructive">Error al cargar datos</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '256px' }}>
                <div className="flex flex-col gap-4 h-full">
                  {chartData.paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: idx === 0 ? 'var(--color-primary)' : idx === 1 ? 'var(--color-secondary)' : idx === 2 ? 'var(--color-accent)' : 'var(--muted-foreground)'
                          }}
                        />
                        <span className="text-sm text-foreground">{method.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">{method.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Gráfico 3: Top 5 productos */}
        <div className="card hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="card-header border-b border-border p-6 pb-4">
            <h2 className="card-title text-lg">Top 5 Productos</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Productos más vendidos en el período
            </p>
          </div>
          <div className="card-content p-6">
            {isLoading ? (
              <ChartLoader height="h-64" />
            ) : error ? (
              <div className="h-64 bg-destructive/10 rounded-md border border-destructive/30 flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium text-destructive">Error al cargar datos</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayProductsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => `${value} unidades`}
                    />
                    <Bar
                      dataKey="sales"
                      fill="var(--color-secondary)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 4: Distribución de Pagos */}
        <div className="card hover-lift animate-slide-up" style={{ animationDelay: '225ms' }}>
          <div className="card-header border-b border-border p-6 pb-4">
            <h2 className="card-title text-lg">Distribución de Pagos</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Métodos de pago más usados en el período
            </p>
          </div>
          <div className="card-content p-6">
            {isLoading ? (
              <ChartLoader height="h-64" />
            ) : error ? (
              <div className="h-64 bg-destructive/10 rounded-md border border-destructive/30 flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium text-destructive">Error al cargar datos</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            ) : paymentMethodsData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-center text-sm text-muted-foreground">
                No hay datos de métodos de pago disponibles para este rango.
              </div>
            ) : (
              <div style={{ width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                    >
                      {paymentMethodsData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={PAYMENT_METHOD_COLORS[entry.name] ?? '#8B5CF6'}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 5: Comparativa hoy vs ayer */}
        <div className="card hover-lift animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="card-header border-b border-border p-6 pb-4">
            <h2 className="card-title text-lg">Comparativa de Ventas</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Hoy vs. Ayer - Análisis comparativo
            </p>
          </div>
          <div className="card-content p-6">
            {isLoading ? (
              <ChartLoader height="h-64" />
            ) : error ? (
              <div className="h-64 bg-destructive/10 rounded-md border border-destructive/30 flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium text-destructive">Error al cargar datos</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.isArray(chartData.trendComparison) ? chartData.trendComparison : []}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="hour"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => `Bs. ${value}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="today"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--color-primary)', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Hoy"
                    />
                    <Line
                      type="monotone"
                      dataKey="yesterday"
                      stroke="var(--color-secondary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--color-secondary)', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Ayer"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticDashboard;
