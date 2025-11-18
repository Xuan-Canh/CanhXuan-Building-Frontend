import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Room, RoomDto, RoomImage} from '../../shared/model/room';
import {environment} from "../../shared/model/enviroment";
import {ApiResponse} from "../../shared/model/api-response";

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(this.apiUrl);
  }

  getByName(name: string): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/search?name=${name}`);
  }

  getByBuildingId(buildingId: number): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/building/${buildingId}`);
  }

  getById(id: number): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/${id}`);
  }

  create(buildingId: number, roomDto: RoomDto): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(`${this.apiUrl}/building/${buildingId}`, roomDto);
  }

  update(id: number, roomDto: RoomDto): Observable<ApiResponse<Room>> {
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
