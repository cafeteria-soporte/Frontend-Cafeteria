"use client";

import { Printer, ChevronLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
export const PantallaComprobante = ({ params }) => {
  const sale = {
    id: params.id || "001-2405",
    date: "21/04/2026 14:20",
    items: [
      { name: "Café Americano", qty: 2, price: 15 },
      { name: "Croissant", qty: 1, price: 12 },
    ],
    total: 42,
    method: "Efectivo"
  };

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md flex justify-between mb-4">
        <Link href="/pos" className="button button-ghost flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Volver al POS
        </Link>
        <div className="flex gap-2">
          <button className="button button-outline button-icon"><Download className="h-4 w-4" /></button>
          <button onClick={() => window.print()} className="button button-default flex items-center gap-2 px-4">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>

      {/* Ticket Estilo Térmico */}
      <div className="w-full max-w-[350px] bg-white shadow-xl p-8 text-black font-mono no-print">
        <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase">CAFÉ UCB</h1>
          <p className="text-[10px]">Campus Universitario - La Paz</p>
          <p className="text-[10px]">NIT: 1020304050</p>
        </div>

        <div className="text-[11px] mb-4">
          <div className="flex justify-between"><span>TICKET:</span> <span>#{sale.id}</span></div>
          <div className="flex justify-between"><span>FECHA:</span> <span>{sale.date}</span></div>
          <div className="flex justify-between"><span>CAJERO:</span> <span>Admin</span></div>
        </div>

        <table className="w-full text-[12px] mb-4">
          <thead className="border-b border-dashed border-gray-300">
            <tr>
              <th className="text-left py-2">DESCRIPCIÓN</th>
              <th className="text-right py-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-1 uppercase">{item.qty}x {item.name}</td>
                <td className="text-right">Bs. {(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-300 pt-4 text-sm font-bold">
          <div className="flex justify-between text-lg">
            <span>TOTAL:</span>
            <span>Bs. {sale.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] mt-2 font-normal">
            <span>MÉTODO:</span>
            <span>{sale.method}</span>
          </div>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-dashed border-gray-300">
          <p className="text-[10px]">¡Gracias por su preferencia!</p>
          <p className="text-[9px] mt-1 italic">Este no es un comprobante fiscal</p>
        </div>
      </div>
    </div>
  );
}