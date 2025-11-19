// services/invoice.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvoiceRequest, InvoiceResponse } from '../../shared/model/invoice';
import { Contract } from '../../shared/model/contract';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/canhxuan';

  constructor(private http: HttpClient) {}

  // Lấy danh sách hợp đồng active
  getActiveContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/contracts?status=ACTIVE`);
  }

  // Lấy chi tiết hợp đồng
  getContractById(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/contracts/${id}`);
  }

  // Lấy hóa đơn gần nhất của hợp đồng (để lấy chỉ số cũ)
  getLastInvoice(contractId: number): Observable<InvoiceResponse | null> {
    return this.http.get<InvoiceResponse | null>(
      `${this.apiUrl}/invoices/last?contractId=${contractId}`
    );
  }

  // Tạo hóa đơn mới
  createInvoice(request: CreateInvoiceRequest): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${this.apiUrl}/invoices`, request);
  }

  // Tính toán preview hóa đơn
  previewInvoice(request: CreateInvoiceRequest): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(
      `${this.apiUrl}/invoices/preview`,
      request
    );
  }
}
