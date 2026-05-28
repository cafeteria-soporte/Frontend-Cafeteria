import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { RefreshCw, Activity } from 'lucide-react';
import SpinnerLoader from '@/components/ui/SpinnerLoader';

const FinancialDashboard = () => {
  const [activeRange, setActiveRange] = useState('7d');
  // Fechas seleccionadas (pueden venir como Date o 'YYYY-MM-DD')
  const [from, setFrom] = useState('2026-05-01');
  const [to, setTo] = useState('2026-05-31');

  const [discrepanciesData, setDiscrepanciesData] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const extractArray = (resp) => {
    const maybe = resp?.data?.data ?? resp?.data ?? resp;
    if (Array.isArray(maybe)) return maybe;
    if (maybe && Array.isArray(maybe.items)) return maybe.items;
    return [];
  };

  const fetchShiftsAnalytics = async () => {
    setIsLoading(true);
    try {
const discrepanciesResp = await axiosInstance.get('/analytics/shifts/discrepancies', {
  params: { from, to } 
});
      const discrepanciesArray = Array.isArray(discrepanciesResp?.data) ? discrepanciesResp.data : [];
      const mappedDiscrepancies = discrepanciesArray.map((item) => ({
        id: item.shiftRecordId,
        cajero: item.cashierName,
        fecha: item.openedAt ? new Date(item.openedAt).toLocaleDateString() : '-',
        esperado: item.expectedAmount ?? 0,
        declarado: item.declaredAmount ?? 0,
        descuadre: item.discrepancy ?? 0,
        estado: item.discrepancyAlert ? 'Alerta' : 'OK',
      }));

      setDiscrepanciesData(mappedDiscrepancies || []);
      setShiftsList([]);

    } catch (err) {
      setDiscrepanciesData([]);
      setShiftsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftsAnalytics();
  }, [from, to]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <SpinnerLoader />
      </div>
    );
  }

  const handleRangeChange = (range) => {
  setActiveRange(range);
  
  // Usamos el 31 de mayo de 2026 como tu "hoy" según tus datos de prueba
  const endDate = new Date('2026-05-31T12:00:00'); 
  const startDate = new Date(endDate);

  if (range === '7d') startDate.setDate(endDate.getDate() - 7);
  if (range === '15d') startDate.setDate(endDate.getDate() - 15);
  if (range === '30d') startDate.setDate(endDate.getDate() - 30);

  // Formateamos a YYYY-MM-DD y actualizamos los estados
  setFrom(startDate.toISOString().split('T')[0]);
  setTo(endDate.toISOString().split('T')[0]);
};

  const totalDiscrepancy = discrepanciesData.reduce((acc, curr) => acc + (Number(curr.descuadre) || 0), 0);

  // Agrupar y calcular cajeros con mayores faltantes
const cashierRiskStats = discrepanciesData.reduce((acc, curr) => {
  if (curr.descuadre < 0) {
    if (!acc[curr.cajero]) {
      acc[curr.cajero] = { name: curr.cajero, totalShortage: 0, incidents: 0 };
    }
    acc[curr.cajero].totalShortage += curr.descuadre; // Suma los valores negativos
    acc[curr.cajero].incidents += 1;
  }
  return acc;
}, {});

// Convertir a array, ordenar por el que más dinero ha perdido y tomar los top 3
const topRiskyCashiers = Object.values(cashierRiskStats)
  .sort((a, b) => a.totalShortage - b.totalShortage) // Ordena de más negativo a menos negativo
  .slice(0, 3);
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex flex-col gap-3 mb-6 animate-slide-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">DSS-34 · Control de Caja y Anulaciones</p>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          </div>
          <button onClick={fetchShiftsAnalytics} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-accent">
            <RefreshCw size={16} />
            Actualizar datos
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {['7d', '15d', '30d'].map((range) => (
            <button
              key={range}
onClick={() => handleRangeChange(range)}               className={`rounded-full border px-4 py-2 text-sm transition ${activeRange === range ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:bg-muted'}`}>
              Últimos {range === '7d' ? '7 días' : range === '15d' ? '15 días' : '30 días'}
            </button>
          ))}
        </div>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Control rápido</p>
              <h3 className="text-lg font-semibold text-foreground">Descuadre total</h3>
            </div>
            <div className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground border border-border">
              Bs. {totalDiscrepancy}
            </div>
            {/* Componente de decisión rápida */}
<div className={`mt-4 p-4 rounded-xl border ${totalDiscrepancy < 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
  <h4 className={`font-bold ${totalDiscrepancy < 0 ? 'text-red-800' : 'text-emerald-800'}`}>
    {totalDiscrepancy < 0 ? " Acción Requerida: Pérdida detectada" : "✅ Caja Saludable"}
  </h4>
  <p className="text-sm opacity-80">
    {totalDiscrepancy < 0 
      ? "El acumulado indica una pérdida significativa. Se recomienda realizar arqueo sorpresa al próximo turno." 
      : "No se detectaron discrepancias fuera de los límites aceptables."}
  </p>
</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Último turno con descuadre negativo registrado. Revisa la caja y cierra con operativa para corregir discrepancias.
          </p>
        </section>

        {/* SECCIÓN NUEVA: DSS - Alertas de Auditoría */}
<section className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-500">
      Recomendaciones de Auditoría (DSS)
    </h3>
    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
      Sistema inteligente de detección de patrones recurrentes de pérdida.
    </p>
  </div>

  {topRiskyCashiers.length > 0 ? (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {topRiskyCashiers.map((cashier, index) => (
        <div key={index} className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-amber-500/50">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-foreground">{cashier.name}</span>
            <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
              {cashier.incidents} {cashier.incidents === 1 ? 'incidente' : 'incidentes'}
            </span>
          </div>
          
          <p className="text-2xl font-extrabold text-foreground mb-3">
            - Bs. {Math.abs(cashier.totalShortage).toLocaleString('es-BO')}
          </p>
          
          <div className="mt-auto border-t border-dashed border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Acción Sugerida:
            </p>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-500">
              {cashier.incidents >= 3 
                ? " Bloquear caja y auditar urgentemente."
                : " Programar arqueo sorpresa en su próximo turno."}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
      <p className="font-semibold text-emerald-700 dark:text-emerald-500">
        No hay patrones de riesgo detectados
      </p>
      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
        Ningún cajero presenta faltantes recurrentes en el rango seleccionado.
      </p>
    </div>
  )}
</section>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <section className="card border border-border bg-card shadow-sm animate-slide-up">
            <div className="card-header border-b border-border p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="card-title text-xl font-semibold">Descuadres por Turno</h2>
                  <p className="text-sm text-muted-foreground mt-1">Monto esperado vs monto declarado por cada turno</p>
                </div>
                <div className="rounded-2xl bg-background px-3 py-2 text-sm text-foreground">{activeRange === '7d' ? 'Últimos 7 días' : activeRange === '15d' ? 'Últimos 15 días' : 'Últimos 30 días'}</div>
              </div>
            </div>
            <div className="card-content p-6 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.isArray(discrepanciesData) && discrepanciesData.length > 0 ? discrepanciesData : []} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-border)" vertical={false} />
                  <XAxis dataKey="cajero" stroke="var(--text-foreground)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-border)',
                      color: 'var(--text-foreground)',
                    }}
                  />
                  <Bar dataKey="esperado" name="Monto Esperado" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="declarado" name="Monto Declarado" fill="#A8A29E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card border border-border bg-card shadow-sm animate-slide-up">
            <div className="card-header border-b border-border p-6">
              <h2 className="card-title text-xl font-semibold">Últimos Turnos</h2>
              <p className="text-sm text-muted-foreground mt-1">Registro de ventas y descuadres</p>
            </div>
            <div className="card-content p-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm leading-6">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="pb-3 font-medium">Turno</th>
                    <th className="pb-3 font-medium">Cajero</th>
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Total ventas</th>
                    <th className="pb-3 font-medium">Descuadre</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.isArray(discrepanciesData) && discrepanciesData.length > 0 ? (
                    discrepanciesData.map((turno) => (
                      <tr key={turno?.id ?? Math.random()} className="hover:bg-background/50 transition-colors">
                        <td className="py-4 font-medium text-foreground">{turno?.id ?? '-'}</td>
                        <td className="py-4 text-muted-foreground">{turno?.cajero ?? '-'}</td>
                        <td className="py-4 text-muted-foreground">{turno?.fecha ?? '-'}</td>
                        <td className="py-4 text-foreground">Bs. {turno?.esperado !== undefined ? turno.esperado.toLocaleString?.('es-BO') ?? turno.esperado : '-'}</td>
                        <td className={`py-4 font-medium ${turno?.descuadre && turno.descuadre < 0 ? 'text-destructive' : 'text-foreground'}`}>
                          {turno?.descuadre !== undefined ? (turno.descuadre < 0 ? `- Bs. ${Math.abs(turno.descuadre).toLocaleString('es-BO')}` : `Bs. ${turno.descuadre.toLocaleString('es-BO')}`) : '-'}
                        </td>
                        <td className="py-4"><span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground border border-border">{turno?.estado ?? '-'}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-sm text-muted-foreground">No hay datos de turnos disponibles.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
