import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Download, Calendar, TrendingDown,ArchiveX } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import SpinnerLoader from '@/components/ui/SpinnerLoader';
// Añade ArchiveX a tu lista de íconos importados
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

   // ... dentro de fetchInventoryData, sustituye el bloque shrinkageResp
const shrinkageArray = shrinkageResp?.data?.data || [];
const mappedShrink = shrinkageArray.map((item) => ({
  name: item.productName || 'Sin nombre',
  quantity: item.totalQuantity || 0,
  value: item.totalValue || 0,
  reason: item.mainReason?.trim() || 'Sin motivo',
  percentage: item.percentage || 0,
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
  const velocityCards = Array.isArray(stockVelocity) ? stockVelocity : [];
const chartData = Array.isArray(shrinkage) ? shrinkage : [];
// Añade esta línea nueva para sumar el total:
const totalShrinkageValue = chartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
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
    // 1. Extraemos TODAS las variables que manda el backend con sus respectivos fallbacks
    const title = item.productName || item.nombre || `Ítem ${index + 1}`;
    const currentStock = item.currentStock ?? 0;
    const minStock = item.minStock ?? 0;
    const averageDailyUsage = item.averageDailyUsage ?? 0;
    const remaining = item.daysRemaining ?? item.dias_restantes ?? 0;
    const backendStatus = (item.status || 'ok').toLowerCase();

    // 2. UX/UI: Determinamos si visualmente requiere alerta (por días restantes o por el estado del backend)
    const isAlert = remaining <= 7 || backendStatus !== 'ok'; 
    const isCritical = remaining <= 3;

    return (
      <div
        key={title + index}
        className={`rounded-3xl border bg-background p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
          isCritical 
            ? 'border-destructive/40 ring-1 ring-destructive/10 bg-destructive/[0.01]' 
            : isAlert 
              ? 'border-amber-500/40 bg-amber-500/[0.01]' 
              : 'border-border'
        }`}
      >
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Producto</span>
            <h3 className="text-lg font-bold text-foreground mt-0.5">{title}</h3>
          </div>
          
          {/* Badge de Estado Dinámico */}
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ${
            isCritical
              ? 'bg-destructive/10 text-destructive'
              : isAlert
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isCritical ? 'Crítico' : isAlert ? 'Revisar' : 'Óptimo'}
          </span>
        </div>

        {/* Sección Principal: Stock Actual */}
        <div className="my-5 border-y border-border/50 py-3 flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted-foreground">Stock Disponible:</span>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-foreground">{currentStock}</span>
            <span className="text-xs text-muted-foreground ml-1">unidades</span>
          </div>
        </div>

        {/* Datos Técnicos y Métricas (Mejora UX) */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Stock Mínimo Permitido:</span>
            <span className="font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
              {minStock} und
            </span>
          </div>

         {/* Consumo Diario Promedio (UX Mejorado) */}
<div className="flex justify-between items-center">
  <span className="text-muted-foreground font-medium">Consumo Promedio:</span>
  <span className="font-semibold text-foreground text-sm">
    {averageDailyUsage === 0 ? (
      "0 / día"
    ) : averageDailyUsage >= 1 ? (
      <>{averageDailyUsage.toFixed(1)} <span className="text-[10px] text-muted-foreground font-normal">/ día</span></>
    ) : (
      <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded">
        1 cada {Math.round(1 / averageDailyUsage)} días
      </span>
    )}
  </span>
</div>

          <div className="flex justify-between items-center pt-2 border-t border-dashed border-border">
            <span className="text-muted-foreground font-medium">Tiempo estimado de vida:</span>
            <span className={`font-bold text-sm ${isCritical ? 'text-destructive' : isAlert ? 'text-amber-500' : 'text-emerald-500'}`}>
              {remaining} días
            </span>
          </div>
        </div>
      </div>
    );
  })
) : (
  <div className="col-span-full rounded-3xl border border-border bg-background p-6 text-center text-sm text-muted-foreground">
    No hay datos de velocidad de stock disponibles.
  </div>
)}
              </div>
            </div>

  <section className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
  {/* Cabecera */}
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-foreground">Análisis de Mermas</h2>
      <p className="mt-1 text-sm text-muted-foreground">Distribución por valor y producto</p>
    </div>
    <div className="rounded-xl bg-destructive/10 p-2.5 text-destructive shadow-sm">
      <TrendingDown size={20} />
    </div>
  </div>

  {chartData.length > 0 ? (
    <div className="flex flex-1 flex-col">
      {/* Gráfico Donut con Centro Absoluto */}
      <div className="relative h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              innerRadius={75} 
              outerRadius={105} 
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 p-4 text-xs shadow-xl backdrop-blur-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                        <p className="font-bold text-foreground">{data.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-muted-foreground">Valor:</span>
                        <span className="font-semibold text-foreground text-right">Bs {data.value}</span>
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="font-semibold text-foreground text-right">{data.quantity} und</span>
                      </div>
                      <div className="mt-3 rounded bg-muted/50 p-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Motivo principal</p>
                        <p className="mt-0.5 text-xs font-medium text-foreground">{data.reason}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Total posicionado en el centro del Donut */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Valor</span>
          <span className="mt-1 text-2xl font-extrabold text-foreground">
            Bs {totalShrinkageValue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      
      {/* Leyenda Estilizada en formato de Mini-Cards */}
      <div className="mt-6 flex flex-col gap-2.5">
        {chartData.map((item, index) => (
          <div 
            key={item.name} 
            className="flex items-center justify-between rounded-2xl border border-transparent bg-muted/30 p-3.5 transition-colors hover:border-border/50 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div 
                className="h-3.5 w-3.5 rounded-full shadow-sm ring-2 ring-background" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <div>
                <p className="text-sm font-bold text-foreground leading-none">{item.name}</p>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground">{item.quantity} unidades perdidas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">Bs {item.value}</p>
              <span className="inline-block mt-1 rounded-md bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-sm">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    /* Estado Vacío (Empty State) Rediseñado */
    <div className="flex min-h-[340px] flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center transition-colors hover:border-border/80 hover:bg-muted/20">
      <div className="mb-4 rounded-full bg-background p-4 shadow-sm ring-1 ring-border">
        <ArchiveX size={32} className="text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-bold text-foreground">Sin registros de mermas</h3>
      <p className="mt-2 max-w-[260px] text-sm text-muted-foreground leading-relaxed">
        Excelente noticia. No se han reportado pérdidas ni mermas en el inventario durante este periodo.
      </p>
    </div>
  )}
</section>
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
