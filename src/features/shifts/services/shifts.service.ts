import { BaseService, apiClient } from '@/api/base.service'; // Ajusta la ruta a tu base.service
import { ShiftRecord, OpenShiftDto, CloseShiftDto, ShiftQueryParams } from '../dtos/shift.dto';

export class ShiftsService extends BaseService<ShiftRecord> {
  constructor() {
    super('/shift-records');
  }

  async getMyShifts(params: ShiftQueryParams = {}): Promise<any> {
    const response = await apiClient.get(`${this.endpoint}/mine`, { params });
    return response.data;
  }

  async getCurrentShift(): Promise<ShiftRecord | null> {
    try {
      const response = await apiClient.get(`${this.endpoint}/mine/current`);
      return response.data; 
    } catch (error: any) {
    
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async openShift(data: OpenShiftDto): Promise<ShiftRecord> {
    const response = await apiClient.post(`${this.endpoint}/open`, data);
    return response.data;
  }

  async closeShift(data: CloseShiftDto): Promise<ShiftRecord> {
    const response = await apiClient.post(`${this.endpoint}/close`, data);
    return response.data;
  }
}

export const shiftsService = new ShiftsService();