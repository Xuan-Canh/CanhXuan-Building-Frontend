import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CreateRoomDto, Room, RoomDto, RoomImage} from '../../shared/model/room';
import {environment} from "../../shared/model/enviroment";
import {ApiResponse, Page} from "../../shared/model/api-response";
import { CrudService } from './generic/crud.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient,
    private crudService: CrudService
  ) {}

  getAll(page: number, size?: number): Observable<ApiResponse<Page<Room>>> {
    return this.crudService.getAllWithPage('rooms', page, size);
  }

  searchWithPage(keyword: string, page?: number): Observable<ApiResponse<Page<Room>>> {
    return this.crudService.searchWithPage('rooms', keyword, page);
  }

  getByBuildingId(buildingId: number): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/building/${buildingId}`);
  }

  getById(id: number): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateRoomDto): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(`${this.apiUrl}`, request);
  }

  update(id: number, roomDto: CreateRoomDto): Observable<ApiResponse<Room>> {
    return this.http.put<ApiResponse<Room>>(`${this.apiUrl}/${id}`, roomDto);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getImages(roomId: number): Observable<ApiResponse<RoomImage[]>> {
    return this.http.get<ApiResponse<RoomImage[]>>(`${this.apiUrl}/${roomId}/images`);
  }

  uploadImage(roomId: number, file: File): Observable<ApiResponse<RoomImage>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<RoomImage>>(`${this.apiUrl}/${roomId}/images`, formData);
  }

  deleteImage(roomId: number, imageId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${roomId}/images/${imageId}`);
  }

  getImageUrl(roomId: number, fileName: string): string {
    return `${this.apiUrl}/${roomId}/images/${fileName}`;
  }
}
