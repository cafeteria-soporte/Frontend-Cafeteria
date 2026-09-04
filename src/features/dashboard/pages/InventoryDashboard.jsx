import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FileDown, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/utils/formats";
import SpinnerLoader from "@/components/ui/SpinnerLoader";
import DashboardHeader from "../components/DashboardHeader";
import { Card, StatTile, EmptyState, ErrorState, CHART_COLORS } from "../components/primitives";
import { useDateRange } from "../hooks/useDateRange";
import { useInventoryAnalytics } from "../hooks/useInventoryAnalytics";
import { inventoryAnalytics } from "../services/analytics.service";

const STATUS_META = {
  critico: { label: "Crítico", tone: "border-destructive/40 bg-destructive/[0.03]", badge: "bg-destructive/10 text-destructive" },
  alerta: { label: "Revisar", tone: "border-amber-500/40 bg-amber-500/[0.03]", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ok: { label: "Óptimo", tone: "border-border", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

const MOV_LABEL = {
  goods_receipt: "Ingreso",
  manual_adjustment: "Ajuste",
  shrinkage: "Merma",
  sale: "Venta",
  sale_void: "Devolución",
};

export function InventoryDashboard() {
  const range = useDateRange("30d");
  const { movements, shrinkage, stockVelocity, loading, error, refetch } =
    useInventoryAnalytics({ startDate: range.from, endDate: range.to });

  const shrinkChart = useMemo(
    () =>
      shrinkage.map((s) => ({
        name: s.productName,
        value: Number(s.totalValue) || 0,
        quantity: s.totalQuantity,
        reason: (s.mainReason || "").trim() || "Sin motivo",
        percentage: s.percentage,
      })),
    [shrinkage],
  );
  const totalShrinkValue = shrinkChart.reduce((s, i) => s + i.value, 0);
  const totalShrinkQty = shrinkChart.reduce((s, i) => s + (i.quantity || 0), 0);
  const criticalCount = stockVelocity.filter((v) => v.status === "critico").length;

  const doExport = async (format) => {
    try {
      await inventoryAnalytics.exportMovements(
        { startDate: range.from, endDate: range.to },
        format,
      );
    } catch {
      toast.error(`No se pudo exportar el reporte ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardHeader
        eyebrow="DSS · Análisis de Inventario"
        title="Inventario"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile label="Productos en estado crítico" value={criticalCount} tone={criticalCount ? "bad" : "good"} />
            <StatTile label="Unidades perdidas (mermas)" value={totalShrinkQty} />
            <StatTile label="Valor de mermas" value={formatCurrency(totalShrinkValue)} tone={totalShrinkValue ? "warn" : "good"} />
          </div>

          <Card title="Velocidad de stock" subtitle="Días estimados hasta agotar según consumo de los últimos 30 días">
            {stockVelocity.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stockVelocity.map((v) => {
                  const meta = STATUS_META[v.status] ?? STATUS_META.ok;
                  return (
                    <div key={v.productId} className={`rounded-xl border p-4 ${meta.tone}`}>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight">{v.productName}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between border-y border-border/50 py-2">
                        <span className="text-sm text-muted-foreground">Stock</span>
                        <span className="text-2xl font-bold">{v.currentStock}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between"><span>Mínimo</span><span className="font-medium text-foreground">{v.minStock}</span></div>
                        <div className="flex justify-between"><span>Consumo diario</span><span className="font-medium text-foreground">{v.averageDailyUsage.toFixed(1)}</span></div>
                        <div className="flex justify-between"><span>Días restantes</span><span className={`font-bold ${v.status === "critico" ? "text-destructive" : v.status === "alerta" ? "text-amber-500" : "text-emerald-500"}`}>{v.daysRemaining}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card
              title="Análisis de mermas"
              subtitle="Distribución del valor perdido por producto"
              action={<div className="rounded-lg bg-destructive/10 p-2 text-destructive"><TrendingDown size={18} /></div>}
            >
              {shrinkChart.length === 0 ? (
                <EmptyState message="Sin registros de mermas en el período." />
              ) : (
                <>
                  <div className="relative h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={shrinkChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} stroke="none">
                          {shrinkChart.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n, p) => [`${formatCurrency(v)} · ${p.payload.quantity} und`, p.payload.name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
                      <span className="text-xl font-bold">{formatCurrency(totalShrinkValue)}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {shrinkChart.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">· {item.reason}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.value)} <span className="text-xs text-muted-foreground">({item.percentage}%)</span></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            <Card title="Movimientos recientes" subtitle={`${movements.length} en el período`}>
              {movements.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="pb-2 font-medium">Fecha</th>
                        <th className="pb-2 font-medium">Producto</th>
                        <th className="pb-2 font-medium">Tipo</th>
                        <th className="pb-2 font-medium text-right">Cant.</th>
                        <th className="pb-2 font-medium text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {movements.slice(0, 60).map((m) => (
                        <tr key={m.id} className="hover:bg-muted/40">
                          <td className="py-2 text-muted-foreground whitespace-nowrap">{formatDate(m.createdAt)}</td>
                          <td className="py-2 font-medium">{m.productName}</td>
                          <td className="py-2 text-muted-foreground">{MOV_LABEL[m.movementType] ?? m.movementType}</td>
                          <td className={`py-2 text-right font-medium ${m.quantity < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </td>
                          <td className="py-2 text-right text-muted-foreground">{m.resultingStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryDashboard;
