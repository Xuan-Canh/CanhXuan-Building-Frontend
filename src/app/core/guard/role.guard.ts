import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {NotificationService} from "../service/notification.service";

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const noti = inject(NotificationService);
  const expectedRole = route.data['roles'] as Array<string>;
  const currentRole = localStorage.getItem('role');
  if (!currentRole || !expectedRole.includes(currentRole)) {
    noti.show('Access denied. You do not have permission to view this page.', 'error');
    router.navigate(['']);
    return false;
  }
  return true;
};
