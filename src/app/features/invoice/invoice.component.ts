import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceRequest, ServiceUsageDetail } from '../../shared/model/invoice';
import { InvoiceService } from '../../core/service/invoice.service';
import { ContractService } from '../../core/service/contract.service';
import { ServiceService } from '../../core/service/service.service';
import { NotificationService } from '../../core/service/notification.service';
import { Contract } from '../../shared/model/contract';
import { Service } from '../../shared/model/service';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  contracts: Contract[] = [];
  services: Service[] = [];
  selectedInvoice: Invoice | null = null;

  state = {
    loading: false,
    showForm: false,
    showDetail: false,
    submitting: false,
    editing: false,
    editingId: 0
  };

  newInvoice: InvoiceRequest = {
    contractId: 0,
    invoiceDate: this.getCurrentDate(),
    dueDate: this.getNextMonthDate(),
    serviceUsageDetails: [],
    note: ''
  };

  serviceUsages: Map<number, ServiceUsageDetail> = new Map();

  constructor(
    private invoiceService: InvoiceService,
    private contractService: ContractService,
    private serviceService: ServiceService,
    private noti: NotificationService
  ) {}

  ngOnInit() {
    this.loadInvoices();
    this.loadServices();
  }

  loadInvoices() {
    this.state.loading = true;
    this.invoiceService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.invoices = response.data;
        }
        this.state.loading = false;
      },
      error: () => {
        this.noti.show('Lỗi tải danh sách hóa đơn', 'error');
        this.state.loading = false;
      }
    });
  }

  loadContracts() {
    this.contractService.getAll().subscribe({
      next: (response) => {
        this.contracts = response.data;
      },
      error: () => {
        this.noti.show('Lỗi tải danh sách hợp đồng', 'error');
      }
    });
  }

  loadServices() {
    this.serviceService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.services = response.data;
          // Khởi tạo service usages sau khi load xong services
          this.initializeServiceUsages();
        }
      },
      error: () => {
        this.noti.show('Lỗi tải danh sách dịch vụ', 'error');
      }
    });
  }

  addInvoice() {
    this.loadContracts();
    this.state.showForm = true;
    this.state.editing = false;
    this.resetForm();
  }

  viewDetail(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.state.showDetail = true;
  }

  closeDetail() {
    this.state.showDetail = false;
    this.selectedInvoice = null;
  }

  onContractChange() {
    // Reset và khởi tạo lại service usages
    this.initializeServiceUsages();

    // Lấy invoice cuối cùng của contract để lấy chỉ số cũ
    const contractId = this.newInvoice.contractId;
    if (contractId > 0) {
      this.invoiceService.getAll().subscribe({
        next: (response) => {
          const lastInvoice = response.data
            .filter((inv: Invoice) => inv.contract.id === contractId)
            .sort((a: Invoice, b: Invoice) =>
              new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
            )[0];

          if (lastInvoice && lastInvoice.serviceDetails) {
            lastInvoice.serviceDetails.forEach(detail => {
              const usage = this.serviceUsages.get(detail.service.id);
              if (usage && detail.newReading !== undefined) {
                usage.oldReading = detail.newReading;
              }
            });
          }
        }
      });
    }
  }

  private initializeServiceUsages() {
    this.serviceUsages.clear();
    this.services.forEach(service => {
      this.serviceUsages.set(service.id, {
        serviceId: service.id,
        oldReading: 0,
        newReading: 0,
        quantity: 1
      });
    });
  }

  updateServiceUsage(serviceId: number, field: keyof ServiceUsageDetail, value: any) {
    const usage = this.serviceUsages.get(serviceId);
    if (usage) {
      (usage as any)[field] = value;
    }
  }

  submitInvoice() {
    if (!this.newInvoice.contractId) {
      this.noti.show('Vui lòng chọn hợp đồng', 'error');
      return;
    }

    // Lọc các dịch vụ có sử dụng
    this.newInvoice.serviceUsageDetails = Array.from(this.serviceUsages.values())
      .filter(usage => {
        const service = this.services.find(s => s.id === usage.serviceId);
        if (service?.type === 'METERED') {
          // Dịch vụ đo đếm: phải có newReading > oldReading
          return usage.newReading !== undefined &&
            usage.oldReading !== undefined &&
            usage.newReading > usage.oldReading;
        }
        // Dịch vụ cố định: phải có quantity > 0
        return usage.quantity !== undefined && usage.quantity > 0;
      });

    if (this.newInvoice.serviceUsageDetails.length === 0) {
      this.noti.show('Vui lòng nhập thông tin sử dụng dịch vụ', 'error');
      return;
    }

    this.state.submitting = true;
    this.invoiceService.create(this.newInvoice).subscribe({
      next: () => {
        this.noti.show('Tạo hóa đơn thành công', 'success');
        this.loadInvoices();
        this.cancelForm();
      },
      error: (err) => {
        this.noti.show(err.error?.message || 'Có lỗi xảy ra', 'error');
        this.state.submitting = false;
      }
    });
  }

  markAsPaid(id: number) {
    if (confirm('Xác nhận đã thanh toán hóa đơn này?')) {
      this.invoiceService.markAsPaid(id).subscribe({
        next: () => {
          this.noti.show('Cập nhật trạng thái thành công', 'success');
          this.loadInvoices();
        },
        error: () => {
          this.noti.show('Lỗi cập nhật trạng thái', 'error');
        }
      });
    }
  }

  deleteInvoice(id: number) {
    if (confirm('Bạn có chắc muốn xóa hóa đơn này?')) {
      this.invoiceService.delete(id).subscribe({
        next: () => {
          this.noti.show('Xóa hóa đơn thành công', 'success');
          this.loadInvoices();
        },
        error: () => {
          this.noti.show('Lỗi khi xóa', 'error');
        }
      });
    }
  }

  cancelForm() {
    this.state.showForm = false;
    this.state.editing = false;
    this.state.submitting = false;
    this.resetForm();
  }

  resetForm() {
    this.newInvoice = {
      contractId: 0,
      invoiceDate: this.getCurrentDate(),
      dueDate: this.getNextMonthDate(),
      serviceUsageDetails: [],
      note: ''
    };
    this.serviceUsages.clear();
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PAID': 'status-paid',
      'UNPAID': 'status-unpaid',
      'OVERDUE': 'status-overdue'
    };
    return classes[status] || '';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'PAID': 'Đã thanh toán',
      'UNPAID': 'Chưa thanh toán',
      'OVERDUE': 'Quá hạn'
    };
    return texts[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getNextMonthDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  }

  getServiceType(serviceId: number): string {
    return this.services.find(s => s.id === serviceId)?.type || 'FIXED';
  }
}
