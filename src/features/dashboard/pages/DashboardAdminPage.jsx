import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, PieChart, ShieldAlert, ClipboardList, TrendingUp } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { ROUTES } from "@/utils/constants";
import { formatCurrency } from "@/utils/formats";
import { salesAnalytics } from "../services/analytics.service";
import { Card, StatTile } from "../components/primitives";
import SpinnerLoader from "@/components/ui/SpinnerLoader";

const todayIso = () => new Date().toISOString().split("T")[0];
const asArray = (d) => (Array.isArray(d) ? d : d?.data ?? d?.items ?? []);

const QUICK_LINKS = [
  { title: "Dashboard Gerencial", icon: PieChart, to: ROUTES.ANALYTICS },
  { title: "Análisis de Ventas", icon: TrendingUp, to: ROUTES.VENTAS_ANALYTICS },
  { title: "Auditoría de Cajas", icon: ShieldAlert, to: "/auditoria-caja" },
  { title: "Inventario", icon: ClipboardList, to: ROUTES.INVENTORY },
];

export function DashboardAdminPage() {
  const [state, setState] = useState({ loading: true, admins: 0, cashiers: 0, lowStock: 0, salesToday: 0, ordersToday: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [admins, cashiers, low, byPeriod] = await Promise.all([
          apiClient.get("/users", { params: { roleId: 2, limit: 1 } }).then((r) => r.data).catch(() => null),
          apiClient.get("/users", { params: { roleId: 3, limit: 1 } }).then((r) => r.data).catch(() => null),
          apiClient.get("/products/low-stock").then((r) => asArray(r.data)).catch(() => []),
          salesAnalytics.byPeriod({ from: todayIso(), to: todayIso(), groupBy: "day" }).catch(() => []),
        ]);
        if (!alive) return;
        const total = (d) => d?.meta?.total ?? asArray(d).length ?? 0;
        const today = byPeriod[0] ?? { revenue: 0, orderCount: 0 };
        setState({
          loading: false,
          admins: total(admins),
          cashiers: total(cashiers),
          lowStock: low.length,
          salesToday: today.revenue,
          ordersToday: today.orderCount,
        });
      } catch {
        if (alive) setState((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) return <SpinnerLoader />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Panel de administración</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resumen</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile label="Ventas de hoy" value={formatCurrency(state.salesToday)} hint={`${state.ordersToday} órdenes`} />
        <StatTile label="Productos en bajo stock" value={state.lowStock} tone={state.lowStock ? "warn" : "good"} />
        <StatTile label="Administradores" value={state.admins} />
        <StatTile label="Cajeros activos" value={state.cashiers} />
        <StatTile label="Estado del sistema" value="OK" tone="good" />
      </div>

      <Card title="Accesos rápidos">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center text-sm font-medium transition hover:border-primary hover:bg-primary/5"
            >
              <l.icon size={20} className="text-primary" />
              {l.title}
            </Link>
          ))}
        </div>
      </Card>

      <Card title="Gestión">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to={ROUTES.PRODUCTOS} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 hover:bg-accent"><Package size={14} /> Productos</Link>
          <Link to={ROUTES.CAJEROS} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 hover:bg-accent"><Users size={14} /> Cajeros</Link>
          <Link to={ROUTES.TURNOS} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 hover:bg-accent"><ClipboardList size={14} /> Turnos</Link>
        </div>
      </Card>
    </div>
  );
}

export default DashboardAdminPage;
