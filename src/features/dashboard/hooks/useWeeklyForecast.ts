import { useState, useEffect, useCallback } from "react";
import { salesAnalytics, inventoryAnalytics } from "../services/analytics.service";

export interface StockNeed {
  productId: number;
  productName: string;
  currentStock: number;
  averageDailyUsage: number;
  weeklyUsage: number;
  deficit: number;
  daysRemaining: number;
}

export interface WeeklyForecast {
  projectedRevenue: number;
  projectedOrders: number;
  growthPct: number; // vs semana anterior
  stockNeeds: StockNeed[]; // ordenados por urgencia
  loading: boolean;
  error: string | null;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

/**
 * Proyección simple (media móvil de los últimos 7 días) de ventas de la
 * próxima semana + necesidad de stock semanal por producto.
 * No es ML — es la media de la última semana disponible, honesto y explicable.
 */
export function useWeeklyForecast() {
  const [state, setState] = useState<WeeklyForecast>({
    projectedRevenue: 0,
    projectedOrders: 0,
    growthPct: 0,
    stockNeeds: [],
    loading: true,
    error: null,
  });

  const fetchForecast = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 14);

      const [byPeriod, stockVelocity] = await Promise.all([
        salesAnalytics.byPeriod({ from: iso(from), to: iso(to), groupBy: "day" }),
        inventoryAnalytics.stockVelocity(),
      ]);

      const sorted = [...byPeriod].sort((a, b) => a.period.localeCompare(b.period));
      const last7 = sorted.slice(-7);
      const prev7 = sorted.slice(-14, -7);

      const avg = (arr: typeof last7, key: "revenue" | "orderCount") =>
        arr.length ? arr.reduce((s, r) => s + r[key], 0) / arr.length : 0;

      const avgRevenue = avg(last7, "revenue");
      const avgOrders = avg(last7, "orderCount");
      const prevAvgRevenue = avg(prev7, "revenue");

      const growthPct =
        prevAvgRevenue > 0
          ? Math.round(((avgRevenue - prevAvgRevenue) / prevAvgRevenue) * 1000) / 10
          : 0;

      const stockNeeds: StockNeed[] = stockVelocity
        .filter((v) => v.averageDailyUsage > 0)
        .map((v) => {
          const weeklyUsage = Math.ceil(v.averageDailyUsage * 7);
          return {
            productId: v.productId,
            productName: v.productName,
            currentStock: v.currentStock,
            averageDailyUsage: v.averageDailyUsage,
            weeklyUsage,
            deficit: weeklyUsage - v.currentStock,
            daysRemaining: v.daysRemaining,
          };
        })
        .filter((v) => v.deficit > 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

      setState({
        projectedRevenue: Math.round(avgRevenue * 7),
        projectedOrders: Math.round(avgOrders * 7),
        growthPct,
        stockNeeds,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Error al calcular la proyección",
      }));
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return { ...state, refetch: fetchForecast };
}
