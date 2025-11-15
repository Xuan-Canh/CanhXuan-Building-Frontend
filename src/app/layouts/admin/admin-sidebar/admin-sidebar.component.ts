// src/app/layouts/admin/admin-sidebar/admin-sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Tòa nhà', route: '/buildings', icon: 'building' },
    { label: 'Phòng', route: '/rooms', icon: 'door' },
    { label: 'Khách hàng', route: '/customers', icon: 'users' },
    { label: 'Hợp đồng', route: '/contracts', icon: 'file-text' },
    { label: 'Dịch vụ', route: '/services', icon: 'tool' },
    { label: 'Hóa đơn', route: '/bills', icon: 'receipt' },
    { label: 'Đơn hàng', route: '/orders', icon: 'shopping-cart' }
  ];

  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
