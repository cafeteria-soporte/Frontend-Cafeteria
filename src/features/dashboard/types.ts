// ─────────────────────────────────────────────────────────────────────────────
//  Tipos de los endpoints de análisis / DSS del backend (rama `test`).
//  Reflejan exactamente los *Response DTO del backend. NO inventar campos.
// ─────────────────────────────────────────────────────────────────────────────

// ── Filtros comunes ──────────────────────────────────────────────────────────

/** Rango de fechas (YYYY-MM-DD). Ventas y turnos usan from/to. */
export interface DateRange {
  from?: string;
  to?: string;
}

export type GroupBy = "day" | "week" | "month";
export type ExportFormat = "pdf" | "csv";

/** Filtro del DSS: usa startDate/endDate (no from/to) + crisisMode. */
export interface DssFilter {
  startDate?: string;
  endDate?: string;
  crisisMode?: boolean;
}

// ═══════════════════════ ANÁLISIS DE VENTAS ══════════════════════════════════
// GET /analytics/sales/*  → devuelven el array pelado.

export interface SalesByPeriod {
  period: string; // YYYY-MM-DD
  revenue: number;
  orderCount: number;
  avgTicket: number;
}

export interface SalesByCategory {
  categoryId: number;
  name: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface PaymentMethodShare {
  method: string; // 'cash' | 'card' | 'transfer' | 'mixed'
  orderCount: number;
  percentage: number;
}

// ═══════════════════════ ANÁLISIS DE TURNOS ══════════════════════════════════
// GET /analytics/shifts/*  → devuelven el array pelado (salvo :id/summary).

export interface VoidsByReason {
  reason: string;
  count: number;
  totalVoided: number;
  percentage: number;
}

export interface VoidsByCashier {
  cashierId: number;
  cashierName: string;
  count: number;
  totalVoided: number;
}

export interface Discrepancy {
  shiftRecordId: number;
  cashierId: number;
  cashierName: string;
  cashierUsername: string;
  openedAt: string;
  closedAt: string;
  initialFund: number;
  expectedAmount: number | null;
  declaredAmount: number | null;
  discrepancy: number | null;
  discrepancyAlert: boolean;
}

export interface ShiftSummary {
  shiftId: number;
  cashierId: number;
  cashierName: string;
  cashierUsername: string;
  openedAt: string;
  closedAt: string;
  financial: {
    initialFund: number;
    expectedAmount: number | null;
    declaredAmount: number | null;
    discrepancy: number | null;
    discrepancyAlert: boolean;
  };
  losses: {
    totalVoidedOrders: number;
    totalVoidedAmount: number;
    reasons: { reason: string; count: number; totalAmount: number }[];
  };
  payments: {
    totalCollected: number;
    methods: {
      paymentMethodId: number;
      paymentMethodName: string;
      count: number;
      totalAmount: number;
      percentage: number;
    }[];
  };
}

// ═══════════════════════ ANÁLISIS DE INVENTARIO ═════════════════════════════
// GET /analytics/inventory/*  → devuelven { data: [...] } (envuelto).

export interface InventoryFilter extends DateRange {
  startDate?: string; // el backend de inventario usa startDate/endDate
  endDate?: string;
  productId?: number;
  movementType?: string;
}

export interface StockMovementRow {
  id: number;
  createdAt: string;
  productId: number;
  productName: string;
  categoryName: string;
  movementType: string;
  quantity: number;
  resultingStock: number;
  estimatedValue: number;
  reason: string | null;
  registeredBy: string;
}

export interface ShrinkageRow {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalValue: number;
  reasons: (string | null)[];
  percentage: number;
  mainReason: string;
}

export interface StockVelocityRow {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  averageDailyUsage: number;
  daysRemaining: number;
  status: "ok" | "alerta" | "critico";
}

// ═══════════════════════ DSS — DASHBOARD GERENCIAL ═════════════════════════
// GET /dss/tab-*

// -- tab-principal --
export interface CashAccumulationPoint {
  hour: string; // HH:MM
  amountBs: number;
}

export interface CashierBreakdown {
  salesScore: number;
  accuracyScore: number;
  speedScore: number;
  cashHandlingScore: number;
  attendanceScore: number;
}

export interface CashierEfficiency {
  cashierName: string;
  efficiencyScore: number;
  breakdown: CashierBreakdown;
}

export interface TabPrincipal {
  shiftStatus: {
    isOpen: boolean;
    cashierName: string | null;
    cashAccumulationBs: number;
    fatigueRiskScore: number;
    cashAccumulationHistory: CashAccumulationPoint[];
  };
  holisticKpis: {
    opportunityCostBs: number;
    cashierEfficiencyRanking: CashierEfficiency[];
  };
}

// -- tab-predictivo --
export interface CriticalStock {
  productName: string;
  currentStock: number;
  teaHours: number | null;
}

export interface ExpectedShrinkage {
  productName: string;
  expectedLossQty: number;
  urgency: "alta" | "media" | "baja";
}

export interface StockTrendPoint {
  date: string;
  dayLabel: string;
  avgStock: number;
  totalShrinkage: number;
}

export interface TabPredictivo {
  inventoryPredictions: { criticalStock: CriticalStock[] };
  expectedShrinkage: ExpectedShrinkage[];
  operationsForecast: {
    peakHourStart: string | null;
    peakHourEnd: string | null;
    growingCategory: string | null;
  };
  stockTrend: StockTrendPoint[];
}

// -- tab-marketing --
export interface CrossSelling {
  baseProduct: string;
  matchedProduct: string;
  affinityPct: number;
}

export interface MenuPerformance {
  productName: string;
  matrixType: "estrella" | "vaca" | "interrogante" | "zombie";
  revenueBs: number;
}

export interface DeadHour {
  hourStart: string;
  hourEnd: string;
  affectedCategory: string;
}

export interface PriceSensitivity {
  productName: string | null;
  salesDropPct: number | null;
  priceChangeBs: number | null;
}

export interface TabMarketing {
  crossSellingAffinity: CrossSelling[];
  menuPerformanceMatrix: MenuPerformance[];
  heatmapInsights: { deadHours: DeadHour[] };
  priceSensitivity: PriceSensitivity;
}
