import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

// Subject để quản lý trạng thái refresh token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Bỏ qua các request đến endpoint refresh token để tránh vòng lặp
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  const accessToken = localStorage.getItem('accessToken');

  // Clone request và thêm Authorization header nếu có token
  const authRequest = addTokenToRequest(req, accessToken);

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Chỉ xử lý lỗi 401
      if (error.status === 401) {
        return handle401Error(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

// Helper function để thêm token vào request
function addTokenToRequest(req: any, token: string | null) {
  if (token) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return req;
}

// Xử lý lỗi 401 với cơ chế queuing requests
function handle401Error(
  req: any,
  next: any,
  authService: AuthService,
  router: Router
): Observable<any> {

  // Nếu đang refresh token, queue request này
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addTokenToRequest(req, token));
      })
    );
  }

  // Bắt đầu quá trình refresh token
  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    isRefreshing = false;
    handleLogout(router);
    return throwError(() => new Error('No refresh token available'));
  }

  return authService.refreshToken(refreshToken).pipe(
    switchMap((response: any) => {
      isRefreshing = false;

      const newAccessToken = response.accessToken;
      localStorage.setItem('accessToken', newAccessToken);

      // Thông báo cho các request đang chờ
      refreshTokenSubject.next(newAccessToken);

      // Retry request ban đầu với token mới
      return next(addTokenToRequest(req, newAccessToken));
    }),
    catchError((error) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      handleLogout(router);
      return throwError(() => error);
    })
  );
}

// Helper function để logout
function handleLogout(router: Router): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  router.navigate(['/login']);
}
