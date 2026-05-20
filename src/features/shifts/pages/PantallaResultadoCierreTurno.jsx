"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, LogOut, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useShifts } from "../hooks/useShifts"; 
import { ROUTES } from "@/utils/constants";

export const PantallaResultadoCierreTurno = () => {
  const location = useLocation();
  const { fetchMyShifts } = useShifts();

  const [closedShift, setClosedShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const shiftId = location.state?.shiftId;

  useEffect(() => {
    if (!shiftId) return;

    const cargarYFiltrar = async () => {
      try {
        setLoading(true);
     
        const misTurnos = await fetchMyShifts({ limit: 20 }); 

        const turnoEncontrado = misTurnos.find(t => t.id === shiftId);

        if (turnoEncontrado) {
          setClosedShift(turnoEncontrado);
        } else {
          console.error("No se encontró el turno en tu historial reciente.");
        }
      } catch (error) {
        console.error("Error al obtener el historial:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarYFiltrar();
  }, [shiftId, fetchMyShifts]);

  if (!shiftId) {
    return <Navigate to={ROUTES.PRE_TURNO || "/shifts/pre-shift"} replace />; 
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Procesando reporte de cierre...</p>
      </div>
    );
  }

  if (!closedShift) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive font-bold text-lg">No se pudo recuperar el detalle del cierre.</p>
        <p className="text-sm text-muted-foreground mt-2">El turno se cerró, pero hubo un problema al leer los datos.</p>
        <Link to={ROUTES.PRE_TURNO || "/shifts/pre-shift"} className="mt-6 button button-outline">
          Ir al Inicio
        </Link>
      </div>
    );
  }

  const isDescuadre = closedShift.discrepancyAlert;
  const fechaCierre = new Date(closedShift.closedAt).toLocaleString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card w-full max-w-lg overflow-hidden animate-fade-in shadow-xl border border-border">
        
        {/* Header condicional */}
        <div className={`p-8 text-white text-center transition-colors duration-500 ${isDescuadre ? 'bg-destructive' : 'bg-primary'}`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            {isDescuadre ? <AlertTriangle className="h-10 w-10" /> : <CheckCircle2 className="h-10 w-10" />}
          </div>
          <h1 className="text-2xl font-bold">
            {isDescuadre ? 'Turno Cerrado con Diferencia' : 'Turno Cerrado Exitosamente'}
          </h1>
          <p className="text-white/80 mt-1 text-sm">{fechaCierre}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Resumen Financiero */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resumen de Caja</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm border-b pb-4">
              <span className="text-muted-foreground">Fondo Inicial:</span>
              <span className="text-right font-bold">Bs. {Number(closedShift.initialFund)?.toFixed(2)}</span>
              
              <span className="text-muted-foreground">Esperado en Sistema:</span>
              <span className="text-right font-bold font-mono">Bs. {Number(closedShift.expectedAmount)?.toFixed(2)}</span>
              
              <span className="text-muted-foreground">Declarado por Cajero:</span>
              <span className="text-right font-bold">Bs. {Number(closedShift.declaredAmount)?.toFixed(2)}</span>
              
              <span className="text-muted-foreground font-semibold">Diferencia:</span>
              <span className={`text-right font-bold ${isDescuadre ? 'text-destructive' : 'text-green-600'}`}>
                Bs. {Number(closedShift.discrepancy)?.toFixed(2)}
              </span>
            </div>
          </div>


          <div className="pt-4 border-t">
            <Link 
              to={ROUTES.PRE_TURNO || "/shifts/pre-shift"} 
              className="button button-ghost w-full flex justify-center gap-2 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Finalizar y Salir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};