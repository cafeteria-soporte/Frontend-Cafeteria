import { apiClient } from "@/api/apiClient";

/**
 * Descarga un archivo desde un endpoint que responde con un blob (PDF/CSV),
 * mandando el token de auth. Dispara la descarga en el navegador.
 */
export async function downloadFromEndpoint(
  endpoint: string,
  params: Record<string, unknown>,
  filename: string,
): Promise<void> {
  const res = await apiClient.get(endpoint, { params, responseType: "blob" });

  const type =
    filename.endsWith(".csv") ? "text/csv" : "application/pdf";
  const blob = new Blob([res.data], { type });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
