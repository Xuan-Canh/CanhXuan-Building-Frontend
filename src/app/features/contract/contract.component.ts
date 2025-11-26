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
import {CrudService} from "../../core/service/generic/crud.service";
import {CustomerService} from "../../core/service/customer.service";
import {error} from "@angular/compiler-cli/src/transformers/util";

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
  availableCustomers: Customer[] = [];

  showFormCustomer = false;

  currentPage = 0;
  totalPage = 0;

  keyword = '';
  customerKeyword = '';

  state = {
    showForm: false,
    viewDetails: false,
    isEditing: false,
    isLoading: false,
    isSubmitting: false,
    editingId: 0,
    searchState: false
  };

  isAdmin = false;


  newContract: ContractDto = this.initContract();
  selectedServices: number[] = [];

  constructor(
    private customerService: CustomerService,
    private contractService: ContractService,
    private roomService: RoomService,
    private serviceService: ServiceService,
    private noti: NotificationService,
    private crudService: CrudService
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
    if (this.keyword.length > 0) {
      this.searchContract(this.keyword, page);
    } else {
this.contractService.getAllWithPage(page).subscribe({
      next: response => {
        this.contracts = response.data.content;
        this.totalPage = response.data.totalPages;
        this.currentPage = response.data.number;
        this.state.isLoading = false;
        this.state.searchState = false;
      },
      error: err => {
        this.noti.show('Lỗi tải danh sách hợp đồng', 'error');
        this.state.isLoading = false;
      }
    });
  }
}


  searchContract(keyword: string, page?: number) {
    this.state.isLoading = true;
    this.contractService.searchWithPage(keyword, page)
      .subscribe({
        next: (response) => {
          this.contracts = response.data.content;
          this.currentPage = response.data.number;
          this.totalPage = response.data.totalPages;
          this.state.searchState = true;
          this.state.isLoading = false;
        },
        error: err => {
          this.noti.show('Loi tim kiem', 'error');
          this.state.isLoading = false;
        }
      });
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState){
        this.searchContract(this.keyword, this.currentPage + 1);
      } else {
      this.loadContracts(this.currentPage + 1);
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
     if (this.keyword.length > 0 && this.state.searchState){
        this.searchContract(this.keyword, this.currentPage - 1);
      } else {
      this.loadContracts(this.currentPage - 1);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState) {
        this.searchContract(this.keyword, page)
      } else{
        this.loadContracts(page);
      }
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
    this.roomService.getAvailableRooms().subscribe({
      next: response => {
        this.rooms = response.data;
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

  searchCustomers() {
    console.log(this.customerKeyword);
    if (this.customerKeyword.length == 0) {
      this.noti.show('Vui lòng nhập từ khoá tìm kiếm', 'info');
      return;
    }
    this.customerService.searchWithPage(this.customerKeyword).subscribe({
      next: (response) => {
        this.availableCustomers = response.data.content;
      }
    });
  }

  showCreateForm() {
    this.loadRooms();
    this.loadServices();
    this.state.showForm = true;
    this.state.isEditing = false;
    this.newContract = this.initContract();
    this.selectedServices = [];
  }

  showEditForm(contractId: number) {
    this.loadServices();
    this.contractService.getById(contractId).subscribe({
      next: response => {
        const contract = response.data;
        this.state.isEditing = true;
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
        // Đảm bảo phòng hiện tại có trong danh sách
        if (!this.rooms.find(r => r.id === contract.room.id)) {
          this.rooms = [...this.rooms, contract.room];
        }
        this.selectedServices = contract.services?.map(s => s.id) || [];
        this.showFormCustomer = true;
        this.state.showForm = true;
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
      next: (response) => {
        if (response.success) {
          this.noti.show(response.message, 'success');
          this.loadContracts(this.currentPage);
          this.cancelForm();
          this.state.isSubmitting = false;
          this.showFormCustomer = false;
          this.newContract = this.initContract();
          this.customerKeyword = '';
          this.availableCustomers = [];
        }
        else {
          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(error => this.noti.show(error, 'error'));
          } else {
            this.noti.show(response.message, 'error');
          }
          this.state.isSubmitting = false;
        }
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

  onRoomSelect(roomId: number) {
  console.log(roomId);
  const selectedRoom = this.rooms.find(room => room.id == roomId);
  console.log(selectedRoom);
  if (selectedRoom) {
    this.newContract.monthlyRent = selectedRoom.price;
    this.newContract.depositAmount = selectedRoom.price;
  }
}

  onCustomerSelect(customer: Customer) {
    this.newContract.customer = customer;
    this.showFormCustomer = true;
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

  exportToExcel(fileName: string) {
    this.state.isLoading = true;
    return this.crudService.exportToExcel('customers')
      .subscribe({
        next: (blob) => {
          const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
          const fileExportedName = `${fileName}_${timestamp}.xlsx`;
          this.crudService.downloadFile(blob, fileExportedName);
          this.state.isLoading = false;
          this.noti.show('Export customers to excel successfully', 'success');
        },
        error: (err) => {
          this.state.isLoading = false;
          console.error('Export error:', err);
          this.noti.show('Không thể xuất file. Vui lòng thử lại!', 'error');
        }
      })
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
    this.showFormCustomer = false;
    this.resetForm();
  }

  resetForm() {
    this.state.isEditing = false;
    this.state.editingId = 0;
    this.newContract = this.initContract();
    this.customerKeyword = '';
    this.availableCustomers = [];
    this.selectedServices = [];
  }
}
