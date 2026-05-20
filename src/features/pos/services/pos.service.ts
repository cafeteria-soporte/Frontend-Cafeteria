import { BaseService, apiClient } from '../../../api/base.service';
import { 
  PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto,
  Order, CreateOrderDto, PayOrderDto, VoidOrderDto,
  OrderItem, AddOrderItemDto, OrderPayment, AddOrderPaymentDto
} from '../dtos/pos.dto';

class PaymentMethodService extends BaseService<PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto> {
  constructor() {
    super('/payment-methods'); 
  }
}

class OrderService extends BaseService<Order, CreateOrderDto, Partial<Order>> {
  constructor() {
    super('/user-orders');
  }

  async pay(id: number | string, data: PayOrderDto): Promise<Order> {
    const response = await apiClient.post<Order>(`${this.endpoint}/${id}/pay`, data);
    return response.data;
  }

  async voidOrder(id: number | string, data: VoidOrderDto): Promise<Order> {
    const response = await apiClient.patch<Order>(`${this.endpoint}/${id}/void`, data);
    return response.data;
  }

  async getItems(orderId: number | string): Promise<OrderItem[]> {
    const response = await apiClient.get<OrderItem[]>(`${this.endpoint}/${orderId}/items`);
    return response.data;
  }

  async addItem(orderId: number | string, data: AddOrderItemDto): Promise<OrderItem[]> {
    const response = await apiClient.post<OrderItem[]>(`${this.endpoint}/${orderId}/items`, data);
    return response.data;
  }

  async removeItem(orderId: number | string, productId: number | string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${orderId}/items/${productId}`);
  }

  async getPayments(orderId: number | string): Promise<OrderPayment[]> {
    const response = await apiClient.get<OrderPayment[]>(`${this.endpoint}/${orderId}/payments`);
    return response.data;
  }

  async addPayment(orderId: number | string, data: AddOrderPaymentDto): Promise<OrderPayment[]> {
    const response = await apiClient.post<OrderPayment[]>(`${this.endpoint}/${orderId}/payments`, data);
    return response.data;
  }
}

export const paymentMethodService = new PaymentMethodService();
export const orderService = new OrderService();