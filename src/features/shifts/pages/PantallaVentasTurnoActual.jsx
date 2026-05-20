/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
"use client";

import { ArrowLeft, Search, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { RequestCancellationModal } from "../../pos/components/ModalSolicitarAnulacion";
import { ModalDetalleVenta } from "../../pos/components/ModalDetalleVenta"; 
import { ROUTES } from "@/utils/constants";
import { usePos } from "@/features/pos/hooks/usePos"; 
import { useShiftContext } from "@/features/shifts/contexts/shiftContext";
import { toast } from "sonner";

export const PantallaVentasTurnoActual = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailSaleId, setDetailSaleId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { orders } = usePos();
  const { currentShift } = useShiftContext();

  const fetchSales = async () => {
    if (!currentShift) return;
    setIsLoading(true);
    try {
      const resp = await orders.fetch();
      const data = Array.isArray(resp) ? resp : resp.data || [];
      
   
      const shiftSales = data.filter(o => 
        o.shiftRecordId === currentShift.id && o.status !== "open"
      );
      
      setAllOrders(shiftSales);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("No se pudieron cargar las ventas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [currentShift]);

  const filteredSales = useMemo(() => {
    return allOrders.filter(sale => 
      sale.id.toString().includes(searchTerm) || 
      (sale.receiptNumber && sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allOrders, searchTerm]);


  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenDetail = (id) => {
    setDetailSaleId(id);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center gap-4">
        <Link to={ROUTES.POS || "/pos"} className="button button-outline button-icon h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Ventas del Turno</h1>
          <p className="text-xs text-muted-foreground">Turno #{currentShift?.id} - {currentShift?.cashier?.fullName}</p>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="card max-w-5xl mx-auto shadow-sm">
          <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                className="input pl-10" 
                placeholder="Buscar por ID o Recibo..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        
          </div>

          <div className="table-container">
            {isLoading ? (
              <div className="flex flex-col items-center py-20 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando transacciones...</p>
              </div>
            ) : (
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Hora</th>
                    <th className="table-header-cell">ID / Recibo</th>
                    <th className="table-header-cell">Total</th>
                    <th className="table-header-cell">Estado</th>
                    <th className="table-header-cell text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-muted-foreground">No se encontraron ventas en este turno.</td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="table-row">
                        <td className="table-cell text-muted-foreground">{formatTime(sale.createdAt)}</td>
                        <td className="table-cell">
                          <div className="flex flex-col">
                            <span className="font-bold font-mono">#{sale.id}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{sale.receiptNumber || 'Sin Recibo'}</span>
                          </div>
                        </td>
                        <td className="table-cell font-semibold text-foreground">Bs. {parseFloat(sale.total).toFixed(2)}</td>
                        <td className="table-cell">
                           <span className={`badge ${sale.status === 'voided' ? 'badge-destructive' : 'badge-success'}`}>
                            {sale.status === 'paid' ? 'Completada' : 'Anulada'}
                           </span>
                        </td>
                        <td className="table-cell text-right flex justify-end gap-2">
                          {/* BOTÓN ACTUALIZADO PARA ABRIR MODAL */}
                          <button 
                            onClick={() => handleOpenDetail(sale.id)} 
                            className="button button-outline button-sm h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" /> Detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <RequestCancellationModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        saleId={selectedSaleId}
        onSuccess={() => {
            fetchSales(); 
            setIsModalOpen(false);
        }}
      />

      <ModalDetalleVenta 
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        saleId={detailSaleId}
      />
    </div>
  );
};