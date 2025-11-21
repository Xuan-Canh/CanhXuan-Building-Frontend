import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {ApiResponse, Page} from "../../../shared/model/api-response";
import {environment} from "../../../shared/model/enviroment";
import { Contract } from '../../../shared/model/contract';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getAll(objectName: string) : Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${objectName}/all`)
      .pipe(catchError(this.handleError));
  }

  getAllWithPage(objectName: string, page?: number) : Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${objectName}?page=${page}`)
      .pipe(catchError(this.handleError));
  }

  searchWithPage(objectName: string, keyword: string, page: number = 0) : Observable<ApiResponse<Page<any>>> {
    return this.http.get<ApiResponse<Page<any>>>(`${this.apiUrl}/${objectName}/search?keyword=${keyword}&page=${page}`)
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

  export(objectName: string, objectId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${objectName}/${objectId}/export`, {
        responseType: 'blob'
    })
    .pipe(catchError(this.handleError));
  }

  exportToExcel(objectName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${objectName}/export`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    }).pipe(catchError(this.handleError));
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth error: ', error);
    const message = error.error?.message || 'Có lỗi xảy ra';
    return throwError(() => new Error(message));
  }
}
