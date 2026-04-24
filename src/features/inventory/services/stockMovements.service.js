import { apiClient, normalizeApiList } from "@/api/apiClient";

export const MOVEMENT_TYPES = {
  INGRESO: 1,
  AJUSTE: 2,
  MERMA: 3,
};

export const mapMovementToView = (movement = {}) => ({
  ...movement,
  id: movement.id,
  fecha: movement.createdAt ?? movement.date ?? movement.timestamp ?? "",
  producto:
    movement.product?.name ??
    movement.productName ??
    movement.producto ??
    `Producto #${movement.productId ?? ""}`,
  tipo:
    movement.movementType?.name ??
    movement.typeName ??
    movement.tipo ??
    "Movimiento",
  movementTypeId: movement.movementTypeId ?? movement.movementType?.id,
  cantidad: Number(movement.quantity ?? movement.cantidad ?? 0),
  stockResultante:
    movement.resultingStock ??
    movement.stockResultante ??
    movement.newStock ??
    "—",
  usuario:
    movement.user?.username ?? movement.username ?? movement.usuario ?? "—",
  detalle: movement.reason ?? movement.detalle ?? movement.motivo ?? "—",
});

export const mapMovementToApi = (form = {}) => ({
  productId: Number(form.productId),
  movementTypeId: Number(form.movementTypeId),
  quantity: Number(form.quantity),
  reason: form.reason ?? "",
});

export const stockMovementsService = {
  async getAll() {
    const response = await apiClient("/stock-movements");
    return normalizeApiList(response).map(mapMovementToView);
  },

  async getByProduct(productId) {
    const response = await apiClient(
      `/stock-movements/by-product/${productId}`,
    );
    return normalizeApiList(response).map(mapMovementToView);
  },

  async getById(id) {
    const response = await apiClient(`/stock-movements/${id}`);
    return mapMovementToView(response);
  },

  create(data) {
    return apiClient("/stock-movements", {
      method: "POST",
      body: JSON.stringify(mapMovementToApi(data)),
    });
  },
};
