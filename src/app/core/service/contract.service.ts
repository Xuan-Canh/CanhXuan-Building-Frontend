import { Injectable } from '@angular/core';
import {CrudService} from "./generic/crud.service";
import {Contract, ContractDto} from "../../shared/model/contract";
import {Observable} from "rxjs";
import {ApiResponse, Page} from "../../shared/model/api-response";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../shared/model/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  private apiUrl = `${environment.apiUrl}`

  constructor(private crudService: CrudService,
    private http: HttpClient
  ) { }

  getAll() : Observable<ApiResponse<Contract[]>> {
    return this.crudService.getAll('contracts');
  }

  getAllWithPage(page?: number) : Observable<ApiResponse<Page<Contract>>> {
    return this.crudService.getAllWithPage('contracts', page);
  }

  getById(id: number): Observable<ApiResponse<Contract>> {
    return this.crudService.getById('contracts', id);
  }

  create(contractDto: ContractDto) : Observable<ApiResponse<Contract>> {
    return this.crudService.create('contracts', contractDto);
  }

  update(id: number, contract: Contract) : Observable<ApiResponse<Contract>> {
    return this.crudService.update('contracts', id, contract);
  }

  delete(id: number) : Observable<ApiResponse<void>> {
    return this.crudService.delete('contracts', id);
  }

  export(id: number): Observable<Blob> {
    return this.crudService.export('contracts',id);
  }

  sendEmai(id: number) {
    return this.http.post(`${this.apiUrl}/contracts/${id}/send-email`, {});
  }

}
