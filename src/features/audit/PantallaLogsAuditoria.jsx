import { RefreshCw, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/utils/formats";
import SpinnerLoader from "@/components/ui/SpinnerLoader";
import { useAuditLogs } from "./useAuditLogs";

const ACTIONS = [
  "login", "logout", "login_failed", "user_created", "user_deactivated",
  "password_changed", "product_created", "product_deactivated", "price_changed",
  "stock_adjusted", "shrinkage_recorded", "sale_paid", "sale_voided",
  "shift_opened", "shift_closed", "settings_changed",
  "order_item_added", "order_item_removed", "order_payment_added",
];
const MODULES = ["auth", "users", "products", "inventory", "shifts", "orders", "payments", "settings", "analytics"];

const ACTION_LABEL = {
  login: "Inicio de sesión", logout: "Cierre de sesión", login_failed: "Login fallido",
  user_created: "Usuario creado", user_deactivated: "Usuario desactivado", password_changed: "Cambio de contraseña",
  product_created: "Producto creado", product_deactivated: "Producto desactivado", price_changed: "Cambio de precio",
  stock_adjusted: "Ajuste de stock", shrinkage_recorded: "Merma registrada",
  sale_paid: "Venta cobrada", sale_voided: "Venta anulada",
  shift_opened: "Turno abierto", shift_closed: "Turno cerrado", settings_changed: "Configuración cambiada",
  order_item_added: "Ítem agregado", order_item_removed: "Ítem quitado", order_payment_added: "Pago agregado",
};

const ACTION_TONE = (a) => {
  if (["sale_voided", "login_failed", "user_deactivated", "product_deactivated"].includes(a)) return "bg-destructive/10 text-destructive";
  if (["price_changed", "settings_changed", "stock_adjusted", "shrinkage_recorded"].includes(a)) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-muted text-foreground";
};

export function PantallaLogsAuditoria() {
  const { rows, meta, loading, error, query, setFilter, setPage, refetch } = useAuditLogs();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Trazabilidad</p>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight">
            <ShieldCheck className="text-primary" size={24} /> Registro de auditoría
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Bitácora inmutable de todas las acciones sensibles del sistema.</p>
        </div>
        <button onClick={refetch} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={query.action ?? ""}
          onChange={(e) => setFilter({ action: e.target.value || undefined })}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="">Todas las acciones</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>)}
        </select>
        <select
          value={query.module ?? ""}
          onChange={(e) => setFilter({ module: e.target.value || undefined })}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        >
          <option value="">Todos los módulos</option>
          {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="text"
          placeholder="Usuario…"
          defaultValue={query.username ?? ""}
          onKeyDown={(e) => e.key === "Enter" && setFilter({ username: e.target.value || undefined })}
          onBlur={(e) => setFilter({ username: e.target.value || undefined })}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
        />
        <input type="date" value={query.from ?? ""} onChange={(e) => setFilter({ from: e.target.value || undefined })} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm" />
        <input type="date" value={query.to ?? ""} onChange={(e) => setFilter({ to: e.target.value || undefined })} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm" />
      </div>

      {loading ? (
        <SpinnerLoader />
      ) : error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">{error}</p>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="p-3 font-medium">Fecha</th>
                  <th className="p-3 font-medium">Usuario</th>
                  <th className="p-3 font-medium">Rol</th>
                  <th className="p-3 font-medium">Acción</th>
                  <th className="p-3 font-medium">Módulo</th>
                  <th className="p-3 font-medium">Entidad</th>
                  <th className="p-3 font-medium">Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin eventos para estos filtros.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="p-3 whitespace-nowrap text-muted-foreground">{formatDateTime(r.createdAt)}</td>
                      <td className="p-3 font-medium">{r.usernameSnapshot ?? "sistema"}</td>
                      <td className="p-3 text-muted-foreground">{r.roleSnapshot ?? "—"}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_TONE(r.action)}`}>
                          {ACTION_LABEL[r.action] ?? r.action}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{r.module}</td>
                      <td className="p-3 text-muted-foreground">{r.affectedEntity ? `${r.affectedEntity}${r.entityId ? ` #${r.entityId}` : ""}` : "—"}</td>
                      <td className="p-3 text-xs">
                        {r.previousValue || r.newValue ? (
                          <span className="text-muted-foreground">
                            {r.previousValue && <span className="line-through">{r.previousValue}</span>}
                            {r.previousValue && r.newValue && " → "}
                            {r.newValue && <span className="font-medium text-foreground">{r.newValue}</span>}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border p-3 text-sm">
            <span className="text-muted-foreground">
              {meta.total} eventos · página {meta.page} de {meta.pages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
                className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-accent"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={meta.page >= meta.pages}
                onClick={() => setPage(meta.page + 1)}
                className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-accent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallaLogsAuditoria;
