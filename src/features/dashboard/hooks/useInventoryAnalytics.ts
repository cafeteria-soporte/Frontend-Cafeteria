import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { inventoryAnalytics } from "../services/analytics.service";
import type {
  InventoryFilter,
  StockMovementRow,
  ShrinkageRow,
  StockVelocityRow,
} from "../types";

interface State {
  movements: StockMovementRow[];
  shrinkage: ShrinkageRow[];
  stockVelocity: StockVelocityRow[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = {
  movements: [],
  shrinkage: [],
  stockVelocity: [],
  loading: true,
  error: null,
};

export function useInventoryAnalytics(filter: InventoryFilter) {
  const [state, setState] = useState<State>(EMPTY);

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [movements, shrinkage, stockVelocity] = await Promise.all([
        inventoryAnalytics.movements(filter),
        inventoryAnalytics.shrinkage(),
        inventoryAnalytics.stockVelocity(),
      ]);
      setState({
        movements,
        shrinkage,
        stockVelocity,
        loading: false,
        error: null,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al cargar análisis de inventario";
      setState({ ...EMPTY, loading: false, error: msg });
      toast.error(msg);
    }
  }, [filter.startDate, filter.endDate, filter.from, filter.to, filter.movementType, filter.productId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
