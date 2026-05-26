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
      const discrepanciesResp = await axiosInstance.get('/analytics/shifts/discrepancies');

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

  const totalDiscrepancy = discrepanciesData.reduce((acc, curr) => acc + (Number(curr.descuadre) || 0), 0);
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
              onClick={() => setActiveRange(range)}
              className={`rounded-full border px-4 py-2 text-sm transition ${activeRange === range ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:bg-muted'}`}>
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
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Último turno con descuadre negativo registrado. Revisa la caja y cierra con operativa para corregir discrepancias.
          </p>
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
