/**
 * Hook useAnalytics - Sprint 2 DSS
 * Maneja el consumo de datos analíticos y estado de carga
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSalesByHour,
  getTopProducts,
  SalesHourData,
  TopProductData,
  AnalyticsDateRange,
} from '../services/analyticsService';

interface UseAnalyticsState {
  salesByHour: SalesHourData[];
  topProducts: TopProductData[];
  isLoading: boolean;
  error: string | null;
}

interface UseAnalyticsReturn extends UseAnalyticsState {
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar datos analíticos
 */
export const useAnalytics = (dateRange: AnalyticsDateRange): UseAnalyticsReturn => {
  const [state, setState] = useState<UseAnalyticsState>({
    salesByHour: [],
    topProducts: [],
    isLoading: true,
    error: null,
  });

  /**
   * Obtiene datos de ambos endpoints
   */
  const fetchAnalyticsData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [salesData, productsData] = await Promise.all([
        getSalesByHour(dateRange),
        getTopProducts(dateRange),
      ]);

      setState({
        salesByHour: salesData,
        topProducts: productsData,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching analytics data';
      setState({
        salesByHour: [],
        topProducts: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  }, [dateRange]);

  /**
   * Efecto: Obtiene datos cuando cambia el rango de fechas
   */
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, fetchAnalyticsData]);

  return {
    ...state,
    refetch: fetchAnalyticsData,
  };
};
