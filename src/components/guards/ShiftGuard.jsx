import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useShifts } from "@/features/shifts/hooks/useShifts";
import { ROUTES } from "@/utils/constants";

export const ShiftGuard = () => {
  const { currentShift, loadingCurrent, fetchCurrentShift } = useShifts();
  const location = useLocation();

  useEffect(() => {
    fetchCurrentShift();
  }, [fetchCurrentShift]);

  if (loadingCurrent) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Verificando estado de caja...</p>
        </div>
      </div>
    );
  }

  if (!currentShift) {
    return <Navigate to={ROUTES.PRE_TURNO} state={{ from: location }} replace />;
  }

  return <Outlet />;
};