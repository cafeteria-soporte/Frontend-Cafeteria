import { BaseService, apiClient } from '@/api/base.service'; 
import { Product, CreateProductDto, UpdateProductDto } from '../dto/product.dto'; 

export class ProductsService extends BaseService<Product, CreateProductDto, UpdateProductDto> {
  constructor() {
    super('/products');
  }

  async getLowStock(): Promise<Product[]> {
    const response = await apiClient.get(`${this.endpoint}/low-stock`);
    
    return response.data; 
  }
}

export const productsService = new ProductsService();