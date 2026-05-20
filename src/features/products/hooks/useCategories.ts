import { useCrud } from '@/hooks/useCrud'; 
import { categoryService } from '../services/categories.service'; 
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto'; 

export const useCategories = () => {
  const { 
    data: categories, 
    loading, 
    getAll, 
    create, 
    update, 
    remove, 
    deactivate 
  } = useCrud<Category, CreateCategoryDto, UpdateCategoryDto>(categoryService);

  return {
    categories,
    loading,
    getAllCategories: getAll,
    createCategory: create,
    updateCategory: update,
    deleteCategory: remove,
    deactivateCategory: deactivate
  };
};