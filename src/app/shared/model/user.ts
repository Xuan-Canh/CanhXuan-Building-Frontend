export interface UserDto {
  id: number
  username: string;
  password: string;
  email: string;
  phone: string;
  city: string;
  role: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  phone: string;
  city: string;
  role: string;
}
