import { Injectable } from '@angular/core';
import {CrudService} from "./generic/crud.service";
import {Observable} from "rxjs";
import {ApiResponse, Page} from "../../shared/model/api-response";
import {Service, ServiceDto} from "../../shared/model/service";

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private crudService: CrudService) { }

  getAll(page?: number): Observable<ApiResponse<Page<Service>>> {
    return this.crudService.getAll('services', page);
  }

  getById(id: number): Observable<ApiResponse<Service>> {
    return this.crudService.getById('services', id);
  }

  create(service: ServiceDto): Observable<ApiResponse<Service>> {
    return this.crudService.create('services', service);
  }

  update(id: number, service: ServiceDto): Observable<ApiResponse<Service>> {
    return this.crudService.update('services', id, service);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.crudService.delete('services', id);
  }
}
