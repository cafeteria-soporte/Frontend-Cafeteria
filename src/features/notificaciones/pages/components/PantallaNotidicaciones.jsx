import { useMemo, useState } from "react";
import { Bell, Filter, Package, AlertTriangle } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { AlertsPanel } from "../components/alertsPanel";

const alertasBase = [
  {
    id: 1,
    tipo: "critico",
    titulo: "Café molido en stock crítico",
    descripcion: "Quedan 2 unidades. El mínimo configurado es 5.",
    fecha: "24 abr 2026 · 10:20",
    leida: false,
    enlace: ROUTES.AJUSTE_STOCK,
  },
  {
    id: 2,
    tipo: "stock",
    titulo: "Leche entera con stock bajo",
    descripcion: "Quedan 5 unidades. Requiere reposición preventiva.",
    fecha: "24 abr 2026 · 09:00",
    leida: false,
    enlace: ROUTES.AJUSTE_STOCK,
  },
  {
    id: 3,
    tipo: "stock",
    titulo: "Croissant con stock bajo",
    descripcion: "Quedan 4 unidades. El mínimo configurado es 6.",
    fecha: "24 abr 2026 · 08:30",
    leida: false,
    enlace: ROUTES.AJUSTE_STOCK,
  },
  {
    id: 4,
    tipo: "sistema",
    titulo: "Movimiento de merma registrado",
    descripcion: "Se registró merma de Café molido por vencimiento.",
    fecha: "23 abr 2026 · 17:10",
    leida: true,
    enlace: ROUTES.HISTORIAL_STOCK,
  },
];

export const PantallaNotificaciones = () => {
  const [alertas, setAlertas] = useState(alertasBase);
  const [filtro, setFiltro] = useState("Todas");

  const alertasFiltradas = useMemo(() => {
    if (filtro === "Todas") return alertas;
    if (filtro === "No leídas") return alertas.filter((a) => !a.leida);
    if (filtro === "Leídas") return alertas.filter((a) => a.leida);
    return alertas.filter((a) => a.tipo === filtro);
  }, [alertas, filtro]);

  const noLeidas = alertas.filter((a) => !a.leida).length;
  const stock = alertas.filter(
    (a) => a.tipo === "stock" || a.tipo === "critico",
  ).length;

  const marcarLeida = (id) =>
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leida: true } : a)),
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Alertas y Notificaciones
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panel de alertas activas del sistema e inventario.
            </p>
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none"
          >
            <option>Todas</option>
            <option>No leídas</option>
            <option>Leídas</option>
            <option value="critico">Críticas</option>
            <option value="stock">Stock bajo</option>
            <option value="sistema">Sistema</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Bell size={18} />
              </div>
              <p className="text-sm font-medium">No leídas</p>
            </div>
            <p className="text-3xl font-bold">{noLeidas}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                <Package size={18} />
              </div>
              <p className="text-sm font-medium">Alertas de stock</p>
            </div>
            <p className="text-3xl font-bold">{stock}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-destructive/10 p-2 text-destructive">
                <AlertTriangle size={18} />
              </div>
              <p className="text-sm font-medium">Críticas</p>
            </div>
            <p className="text-3xl font-bold">
              {alertas.filter((a) => a.tipo === "critico").length}
            </p>
          </div>
        </div>
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <h2 className="text-xl font-semibold">Lista de alertas activas</h2>
          </div>
          <AlertsPanel alertas={alertasFiltradas} onMarcarLeida={marcarLeida} />
        </section>
      </div>
    </div>
  );
};
