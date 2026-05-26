import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Wallet, Activity } from 'lucide-react';

const FinancialDashboard = () => {
  const [activeRange, setActiveRange] = useState('7d');

  const [discrepanciesData, setDiscrepanciesData] = useState([]);
  const [voidsData, setVoidsData] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [latestVoids, setLatestVoids] = useState([]);

  const extractArray = (resp) => {
    const maybe = resp?.data?.data ?? resp?.data ?? resp;
    if (Array.isArray(maybe)) return maybe;
    if (maybe && Array.isArray(maybe.items)) return maybe.items;
    return [];
  };

  const fetchShiftsAnalytics = async () => {
    try {
      const [discrepanciesResp, voidsResp] = await Promise.all([
        axios.get('/api/cafeteria/analytics/shifts/discrepancies'),
        axios.get('/api/cafeteria/analytics/shifts/voids'),
      ]);

      const d = extractArray(discrepanciesResp);
      const v = extractArray(voidsResp);

      setDiscrepanciesData(Array.isArray(d) ? d : []);
      setVoidsData(Array.isArray(v) ? v : []);

      // Optional extraction of shifts list or latest voids
      if (Array.isArray(d) && d.length > 0 && d[0].shifts) {
        setShiftsList(Array.isArray(d[0].shifts) ? d[0].shifts : []);
      }
      if (Array.isArray(v) && v.length > 0 && v[0].recent) {
        setLatestVoids(Array.isArray(v[0].recent) ? v[0].recent : []);
      }

    } catch (err) {
      console.error('Error fetching shifts analytics:', err);
      setDiscrepanciesData([]);
      setVoidsData([]);
      setShiftsList([]);
      setLatestVoids([]);
    }
  };

  useEffect(() => {
    fetchShiftsAnalytics();
  }, []);

  const totalVoids = useMemo(() => Array.isArray(voidsData) ? voidsData.reduce((sum, item) => sum + (item.value || 0), 0) : 0, [voidsData]);

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
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
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
                <BarChart data={discrepanciesData} margin={{ top: 20, right: 24, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-border)" vertical={false} />
                  <XAxis dataKey="turno" stroke="var(--text-foreground)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-border)',
                      color: 'var(--text-foreground)',
                    }}
                  />
                  <Bar dataKey="monto_esperado" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="monto_declarado" fill="var(--color-secondary)" radius={[8, 8, 0, 0]} />
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
                  {shiftsList.map((shift) => (
                    <tr key={shift.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-4 font-medium text-foreground">{shift.id}</td>
                      <td className="py-4 text-muted-foreground">{shift.cajero}</td>
                      <td className="py-4 text-muted-foreground">{shift.fecha}</td>
                      <td className="py-4 text-foreground">Bs. {shift.totalVentas.toLocaleString('es-BO')}</td>
                      <td className={`py-4 font-medium ${shift.descuadre < 0 ? 'text-destructive' : 'text-foreground'}`}>{shift.descuadre < 0 ? `- Bs. ${Math.abs(shift.descuadre).toLocaleString('es-BO')}` : `Bs. ${shift.descuadre.toLocaleString('es-BO')}`}</td>
                      <td className="py-4"><span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground border border-border">{shift.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card border border-border bg-card shadow-sm animate-slide-up">
            <div className="card-header border-b border-border p-6">
              <h2 className="card-title text-xl font-semibold">Anulaciones</h2>
              <p className="text-sm text-muted-foreground mt-1">Motivos de anulaciones y porcentaje del total</p>
            </div>
            <div className="card-content p-6 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={voidsData}
                    dataKey="value"
                    nameKey="reason"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {voidsData.map((entry) => (
                      <Cell key={entry.reason} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ color: 'var(--text-foreground)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                Total anulaciones: <span className="font-semibold text-foreground">{totalVoids}</span>
              </div>
            </div>
          </section>

          <section className="card border border-border bg-card shadow-sm animate-slide-up">
            <div className="card-header border-b border-border p-6">
              <h2 className="card-title text-xl font-semibold">Últimas órdenes anuladas</h2>
              <p className="text-sm text-muted-foreground mt-1">Resumen rápido de las anulaciones recientes</p>
            </div>
            <div className="card-content p-6 space-y-4">
              {latestVoids.map((voidOrder) => (
                <div key={voidOrder.id} className="rounded-3xl border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{voidOrder.order}</p>
                      <p className="text-xs text-muted-foreground mt-1">{voidOrder.reason}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">Bs. {voidOrder.amount.toLocaleString('es-BO')}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity size={14} className="text-muted-foreground" />
                    <span>Registro reciente</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card border border-border bg-card shadow-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Control rápido</p>
                <h3 className="text-lg font-semibold text-foreground">Descuadre total</h3>
              </div>
              <div className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground border border-border">
                Bs. -100
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Último turno con descuadre negativo registrado. Revisa la caja y cierra con operativa para corregir discrepancias.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default FinancialDashboard;
