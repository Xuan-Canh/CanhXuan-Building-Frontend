export interface Customer extends CustomerDto{
  id: number;
}

export interface CustomerDto {
  fullname: string;
  cccd: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  address: string;
  status: string;
  gender: string;
}
