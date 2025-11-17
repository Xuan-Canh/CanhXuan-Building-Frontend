import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../core/service/sidebar.service';

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
    { label: 'Tòa nhà', route: '/buildings', icon: '🏢' },
    { label: 'Phòng', route: '/rooms', icon: '🚪' },
    { label: 'Khách hàng', route: '/customers', icon: '👥' },
    { label: 'Hợp đồng', route: '/contracts', icon: '📄' },
    { label: 'Dịch vụ', route: '/services', icon: '🔧' },
    { label: 'Hóa đơn', route: '/bills', icon: '🧾' },
    { label: 'Đơn hàng', route: '/orders', icon: '🛒' },
    { label: 'Người dùng', route: '/users', icon: '👤' }
  ];

  isCollapsed = false;

  constructor(private sidebarService: SidebarService) {
    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
}
