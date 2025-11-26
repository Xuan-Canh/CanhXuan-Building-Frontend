import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/service/dashboard.service';
import { DashboardDto } from '../../shared/model/dashboard';
import { NotificationService } from '../../core/service/notification.service';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardDto = {} as DashboardDto;
  isLoading = true;
  statCards: StatCard[] = [];

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getSummary().subscribe({
      next: (response) => {
          this.dashboardData = response.data;
          this.buildStatCards();
          this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.notificationService.show('Không thể tải dữ liệu dashboard', 'error');
        this.isLoading = false;
      }
    });
  }

  buildStatCards(): void {
    if (!this.dashboardData) return;

    const occupancyRate = this.dashboardData.totalRooms > 0
      ? ((this.dashboardData.rentedRooms / this.dashboardData.totalRooms) * 100).toFixed(1)
      : '0';

    this.statCards = [
      {
        title: 'Tổng tòa nhà',
        value: this.dashboardData.totalBuildings,
        icon: '🏢',
        color: 'primary'
      },
      {
        title: 'Tổng phòng',
        value: this.dashboardData.totalRooms,
        icon: '🚪',
        color: 'secondary'
      },
      {
        title: 'Phòng trống',
        value: this.dashboardData.emptyRooms,
        icon: '🔓',
        color: 'success'
      },
      {
        title: 'Phòng đã thuê',
        value: this.dashboardData.rentedRooms,
        icon: '🔐',
        color: 'info',
        change: `${occupancyRate}% công suất`,
        changeType: 'increase'
      },
      {
        title: 'Khách hàng đã kí hợp đồng',
        value: this.dashboardData.totalCustomers,
        icon: '👥',
        color: 'warning'
      },
      {
        title: 'Hợp đồng đang hoạt động',
        value: this.dashboardData.activeContracts,
        icon: '📄',
        color: 'primary'
      },
      {
        title: 'Doanh thu tháng',
        value: this.dashboardData.monthlyRevenue,
        icon: '💰',
        color: 'success',
        change: 'VNĐ',
        changeType: 'increase'
      },
      {
        title: 'Hóa đơn chưa thanh toán',
        value: this.dashboardData.unpaidInvoices,
        icon: '🧾',
        color: 'error',
        change: 'Cần xử lý',
        changeType: 'decrease'
      }
    ];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  refresh(): void {
    this.loadDashboardData();
    this.notificationService.show('Đã làm mới dữ liệu', 'success');
  }
}
