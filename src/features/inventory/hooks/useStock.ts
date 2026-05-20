import { useState, useCallback } from 'react';
import { useCrud } from '../../../hooks/useCrud';
import { stockMovementsService, stockMovementTypesService } from '../services/stockMovements.service';
import { 
  StockMovement, 
  CreateStockMovementDto, 
  StockMovementType,
  StockMovementQueryParams 
} from '../dtos/stock.dto';
import { toast } from 'sonner';

export const useStock = () => {
  const { 
    data: movements, 
    loading: loadingMovements, 
    getAll: getAllMovements, 
    create: createMovement 
  } = useCrud<StockMovement, CreateStockMovementDto, any>(stockMovementsService);

  const [movementTypes, setMovementTypes] = useState<StockMovementType[]>([]);
  const [productHistory, setProductHistory] = useState<StockMovement[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchMovementTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const result = await stockMovementTypesService.getAll({ limit: 100 }); 
      const dataArray = Array.isArray(result) ? result : (result.data || result.items || []);
      setMovementTypes(dataArray);
      return dataArray;
    } catch (err: any) {
      toast.error('Error al cargar tipos de movimiento');
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  const fetchProductHistory = useCallback(async (productId: number | string, params?: StockMovementQueryParams) => {
    setLoadingHistory(true);
    try {
      const result = await stockMovementsService.getByProduct(productId, params);
      const dataArray = Array.isArray(result) ? result : (result.data || result.items || []);
      setProductHistory(dataArray);
      return dataArray;
    } catch (err: any) {
      toast.error('Error al cargar el historial del producto');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  return {
    movements,
    loadingMovements,
    getAllMovements,
    
    movementTypes,
    loadingTypes,
    fetchMovementTypes,
    createMovement,
    
    productHistory,
    loadingHistory,
    fetchProductHistory
  };
};