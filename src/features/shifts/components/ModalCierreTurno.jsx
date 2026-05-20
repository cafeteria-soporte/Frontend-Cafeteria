/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { X, Calculator, Info, Loader2, AlertTriangle } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { toast } from "sonner";
import { ROUTES } from "@/utils/constants";

import { shiftsService } from "../services/shifts.service"; 

export const CloseShiftModal = ({ open, onClose, totals, pendingCount = 0 }) => {
  const [actualCash, setActualCash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentShift, fetchCurrentShift } = useShifts();
  const navigate = useNavigate();

  if (!open) return null;

  const handleFinalizarTurno = async () => {
    if (pendingCount > 0) {
      toast.error("Cierre no permitido", {
        description: `Tienes ${pendingCount} órdenes pendientes. Debes cobrarlas o anularlas antes de cerrar el turno.`,
        duration: 5000,
      });
      return; 
    }
    

    const declaredAmount = parseFloat(actualCash);

    if (!actualCash || isNaN(declaredAmount) || declaredAmount < 0) {
      toast.error("Por favor, ingresa un monto físico válido.");
      return;
    }

    const idDelTurnoCerrado = currentShift?.id;
    console.log("ID del turno que se va a cerrar:", idDelTurnoCerrado); 

    if (!idDelTurnoCerrado) {
      toast.error("Error: No se pudo identificar el turno activo.");
      return;
    }

    setIsSubmitting(true);
    try {
     
      await shiftsService.closeShift({ declaredAmount }); 
      
      console.log("Cierre enviado al backend con éxito."); 
      
      onClose();
      
      navigate(ROUTES.RESULTADO_CIERRE, { 
        state: { shiftId: idDelTurnoCerrado },
        replace: true 
      });

      
      fetchCurrentShift();

    } catch (error) {
      console.error("Error al cerrar caja:", error);
      setIsSubmitting(false);
      toast.error("Error al comunicarse con el servidor.");
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Cierre de Turno
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="hover:bg-accent p-1 rounded-full text-muted-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          {pendingCount > 0 && (
            <div className="flex gap-3 rounded-lg bg-destructive/10 p-3 border border-destructive/20 text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Órdenes pendientes: {pendingCount}</p>
                <p className="text-xs">No podrás finalizar el turno hasta procesarlas.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">Fondo Inicial</p>
              <p className="text-lg font-bold">Bs. {totals.initialFund.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
            <label className="text-sm font-semibold text-primary block mb-2 text-center uppercase tracking-wider">
              Efectivo físico en caja
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">Bs.</span>
              <input
                type="number"
                disabled={isSubmitting || pendingCount > 0} 
                className="input h-14 pl-12 text-2xl font-bold text-center focus:ring-primary"
                placeholder="0.00"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 rounded-lg bg-accent/50 p-3 border border-border">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight italic">
              Al confirmar, el turno se dará por cerrado y no podrás realizar más ventas.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="flex-1 button button-outline disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            className="flex-1 button button-default flex items-center justify-center gap-2"
            onClick={handleFinalizarTurno}
            disabled={isSubmitting || pendingCount > 0} 
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Procesando...</>
            ) : (
              "Finalizar Turno"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};