import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../../shared/model/enviroment";
import {catchError, map, Observable, throwError} from "rxjs";
import {ApiResponse} from "../../../shared/model/api-response";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient
  ) { }

  upLoadImage(objectName: string, objectId: number, imageFile: File) : Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("file", imageFile);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${objectName}/${objectId}/images`, formData)
      .pipe(map(response => response.data),
        catchError(this.handleError));
  }

  getImages(objectName: string, objectId: number) : Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${objectName}/${objectId}/images`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteImage(objectName: string, objectId: number, imageId: number) : Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${objectName}/${objectId}/images`);
  }

  getImageUrl(objectName: string, fileName: string) : string {
    return `${this.apiUrl}/${objectName}/images/${fileName}`;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
