import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { dssService } from "../services/dss.service";
import type {
  DssFilter,
  TabPrincipal,
  TabPredictivo,
  TabMarketing,
} from "../types";

interface State {
  principal: TabPrincipal | null;
  predictivo: TabPredictivo | null;
  marketing: TabMarketing | null;
  loading: boolean;
  error: string | null;
}

const EMPTY: State = {
  principal: null,
  predictivo: null,
  marketing: null,
  loading: true,
  error: null,
};

/**
 * Trae los 3 tabs del DSS en paralelo. Un solo filtro (fechas + crisisMode).
 */
export function useDss(filter: DssFilter) {
  const [state, setState] = useState<State>(EMPTY);

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [principal, predictivo, marketing] = await Promise.all([
        dssService.tabPrincipal(filter),
        dssService.tabPredictivo(filter),
        dssService.tabMarketing(filter),
      ]);
      setState({
        principal,
        predictivo,
        marketing,
        loading: false,
        error: null,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar el DSS";
      setState({ ...EMPTY, loading: false, error: msg });
      toast.error(msg);
    }
  }, [filter.startDate, filter.endDate, filter.crisisMode]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
