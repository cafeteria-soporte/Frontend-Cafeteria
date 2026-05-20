import { useState, useCallback } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { shiftsService } from '../services/shifts.service';
import { ShiftRecord, ShiftQueryParams } from '../dtos/shift.dto';
import { useShiftContext } from '../contexts/shiftContext'; 
import { toast } from 'sonner';

export const useShifts = () => {
  const { 
    currentShift, 
    loadingCurrent, 
    fetchCurrentShift, 
    openShift, 
    closeShift 
  } = useShiftContext();

  const { 
    data: allShifts, 
    loading: loadingAllShifts, 
    getAll: getAllShifts, 
    getById: getShiftById
  } = useCrud<ShiftRecord, any, any>(shiftsService);

  const [myShifts, setMyShifts] = useState<ShiftRecord[]>([]);
  const [loadingMyShifts, setLoadingMyShifts] = useState(false);

  const fetchMyShifts = useCallback(async (params?: ShiftQueryParams) => {
    setLoadingMyShifts(true);
    try {
      const result = await shiftsService.getMyShifts(params);
      const dataArray = Array.isArray(result) ? result : (result.data || result.items || []);
      setMyShifts(dataArray);
      return dataArray;
    } catch (err: any) {
      toast.error('Error al cargar tu historial de turnos');
      throw err;
    } finally {
      setLoadingMyShifts(false);
    }
  }, []);

  return {
    allShifts,
    loadingAllShifts,
    getAllShifts,
    getShiftById,
    
    currentShift,
    loadingCurrent,
    myShifts,
    loadingMyShifts,
    
    fetchCurrentShift,
    fetchMyShifts,
    openShift,  
    closeShift  
  };
};