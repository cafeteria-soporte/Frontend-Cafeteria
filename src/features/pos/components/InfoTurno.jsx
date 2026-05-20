/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Clock,
  Package,
  Receipt,
  LogOut,
  XCircle,
  TrendingUp,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ModalStock } from "./ModalStock";
import { CloseShiftModal } from "@/features/shifts/components/ModalCierreTurno";
import { ROUTES } from "@/utils/constants";
import { useShiftContext } from "@/features/shifts/contexts/shiftContext";
import { useProducts } from "@/features/products/hooks/useProducts"; 

export const ShiftInfo = () => {
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);

  const { products, getAllProducts } = useProducts();

  const { currentShift } = useShiftContext();

  const handleCloseSession = () => {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    if (stockModalOpen) {
      getAllProducts();
    }
  }, [stockModalOpen, getAllProducts]);

  const [cashierName, setCashierName] = useState("Cajero en turno");
  
  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // eslint-disable-next-line no-undef, react-hooks/set-state-in-effect
        setCashierName(userData.username || userData.name || "Cajero en turno");
      } catch (error) {
        console.error("Error al leer los datos del usuario:", error);
      }
    }
  }, []);   

  if (!currentShift) return null;

  const startTime = new Date(currentShift.openedAt).toLocaleTimeString('es-BO', {
    hour: '2-digit', minute: '2-digit'
  });
  
  const currentSalesDisplay = Number(currentShift.initialFund); 



  return (
    <Card className="flex h-full flex-col border-none rounded-none bg-card shadow-none overflow-hidden">
      
      <CardHeader className="px-5 py-5 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold leading-none mb-1">Control de Turno</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                </span>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Activo • POS-01
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 bg-muted/10"> 
        <div className="space-y-6">
          
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-all hover:border-primary/40">
            <div className="flex flex-col gap-1 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-card text-primary border-primary/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                  Fondo Inicial
                </Badge>
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xs font-bold text-muted-foreground uppercase">Bs</span>
                <span className="text-4xl font-black tracking-tighter text-foreground leading-none">
                  {currentSalesDisplay.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Detalles de Operación
            </h3>
            
            <div className="grid gap-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
                <div className="rounded-xl bg-muted/50 p-2">
                  <User className="h-4 w-4 text-primary/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Responsable</p>
                  <p className="text-xs font-black text-foreground truncate uppercase">{cashierName}</p>
                </div>
                <ShieldCheck className="h-4 w-4 text-green-500/70 mr-1" />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
                <div className="rounded-xl bg-muted/50 p-2">
                  <Clock className="h-4 w-4 text-orange-500/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Apertura de caja</p>
                  <p className="text-xs font-black text-foreground">{startTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">
              Herramientas
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="group h-auto flex-col items-center justify-center gap-2 rounded-2xl border-border/40 bg-card p-4 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
                onClick={() => setStockModalOpen(true)}
              >
                <div className="rounded-full bg-primary/10 p-2.5 transition-transform group-hover:scale-110">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-foreground text-[10px] uppercase tracking-wider text-center leading-tight">
                  Consultar<br/>Stock
                </span>
              </Button>

              <Button
                variant="outline"
                className="group h-auto flex-col items-center justify-center gap-2 rounded-2xl border-border/40 bg-card p-4 transition-all hover:border-chart-2/40 hover:bg-chart-2/5 hover:shadow-md"
                onClick={() => (window.location.href = ROUTES.VENTAS_TURNO || '/ventas')}
              >
                <div className="rounded-full bg-chart-2/10 p-2.5 transition-transform group-hover:scale-110">
                  <Receipt className="h-5 w-5 text-chart-2" />
                </div>
                <span className="font-bold text-foreground text-[10px] uppercase tracking-wider text-center leading-tight">
                  Historial<br/>Ventas
                </span>
              </Button>
            </div>
          </div>

        </div>
      </div>

      <CardFooter className="flex-col gap-3 p-5 border-t border-border/40 bg-card flex-shrink-0">
        <Button
          onClick={() => setCloseShiftModalOpen(true)}
          variant="destructive"
          className="w-full h-12 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white shadow-none transition-all"
        >
          <XCircle className="mr-2 h-4 w-4" />
          <span className="font-black uppercase tracking-widest text-xs">Cerrar Turno</span>
        </Button>

        <Separator className="bg-border/40" />

        <Button
          variant="ghost"
          onClick={handleCloseSession}
          className="w-full h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          <span className="font-bold text-[11px] uppercase tracking-wider">Cerrar Sesión</span>
        </Button>
      </CardFooter>

      <ModalStock
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        productos={products || []} // Pasamos los productos del hook
      />
      <CloseShiftModal
        open={closeShiftModalOpen}
        onClose={() => setCloseShiftModalOpen(false)}
        totals={{ cash: currentSalesDisplay, initialFund: Number(currentShift.initialFund) }}
      />
    </Card>
  );
};