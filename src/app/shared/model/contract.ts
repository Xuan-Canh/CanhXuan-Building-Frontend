import { Customer } from "./customer";
import { Room } from "./room";
import { Service } from "./service";

export interface ContractDto {
  customer: Customer;
  roomId: number;
  startDate: Date;
  endDate: Date;
  depositAmount: number;
  monthlyRent: number;
  paymentDueDate: number;
  note: string;
  services: Service[];
}


export interface Contract {
  id: number;
  customer: Customer;
  room: Room;
  startDate: Date;
  endDate: Date;
  depositAmount: number;
  monthlyRent: number;
  paymentDueDate: number;
  status: string;
  note: string;
  services: Service[];
}

