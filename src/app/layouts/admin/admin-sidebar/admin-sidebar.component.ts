// admin-sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../core/service/sidebar.service';
import {AuthService} from "../../../core/service/auth.service";

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roleExpect: string[];
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
    { label: 'Dashboard', route: '/dashboard', icon: '🏢', roleExpect: ['ADMIN'] },
    { label: 'Tòa nhà', route: '/buildings', icon: '🏢', roleExpect: ['USER', 'ADMIN'] },
    { label: 'Phòng', route: '/rooms', icon: '🚪', roleExpect: ['USER', 'ADMIN'] },
    { label: 'Khách hàng', route: '/customers', icon: '👥', roleExpect: ['ADMIN'] },
    { label: 'Hợp đồng', route: '/contracts', icon: '📄', roleExpect: ['USER', 'ADMIN'] },
    { label: 'Dịch vụ', route: '/services', icon: '🔧', roleExpect: ['ADMIN'] },
    { label: 'Hóa đơn', route: '/invoices', icon: '🧾', roleExpect: ['ADMIN'] },
    { label: 'Người dùng', route: '/users', icon: '👤', roleExpect: ['ADMIN'] }
  ];

  currentRole: string | null = null;
  isCollapsed = false;

  constructor(private sidebarService: SidebarService, private authService: AuthService) {
    this.currentRole = localStorage.getItem('role');

    this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });

    // Subscribe to role changes
    this.authService.role$.subscribe(role => {
      this.currentRole = role;
    });
  }



  // Kiểm tra xem user có quyền truy cập menu item không
  hasAccess(item: MenuItem): boolean {
    if (!this.currentRole) {
      return false;
    }
    return item.roleExpect.includes(this.currentRole);
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }
}
