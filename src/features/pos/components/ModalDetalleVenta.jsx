/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, Receipt, Printer, AlertTriangle, Loader2, Calendar, Clock, User } from "lucide-react";
import { usePos } from "../hooks/usePos"; 
import { toast } from "sonner";

export const ModalDetalleVenta = ({ open, onClose, saleId }) => {
  const [sale, setSale] = useState(null);
  const [orderItems, setOrderItems] = useState([]); // NUEVO ESTADO PARA LOS ÍTEMS
  const [isLoading, setIsLoading] = useState(true);
  
  const { orders } = usePos();

  useEffect(() => {
    if (open && saleId) {
      const fetchDetalle = async () => {
        setIsLoading(true);
        try {
          const [saleData, itemsData] = await Promise.all([
            orders.getById(saleId),      
            orders.items.fetch(saleId)     
          ]);

          setSale(saleData);
          
          setOrderItems(Array.isArray(itemsData) ? itemsData : (itemsData?.data || []));

        } catch (error) {
          console.error("Error al cargar detalle o ítems:", error);
          toast.error("No se pudo obtener el detalle completo de la venta.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDetalle();
    } else {
      setSale(null); 
      setOrderItems([]);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saleId]);

  if (!open) return null;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${sale?.status === 'voided' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {sale?.status === 'voided' ? <AlertTriangle size={20} /> : <Receipt size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">Detalle de Venta</h2>
              {sale && <p className="text-xs text-muted-foreground mt-1">Recibo {sale.receiptNumber || `#${sale.id}`}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || !sale ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Obteniendo detalles de la orden...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Info General */}
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">{formatDate(sale.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Hora</p>
                    <p className="text-sm font-medium">{formatTime(sale.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-border/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Cajero</p>
                    <p className="text-sm font-medium">{sale.cashier?.fullName || sale.cashier?.username || 'Cajero'}</p>
                  </div>
                </div>
              </div>

              {sale.status === 'voided' && sale.voidReason && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20 text-sm">
                  <strong>Motivo de anulación:</strong> {sale.voidReason}
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Productos</h3>
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border/50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Ítem</th>
                        <th className="px-4 py-2 text-center font-semibold">Cant.</th>
                        <th className="px-4 py-2 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-4 py-4 text-center text-muted-foreground italic">
                            No se encontraron ítems para esta orden.
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.product?.name || item.productName || "Producto"}</p>
                              <p className="text-[10px] text-muted-foreground">Bs. {Number(item.unitPrice).toFixed(2)} c/u</p>
                            </td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-mono font-medium">
                              Bs. {Number(item.subtotal || (item.quantity * item.unitPrice)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t-2 border-dashed border-border/60">
                <div className="text-right">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Pagado</p>
                  <p className="text-2xl font-black text-primary font-mono leading-none">
                    Bs. {Number(sale.total).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border/50 bg-muted/10 flex gap-3">
          <button 
            className="flex-1 button button-outline border-border/50 bg-card hover:bg-muted disabled:opacity-50"
            onClick={() => window.print()}
            disabled={isLoading || !sale}
          >
            <Printer size={16} className="mr-2" /> Imprimir
          </button>
          <button className="flex-1 button button-default" onClick={onClose}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};