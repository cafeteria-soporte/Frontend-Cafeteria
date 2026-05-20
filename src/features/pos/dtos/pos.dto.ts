
export interface Category {
  id: number;
  name: string;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  salePrice: number;
  currentStock: number;
  minStock: number;
  imageUrl: string;
  active: boolean;
  category: Category;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export type CreatePaymentMethodDto = Omit<PaymentMethod, 'id'>;
export type UpdatePaymentMethodDto = Partial<CreatePaymentMethodDto>;

export interface Role {
  id: number;
  name: string;
}

export interface Cashier {
  id: number;
  username: string;
  fullName: string;
  email: string;
  active: boolean;
  role: Role;
}

export interface OrderItem {
  userOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
}

export interface AddOrderItemDto {
  productId: number;
  quantity: number;
}

export interface OrderPayment {
  id: number;
  userOrderId: number;
  paymentMethodId: number;
  amount: number;
  amountTendered: number;
  paymentMethod: PaymentMethod;
}

export interface AddOrderPaymentDto {
  paymentMethodId: number;
  amountTendered: number;
  amount?: number; 
}

export interface Order {
  id: number;
  shiftRecordId: number;
  cashierId: number;
  receiptNumber: string;
  total: number;
  status: 'open' | 'paid' | 'voided';
  voidReason: string | null;
  createdAt: string;
  cashier: Cashier;
}

export interface CreateOrderDto {
  shiftRecordId: number;
}

export interface PayOrderDto {
  payments: AddOrderPaymentDto[];
}

export interface VoidOrderDto {
  reason: string;
}