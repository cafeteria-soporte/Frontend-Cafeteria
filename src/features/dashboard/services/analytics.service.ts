import { apiClient } from "@/api/apiClient";
import { downloadFromEndpoint } from "../lib/download";
import type {
  DateRange,
  GroupBy,
  ExportFormat,
  SalesByPeriod,
  SalesByCategory,
  TopProduct,
  PaymentMethodShare,
  VoidsByReason,
  VoidsByCashier,
  Discrepancy,
  ShiftSummary,
  InventoryFilter,
  StockMovementRow,
  ShrinkageRow,
  StockVelocityRow,
} from "../types";

// El backend de inventario responde { data: [...] }; ventas/turnos responden [...] pelado.
const unwrap = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  const d = (payload as { data?: unknown })?.data;
  return Array.isArray(d) ? (d as T[]) : [];
};

// ═══════════════════════ ANÁLISIS DE VENTAS ══════════════════════════════════

export const salesAnalytics = {
  byPeriod: async (
    range: DateRange & { groupBy?: GroupBy },
  ): Promise<SalesByPeriod[]> => {
    const res = await apiClient.get("/analytics/sales/by-period", {
      params: { from: range.from, to: range.to, groupBy: range.groupBy ?? "day" },
    });
    return unwrap<SalesByPeriod>(res.data);
  },

  byCategory: async (range: DateRange): Promise<SalesByCategory[]> => {
    const res = await apiClient.get("/analytics/sales/by-category", {
      params: { from: range.from, to: range.to },
    });
    return unwrap<SalesByCategory>(res.data);
  },

  topProducts: async (
    range: DateRange & { limit?: number },
  ): Promise<TopProduct[]> => {
    const res = await apiClient.get("/analytics/sales/top-products", {
      params: { from: range.from, to: range.to, limit: range.limit ?? 10 },
    });
    return unwrap<TopProduct>(res.data);
  },

  paymentMethodShare: async (range: DateRange): Promise<PaymentMethodShare[]> => {
    const res = await apiClient.get("/analytics/sales/payment-methods", {
      params: { from: range.from, to: range.to },
    });
    return unwrap<PaymentMethodShare>(res.data);
  },

  export: (range: DateRange, format: ExportFormat = "csv"): Promise<void> =>
    downloadFromEndpoint(
      "/analytics/sales/export",
      { from: range.from, to: range.to, format },
      `reporte-ventas.${format}`,
    ),
};

// ═══════════════════════ ANÁLISIS DE TURNOS ══════════════════════════════════

export const shiftsAnalytics = {
  voidsByReason: async (range: DateRange): Promise<VoidsByReason[]> => {
    const res = await apiClient.get("/analytics/shifts/voids", {
      params: { from: range.from, to: range.to },
    });
    return unwrap<VoidsByReason>(res.data);
  },

  voidsByCashier: async (range: DateRange): Promise<VoidsByCashier[]> => {
    const res = await apiClient.get("/analytics/shifts/voids/by-cashier", {
      params: { from: range.from, to: range.to },
    });
    return unwrap<VoidsByCashier>(res.data);
  },

  discrepancies: async (range: DateRange): Promise<Discrepancy[]> => {
    const res = await apiClient.get("/analytics/shifts/discrepancies", {
      params: { from: range.from, to: range.to },
    });
    return unwrap<Discrepancy>(res.data);
  },

  shiftSummary: async (shiftId: number | string): Promise<ShiftSummary> => {
    const res = await apiClient.get(`/analytics/shifts/${shiftId}/summary`);
    return res.data as ShiftSummary;
  },

  exportDiscrepancies: (
    range: DateRange,
    format: ExportFormat = "csv",
  ): Promise<void> =>
    downloadFromEndpoint(
      "/analytics/shifts/discrepancies/export",
      { from: range.from, to: range.to, format },
      `reporte-descuadres.${format}`,
    ),
};

// ═══════════════════════ ANÁLISIS DE INVENTARIO ═════════════════════════════

export const inventoryAnalytics = {
  movements: async (filter: InventoryFilter = {}): Promise<StockMovementRow[]> => {
    const res = await apiClient.get("/analytics/inventory/movements", {
      params: {
        startDate: filter.startDate ?? filter.from,
        endDate: filter.endDate ?? filter.to,
        productId: filter.productId,
        movementType: filter.movementType,
      },
    });
    return unwrap<StockMovementRow>(res.data);
  },

  shrinkage: async (): Promise<ShrinkageRow[]> => {
    const res = await apiClient.get("/analytics/inventory/shrinkage");
    return unwrap<ShrinkageRow>(res.data);
  },

  stockVelocity: async (): Promise<StockVelocityRow[]> => {
    const res = await apiClient.get("/analytics/inventory/stock-velocity");
    return unwrap<StockVelocityRow>(res.data);
  },

  exportMovements: (
    filter: InventoryFilter,
    format: ExportFormat = "csv",
  ): Promise<void> =>
    downloadFromEndpoint(
      "/analytics/inventory/movements/export",
      {
        format,
        startDate: filter.startDate ?? filter.from,
        endDate: filter.endDate ?? filter.to,
        productId: filter.productId,
        movementType: filter.movementType,
      },
      `reporte-inventario.${format}`,
    ),
};
