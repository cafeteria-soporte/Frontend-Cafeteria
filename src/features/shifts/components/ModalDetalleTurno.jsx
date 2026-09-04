import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils/formats";
import { shiftsAnalytics } from "@/features/dashboard/services/analytics.service";
import SpinnerLoader from "@/components/ui/SpinnerLoader";

export function ModalDetalleTurno({ shiftId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    shiftsAnalytics
      .shiftSummary(shiftId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e?.response?.data?.message || "No se pudo cargar el turno"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [shiftId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-bold">Turno #{shiftId}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <SpinnerLoader />
        ) : error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Cajero</span><p className="font-semibold">{data.cashierName}</p></div>
              <div><span className="text-muted-foreground">Usuario</span><p className="font-semibold">{data.cashierUsername}</p></div>
              <div><span className="text-muted-foreground">Apertura</span><p>{formatDateTime(data.openedAt)}</p></div>
              <div><span className="text-muted-foreground">Cierre</span><p>{formatDateTime(data.closedAt)}</p></div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arqueo financiero</p>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Fondo inicial</span><span className="text-right">{formatCurrency(data.financial.initialFund)}</span>
                <span className="text-muted-foreground">Esperado</span><span className="text-right">{data.financial.expectedAmount != null ? formatCurrency(data.financial.expectedAmount) : "-"}</span>
                <span className="text-muted-foreground">Declarado</span><span className="text-right">{data.financial.declaredAmount != null ? formatCurrency(data.financial.declaredAmount) : "-"}</span>
                <span className="text-muted-foreground font-semibold">Descuadre</span>
                <span className={`text-right font-bold ${(data.financial.discrepancy ?? 0) < 0 ? "text-destructive" : (data.financial.discrepancy ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {data.financial.discrepancy != null ? formatCurrency(data.financial.discrepancy) : "-"}
                  {data.financial.discrepancyAlert && " ⚠"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingresos por método de pago</p>
              {data.payments.methods.length === 0 ? (
                <p className="text-muted-foreground">Sin pagos registrados.</p>
              ) : (
                <>
                  <table className="w-full">
                    <tbody>
                      {data.payments.methods.map((m) => (
                        <tr key={m.paymentMethodId}>
                          <td className="py-1">{m.paymentMethodName}</td>
                          <td className="py-1 text-right text-muted-foreground">{m.count} pagos</td>
                          <td className="py-1 text-right font-medium">{formatCurrency(m.totalAmount)}</td>
                          <td className="py-1 text-right text-muted-foreground">{m.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                    <span>Total recaudado</span><span>{formatCurrency(data.payments.totalCollected)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pérdidas por anulaciones</p>
              {data.losses.totalVoidedOrders === 0 ? (
                <p className="text-emerald-600 dark:text-emerald-400">Sin anulaciones en el turno.</p>
              ) : (
                <>
                  <p className="mb-2">
                    <span className="font-bold">{data.losses.totalVoidedOrders}</span> órdenes ·{" "}
                    <span className="font-bold text-destructive">{formatCurrency(data.losses.totalVoidedAmount)}</span>
                  </p>
                  {data.losses.reasons.map((r) => (
                    <div key={r.reason} className="flex justify-between text-xs text-muted-foreground">
                      <span>{r.reason}</span><span>{r.count} · {formatCurrency(r.totalAmount)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalDetalleTurno;
