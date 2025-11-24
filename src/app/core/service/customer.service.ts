import { Injectable } from '@angular/core';
import {CrudService} from "./generic/crud.service";
import {Observable} from "rxjs";
import {ApiResponse, Page} from "../../shared/model/api-response";
import {Customer, CustomerDto} from "../../shared/model/customer";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private crudService: CrudService) { }

  getAll(page: number, size: number = 10): Observable<ApiResponse<Page<Customer>>> {
    return this.crudService.getAllWithPage('customers', page, size);
  }

  searchWithPage(keyword: string, page: number = 0) : Observable<ApiResponse<Page<Customer>>> {
    return this.crudService.searchWithPage('customers', keyword, page);
  }

  getById(id: number) : Observable<ApiResponse<Customer>> {
    return this.crudService.getById('customers', id);
  }

  create(customerDto: CustomerDto): Observable<ApiResponse<Customer>> {
    return this.crudService.create('customers', customerDto);
  }

  update(id: number, customerDto: CustomerDto) : Observable<ApiResponse<Customer>> {
    return this.crudService.update('customers', id, customerDto);
  }

  delete(id: number) : Observable<ApiResponse<void>> {
    return this.crudService.delete('customers', id);
  }
}
