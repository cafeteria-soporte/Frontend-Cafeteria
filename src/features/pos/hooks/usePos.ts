import { useState } from 'react';
import { toast } from 'sonner';
import { CrudService, useCrud } from '@/hooks/useCrud';
import { paymentMethodService, orderService } from '../services/pos.service';
import { 
  PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto,
  Order, CreateOrderDto, PayOrderDto, VoidOrderDto,
  AddOrderItemDto, AddOrderPaymentDto, OrderItem, OrderPayment
} from '../dtos/pos.dto';



export const usePos = () => {
const paymentMethodsCrud = useCrud<PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto>(
    paymentMethodService as unknown as CrudService<PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto>
  );

  const ordersCrud = useCrud<Order, CreateOrderDto, Partial<Order>>(
    orderService as unknown as CrudService<Order, CreateOrderDto, Partial<Order>>
  );

  const [actionLoading, setActionLoading] = useState(false);
  
  const [activeOrderItems, setActiveOrderItems] = useState<OrderItem[]>([]);
  const [activeOrderPayments, setActiveOrderPayments] = useState<OrderPayment[]>([]);

  const payOrder = async (id: number | string, data: PayOrderDto) => {
    setActionLoading(true);
    try {
      const updatedOrder = await orderService.pay(id, data);
      ordersCrud.getAll(); 
      toast.success('Orden pagada exitosamente');
      return updatedOrder;
    } catch (error) {
      toast.error('Error al procesar el pago');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const voidOrder = async (id: number | string, data: VoidOrderDto) => {
    setActionLoading(true);
    try {
      const voidedOrder = await orderService.voidOrder(id, data);
      ordersCrud.getAll();
      toast.success('Orden anulada correctamente');
      return voidedOrder;
    } catch (error) {
      toast.error('Error al anular la orden');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: number | string) => {
    try {
      const items = await orderService.getItems(orderId);
      setActiveOrderItems(items);
      return items;
    } catch (error) {
      toast.error('Error al cargar los ítems');
      throw error;
    }
  };

  const addItemToOrder = async (orderId: number | string, data: AddOrderItemDto) => {
    setActionLoading(true);
    try {
      const updatedItems = await orderService.addItem(orderId, data);
      setActiveOrderItems(updatedItems);
      toast.success('Producto agregado a la orden');
      return updatedItems;
    } catch (error) {
      toast.error('Error al agregar el producto');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const removeItemFromOrder = async (orderId: number | string, productId: number | string) => {
    setActionLoading(true);
    try {
      await orderService.removeItem(orderId, productId);
      await fetchOrderItems(orderId);
      toast.success('Producto removido');
    } catch (error) {
      toast.error('Error al remover el producto');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const fetchOrderPayments = async (orderId: number | string) => {
    try {
      const payments = await orderService.getPayments(orderId);
      setActiveOrderPayments(payments);
      return payments;
    } catch (error) {
      toast.error('Error al cargar los pagos');
      throw error;
    }
  };

  const addPaymentToOrder = async (orderId: number | string, data: AddOrderPaymentDto) => {
    setActionLoading(true);
    try {
      const updatedPayments = await orderService.addPayment(orderId, data);
      setActiveOrderPayments(updatedPayments);
      toast.success('Pago registrado');
      return updatedPayments;
    } catch (error) {
      toast.error('Error al registrar el pago');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    paymentMethods: {
      data: paymentMethodsCrud.data,
      loading: paymentMethodsCrud.loading,
      fetch: paymentMethodsCrud.getAll,
    },
    orders: {
      data: ordersCrud.data,
      loading: ordersCrud.loading || actionLoading,
      fetch: ordersCrud.getAll,
      create: ordersCrud.create,
      getById: orderService.getById.bind(orderService),
      pay: payOrder,
      void: voidOrder,
      items: {
        data: activeOrderItems,
        fetch: fetchOrderItems,
        add: addItemToOrder,
        remove: removeItemFromOrder,
      },
      payments: {
        data: activeOrderPayments,
        fetch: fetchOrderPayments,
        add: addPaymentToOrder,
      }
    }
  };
};