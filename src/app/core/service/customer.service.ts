import { Injectable } from '@angular/core';
import {CrudService} from "./generic/crud.service";
import {Observable} from "rxjs";
import {ApiResponse} from "../../shared/model/api-response";
import {Customer, CustomerDto} from "../../shared/model/customer";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private crudService: CrudService) { }

  getAll(): Observable<ApiResponse<Customer[]>> {
    return this.crudService.getAll('customers');
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
