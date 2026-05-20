import { BaseService } from '@/api/base.service';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto'; 

export class CategoryService extends BaseService<Category, CreateCategoryDto, UpdateCategoryDto> {
  constructor() {
    super('/categories'); 
  }
}

export const categoryService = new CategoryService();