import { apiClient } from "@/api/apiClient";

export const categoriesService = {
  getAll: () => apiClient("/categories"),
  getById: (id) => apiClient(`/categories/${id}`),

  create: (data) =>
    apiClient("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiClient(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
