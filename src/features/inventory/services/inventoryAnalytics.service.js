import { API_BASE_URL, apiClient, normalizeApiList } from "@/api/apiClient";

const today = new Date();
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 7);

export const defaultInventoryAnalyticsFilters = {
  startDate: sevenDaysAgo.toISOString().slice(0, 10),
  endDate: today.toISOString().slice(0, 10),
  productId: "",
  movementType: "",
  reason: "",
};

const cleanFilters = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.append(key, String(value).trim());
    }
  });

  return params.toString();
};

const withQuery = (endpoint, filters = {}) => {
  const query = cleanFilters(filters);
  return query ? `${endpoint}?${query}` : endpoint;
};

export const mapInventoryMovementToView = (movement = {}) => ({
  id:
    movement.id ??
    movement.movementId ??
    movement.stockMovementId ??
    crypto.randomUUID?.() ??
    `${movement.productId}-${movement.createdAt}`,
  fecha:
    movement.fecha ??
    movement.createdAt ??
    movement.date ??
    movement.timestamp ??
    movement.movementDate ??
    "",
  producto:
    movement.producto ??
    movement.productName ??
    movement.product?.name ??
    movement.product?.nombre ??
    `Producto #${movement.productId ?? ""}`,
  productId: movement.productId ?? movement.product?.id ?? "",
  categoria:
    movement.categoria ??
    movement.categoryName ??
    movement.category?.name ??
    movement.product?.category?.name ??
    "Sin categoría",
  tipo:
    movement.tipo ??
    movement.movementType?.name ??
    movement.movementTypeName ??
    movement.typeName ??
    movement.type ??
    "Movimiento",
  cantidad: Number(movement.cantidad ?? movement.quantity ?? movement.qty ?? 0),
  stockResultante:
    movement.stockResultante ??
    movement.resultingStock ??
    movement.newStock ??
    movement.currentStock ??
    "—",
  usuario:
    movement.usuario ??
    movement.registeredBy ??
    movement.userName ??
    movement.user?.username ??
    movement.user?.name ??
    "—",
  motivo:
    movement.motivo ??
    movement.reason ??
    movement.detail ??
    movement.detalle ??
    "—",
  valorEstimado: Number(
    movement.valorEstimado ?? movement.estimatedValue ?? movement.totalValue ?? 0,
  ),
  raw: movement,
});

export const mapShrinkageToView = (item = {}) => ({
  id:
    item.productId ??
    item.id ??
    item.productName ??
    item.producto ??
    item.reason ??
    crypto.randomUUID?.(),
  producto:
    item.producto ??
    item.productName ??
    item.product?.name ??
    item.name ??
    "Sin nombre",
  productId: item.productId ?? item.product?.id ?? "",
  motivo: item.motivo ?? item.reason ?? item.shrinkageReason ?? "—",
  cantidad: Number(item.cantidad ?? item.totalQuantity ?? item.quantity ?? item.units ?? 0),
  valor: Number(
    item.valor ?? item.totalValue ?? item.estimatedValue ?? item.amount ?? item.value ?? 0,
  ),
  porcentaje: Number(item.porcentaje ?? item.percentage ?? 0),
});

export const mapStockVelocityToView = (item = {}) => {
  const daysRemaining = Number(
    item.daysRemaining ?? item.diasRestantes ?? item.estimatedDaysRemaining ?? 0,
  );

  return {
    id: item.productId ?? item.id ?? item.productName ?? crypto.randomUUID?.(),
    producto:
      item.producto ?? item.productName ?? item.product?.name ?? item.name ?? "Sin nombre",
    productId: item.productId ?? item.product?.id ?? "",
    stockActual: Number(item.currentStock ?? item.stockActual ?? item.stock ?? 0),
    stockMinimo: Number(item.minStock ?? item.stockMinimo ?? item.minimumStock ?? 0),
    velocidadDiaria: Number(
      item.dailyVelocity ?? item.averageDailyUsage ?? item.velocidadDiaria ?? 0,
    ),
    diasRestantes: Number.isFinite(daysRemaining) ? daysRemaining : 0,
    estado:
      item.status ??
      item.estado ??
      (daysRemaining <= 0
        ? "sin_stock"
        : daysRemaining <= 3
          ? "critico"
          : daysRemaining <= 7
            ? "alerta"
            : "ok"),
  };
};

const downloadFromEndpoint = async (endpoint, filters, format) => {
  const token = localStorage.getItem("accessToken");
  const query = cleanFilters({ ...filters, format });
  const response = await fetch(`${API_BASE_URL}${endpoint}?${query}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `No se pudo exportar ${format.toUpperCase()}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") ?? "";
  const match = contentDisposition.match(/filename="?([^";]+)"?/i);
  const fileName = match?.[1] ?? `inventario-dss.${format}`;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const inventoryAnalyticsService = {
  async getMovements(filters = defaultInventoryAnalyticsFilters) {
    const response = await apiClient(withQuery("/analytics/inventory/movements", filters));
    return normalizeApiList(response).map(mapInventoryMovementToView);
  },

  async getShrinkage(filters = defaultInventoryAnalyticsFilters) {
    const response = await apiClient(withQuery("/analytics/inventory/shrinkage", filters));
    return normalizeApiList(response).map(mapShrinkageToView);
  },

  async getStockVelocity(filters = defaultInventoryAnalyticsFilters) {
    const response = await apiClient(withQuery("/analytics/inventory/stock-velocity", filters));
    return normalizeApiList(response).map(mapStockVelocityToView);
  },

  async exportInventoryReport(filters = defaultInventoryAnalyticsFilters, format = "csv") {
    const safeFormat = format === "pdf" ? "pdf" : "csv";

    try {
      await downloadFromEndpoint("/analytics/inventory/export", filters, safeFormat);
    } catch {
      await downloadFromEndpoint("/analytics/inventory/movements/export", filters, safeFormat);
    }
  },
};
