import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Download, Calendar, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import SpinnerLoader from '@/components/ui/SpinnerLoader';

const COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)', 'var(--color-destructive)'];

const InventoryDashboard = () => {
  // Estado del rango de fechas
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  const [movements, setMovements] = useState([]);
  const [shrinkage, setShrinkage] = useState([]);
  const [stockVelocity, setStockVelocity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractArray = (response) => {
    const candidate = response?.data?.data ?? response?.data ?? response;
    if (Array.isArray(candidate)) return candidate;
    if (candidate && Array.isArray(candidate.items)) return candidate.items;
    return [];
  };

  const fetchInventoryData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      try {
        const movementsResp = await axiosInstance.get('/analytics/inventory/movements');
        setMovements(extractArray(movementsResp) || []);
      } catch (movErr) {
        // No bloquear la vista si /movements no acepta filtros de fecha.
        setMovements([]);
      }

      const [shrinkageResp, velocityResp] = await Promise.all([
        axiosInstance.get('/analytics/inventory/shrinkage', { params: { from: startDate, to: endDate } }),
        axiosInstance.get('/analytics/inventory/stock-velocity', { params: { from: startDate, to: endDate } }),
      ]);

      const shrinkageArray = shrinkageResp?.data?.data || [];
      const mappedShrink = shrinkageArray.map((item) => ({
        name: item.productName || item.categoria || item.nombre || 'Sin etiqueta',
        value: item.totalQuantity ?? item.cantidad ?? item.quantity ?? item.amount ?? item.value ?? 0,
      }));
      setShrinkage(mappedShrink);

      setStockVelocity(extractArray(velocityResp) || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar inventario';
      setError(errorMsg);
      setShrinkage([]);
      setStockVelocity([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [startDate, endDate]);

  const downloadWithAuth = async (format, fallbackFilename) => {
    try {
      const response = await axiosInstance.get('/analytics/inventory/movements/export', {
        params: {
          format,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${format}_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Silencioso - descarga bloqueada o error de red
    }
  };

  const handleExportPDF = () => downloadWithAuth('pdf', 'inventario_movimientos.pdf');
  const handleExportCSV = () => downloadWithAuth('csv', 'inventario_movimientos.csv');

  const handleDateChange = (field, value) => {
    if (field === 'from') setStartDate(value);
    if (field === 'to') setEndDate(value);
  };

  const tableRows = Array.isArray(movements) ? movements : [];
  const chartData = Array.isArray(shrinkage) ? shrinkage : [];
  const velocityCards = Array.isArray(stockVelocity) ? stockVelocity : [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventario (DSS)</h1>
          <p className="text-sm text-muted-foreground mt-1">Movimientos, mermas y velocidad de stock.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <Download size={16} /> Exportar PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar size={16} />
            Selecciona el rango de fechas
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground" htmlFor="inventory-start-date">Desde</label>
              <input
                id="inventory-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground" htmlFor="inventory-end-date">Hasta</label>
              <input
                id="inventory-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <SpinnerLoader />
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {velocityCards.length > 0 ? (
                  velocityCards.map((item, index) => {
                    const remaining = item.daysRemaining ?? item.dias_restantes ?? 0;
                    const title = item.productName || item.nombre || `Ítem ${index + 1}`;
                    const value = item.quantity || item.cantidad || item.stock || 0;
                    return (
                      <div
                        key={title + index}
                        className={`rounded-3xl border border-border bg-background p-5 shadow-sm ${remaining <= 3 ? 'ring-1 ring-destructive/30' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{remaining <= 3 ? 'Alerta' : 'OK'}</span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
                        <p className="mt-2 text-sm text-muted-foreground">Días restantes: {remaining}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground">
                    No hay datos de velocidad de stock disponibles.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Mermas</h2>
                  <p className="text-sm text-muted-foreground">Distribución de pérdidas por categoría</p>
                </div>
                <TrendingDown size={22} className="text-primary" />
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name || index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}`}
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border-border)', color: 'var(--foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No hay datos de mermas para este rango.</div>
              )}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6">
              <h2 className="text-lg font-semibold text-foreground">Movimientos de Inventario</h2>
              <p className="text-sm text-muted-foreground mt-1">Filtrado por fechas y exportación directa de movimientos.</p>
            </div>
            <div className="overflow-x-auto p-6">
              <table className="min-w-full text-left text-sm leading-6">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Cantidad</th>
                    <th className="px-4 py-3">Stock actual</th>
                    <th className="px-4 py-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableRows.length > 0 ? (
                    tableRows.map((movement, index) => (
                      <tr key={movement.id ?? index} className="hover:bg-background/50 transition-colors">
                        <td className="px-4 py-4 text-foreground">{movement.date || movement.fecha || movement.createdAt || '-'}</td>
                        <td className="px-4 py-4 text-foreground">{movement.productName || movement.producto || movement.name || '-'}</td>
                        <td className="px-4 py-4 text-muted-foreground">{movement.type || movement.tipo || '-'}</td>
                        <td className="px-4 py-4 text-foreground">{movement.quantity ?? movement.cantidad ?? '-'}</td>
                        <td className="px-4 py-4 text-muted-foreground">{movement.stockAfter ?? movement.stock_actual ?? '-'}</td>
                        <td className="px-4 py-4 text-muted-foreground">{movement.reason || movement.motivo || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No se encontraron movimientos en el rango seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default InventoryDashboard;
