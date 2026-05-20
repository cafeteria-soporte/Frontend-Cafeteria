// useConfig.ts
import { useState } from 'react';
import { useCrud } from '@/hooks/useCrud'; // Ajusta la ruta
import { globalSettingsService } from './global-settings.service';
import { GlobalSetting, UpdateGlobalSettingDto } from './globla-settings.dto';
import { toast } from 'sonner';

export const useConfig = () => {
  const crud = useCrud<GlobalSetting, any, UpdateGlobalSettingDto>(globalSettingsService);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const saveAllSettings = async (payload: Record<string, string | number | boolean>) => {
    setIsSavingBulk(true);
    try {
      const keys = Object.keys(payload);

  
      const updatePromises = keys.map((key) => {
        return crud.update(key, { value: payload[key] });
      });

      await Promise.all(updatePromises);
      
      toast.success('Todas las configuraciones se guardaron correctamente');
      return true;
    } catch (error) {
      console.error('Error al guardar configuraciones en lote:', error);
      toast.error('Hubo un error al guardar algunas configuraciones');
      return false;
    } finally {
      setIsSavingBulk(false);
    }
  };

  return {
    settings: crud.data,
    loadingSettings: crud.loading,
    fetchSettings: crud.getAll,
    
    saveAllSettings,
    isSavingBulk,
  };
};