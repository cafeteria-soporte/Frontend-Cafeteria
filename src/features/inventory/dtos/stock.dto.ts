
import { UserEntityDto } from "@/features/users/dtos/user.dto"; 
export interface StockMovementType {
  id: number;
  name: string; 
}

export interface StockMovement {
  id: number;
  productId: number;
  userId: number;
  user : UserEntityDto;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  createdAt: string; 
  movementType: StockMovementType;
}


export interface CreateStockMovementDto {
  productId: number;
  movementTypeId: number;
  quantity: number; 
  reason: string;
}

export interface StockMovementQueryParams {
  page?: number;
  limit?: number;
  productId?: number;
  movementTypeId?: number;
  from?: string;
  to?: string;  
}