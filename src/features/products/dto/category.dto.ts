export interface Category {
  id: number;
  name: string;
  active: boolean;
}

export interface CreateCategoryDto {
  name: string;
  active: boolean;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  active?: boolean;
}