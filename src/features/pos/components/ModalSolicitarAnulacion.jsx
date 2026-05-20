"use client";

import { useState } from "react";
import { AlertCircle, X, Loader2 } from "lucide-react";
import { usePos } from "@/features/pos/hooks/usePos"; // Asegúrate de que la ruta sea correcta
import { toast } from "sonner";

export const RequestCancellationModal = ({ open, onClose, saleId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { orders } = usePos();

  if (!open) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return toast.error("Debes ingresar un motivo para la anulación");
    }

    setIsSubmitting(true);
    try {
 
      await orders.void(saleId, { reason: reason.trim() });

      toast.success(`Venta #${saleId} anulada correctamente`);
      
      setReason("");
      if (onSuccess) onSuccess(); 
      onClose();
    } catch (error) {
      console.error("Error al anular venta:", error);
      const errorMsg = error.response?.data?.message || "No se pudo anular la venta";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" /> Solicitar Anulación
          </h2>
          <button 
            onClick={onClose} 
            className="hover:bg-accent p-1 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Estás a punto de anular la venta <span className="font-bold text-foreground">#{saleId}</span>. 
            Esta acción revertirá el stock y marcará la orden como cancelada.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo de la anulación</label>
            <textarea 
              className="w-full min-h-[100px] rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
              placeholder="Ej: Error en método de pago, cliente desistió, producto defectuoso..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex justify-center items-center rounded-xl bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anulando...
              </>
            ) : (
              "Confirmar Anulación"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};