import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse , Page} from '../../shared/model/api-response';
import { Invoice, InvoiceRequest } from '../../shared/model/invoice';
import {environment} from "../../shared/model/enviroment";
import { CrudService } from './generic/crud.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient,
    private crudService: CrudService
  ) {}

  getAll(page: number): Observable<ApiResponse<Page<Invoice>>> {
    return this.crudService.getAllWithPage('invoices', page)
  }

  getById(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`);
  }

  create(request: InvoiceRequest): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(this.apiUrl, request);
  }

  update(id: number, request: InvoiceRequest): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  markAsPaid(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.patch<ApiResponse<Invoice>>(`${this.apiUrl}/${id}/paid`, {});
  }
}
