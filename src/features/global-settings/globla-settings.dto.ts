
export interface GlobalSetting {
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
  id: string; 
}

export interface UpdateGlobalSettingDto {
  value: string | number | boolean;
}