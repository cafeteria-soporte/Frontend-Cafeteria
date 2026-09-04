import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { shiftsAnalytics } from "../services/analytics.service";
import type {
  DateRange,
  VoidsByReason,
  VoidsByCashier,
  Discrepancy,
} from "../types";

interface State {
  voidsByReason: VoidsByReason[];
  voidsByCashier: VoidsByCashier[];
  discrepancies: Discrepancy[];
  loading: boolean;
  error: string | null;
}

const EMPTY: State = {
  voidsByReason: [],
  voidsByCashier: [],
  discrepancies: [],
  loading: true,
  error: null,
};

export function useShiftsAnalytics(range: DateRange) {
  const [state, setState] = useState<State>(EMPTY);

  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [voidsByReason, voidsByCashier, discrepancies] = await Promise.all([
        shiftsAnalytics.voidsByReason(range),
        shiftsAnalytics.voidsByCashier(range),
        shiftsAnalytics.discrepancies(range),
      ]);
      setState({
        voidsByReason,
        voidsByCashier,
        discrepancies,
        loading: false,
        error: null,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al cargar análisis de turnos";
      setState({ ...EMPTY, loading: false, error: msg });
      toast.error(msg);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
