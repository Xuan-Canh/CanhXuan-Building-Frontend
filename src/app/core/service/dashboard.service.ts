import { Injectable } from '@angular/core';
import {CrudService} from "./generic/crud.service";
import {Observable} from "rxjs";
import {ApiResponse} from "../../shared/model/api-response";
import {DashboardDto} from "../../shared/model/dashboard";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  getSummary(): Observable<ApiResponse<DashboardDto>> {
    return this.http.get<ApiResponse<DashboardDto>>('http://localhost:8080/canhxuan/dashboard/summary');
  }
}
