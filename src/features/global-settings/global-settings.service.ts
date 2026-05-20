import { BaseService } from '@/api/base.service'; // Ajusta la ruta
import { GlobalSetting, UpdateGlobalSettingDto } from './globla-settings.dto';

class GlobalSettingsService extends BaseService<GlobalSetting, any, UpdateGlobalSettingDto> {
  constructor() {
    super('/global-settings');
  }

  async getAll(params: Record<string, any> = {}): Promise<any> {
    const response = await super.getAll(params);
    
    if (response && response.data && Array.isArray(response.data)) {
      response.data = response.data.map((item: any) => ({
        ...item,
        id: item.key 
      }));
    } else if (Array.isArray(response)) {
      return response.map((item: any) => ({
        ...item,
        id: item.key
      }));
    }
    
    return response;
  }
}

export const globalSettingsService = new GlobalSettingsService();