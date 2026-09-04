import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { findAuditLogs } from "./audit.service";
import type { AuditLogRow, AuditLogQuery } from "./audit.service";

export function useAuditLogs(initial: AuditLogQuery = {}) {
  const [query, setQuery] = useState<AuditLogQuery>({ page: 1, limit: 25, ...initial });
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await findAuditLogs(query);
      setRows(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      const msg =
        err?.response?.status === 403
          ? "Solo el usuario root puede ver el registro de auditoría."
          : err?.message || "Error al cargar el registro de auditoría";
      setError(msg);
      setRows([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const setFilter = (patch: Partial<AuditLogQuery>) =>
    setQuery((q) => ({ ...q, ...patch, page: 1 }));
  const setPage = (page: number) => setQuery((q) => ({ ...q, page }));

  return { rows, meta, loading, error, query, setFilter, setPage, refetch: fetch };
}
