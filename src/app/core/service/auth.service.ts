import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, throwError} from "rxjs";
import {User} from "../../shared/model/user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'http:http://localhost:8080/canhxuan/auth'

  constructor(private http: HttpClient) { }

  register(user: User) {
    return this.http.post(`${this.authUrl}/register`, user)
      .pipe(catchError(error => this.handleError(error)));
  }

  login(username: string, password: string) {
    return this.http.post(`${this.authUrl}/login`, { username, password})
      .pipe(catchError(error => this.handleError(error)));
  }

  logout() {
    return this.http.post(`${this.authUrl}/logout`, {})
      .pipe(catchError(error => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth error: ', error);
    return throwError(() => new Error(error.message));
  }

}
