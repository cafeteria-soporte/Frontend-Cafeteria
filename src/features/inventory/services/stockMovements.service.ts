// stock.service.ts
import { BaseService, apiClient } from '@/api/base.service'; // Ajusta la ruta a tu base.service
import { 
  StockMovement, 
  CreateStockMovementDto, 
  StockMovementType,
  StockMovementQueryParams
} from '../dtos/stock.dto';

class StockMovementTypesService extends BaseService<StockMovementType> {
  constructor() {
    super('/stock-movement-types');
  }
}

class StockMovementsService extends BaseService<StockMovement, CreateStockMovementDto> {
  constructor() {
    super('/stock-movements');
  }

  async getByProduct(productId: number | string, params: StockMovementQueryParams = {}): Promise<any> {
    const response = await apiClient.get(`${this.endpoint}/by-product/${productId}`, { params });
    return response.data;
  }
}

export const stockMovementTypesService = new StockMovementTypesService();
export const stockMovementsService = new StockMovementsService();