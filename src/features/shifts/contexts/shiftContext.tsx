import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { shiftsService } from "../services/shifts.service";
import { ShiftRecord } from "../dtos/shift.dto";
import { toast } from "sonner";

interface ShiftContextType {
  currentShift: ShiftRecord | null;
  loadingCurrent: boolean;
  fetchCurrentShift: () => Promise<ShiftRecord | null>;
  openShift: (initialFund: number) => Promise<ShiftRecord>;
  closeShift: (declaredAmount: number) => Promise<ShiftRecord>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShift, setCurrentShift] = useState<ShiftRecord | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  const fetchCurrentShift = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setCurrentShift(null);
      return null;
    }

    setLoadingCurrent(true);
    try {
      const shift = await shiftsService.getCurrentShift();
      setCurrentShift(shift);
      return shift;
    } catch (error) {
      setCurrentShift(null);
      return null;
    } finally {
      setLoadingCurrent(false);
    }
  }, []);

  const openShift = async (initialFund: number) => {
    try {
      const newShift = await shiftsService.openShift({ initialFund });
      setCurrentShift(newShift); 
      toast.success('Turno abierto exitosamente. ¡Buena jornada!');
      return newShift;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al abrir caja');
      throw err;
    }
  };

 const closeShift = async (declaredAmount: number) => {
  console.log('Intentando cerrar turno con monto declarado:', declaredAmount); 
  try {
    const closedShift = await shiftsService.closeShift({ declaredAmount });
    console.log('Turno cerrado:', closedShift);

    if (closedShift.discrepancyAlert) {
      toast.warning("Se encontró una discrepancia en el cierre. Revisa el resultado.");
    } else {
      toast.success('Turno cerrado correctamente y cuadrado.');
    }

    setCurrentShift(null);

    return closedShift;

  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Error al cerrar caja');
    throw err;
  }
};

  useEffect(() => {
    fetchCurrentShift();
  }, [fetchCurrentShift]);

  return (
    <ShiftContext.Provider value={{ currentShift, loadingCurrent, fetchCurrentShift, openShift, closeShift }}>
      {children}
    </ShiftContext.Provider>
  );
};

export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error("useShiftContext debe usarse dentro de un ShiftProvider");
  }
  return context;
};