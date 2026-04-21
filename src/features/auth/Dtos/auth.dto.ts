
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  active: boolean;
  role: UserRole;
}

export interface LoginResponseDto {
  accessToken: string;
  requiresPwdChange: boolean;
  user: User;
}