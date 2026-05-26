/**
 * Analytics Service - Sprint 2 DSS
 * Consumo de endpoints analíticos del backend
 * Formato y estructura de datos para gráficos
 */

import { apiClient } from '@/api/apiClient';

export interface SalesHourData {
  time: string;
  amount: number;
}

export interface TopProductData {
  name: string;
  sales: number;
}

export interface AnalyticsDateRange {
  from: string;
  to: string;
}

export interface AnalyticsResponse<T> {
  status: 'success' | 'error';
  data: T;
  timestamp: string;
}

/**
 * Obtiene ventas por hora en el período seleccionado
 */
export const getSalesByHour = async (
  dateRange: AnalyticsDateRange
): Promise<SalesHourData[]> => {
  try {
    const response = await apiClient.get<AnalyticsResponse<SalesHourData[]>>(
      `/analytics/sales/by-period`,
      {
        params: {
          startDate: dateRange.from,
          endDate: dateRange.to,
        },
      }
    );

    if (response.data.status === 'success') {
      return response.data.data;
    }

    throw new Error('Failed to fetch sales by hour');
  } catch (error) {
    console.error('Error fetching sales by hour:', error);
    throw error;
  }
};

/**
 * Obtiene top productos del período seleccionado
 */
export const getTopProducts = async (
  dateRange: AnalyticsDateRange
): Promise<TopProductData[]> => {
  try {
    const response = await apiClient.get<AnalyticsResponse<TopProductData[]>>(
      `/analytics/sales/top-products`,
      {
        params: {
          startDate: dateRange.from,
          endDate: dateRange.to,
          limit: 5,
        },
      }
    );

    if (response.data.status === 'success') {
      return response.data.data;
    }

    throw new Error('Failed to fetch top products');
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

/**
 * Exporta reporte de ventas en formato PDF o CSV
 */
export const exportSalesReport = async (
  dateRange: AnalyticsDateRange,
  format: 'pdf' | 'csv'
): Promise<Blob> => {
  try {
    const response = await apiClient.get(
      `/analytics/sales/export`,
      {
        params: {
          startDate: dateRange.from,
          endDate: dateRange.to,
          format,
        },
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error exporting ${format.toUpperCase()} report:`, error);
    throw error;
  }
};
