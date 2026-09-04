import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { FileDown, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/utils/formats";
import SpinnerLoader from "@/components/ui/SpinnerLoader";
import DashboardHeader from "../components/DashboardHeader";
import { Card, StatTile, EmptyState, ErrorState, CHART_COLORS } from "../components/primitives";
import { useDateRange } from "../hooks/useDateRange";
import { useShiftsAnalytics } from "../hooks/useShiftsAnalytics";
import { shiftsAnalytics } from "../services/analytics.service";

export function FinancialDashboard() {
  const range = useDateRange("30d");
  const { voidsByReason, voidsByCashier, discrepancies, loading, error, refetch } =
    useShiftsAnalytics({ from: range.from, to: range.to });

  const stats = useMemo(() => {
    const totalDiscrepancy = discrepancies.reduce((s, d) => s + (Number(d.discrepancy) || 0), 0);
    const alerts = discrepancies.filter((d) => d.discrepancyAlert).length;
    const totalVoided = voidsByReason.reduce((s, v) => s + v.totalVoided, 0);
    const voidCount = voidsByReason.reduce((s, v) => s + v.count, 0);
    return { totalDiscrepancy, alerts, totalVoided, voidCount };
  }, [discrepancies, voidsByReason]);

  // cajeros con más faltantes (discrepancy negativo = declaró menos de lo esperado)
  const riskyCashiers = useMemo(() => {
    const map = {};
    for (const d of discrepancies) {
      if ((d.discrepancy ?? 0) < 0) {
        map[d.cashierName] ??= { name: d.cashierName, shortage: 0, incidents: 0 };
        map[d.cashierName].shortage += d.discrepancy;
        map[d.cashierName].incidents += 1;
      }
    }
    return Object.values(map).sort((a, b) => a.shortage - b.shortage).slice(0, 3);
  }, [discrepancies]);

  const doExport = async (format) => {
    try {
      await shiftsAnalytics.exportDiscrepancies({ from: range.from, to: range.to }, format);
    } catch {
      toast.error(`No se pudo exportar el reporte ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardHeader
        eyebrow="DSS · Auditoría de Caja y Turnos"
        title="Turnos y Descuadres"
        range={range}
        onRefresh={refetch}
      >
        <div className="flex gap-2">
          <button onClick={() => doExport("csv")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">
            <FileDown size={14} /> CSV
          </button>
          <button onClick={() => doExport("pdf")} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">
            <FileDown size={14} /> PDF
          </button>
        </div>
      </DashboardHeader>

      {loading ? (
        <SpinnerLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Descuadre acumulado" value={formatCurrency(stats.totalDiscrepancy)} tone={stats.totalDiscrepancy < 0 ? "bad" : "default"} />
            <StatTile label="Turnos con alerta" value={stats.alerts} tone={stats.alerts ? "warn" : "good"} />
            <StatTile label="Órdenes anuladas" value={stats.voidCount} />
            <StatTile label="Monto anulado" value={formatCurrency(stats.totalVoided)} tone={stats.totalVoided ? "warn" : "good"} />
          </div>

          {riskyCashiers.length > 0 && (
            <Card
              title="Recomendaciones de auditoría"
              subtitle="Cajeros con faltantes recurrentes"
              action={<div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400"><ShieldAlert size={18} /></div>}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {riskyCashiers.map((c) => (
                  <div key={c.name} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{c.name}</span>
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                        {c.incidents} {c.incidents === 1 ? "incidente" : "incidentes"}
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-bold text-destructive">-{formatCurrency(Math.abs(c.shortage))}</p>
                    <p className="mt-2 border-t border-dashed border-border pt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                      {c.incidents >= 3 ? "Auditar urgentemente." : "Arqueo sorpresa en el próximo turno."}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Anulaciones por motivo">
              {voidsByReason.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={voidsByReason} dataKey="totalVoided" nameKey="reason" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                        {voidsByReason.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n, p) => [`${formatCurrency(v)} · ${p.payload.count} órdenes`, p.payload.reason]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Anulaciones por cajero">
              {voidsByCashier.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={voidsByCashier} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="cashierName" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip formatter={(v, n) => [n === "totalVoided" ? formatCurrency(v) : v, n === "totalVoided" ? "Monto" : "Órdenes"]} />
                      <Bar dataKey="totalVoided" fill={CHART_COLORS[4]} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <Card title="Descuadres por turno" subtitle="Monto esperado vs declarado en el arqueo ciego">
            {discrepancies.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3 font-medium">Turno</th>
                      <th className="pb-3 font-medium">Cajero</th>
                      <th className="pb-3 font-medium">Cierre</th>
                      <th className="pb-3 font-medium text-right">Esperado</th>
                      <th className="pb-3 font-medium text-right">Declarado</th>
                      <th className="pb-3 font-medium text-right">Descuadre</th>
                      <th className="pb-3 font-medium text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {discrepancies.map((d) => (
                      <tr key={d.shiftRecordId} className="hover:bg-muted/40">
                        <td className="py-3 font-medium">#{d.shiftRecordId}</td>
                        <td className="py-3">{d.cashierName}</td>
                        <td className="py-3 text-muted-foreground">{d.closedAt ? formatDate(d.closedAt) : "-"}</td>
                        <td className="py-3 text-right">{d.expectedAmount != null ? formatCurrency(d.expectedAmount) : "-"}</td>
                        <td className="py-3 text-right">{d.declaredAmount != null ? formatCurrency(d.declaredAmount) : "-"}</td>
                        <td className={`py-3 text-right font-medium ${(d.discrepancy ?? 0) < 0 ? "text-destructive" : (d.discrepancy ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                          {d.discrepancy != null ? formatCurrency(d.discrepancy) : "-"}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.discrepancyAlert ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                            {d.discrepancyAlert ? "Alerta" : "OK"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default FinancialDashboard;
