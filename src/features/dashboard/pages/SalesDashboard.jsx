import { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formats";
import { useDateRange } from "../hooks/useDateRange";
import { useSalesAnalytics } from "../hooks/useSalesAnalytics";
import { salesAnalytics } from "../services/analytics.service";
import DashboardHeader from "../components/DashboardHeader";
import { Card, StatTile, EmptyState, ErrorState, CHART_COLORS } from "../components/primitives";
import SpinnerLoader from "@/components/ui/SpinnerLoader";

const METHOD_LABEL = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", mixed: "Mixto" };

export function SalesDashboard() {
  const range = useDateRange("30d");
  const [groupBy, setGroupBy] = useState("day");
  const { byPeriod, byCategory, topProducts, paymentMethods, loading, error, refetch } =
    useSalesAnalytics({ from: range.from, to: range.to }, groupBy);

  const totals = useMemo(() => {
    const revenue = byPeriod.reduce((s, r) => s + r.revenue, 0);
    const orders = byPeriod.reduce((s, r) => s + r.orderCount, 0);
    return { revenue, orders, avgTicket: orders ? revenue / orders : 0 };
  }, [byPeriod]);

  const doExport = async (format) => {
    try {
      await salesAnalytics.export({ from: range.from, to: range.to }, format);
    } catch {
      toast.error(`No se pudo exportar el reporte ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <DashboardHeader
        eyebrow="DSS · Análisis de Ventas"
        title="Ventas"
        range={range}
        onRefresh={refetch}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {["day", "week", "month"].map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                  groupBy === g ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g === "day" ? "Diario" : g === "week" ? "Semanal" : "Mensual"}
              </button>
            ))}
          </div>
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
            <StatTile label="Ingresos del período" value={formatCurrency(totals.revenue)} />
            <StatTile label="Órdenes pagadas" value={totals.orders} />
            <StatTile label="Ticket promedio" value={formatCurrency(totals.avgTicket)} />
          </div>

          <Card title="Ingresos por período" subtitle={`Agrupado por ${groupBy === "day" ? "día" : groupBy === "week" ? "semana" : "mes"}`}>
            {byPeriod.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={byPeriod} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                    <Tooltip formatter={(v, n) => [n === "revenue" ? formatCurrency(v) : v, n === "revenue" ? "Ingresos" : "Órdenes"]} />
                    <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS[0]} fill="url(#rev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title="Ventas por categoría">
              {byCategory.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Bar dataKey="revenue" fill={CHART_COLORS[1]} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Métodos de pago" subtitle="Distribución de órdenes">
              {paymentMethods.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        dataKey="orderCount"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {paymentMethods.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n, p) => [`${v} órdenes (${p.payload.percentage}%)`, METHOD_LABEL[p.payload.method] ?? p.payload.method]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <Card title="Top productos" subtitle="Por ingresos en el período">
            {topProducts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Producto</th>
                      <th className="pb-3 font-medium">Categoría</th>
                      <th className="pb-3 font-medium text-right">Unidades</th>
                      <th className="pb-3 font-medium text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topProducts.map((p, i) => (
                      <tr key={p.productId} className="hover:bg-muted/40">
                        <td className="py-3 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 font-medium">{p.name}</td>
                        <td className="py-3 text-muted-foreground">{p.category}</td>
                        <td className="py-3 text-right">{p.totalQuantity}</td>
                        <td className="py-3 text-right font-semibold">{formatCurrency(p.totalRevenue)}</td>
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

export default SalesDashboard;
