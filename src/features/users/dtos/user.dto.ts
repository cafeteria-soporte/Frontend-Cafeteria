// Define el rol dentro del objeto usuario
export interface UserRoleDto {
  id: number;
  name: string;
}

// Representación completa del usuario (Response estándar)
export interface UserEntityDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  active: boolean;
  createdAt: string; // Formato ISO Date string
  requiresPwdChange: boolean;
  role: UserRoleDto;
}

// Datos necesarios para crear un nuevo usuario (POST /user)
export interface CreateUserDto {
  username: string;
  fullName: string;
  email: string;
  password?: string; // Opcional dependiendo de la lógica de negocio, requerido en Swagger
  roleId: number;
}

// Datos para actualizar un usuario (PATCH /user/{id})
// Todos los campos son opcionales (Partial)
export interface UpdateUserDto extends Partial<CreateUserDto> {
  active?: boolean;
}

// Estructura de metadatos de paginación (GET /user)
export interface PaginationMetaDto {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

// Respuesta del endpoint principal de usuarios paginados (GET /user)
export interface UsersResponseDto {
  [x: string]: UserEntityDto[] | PromiseLike<UserEntityDto[]>;
  items: UserEntityDto[];
  meta: PaginationMetaDto;
}