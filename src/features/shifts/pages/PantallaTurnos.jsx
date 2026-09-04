import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { formatCurrency, formatDateTime } from "@/utils/formats";
import { shiftsAnalytics } from "@/features/dashboard/services/analytics.service";
import { useDateRange } from "@/features/dashboard/hooks/useDateRange";
import SpinnerLoader from "@/components/ui/SpinnerLoader";
import { ModalDetalleTurno } from "../components/ModalDetalleTurno";

const asArray = (d) => (Array.isArray(d) ? d : d?.data ?? d?.items ?? []);

export const PantallaTurnos = () => {
  const range = useDateRange("30d");
  const [closed, setClosed] = useState([]);
  const [open, setOpen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, o] = await Promise.all([
        shiftsAnalytics.discrepancies({ from: range.from, to: range.to }).catch(() => []),
        apiClient.get("/shift-records", { params: { status: "open", limit: 20 } }).then((r) => asArray(r.data)).catch(() => []),
      ]);
      setClosed(c);
      setOpen(o);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const stats = useMemo(() => {
    const alerts = closed.filter((s) => s.discrepancyAlert).length;
    const totalDisc = closed.reduce((s, d) => s + (Number(d.discrepancy) || 0), 0);
    return { total: closed.length, alerts, totalDisc };
  }, [closed]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Caja</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Turnos</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {["7d", "15d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => range.setPreset(p)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                range.preset === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
              }`}
            >
              {p === "7d" ? "7 días" : p === "15d" ? "15 días" : p === "30d" ? "30 días" : "90 días"}
            </button>
          ))}
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <SpinnerLoader />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Turnos cerrados</p>
              <p className="mt-1 text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Con alerta</p>
              <p className={`mt-1 text-2xl font-bold ${stats.alerts ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>{stats.alerts}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Descuadre acumulado</p>
              <p className={`mt-1 text-2xl font-bold ${stats.totalDisc < 0 ? "text-destructive" : ""}`}>{formatCurrency(stats.totalDisc)}</p>
            </div>
          </div>

          {open.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-semibold text-primary">Turnos abiertos ahora ({open.length})</p>
              <div className="space-y-1.5">
                {open.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm">
                    <span>Turno #{s.id} · abierto {formatDateTime(s.openedAt)}</span>
                    <span className="text-muted-foreground">Fondo: {formatCurrency(s.initialFund)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <h2 className="text-base font-semibold">Historial de turnos cerrados</h2>
              <p className="text-sm text-muted-foreground">Clic en una fila para ver el desglose completo</p>
            </div>
            <div className="overflow-x-auto p-4">
              {closed.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Sin turnos cerrados en el período.</p>
              ) : (
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Cajero</th>
                      <th className="pb-3 font-medium">Cierre</th>
                      <th className="pb-3 font-medium text-right">Fondo</th>
                      <th className="pb-3 font-medium text-right">Esperado</th>
                      <th className="pb-3 font-medium text-right">Declarado</th>
                      <th className="pb-3 font-medium text-right">Descuadre</th>
                      <th className="pb-3 font-medium text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {closed.map((s) => (
                      <tr key={s.shiftRecordId} onClick={() => setDetailId(s.shiftRecordId)} className="cursor-pointer hover:bg-muted/40">
                        <td className="py-3 font-medium">#{s.shiftRecordId}</td>
                        <td className="py-3">{s.cashierName}</td>
                        <td className="py-3 text-muted-foreground">{s.closedAt ? formatDateTime(s.closedAt) : "-"}</td>
                        <td className="py-3 text-right">{formatCurrency(s.initialFund)}</td>
                        <td className="py-3 text-right">{s.expectedAmount != null ? formatCurrency(s.expectedAmount) : "-"}</td>
                        <td className="py-3 text-right">{s.declaredAmount != null ? formatCurrency(s.declaredAmount) : "-"}</td>
                        <td className={`py-3 text-right font-medium ${(s.discrepancy ?? 0) < 0 ? "text-destructive" : (s.discrepancy ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                          {s.discrepancy != null ? formatCurrency(s.discrepancy) : "-"}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.discrepancyAlert ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                            {s.discrepancyAlert ? "Alerta" : "OK"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {detailId && <ModalDetalleTurno shiftId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  );
};

export default PantallaTurnos;
