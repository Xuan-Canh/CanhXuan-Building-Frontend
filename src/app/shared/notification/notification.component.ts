import {Component, OnInit} from '@angular/core';
import {Notification, NotificationService} from "../../core/service/notification.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit{
  notification: Notification | null = null;

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit() {
    console.log('NotificationComponent initialized');
    this.notificationService.notification$.subscribe((notification) => {
      this.notification = notification;
      if (notification?.duration) {
        setTimeout(() => this.notification = null, notification.duration);
      }
    });
  }
}
