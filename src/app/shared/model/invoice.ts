// models/invoice.model.ts
export interface CreateInvoiceRequest {
  contractId: number;
  invoiceDate: string;
  dueDate: string;
  serviceDetails: ServiceUsageDetail[];
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
  invoiceDate: string;
  dueDate: string;
  status: string;
  roomRent: number;
  totalServiceFee: number;
  totalAmount: number;
  paidAt?: string;
  note?: string;
  customer: CustomerInfo;
  room: RoomInfo;
  serviceDetails: ServiceDetailInfo[];
}

export interface CustomerInfo {
  id: number;
  fullname: string;
  phone: string;
}

export interface RoomInfo {
  id: number;
  name: string;
  floor: number;
}

export interface ServiceDetailInfo {
  serviceName: string;
  oldReading?: number;
  newReading?: number;
  quantity: number;
  unitPrice: number;
  amount: number;
}
