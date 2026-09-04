import { useState, useMemo } from "react";
import {
  AreaChart, Area, ComposedChart, Bar, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Flame, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formats";
import SpinnerLoader from "@/components/ui/SpinnerLoader";
import DashboardHeader from "../components/DashboardHeader";
import { Card, StatTile, EmptyState, ErrorState, CHART_COLORS } from "../components/primitives";
import { useDateRange } from "../hooks/useDateRange";
import { useDss } from "../hooks/useDss";

const TABS = [
  { key: "principal", label: "Principal" },
  { key: "predictivo", label: "Predictivo" },
  { key: "marketing", label: "Marketing" },
];

const MATRIX_META = {
  estrella: { label: "Estrella", color: "#f59e0b", hint: "Alto volumen + altos ingresos → promover" },
  vaca: { label: "Vaca", color: "#10b981", hint: "Alto volumen + bajos ingresos → revisar precio" },
  interrogante: { label: "Interrogante", color: "#0ea5e9", hint: "Bajo volumen + altos ingresos → potencial" },
  zombie: { label: "Zombie", color: "#a3a3a3", hint: "Bajo volumen + bajos ingresos → evaluar retiro" },
};
const URGENCY_META = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  baja: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function Gauge({ score: rawScore, threshold = 80 }) {
  const score = Math.max(0, Math.min(100, Math.round(rawScore || 0)));
  const danger = score >= threshold;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={danger ? "var(--color-destructive, #ef4444)" : "#f59e0b"}
            strokeWidth="3.5" strokeDasharray={`${score}, 100`} strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}</span>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Riesgo de fatiga</p>
        <p className={`text-sm font-semibold ${danger ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`}>
          {danger ? "Alto — considerar relevo" : "Bajo / moderado"}
        </p>
      </div>
    </div>
  );
}

export function AnalyticDashboard() {
  const range = useDateRange("30d");
  const [tab, setTab] = useState("principal");
  const [crisisMode, setCrisisMode] = useState(false);
  const { principal, predictivo, marketing, loading, error, refetch } = useDss({
    startDate: range.from,
    endDate: range.to,
    crisisMode,
  });

  const [selectedCashier, setSelectedCashier] = useState(0);
  const radarData = useMemo(() => {
    const c = principal?.holisticKpis.cashierEfficiencyRanking[selectedCashier];
    if (!c) return [];
    const b = c.breakdown;
    return [
      { k: "Ventas", v: b.salesScore },
      { k: "Precisión", v: b.accuracyScore },
      { k: "Velocidad", v: b.speedScore },
      { k: "Efectivo", v: b.cashHandlingScore },
      { k: "Asistencia", v: b.attendanceScore },
    ];
  }, [principal, selectedCashier]);

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardHeader
        eyebrow="DSS · Dashboard Gerencial"
        title="Centro de Decisiones"
        range={range}
        onRefresh={refetch}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                  tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCrisisMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              crisisMode ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-border bg-card hover:bg-accent"
            }`}
          >
            <Flame size={14} /> Modo crisis
          </button>
        </div>
      </DashboardHeader>

      {loading ? (
        <SpinnerLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          {/* ───────────── PRINCIPAL ───────────── */}
          {tab === "principal" && principal && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Turno activo" className="lg:col-span-1">
                  {principal.shiftStatus.isOpen ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Cajero</p>
                        <p className="text-lg font-bold">{principal.shiftStatus.cashierName}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Efectivo en caja</p>
                        <p className="text-2xl font-bold">{formatCurrency(principal.shiftStatus.cashAccumulationBs)}</p>
                      </div>
                      <Gauge score={principal.shiftStatus.fatigueRiskScore} threshold={crisisMode ? 60 : 80} />
                    </div>
                  ) : (
                    <EmptyState message="No hay ningún turno abierto en este momento." />
                  )}
                </Card>

                <Card title="Efectivo acumulado en el turno" className="lg:col-span-2">
                  {principal.shiftStatus.cashAccumulationHistory.length === 0 ? (
                    <EmptyState message="Sin pagos en efectivo registrados aún." />
                  ) : (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={principal.shiftStatus.cashAccumulationHistory}>
                          <defs>
                            <linearGradient id="cash" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={CHART_COLORS[2]} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={CHART_COLORS[2]} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                          <Area type="monotone" dataKey="amountBs" stroke={CHART_COLORS[2]} fill="url(#cash)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const opp = Math.max(0, principal.holisticKpis.opportunityCostBs || 0);
                  return (
                    <StatTile
                      label="Costo de oportunidad (quiebres de stock)"
                      value={formatCurrency(opp)}
                      hint="Bs que se dejan de vender por productos sin stock"
                      tone={opp > 0 ? "warn" : "good"}
                    />
                  );
                })()}
                <StatTile
                  label="Cajeros evaluados"
                  value={principal.holisticKpis.cashierEfficiencyRanking.length}
                  hint="Turnos cerrados en el rango seleccionado"
                />
              </div>

              <Card title="Ranking de eficiencia de cajeros" subtitle="Puntaje 0–100 según ventas vs descuadres">
                {principal.holisticKpis.cashierEfficiencyRanking.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      {principal.holisticKpis.cashierEfficiencyRanking.map((c, i) => (
                        <button
                          key={c.cashierName}
                          onClick={() => setSelectedCashier(i)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition ${
                            selectedCashier === i ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                          <span className="flex-1 text-sm font-medium">{c.cashierName}</span>
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${c.efficiencyScore}%` }} />
                          </div>
                          <span className="text-sm font-bold w-8 text-right">{c.efficiencyScore}</span>
                        </button>
                      ))}
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="k" tick={{ fontSize: 11 }} />
                          <Radar dataKey="v" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.35} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ───────────── PREDICTIVO ───────────── */}
          {tab === "predictivo" && predictivo && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatTile
                  label="Hora pico prevista"
                  value={predictivo.operationsForecast.peakHourStart ? `${predictivo.operationsForecast.peakHourStart}–${predictivo.operationsForecast.peakHourEnd}` : "—"}
                  hint="Franja con más órdenes (últimos 30 días)"
                />
                <StatTile label="Categoría en crecimiento" value={predictivo.operationsForecast.growingCategory ?? "—"} hint="Mayor crecimiento semana vs semana" />
                <StatTile label="Productos en stock crítico" value={predictivo.inventoryPredictions.criticalStock.length} tone={predictivo.inventoryPredictions.criticalStock.length ? "bad" : "good"} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="Stock crítico + agotamiento (TEA)" subtitle="Horas estimadas hasta quedarse sin stock">
                  {predictivo.inventoryPredictions.criticalStock.length === 0 ? (
                    <EmptyState message="Ningún producto en nivel crítico." />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="pb-2 font-medium">Producto</th>
                            <th className="pb-2 font-medium text-right">Stock</th>
                            <th className="pb-2 font-medium text-right">TEA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {predictivo.inventoryPredictions.criticalStock.map((s) => (
                            <tr key={s.productName}>
                              <td className="py-2 font-medium">{s.productName}</td>
                              <td className="py-2 text-right">{s.currentStock}</td>
                              <td className={`py-2 text-right font-semibold ${s.teaHours != null && s.teaHours < 4 ? "text-destructive" : ""}`}>
                                {s.teaHours != null ? `${s.teaHours} h` : "s/ventas hoy"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Card title="Mermas esperadas hoy" subtitle="Según historial del mismo día de la semana">
                  {predictivo.expectedShrinkage.length === 0 ? (
                    <EmptyState message="Sin historial de mermas para este día." />
                  ) : (
                    <div className="space-y-2">
                      {predictivo.expectedShrinkage.map((s) => (
                        <div key={s.productName} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-sm">
                          <span className="font-medium">{s.productName}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{s.expectedLossQty} und</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${URGENCY_META[s.urgency]}`}>{s.urgency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <Card title="Tendencia de stock y mermas (7 días)">
                {predictivo.stockTrend.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={predictivo.stockTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="dayLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                        <Tooltip />
                        <Bar dataKey="totalShrinkage" name="Mermas" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="avgStock" name="Stock prom." stroke={CHART_COLORS[1]} strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ───────────── MARKETING ───────────── */}
          {tab === "marketing" && marketing && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card title="Afinidad de cross-selling" subtitle="Productos que se venden juntos">
                  {marketing.crossSellingAffinity.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="space-y-2">
                      {marketing.crossSellingAffinity.map((p, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-sm">
                          <span><span className="font-medium">{p.baseProduct}</span> <span className="text-muted-foreground">+ {p.matchedProduct}</span></span>
                          <span className="font-bold text-primary">{p.affinityPct}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Horas muertas por categoría" subtitle="Franjas con < 30% del promedio">
                  {marketing.heatmapInsights.deadHours.length === 0 ? (
                    <EmptyState message="Sin franjas muertas detectadas." />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {marketing.heatmapInsights.deadHours.map((h, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
                          <Clock size={12} className="text-muted-foreground" />
                          <span className="font-medium">{h.hourStart}–{h.hourEnd}</span>
                          <span className="text-muted-foreground">· {h.affectedCategory}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <Card title="Matriz de menú (BCG)" subtitle="Volumen de unidades × ingresos generados">
                {marketing.menuPerformanceMatrix.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {["estrella", "interrogante", "vaca", "zombie"].map((type) => {
                      const items = marketing.menuPerformanceMatrix.filter((m) => m.matrixType === type);
                      const meta = MATRIX_META[type];
                      return (
                        <div key={type} className="rounded-xl border border-border p-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            <span className="text-sm font-semibold">{meta.label}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{meta.hint}</p>
                          <ul className="mt-2 space-y-1">
                            {items.slice(0, 6).map((m) => (
                              <li key={m.productName} className="flex justify-between text-xs">
                                <span className="truncate">{m.productName}</span>
                                <span className="ml-2 shrink-0 text-muted-foreground">{formatCurrency(m.revenueBs)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card title="Sensibilidad al precio" subtitle="Impacto del último cambio de precio registrado">
                {marketing.priceSensitivity.productName == null ? (
                  <EmptyState message="No hay cambios de precio en el historial." />
                ) : (
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Producto</p>
                      <p className="text-lg font-bold">{marketing.priceSensitivity.productName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Cambio de precio</p>
                      <p className="text-lg font-bold">{formatCurrency(marketing.priceSensitivity.priceChangeBs ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Variación de ventas</p>
                      <p className={`text-lg font-bold ${(marketing.priceSensitivity.salesDropPct ?? 0) > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {(marketing.priceSensitivity.salesDropPct ?? 0) > 0 ? "▼" : "▲"} {Math.abs(marketing.priceSensitivity.salesDropPct ?? 0)}%
                      </p>
                    </div>
                    <p className="flex-1 min-w-[200px] text-sm text-muted-foreground">
                      {(marketing.priceSensitivity.salesDropPct ?? 0) > 0
                        ? "Las ventas cayeron tras el cambio: el cliente reaccionó mal al nuevo precio."
                        : "Las ventas se mantuvieron o subieron: el cambio fue bien recibido."}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnalyticDashboard;
