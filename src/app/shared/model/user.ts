export interface User extends UserDto {
  id: number;
}

export interface UserDto {
  username: string;
  password: string;
  email: string;
  phone: string;
  city: string;
  role: string;
}
