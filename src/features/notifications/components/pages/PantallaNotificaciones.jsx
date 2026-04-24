import { useEffect, useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { productsService } from "@/features/products/services/products.service";

export const PantallaNotificaciones = () => {
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState("");

  const cargarAlertas = async () => {
    try {
      setError("");
      const lowStock = await productsService.getLowStock();
      setAlertas(
        lowStock.map((p) => ({
          id: p.id,
          titulo: `${p.nombre} tiene stock bajo`,
          descripcion: `Stock actual: ${p.stock} · mínimo configurado: ${p.stockMinimo}`,
          tipo: p.stock <= 0 || p.stock < 3 ? "Crítica" : "Stock bajo",
          leida: false,
          producto: p,
        })),
      );
    } catch (err) {
      setError(
        "No se pudo cargar stock bajo desde API. Se muestran alertas de prueba.",
      );
      setAlertas([
        {
          id: 1,
          titulo: "Café molido tiene stock crítico",
          descripcion: "Stock actual: 2 · mínimo: 5",
          tipo: "Crítica",
          leida: false,
        },
        {
          id: 2,
          titulo: "Croissant requiere reposición",
          descripcion: "Stock actual: 4 · mínimo: 6",
          tipo: "Stock bajo",
          leida: false,
        },
      ]);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const marcarLeida = (id) =>
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, leida: true } : a)),
    );
  const pendientes = alertas.filter((a) => !a.leida).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Notificaciones
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Alertas visuales de stock mínimo conectadas a productos con bajo
              stock.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-5 py-3 text-sm">
            <strong>{pendientes}</strong> pendientes
          </div>
        </div>
        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Alertas activas</h2>
              <p className="text-sm text-muted-foreground">
                Productos con stock igual o menor al mínimo.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {alertas.length === 0 ? (
              <p className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                No hay alertas de stock bajo.
              </p>
            ) : (
              alertas.map((alerta) => (
                <article
                  key={alerta.id}
                  className={`rounded-2xl border p-4 ${alerta.leida ? "border-border bg-background/60 opacity-70" : "border-amber-500/30 bg-amber-500/10"}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 rounded-xl p-2 ${alerta.tipo === "Crítica" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}
                      >
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{alerta.titulo}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {alerta.descripcion}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-background px-3 py-1 text-xs font-medium">
                          {alerta.tipo}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={ROUTES.AJUSTE_STOCK}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                      >
                        <ExternalLink size={13} /> Ajustar stock
                      </Link>
                      <button
                        onClick={() => marcarLeida(alerta.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        <CheckCircle2 size={13} /> Leída
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
