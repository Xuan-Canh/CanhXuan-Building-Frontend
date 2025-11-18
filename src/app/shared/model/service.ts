export interface Service extends ServiceDto{
  id: number;
}

export interface ServiceDto {
  name: string;
  description: string;
  price: number;
}
