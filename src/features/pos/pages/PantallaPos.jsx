/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductCatalog } from "../components/ProductoCatalogo";
import { CurrentOrder } from "../components/OrdenActual";
import { ShiftInfo } from "../components/InfoTurno";
import { ProcessPaymentModal } from "../components/ModalPorcesarCobro";
import { PendingOrders } from "../components/PendingOrders";
import { toast } from "sonner";
import { ModalComprobante } from "../components/ModalComprobante";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useShiftContext } from "@/features/shifts/contexts/shiftContext";
import { usePos } from "../hooks/usePos";

export const PantallaPos = () => {
  const [order, setOrder] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);

  const { products, getAllProducts, loadingProducts } = useProducts();
  const { currentShift, loadingCurrent } = useShiftContext();
  const { orders } = usePos();

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);


 const handlePaymentSuccess = (saleResponse) => {
    setLastSaleData({
      items: [...order], 
      total: saleResponse?.total || total,
      descuento: 0, 
      receiptNumber: saleResponse?.receiptNumber, 
      fecha: saleResponse?.createdAt,            
      cajero: saleResponse?.cashier?.fullName || currentShift?.cashier?.fullName 
    });

    setOrder([]);
    setPaymentModalOpen(false);

    setReceiptModalOpen(true);
    fetchPendingOrders(); 
  };
  const fetchPendingOrders = async () => {
  try {
    const resp = await orders.fetch();
    const data = Array.isArray(resp) ? resp : resp.data || orders.data || [];

    const openOrders = data.filter((o) => 
      o.status === "open" && o.shiftRecordId === currentShift?.id
    );

    setPendingOrders(openOrders);
  } catch (error) {
    console.error("Error al cargar pendientes:", error);
  }
};
  useEffect(() => {
    if (currentShift) fetchPendingOrders();
  }, [currentShift]);

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  const formattedProducts = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : products?.data || [];
    console.log("👀 Inspeccionando productos en PantallaPos:", productsArray[2]);
    return productsArray.map((p) => ({
      id: p.id,
      nombre: p.name,
      precio: parseFloat(p.salePrice) || 0,
      stock: p.currentStock,
      categoria: p.category?.name || "General",
      imageUrl: p.imageUrl || "",
    }));
  }, [products]);

  const handleAddProduct = async (product) => {
    const currentOrderId = order.id;
    const existing = order.find((item) => item.id === product.id);

    try {
      if (currentOrderId) {
        await orders.items.add(currentOrderId, {
          productId: product.id,
          quantity: 1,
        });
        toast.success(`Añadido a la Orden #${currentOrderId}`);
      }

      setOrder((prev) => {
        let updated;
        if (existing) {
          updated = prev.map((item) =>
            item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          updated = [...prev, { ...product, cantidad: 1 }];
        }
        updated.id = currentOrderId;
        return updated;
      });

      if (currentOrderId) fetchPendingOrders();
    } catch (error) {
      toast.error("Error al sincronizar con el servidor");
    }
  };

  const handleUpdateQuantity = async (id, delta) => {
    const currentOrderId = order.id;
    const item = order.find(i => i.id === id);

    if (item.cantidad + delta <= 0) {
      return handleRemoveItem(id);
    }

    try {
      if (currentOrderId && delta > 0) {
        await orders.items.add(currentOrderId, { productId: id, quantity: 1 });
      }

      setOrder((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad + delta } : item
        );
        updated.id = currentOrderId;
        return updated;
      });

      if (currentOrderId) fetchPendingOrders();
    } catch {
      toast.error("Error al actualizar cantidad");
    }
  };

  const handleRemoveItem = async (productId) => {
    const currentOrderId = order.id;

    if (currentOrderId) {
      if (!confirm("¿Eliminar este producto de la orden guardada?")) return;
      try {
        await orders.items.remove(currentOrderId, productId);
        toast.info("Eliminado de la base de datos");
      } catch {
        toast.error("No se pudo eliminar del servidor");
        return;
      }
    }

    setOrder((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      updated.id = currentOrderId;
      return updated;
    });

    if (currentOrderId) fetchPendingOrders();
  };

  const handleSelectPendingOrder = async (orderBasicInfo) => {
    try {
      const response = await orders.items.fetch(orderBasicInfo.id);
      const rawItems = Array.isArray(response) ? response : response.data || [];

      if (rawItems.length === 0) {
        return alert("Esta orden no tiene productos.");
      }

      const itemsToLoad = rawItems.map((item) => ({
        id: item.productId,
        nombre: item.product?.name || "Producto",
        precio: parseFloat(item.unitPrice) || 0,
        cantidad: item.quantity,
        stock: item.product?.currentStock || 99,
        categoria: item.product?.category?.name || "General",
      }));

      const newCart = [...itemsToLoad];
      newCart.id = orderBasicInfo.id;
      setOrder(newCart);

      toast.success(`Orden #${orderBasicInfo.id} cargada`);
    } catch {
      toast.error("Error al cargar productos de la orden");
    }
  };

  const handleRegisterOrder = async () => {
    if (order.length === 0) return alert("El carrito está vacío");
    if (order.id) return alert("Esta orden ya está registrada.");

    try {
      const response = await orders.create({ shiftRecordId: currentShift.id });
      const orderId = response?.data?.id || response?.id;

      if (!orderId) throw new Error("No se obtuvo ID");

      await Promise.all(
        order.map((item) =>
          orders.items.add(orderId, {
            productId: item.id,
            quantity: item.cantidad,
          })
        )
      );

      toast.success(`Orden #${orderId} registrada`);
      setOrder([]);
      fetchPendingOrders();
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  const handleClearOrder = () => {
    if (order.length > 0 && confirm("¿Estás seguro de limpiar la orden?")) {
      setOrder([]);
    }
  };

  const total = order.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  if (loadingCurrent)
    return <div className="flex h-full items-center justify-center">Cargando POS...</div>;

  if (!currentShift) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-4">Caja Cerrada</h2>
        <p className="text-muted-foreground">Debes abrir el turno para poder vender.</p>
      </div>
    );
  }
console.log("Renderizando PantallaPos con turno:", formattedProducts);
  return (
    <div className="h-[650px] w-full overflow-x-auto overflow-y-hidden bg-background scroll-smooth">
      <div className="flex h-full w-max">

        {/* Catálogo */}
        <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-border bg-card relative">
          {loadingProducts && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              Cargando catálogo...
            </div>
          )}
          <ProductCatalog products={formattedProducts} onAddProduct={handleAddProduct} />
        </div>

        {/* Carrito */}
        <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-border bg-card">
          <CurrentOrder
            order={order}
            total={total}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearOrder={handleClearOrder}
            onCheckout={() => setPaymentModalOpen(true)}
            onRegisterOrder={handleRegisterOrder}
          />
        </div>

        {/* Shift */}
        <div className="w-[400px] flex-shrink-0 border-r border-border bg-card p-3">
          <ShiftInfo />
        </div>

        {/* Pending */}
        <div className="w-[300px] flex-shrink-0 bg-card p-3">
          <PendingOrders
            orders={pendingOrders}
            onSelectOrder={handleSelectPendingOrder}
          />
        </div>

      </div>

      <ProcessPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={order}
        total={total}
        shiftId={currentShift.id}
        onSuccess={handlePaymentSuccess} 
      />

      {/* Modal */}
   <ModalComprobante
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        saleData={lastSaleData}
      />
    </div>
  );
};