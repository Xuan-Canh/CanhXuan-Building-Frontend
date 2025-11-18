import { Customer } from "./customer";
import { Room } from "./room";

export interface ContractDto {
  customerId: number;
  roomId: number;
  startDate: Date;
  endDate: Date;
  depositAmount: number;
  monthlyRent: number;
  paymentDueDate: number;
  note: string;
}

export interface Contract{
  id: number;
  customer: Customer;
  room: Room;
  startDate: Date;
  endDate: Date;
  depositAmount: number;
  monthlyRent: number;
  paymentDueDate: number;
  note: string;
}
