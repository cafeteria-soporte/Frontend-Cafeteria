import { apiClient } from "@/api/apiClient";

export interface AuditLogRow {
  id: number;
  usernameSnapshot: string | null;
  roleSnapshot: string | null;
  action: string;
  module: string;
  affectedEntity: string | null;
  entityId: number | null;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  action?: string;
  module?: string;
  username?: string;
  from?: string;
  to?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; pages: number };
}

/** GET /audit-log — solo root. Devuelve { data, meta }. */
export async function findAuditLogs(
  query: AuditLogQuery,
): Promise<Paginated<AuditLogRow>> {
  const res = await apiClient.get("/audit-log", { params: query });
  const d = res.data;
  return {
    data: Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [],
    meta: d?.meta ?? { page: 1, limit: query.limit ?? 20, total: 0, pages: 1 },
  };
}
