import { Component, OnInit } from '@angular/core';
import { ContractService } from "../../core/service/contract.service";
import { RoomService } from "../../core/service/room.service";
import { ServiceService } from "../../core/service/service.service";
import { Contract, ContractDto } from '../../shared/model/contract';
import { Customer } from '../../shared/model/customer';
import { Room } from '../../shared/model/room';
import { Service } from '../../shared/model/service';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NotificationService } from "../../core/service/notification.service";

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css'
})
export class ContractComponent implements OnInit {

  contracts: Contract[] = [];
  rooms: Room[] = [];
  availableServices: Service[] = [];

  currentPage = 0;
  totalPage = 0;

  state = {
    showForm: false,
    viewDetails: false,
    isEditing: false,
    isLoading: false,
    isSubmitting: false,
    editingId: 0
  };

  isAdmin = false;


  newContract: ContractDto = this.initContract();
  selectedServices: number[] = [];

  constructor(
    private contractService: ContractService,
    private roomService: RoomService,
    private serviceService: ServiceService,
    private noti: NotificationService
  ) {
    const currentRole = localStorage.getItem('role');
    this.isAdmin = currentRole === 'ADMIN';
  }

  ngOnInit() {
    this.loadContracts(0);
    this.loadRooms();
  }

  initContract(): ContractDto {
    return {
      customer: {
        fullname: '',
        cccd: '',
        phone: '',
        email: '',
        dateOfBirth: new Date(),
        gender: '',
        address: ''
      } as Customer,
      roomId: 0,
      startDate: new Date(),
      endDate: new Date(),
      depositAmount: 0,
      monthlyRent: 0,
      paymentDueDate: 1,
      note: '',
      services: []
    };
  }

  loadContracts(page: number) {
    this.state.isLoading = true;
    this.contractService.getAllWithPage(page).subscribe({
      next: response => {
        this.contracts = response.data.content;
        this.totalPage = response.data.totalPages;
        this.currentPage = response.data.number;
        this.state.isLoading = false;
      },
      error: err => {
        this.noti.show('Lỗi tải danh sách hợp đồng', 'error');
        this.state.isLoading = false;
      }
    });
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      this.loadContracts(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.loadContracts(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      this.loadContracts(page);
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


  loadRooms() {
    this.roomService.getAll(0).subscribe({
      next: response => {
        this.rooms = response.data.content;
      },
      error: err => {
        this.noti.show('Lỗi tải danh sách phòng', 'error');
      }
    });
  }

  loadServices() {
    this.serviceService.getAll(0).subscribe({
      next: response => {
        this.availableServices = response.data.content;
      },
      error: err => {
        this.noti.show('Lỗi tải danh sách dịch vụ', 'error');
      }
    });
  }

  showCreateForm() {
    this.loadServices();
    this.state.showForm = true;
    this.state.isEditing = false;
    this.newContract = this.initContract();
    this.selectedServices = [];
  }

  showEditForm(contractId: number) {
    this.contractService.getById(contractId).subscribe({
      next: response => {
        const contract = response.data;
        this.state.isEditing = true;
        this.state.showForm = true;
        this.state.editingId = contract.id;
        this.newContract = {
          customer: contract.customer,
          roomId: contract.room.id,
          startDate: contract.startDate,
          endDate: contract.endDate,
          depositAmount: contract.depositAmount,
          monthlyRent: contract.monthlyRent,
          paymentDueDate: contract.paymentDueDate,
          note: contract.note,
          services: contract.services || []
        };
        this.selectedServices = contract.services?.map(s => s.id) || [];
      },
      error: err => {
        this.noti.show('Lỗi tải thông tin hợp đồng', 'error');
      }
    });
  }


  submitContract() {
    if (!this.validateContract()) {
      this.noti.show('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    this.newContract.services = this.availableServices.filter(s =>
      this.selectedServices.includes(s.id)
    );

    this.state.isSubmitting = true;
    const request = this.state.isEditing
      ? this.contractService.update(this.state.editingId, this.newContract as any)
      : this.contractService.create(this.newContract);

    request.subscribe({
      next: () => {
        this.noti.show(
          this.state.isEditing ? 'Cập nhật thành công' : 'Thêm mới thành công',
          'success'
        );
        this.loadContracts(this.currentPage);
        this.cancelForm();
        this.state.isSubmitting = false;
      },
      error: err => {
        this.noti.show('Có lỗi xảy ra: ' + (err.error?.message || 'Unknown error'), 'error');
        this.state.isSubmitting = false;
      }
    });
  }

  validateContract(): boolean {
    return this.newContract.customer.fullname !== ''
      && this.newContract.customer.cccd !== ''
      && this.newContract.roomId > 0
      && this.newContract.monthlyRent > 0;
  }

  toggleService(serviceId: number) {
    const index = this.selectedServices.indexOf(serviceId);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(serviceId);
    }
  }

  isServiceSelected(serviceId: number): boolean {
    return this.selectedServices.includes(serviceId);
  }

  export(id: number) {
    this.contractService.export(id).subscribe({
        next: (response: Blob) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            // Cleanup sau 1 phút
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        },
        error: (error) => {
            console.error('Export failed:', error);
        }
    });
}

  sendEmail(id: number) {
    this.contractService.sendEmai(id).subscribe({
        next: () => {
            this.noti.show('Sent contract by email to customer successfully', 'success');
        },
        error: (error) => {
            console.error('Send contract by email failed:', error);
        }
    });
  }


  deleteContract(id: number) {
    if (confirm('Bạn có chắc muốn xóa hợp đồng này?')) {
      this.contractService.delete(id).subscribe({
        next: () => {
          this.noti.show('Xóa thành công', 'success');
          this.loadContracts(this.currentPage);
        },
        error: err => {
          this.noti.show('Lỗi khi xóa', 'error');
        }
      });
    }
  }

  cancelForm() {
    this.state.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.state.isEditing = false;
    this.state.editingId = 0;
    this.newContract = this.initContract();
    this.selectedServices = [];
  }
}
