
export interface ProductCategoryInfo {
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
  category: ProductCategoryInfo;
}

export interface CreateProductDto {
  categoryId: number;
  name: string;
  description: string;
  salePrice: number;
  minStock: number;
  imageUrl: string;
  active: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  active?: boolean;
  categoryId?: number; 
}