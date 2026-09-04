import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { salesAnalytics } from "../services/analytics.service";
import type {
  DateRange,
  GroupBy,
  SalesByPeriod,
  SalesByCategory,
  TopProduct,
  PaymentMethodShare,
} from "../types";

interface State {
  byPeriod: SalesByPeriod[];
  byCategory: SalesByCategory[];
  topProducts: TopProduct[];
  paymentMethods: PaymentMethodShare[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = {
  byPeriod: [],
  byCategory: [],
  topProducts: [],
  paymentMethods: [],
  loading: true,
  error: null,
};

export function useSalesAnalytics(range: DateRange, groupBy: GroupBy = "day") {
  const [state, setState] = useState<State>(EMPTY);

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [byPeriod, byCategory, topProducts, paymentMethods] =
        await Promise.all([
          salesAnalytics.byPeriod({ ...range, groupBy }),
          salesAnalytics.byCategory(range),
          salesAnalytics.topProducts({ ...range, limit: 8 }),
          salesAnalytics.paymentMethodShare(range),
        ]);
      setState({
        byPeriod,
        byCategory,
        topProducts,
        paymentMethods,
        loading: false,
        error: null,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar análisis de ventas";
      setState({ ...EMPTY, loading: false, error: msg });
      toast.error(msg);
    }
  }, [range.from, range.to, groupBy]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
