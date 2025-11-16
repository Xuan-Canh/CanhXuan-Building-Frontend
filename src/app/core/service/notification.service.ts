import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";


export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);

  notification$ = this.notificationSubject.asObservable();

  show(message: string,  type: NotificationType, duration: number = 3000) {
    console.log(`Notification: [${type}] ${message}`);
    this.notificationSubject.next({message, type, duration});
  }

  clear() {
    this.notificationSubject.next(null);
  }
}
