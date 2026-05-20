import { BaseService, apiClient } from '@/api/base.service';
import { UserEntityDto, CreateUserDto, UpdateUserDto, UsersResponseDto } from '../dtos/user.dto';

class UserService extends BaseService<UserEntityDto, CreateUserDto, UpdateUserDto> {
  constructor() {
    super('/users');
  }
  
  async create(data: CreateUserDto): Promise<UserEntityDto> {
  const response = await apiClient.post<UserEntityDto>('/auth/register', data);
  return response.data;
}
  async getAll(params: Record<string, any> = {}): Promise<UserEntityDto[]> {
    const response = await apiClient.get<UsersResponseDto>(this.endpoint, { params });
    console.log('Respuesta de getAll:', response.data); 
    return response.data.items; 
  }

  async getAdmins(): Promise<UserEntityDto[]> {
    const response = await apiClient.get<UsersResponseDto>(this.endpoint, {
      params: { roleId: 2 }
    });
    console.log('Respuesta de getAdmins:', response.data.data); // LOG para verificar la estructura
    return response.data.data;
    
  }

  async getCashiers(): Promise<UserEntityDto[]> {
    const response = await apiClient.get<UsersResponseDto>(this.endpoint, {
      params: { 
        roleId: 3, 
       
      }
    });
    console.log('Respuesta de getCashiers:', response.data.items);
    return response.data.data;
  }
}

export const userService = new UserService();