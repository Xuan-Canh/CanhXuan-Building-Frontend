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
import { CrudService } from '../../core/service/generic/crud.service';

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
  contractServices: Service[] = [];
  selectedInvoice: Invoice | null = null;

  currentPage = 0;
  totalPage = 0;

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

  serviceUsages: ServiceUsageDetail[] = [];
  serviceUsage: ServiceUsageDetail = {
    serviceId: 0,
  oldReading: 0,
  newReading: 0,
  quantity: 0
  };

  constructor(
    private invoiceService: InvoiceService,
    private contractService: ContractService,
    private serviceService: ServiceService,
    private noti: NotificationService,
    private crudService: CrudService
  ) {}

  ngOnInit() {
    this.loadInvoices(0);
    this.loadContracts();
  }

  loadInvoices(page: number) {
    this.state.loading = true;
    this.invoiceService.getAll(page).subscribe({
      next: (response) => {
        if (response.success) {
          this.invoices = response.data.content;
          this.currentPage = response.data.number;
          this.totalPage = response.data.totalPages;
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

  // Pagination methods
  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      this.loadInvoices(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.loadInvoices(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      this.loadInvoices(page);
    }
  }

  getPageNumbers(): number[] {
    const maxPages = 5;
    const pages: number[] = [];

    if (this.totalPage <= maxPages) {
      for (let i = 0; i < this.totalPage; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(0, this.currentPage - 2);
      let endPage = Math.min(this.totalPage - 1, startPage + maxPages - 1);

      if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(0, endPage - maxPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // loadServices() {
  //   this.serviceService.getAll().subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         this.services = response.data;
  //         // Khởi tạo service usages sau khi load xong services
  //         this.initializeServiceUsages();
  //       }
  //     },
  //     error: () => {
  //       this.noti.show('Lỗi tải danh sách dịch vụ', 'error');
  //     }
  //   });
  // }

  exportToExcel(fileName: string) {
    this.state.loading = true;
    return this.crudService.exportToExcel('invoices')
    .subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const fileExportedName = `${fileName}_${timestamp}.xlsx`;
        this.crudService.downloadFile(blob, fileExportedName);
        this.state.loading = false;
        this.noti.show('Export invoices to excel successfully', 'success');
      },
      error: (err) => {
        this.state.loading = false;
        console.error('Export error:', err);
        this.noti.show('Không thể xuất file. Vui lòng thử lại!', 'error');
      }
    })
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

  onContractChange(contractId: number) {
    this.initializeContractService(contractId);
    this.initializeServiceUsages(contractId);
  }

  private initializeServiceUsages(contractId: number) {
    this.serviceUsages = [];
    this.contractServices.forEach(service => {
      this.serviceUsage = {
        serviceId: service.id,
        newReading: 0,
        quantity: service.type === 'FIXED' ? 1 : 0
      };
      this.serviceUsages.push(this.serviceUsage);
    });
  }

  initializeContractService(contractId: number) {
    this.contractService.getById(contractId)
    .subscribe({
      next: (response) => {
        this.contractServices = response.data.services;
        this.initializeServiceUsages(contractId); // Gọi sau khi có dữ liệu
      }
    })
  }

  getServiceUsage(serviceId: number) {
    return this.serviceUsages.find(u => u.serviceId === serviceId);
  }

  updateServiceUsage(contractId: number, serviceId: number, field: keyof ServiceUsageDetail, value: any) {
    const index = this.serviceUsages.findIndex(u => u.serviceId === serviceId);

  if (index !== -1) {
    // Đã tồn tại - cập nhật
    this.serviceUsages[index] = {
      ...this.serviceUsages[index],
      [field]: value
    };
  } else {
    this.initializeServiceUsages(contractId);
  }
  }

  submitInvoice() {
    if (!this.newInvoice.contractId) {
      this.noti.show('Vui lòng chọn hợp đồng', 'error');
      return;
    }

    // Lọc các dịch vụ có sử dụng - CẢI THIỆN LOGIC
    this.newInvoice.serviceUsageDetails = this.serviceUsages
      .filter(usage => {
        const service = this.contractServices.find(s => s.id === usage.serviceId);

        if (!service) return false;

        // Với METERED: kiểm tra newReading
        if (service.type === 'METERED') {
          return usage.newReading !== undefined && usage.newReading > 0;
        }

        // Với FIXED: kiểm tra quantity
        if (service.type === 'FIXED') {
          return usage.quantity !== undefined && usage.quantity > 0;
        }

        return false;
      });

    console.log('Dữ liệu gửi đi:', this.newInvoice); // Debug

    if (this.newInvoice.serviceUsageDetails.length === 0) {
      this.noti.show('Vui lòng nhập thông tin sử dụng dịch vụ', 'error');
      return;
    }

    this.state.submitting = true;
    this.invoiceService.create(this.newInvoice).subscribe({
      next: () => {
        this.noti.show('Tạo hóa đơn thành công', 'success');
        this.loadInvoices(this.currentPage);
        this.cancelForm();
      },
      error: (err) => {
        console.error('Lỗi tạo hóa đơn:', err); // Debug
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
          this.loadInvoices(this.currentPage);
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
          this.loadInvoices(this.currentPage);
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
    this.serviceUsages = [];
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
    return this.contractServices.find(s => s.id === serviceId)?.type || 'FIXED';
  }
}
