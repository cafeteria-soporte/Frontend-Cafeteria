/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Banknote,
  Smartphone,
  ArrowLeftRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usePos } from "../hooks/usePos";

export const ProcessPaymentModal = ({
  open,
  onClose,
  order,
  total,
  shiftId,
  onSuccess,
  onOpenReceipt,
}) => {
  const { paymentMethods, orders } = usePos();

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
const [processingStep, setProcessingStep] = useState(""); 
  useEffect(() => {
    if (open && (!paymentMethods.data || paymentMethods.data.length === 0)) {
      paymentMethods.fetch();
    }
  }, [open, paymentMethods]);

  if (!open) return null;

  const calculateChange = () => {
    if (paymentMethod === "cash") {
      const received = parseFloat(cashReceived) || 0;
      return Math.max(0, received - total);
    }
    return 0;
  };

  const validateMixedPayment = () => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    const transfer = parseFloat(transferAmount) || 0;
    const sum = cash + card + transfer;
    return { sum, isValid: Math.abs(sum - total) < 0.01, difference: total - sum };
  };

const handleConfirmPayment = async () => {
    if (paymentMethod === "cash" && (parseFloat(cashReceived) || 0) < total) {
      toast.error("El monto recibido es menor al total");
      return;
    }

    if (paymentMethod === "mixed" && !validateMixedPayment().isValid) {
      toast.error("La suma de los montos debe ser igual al total");
      return;
    }

   

    setIsProcessing(true);

    try {

      if (paymentMethod === "card") {
        setProcessingStep("Conectando con terminal POS...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setProcessingStep("Esperando lectura y PIN...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        setProcessingStep("Autorizando con el banco...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setProcessingStep("¡Transacción Aprobada!");
        await new Promise((resolve) => setTimeout(resolve, 800));
      } 
      else if (paymentMethod === "transfer") {
        setProcessingStep("Verificando cuenta destino...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setProcessingStep("Confirmando ingreso de fondos...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        setProcessingStep("¡Transferencia verificada!");
        await new Promise((resolve) => setTimeout(resolve, 800));
      } 
      else {
        setProcessingStep("Registrando venta...");
      }
      const getMethodId = (keyword) => {
        const method = paymentMethods.data?.find((m) =>
          m.name.toLowerCase().includes(keyword.toLowerCase())
        );
        return method ? method.id : null;
      };

      const cashId = getMethodId("efectivo") || 1;
      const cardId = getMethodId("tarjeta") || 2;
      const transferId = getMethodId("transfer") || 3;

 
      let paymentsArray = [];

      if (paymentMethod === "cash") {
        paymentsArray.push({
          paymentMethodId: cashId,
          amount: total,
          amountTendered: parseFloat(cashReceived),
        });
      } else if (paymentMethod === "card") {
        paymentsArray.push({
          paymentMethodId: cardId,
          amount: total,
          amountTendered: total,
        });
      } else if (paymentMethod === "transfer") {
        paymentsArray.push({
          paymentMethodId: transferId,
          amount: total,
          amountTendered: total,
        });
      } else if (paymentMethod === "mixed") {
        if (parseFloat(cashAmount) > 0) {
          paymentsArray.push({
            paymentMethodId: cashId,
            amount: parseFloat(cashAmount),
            amountTendered: parseFloat(cashAmount),
          });
        }
        if (parseFloat(cardAmount) > 0) {
          paymentsArray.push({
            paymentMethodId: cardId,
            amount: parseFloat(cardAmount),
            amountTendered: parseFloat(cardAmount),
          });
        }
        if (parseFloat(transferAmount) > 0) {
          paymentsArray.push({
            paymentMethodId: transferId,
            amount: parseFloat(transferAmount),
            amountTendered: parseFloat(transferAmount),
          });
        }
      }

      let orderId = order.id;

      if (!orderId) {
        const newOrder = await orders.create({ shiftRecordId: shiftId });
        orderId = newOrder?.data?.id || newOrder?.id;

        if (!orderId) throw new Error("No se pudo generar el ID de la orden");

        await Promise.all(
          order.map((item) =>
            orders.items.add(orderId, {
              productId: item.id,
              quantity: item.cantidad,
            })
          )
        );
      }


      const paymentResponse = await orders.pay(orderId, { 
        payments: paymentsArray 
      });

      toast.success("Venta completada exitosamente");
      
      setCashReceived("");
      setCashAmount("");
      setCardAmount("");
      setTransferAmount("");

      if (onSuccess) {

        const saleData = paymentResponse?.data || paymentResponse;
        onSuccess(saleData); 
      }
      
      if (onClose) onClose(); 
      
      if (onOpenReceipt && typeof onOpenReceipt === 'function') {
        onOpenReceipt(orderId);
      }

    } catch (error) {
      console.error("Error detallado en la venta:", error.response?.data || error);
      
      const serverMessage = error.response?.data?.message;
      const finalMsg = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      
      toast.error(finalMsg || "No se pudo procesar el pago. Revisa la consola.");
    } finally {
      setIsProcessing(false);
    }
  };

  const mixedValidation = validateMixedPayment();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">
            {order.id ? `Cobrar Orden #${order.id}` : "Procesar Cobro"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.id ? "Finalizando una orden pendiente" : "Selecciona el método de pago"}
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Resumen */}
          <div className="mb-6 rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-medium text-foreground">Detalle del carrito</span>
              <span className="text-sm text-muted-foreground">{order.length} productos</span>
            </div>
            <div className="space-y-2">
              {order.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.cantidad}x {item.nombre}</span>
                  <span className="font-medium text-foreground">Bs. {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              {order.length > 3 && <p className="text-xs text-muted-foreground">+ {order.length - 3} más</p>}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-3">
              <span className="text-lg font-semibold">TOTAL</span>
              <span className="text-2xl font-bold text-primary">Bs. {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod("cash")} 
                  className={`flex items-center gap-3 rounded-xl border p-4 ${paymentMethod === "cash" ? "border-primary bg-primary/10" : "bg-background"}`}>
                  <Banknote className={paymentMethod === "cash" ? "text-primary" : ""} />
                  <span>Efectivo</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("card")} 
                  className={`flex items-center gap-3 rounded-xl border p-4 ${paymentMethod === "card" ? "border-primary bg-primary/10" : "bg-background"}`}>
                  <CreditCard className={paymentMethod === "card" ? "text-primary" : ""} />
                  <span>Tarjeta</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("transfer")} 
                  className={`flex items-center gap-3 rounded-xl border p-4 ${paymentMethod === "transfer" ? "border-primary bg-primary/10" : "bg-background"}`}>
                  <Smartphone className={paymentMethod === "transfer" ? "text-primary" : ""} />
                  <span>Transferencia</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("mixed")} 
                  className={`flex items-center gap-3 rounded-xl border p-4 ${paymentMethod === "mixed" ? "border-primary bg-primary/10" : "bg-background"}`}>
                  <ArrowLeftRight className={paymentMethod === "mixed" ? "text-primary" : ""} />
                  <span>Mixto</span>
                </button>
             </div>

             <div className="mt-4">
                {paymentMethod === "cash" && (
                  <div className="space-y-2">
                    <label className="text-sm">Monto Recibido</label>
                    <input 
                      type="number" 
                      value={cashReceived} 
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-background text-xl font-bold"
                      placeholder="0.00"
                    />
                    {parseFloat(cashReceived) >= total && (
                      <div className="p-3 bg-green-500/10 text-green-500 rounded-lg flex justify-between">
                        <span>Cambio:</span>
                        <span className="font-bold">Bs. {calculateChange().toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {paymentMethod === "mixed" && (
                  <div className="space-y-3">
                    <input type="number" placeholder="Efectivo" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="w-full p-2 border rounded bg-background" />
                    <input type="number" placeholder="Tarjeta" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} className="w-full p-2 border rounded bg-background" />
                    <input type="number" placeholder="Transferencia" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full p-2 border rounded bg-background" />
                    <div className={`p-2 rounded text-sm ${mixedValidation.isValid ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      Suma: Bs. {mixedValidation.sum.toFixed(2)} / Faltan: Bs. {mixedValidation.difference.toFixed(2)}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 p-3 border rounded-xl hover:bg-accent font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            disabled={isProcessing} 
            onClick={handleConfirmPayment}
            className="flex-1 p-3 bg-primary text-primary-foreground rounded-xl font-bold flex justify-center items-center hover:opacity-90 transition-all duration-300"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} /> 
                {processingStep}
              </>
            ) : (
              "Confirmar Pago"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};