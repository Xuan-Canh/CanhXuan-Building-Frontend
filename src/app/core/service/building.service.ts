import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Building, CreateBuildingDto} from "../../shared/model/building";
import {ApiResponse, Page} from "../../shared/model/api-response";
import {Observable} from "rxjs";
import {CrudService} from "./generic/crud.service";

@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  constructor(
    private crudService: CrudService
  ) { }

  getAll(page: number): Observable<ApiResponse<Page<Building>>> {
    return this.crudService.getAllWithPage('buildings', page);
  }

  getById(id: number): Observable<ApiResponse<Building>> {
    return this.crudService.getById('buildings', id);
  }

  create(building: CreateBuildingDto): Observable<ApiResponse<Building>> {
    return this.crudService.create('buildings', building);
  }

  update(buildingId: number, building: CreateBuildingDto): Observable<ApiResponse<Building>> {
    return this.crudService.update('buildings', buildingId, building);
  }

  delete(buildingId: number): Observable<ApiResponse<Building>> {
    return this.crudService.delete('buildings', buildingId);
  }
}
