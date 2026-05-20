import React from "react";
import { Printer, X, CheckCircle2 } from "lucide-react";

export const ModalComprobante = ({ open, onClose, saleData }) => {
  if (!open || !saleData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString('es-BO', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      <div className="relative flex flex-col w-full max-w-sm bg-background rounded-2xl shadow-2xl print:shadow-none print:w-[80mm] print:absolute print:top-0 print:left-0 print:bg-white print:text-black">
        
        <div className="bg-green-500 text-white text-center py-3 px-4 rounded-t-2xl flex items-center justify-center gap-2 print:hidden">
          <CheckCircle2 size={20} />
          <span className="font-bold">¡Cobro exitoso!</span>
        </div>

        <div id="ticket-content" className="p-6 font-mono text-[12px] leading-tight bg-white text-black print:p-2 print:m-0">
          
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-lg font-black uppercase">CAFETERÍA UCB</h2>
            <p className="font-bold uppercase">Sucursal La Paz</p>
            <p className="text-[10px]">Campus Tupuraya</p>
            <p className="text-[10px]">NIT: 1234567890</p>
          </div>

          <div className="border-b-2 border-dashed border-black my-3" />

          <div className="space-y-1 mb-4 text-[11px]">
            <p><span className="font-bold">Recibo Nro:</span> <span className="uppercase">{saleData.receiptNumber || "N/A"}</span></p>
            <p><span className="font-bold">Fecha:</span> {formatTime(saleData.fecha)}</p>
            <p><span className="font-bold">Cajero:</span> <span className="uppercase">{saleData.cajero}</span></p>
          </div>

          <div className="border-b-2 border-dashed border-black my-3" />

          <div className="grid grid-cols-12 font-bold mb-2 uppercase text-[10px]">
            <div className="col-span-2">CANT</div>
            <div className="col-span-6">PRODUCTO</div>
            <div className="col-span-4 text-right">SUBTOT</div>
          </div>

          <div className="space-y-2 mb-4">
            {(saleData.items || []).map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 items-start text-[11px]">
                <div className="col-span-2 font-bold">{item.cantidad}</div>
                <div className="col-span-6 pr-1">
                  <p className="font-bold uppercase leading-tight">{item.nombre}</p>
                  <p className="text-[9px]">Bs. {Number(item.precio).toFixed(2)}</p>
                </div>
                <div className="col-span-4 text-right font-bold">
                  Bs. {(item.cantidad * item.precio).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-b-2 border-dashed border-black my-3" />

          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-[14px] font-black uppercase">
              <span>TOTAL:</span>
              <span>Bs. {Number(saleData.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center space-y-1 mt-6 text-[10px]">
            <p className="font-bold uppercase">¡Gracias por su compra!</p>
            <p>Este recibo no es factura fiscal.</p>
            <p className="mt-2">Sistema UCB - 2026</p>
          </div>
        </div>
        
        <div className="p-4 bg-muted/30 rounded-b-2xl border-t border-border flex gap-3 print:hidden">
          <button 
            className="flex-1 button button-outline flex items-center justify-center gap-2 bg-card hover:bg-muted"
            onClick={handlePrint}
          >
            <Printer size={16} /> Imprimir
          </button>
          <button 
            className="flex-1 button button-default"
            onClick={onClose}
          >
            Nueva Venta
          </button>
        </div>

      </div>
    </div>
  );
};