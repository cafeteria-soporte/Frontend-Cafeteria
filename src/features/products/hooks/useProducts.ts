import { useState, useCallback } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { productsService } from '../services/products.service';
import { Product, CreateProductDto, UpdateProductDto} from '../dto/product.dto';
import { toast } from 'sonner';

export const useProducts = () => {
  const { 
    data: products, 
    loading: loadingProducts, 
    getAll, 
    create, 
    update, 
    remove, 
    deactivate 
  } = useCrud<Product, CreateProductDto, UpdateProductDto>(productsService);

  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loadingLowStock, setLoadingLowStock] = useState<boolean>(false);

  const fetchLowStock = useCallback(async () => {
    setLoadingLowStock(true);
    try {
      const result = await productsService.getLowStock();
      setLowStockProducts(result);
      console.log('Productos con bajo stock obtenidos:', result); // Debugging
      return result;
    } catch (err: any) {
      toast.error('Error al obtener productos con bajo stock');
      throw err;
    } finally {
      setLoadingLowStock(false);
    }
  }, []);

  return {
    products,
    loadingProducts,
    getAllProducts: getAll,
    createProduct: create,
    updateProduct: update,
    deleteProduct: remove, 
    deactivateProduct: deactivate,
    
    lowStockProducts,
    loadingLowStock,
    getLowStockProducts: fetchLowStock,
  };
};