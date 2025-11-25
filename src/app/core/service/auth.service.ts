import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {BehaviorSubject, catchError, Observable, throwError} from "rxjs";
import {User, UserDto} from "../../shared/model/user";
import { ApiResponse } from '../../shared/model/api-response';
import {LoginResponse} from "../../shared/model/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = 'http://localhost:8080/canhxuan/auth'
  private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  private userAvatarSubject = new BehaviorSubject<string>('assets/avatar.png');
  private roleSubject = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  loggedIn$ = this.loggedInSubject.asObservable();
  userAvatar$ = this.userAvatarSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(userDto: UserDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.authUrl}/register`, userDto)
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

  forgotPassword(email: string) : Observable<any>{
    return this.http.post<any>(`${this.authUrl}/forgot-password`, { email })
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

  setUserAvatar(avatarUrl: string) {
    localStorage.setItem('userAvatar', avatarUrl);
    this.userAvatarSubject.next(avatarUrl);
  }

  setRole(role: string) {
    localStorage.setItem('role', role);
    this.roleSubject.next(role);
  }

  getRole() {
    return this.roleSubject.value;
  }


  private handleError(error: HttpErrorResponse) {
    console.error('Auth error: ', error);
    const message = error.error?.message || 'Có lỗi xảy ra';
    return throwError(() => new Error(message));
  }

}
