import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BehaviorSubject, catchError, Observable, throwError} from "rxjs";
import {User} from "../../shared/model/user";
import { ApiResponse } from '../../shared/model/api-response';
import {LoginResponse} from "../../shared/model/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'http://localhost:8080/canhxuan/auth'
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(user: User) {
    return this.http.post(`${this.authUrl}/register`, user)
      .pipe(catchError(error => this.handleError(error)));
  }

  login(username: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.authUrl}/login`, { username, password})
      .pipe(catchError(error => this.handleError(error)));
  }

  logout() {
    return this.http.post(`${this.authUrl}/logout`, {})
      .pipe(catchError(error => this.handleError(error)));
  }

  refreshToken(refreshToken: string) {
    return this.http.post(`${this.authUrl}/refresh-token`, refreshToken)
      .pipe(catchError(error => this.handleError(error)));
  }

  isLoggedIn() {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  }

  setLoggedIn(value: boolean) {
    this.loggedInSubject.next(value);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth error: ', error);
    const message = error.error?.message || 'Có lỗi xảy ra';
    return throwError(() => new Error(message));
  }

}
