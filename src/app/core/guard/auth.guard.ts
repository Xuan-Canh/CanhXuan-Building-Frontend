import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {NotificationService} from "../service/notification.service";


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const noti = inject(NotificationService);
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    router.navigate(['login']);
    noti.show('Please login to use this feature', 'info');
    return false;
  }
  return true;
};
