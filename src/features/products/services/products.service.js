import { apiClient, normalizeApiList } from "@/api/apiClient";

export const productsService = {
  getAll: async () => {
    const data = await apiClient("/products");
    return normalizeApiList(data);
  },

  getLowStock: async () => {
    const data = await apiClient("/products/low-stock");
    return normalizeApiList(data);
  },

  getById: (id) => apiClient(`/products/${id}`),

  create: (data) =>
    apiClient("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiClient(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    apiClient(`/products/${id}`, {
      method: "DELETE",
    }),
};
