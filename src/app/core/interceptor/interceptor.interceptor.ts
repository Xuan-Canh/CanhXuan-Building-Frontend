import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const accessToken = localStorage.getItem('accessToken');

  // Clone request and add Authorization header if token exists
  const authRequest = accessToken
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    : req;

  // Send the cloned request with the token
  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - Token expired or invalid
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          // // Try to refresh the token
          // return authService.refreshToken().pipe(
          //   switchMap((response: any) => {
          //     // Save new access token
          //     localStorage.setItem('accessToken', response.accessToken);
          //
          //     // Retry the original request with new token
          //     const retryRequest = req.clone({
          //       setHeaders: {
          //         Authorization: `Bearer ${response.accessToken}`
          //       }
          //     });
          //
          //     return next(retryRequest);
          //   }),
          //   catchError((refreshError) => {
          //     // Refresh token also failed - redirect to login
          //     localStorage.clear();
          //     router.navigate(['/login']);
          //     return throwError(() => refreshError);
          //   })
          // );
        } else {
          // No refresh token - redirect to login
          localStorage.clear();
          router.navigate(['/login']);
          return throwError(() => error);
        }
      }

      // Handle 403 Forbidden - No permission
      if (error.status === 403) {
        console.error('Forbidden - Insufficient permissions');
        alert('You do not have permission to access this resource.');
      }

      // Handle other errors
      return throwError(() => error);
    })
  );
};
