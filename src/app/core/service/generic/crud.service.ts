import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {ApiResponse} from "../../../shared/model/api-response";
import {environment} from "../../../shared/model/enviroment";

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getAll(objectName: string) : Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${objectName}`)
      .pipe(catchError(this.handleError));
  }

  getById(objectName: string, id: number) : Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${objectName}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(objectName: string, data: any) : Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${objectName}`, data)
      .pipe(catchError(this.handleError));
  }

  update(objectName: string, objectId: number, data: any) : Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${objectName}/${objectId}`, data)
      .pipe(catchError(this.handleError));
  }

  delete(objectName: string, objectId: number) : Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${objectName}/${objectId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth error: ', error);
    const message = error.error?.message || 'Có lỗi xảy ra';
    return throwError(() => new Error(message));
  }
}
