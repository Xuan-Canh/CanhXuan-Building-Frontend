import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from "./layouts/admin/admin-header/admin-header.component";
import { AdminSidebarComponent } from "./layouts/admin/admin-sidebar/admin-sidebar.component";
import { NotificationComponent } from "./shared/notification/notification.component";
import { AdminFooterComponent } from "./layouts/admin/admin-footer/admin-footer.component";
import { SidebarService } from './core/service/sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AdminHeaderComponent,
    AdminSidebarComponent,
    NotificationComponent,
    AdminFooterComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CanhXuan-Building-Frontend';
  isSidebarCollapsed = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });
  }
}
