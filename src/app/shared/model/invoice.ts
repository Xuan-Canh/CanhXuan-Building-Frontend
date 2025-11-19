import {Contract} from "./contract";
import {Service} from "./service";

export interface Invoice {
  id: number;
  contract: Contract;
  invoiceDate: string; // ISO date string
  dueDate: string;
  roomRent: number;
  totalServiceFee: number;
  totalAmount: number;
  status: string; // 'UNPAID' | 'PAID' | 'OVERDUE'
  note?: string;
  paidAt?: string; // ISO datetime string
  serviceDetails: InvoiceServiceDetail[];
}

export interface InvoiceRequest {
  contractId: number;
  invoiceDate: string;
  dueDate: string;
  serviceUsageDetails: ServiceUsageDetail[];
  note?: string;
}

export interface ServiceUsageDetail {
  serviceId: number;
  oldReading?: number;
  newReading?: number;
  quantity?: number;
}


export interface InvoiceResponse {
  id: number;
  contract: Contract;
  invoiceDate: string;
  dueDate: string;
  roomRent: number;
  totalServiceFee: number;
  totalAmount: number;
  status: string;
  note?: string;
  paidAt?: string;
  serviceDetail: InvoiceServiceDetail[];
}

export interface InvoiceServiceDetail {
  id: number;
  service: Service;
  oldReading?: number;
  newReading?: number;
  quantity: number;
  unitPrice: number;
  amount: number;
}
