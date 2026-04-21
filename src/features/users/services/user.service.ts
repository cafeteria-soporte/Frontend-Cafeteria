import { BaseService, apiClient } from '@/api/base.service';
import { UserEntityDto, CreateUserDto, UpdateUserDto, UsersResponseDto } from '../dtos/user.dto';

class UserService extends BaseService<UserEntityDto, CreateUserDto, UpdateUserDto> {
  constructor() {
    super('/users');
  }
  
  async create(data: CreateUserDto): Promise<UserEntityDto> {
  // Ignoramos this.endpoint y usamos la ruta exacta del Swagger
  const response = await apiClient.post<UserEntityDto>('/auth/register', data);
  return response.data;
}
  // Sobrescribimos getAll para que use su estructura de 'items'
  async getAll(params: Record<string, any> = {}): Promise<UserEntityDto[]> {
    const response = await apiClient.get<UsersResponseDto>(this.endpoint, { params });
    console.log('Respuesta de getAll:', response.data); // LOG para verificar la estructura
    return response.data.items; // Extraemos los items según tu UsersResponseDto
  }

  // Método específico para Administradores
  async getAdmins(): Promise<UserEntityDto[]> {
    const response = await apiClient.get<UsersResponseDto>(this.endpoint, {
      params: { roleId: 2, active: true }
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
    console.log('Respuesta de getCashiers:', response.data.items); // LOG para verificar la estructura
    return response.data.data;
  }
}

export const userService = new UserService();