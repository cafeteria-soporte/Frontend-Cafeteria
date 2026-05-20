import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const OpenShiftModal = ({
  open,
  onClose,
  cashierName,
  onConfirm,
  isLoading
}) => {
  const [initialFund, setInitialFund] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fund = parseFloat(initialFund);

    if (isNaN(fund) || fund <= 0) {
      setError("El fondo inicial debe ser mayor a 0");
      return;
    }

    setError("");
    try {
      await onConfirm(fund);
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error al abrir el turno");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">
            Apertura de Turno
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra el fondo de caja inicial para comenzar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="space-y-3 rounded-xl border border-border bg-background p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cajero:</span>
              <span className="font-medium text-foreground capitalize">{cashierName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium text-foreground">
                {new Date().toLocaleDateString("es-ES")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hora de inicio:</span>
              <span className="font-medium text-foreground">
                {new Date().toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Fondo de caja inicial <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Bs.
              </span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                disabled={isLoading}
                value={initialFund}
                onChange={(e) => {
                  setInitialFund(e.target.value);
                  setError("");
                }}
                placeholder="0.00"
                className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-4 text-lg font-semibold outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 rounded-xl bg-primary/10 p-4">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-xs text-foreground">
              Este monto será registrado como el saldo inicial de tu turno.
              Verifica que sea correcto antes de confirmar.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Confirmar apertura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};