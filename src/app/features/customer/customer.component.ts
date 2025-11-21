import { Component, OnInit } from '@angular/core';
import {CustomerService} from "../../core/service/customer.service";
import {NotificationService} from "../../core/service/notification.service";
import {Customer, CustomerDto} from "../../shared/model/customer";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CrudService} from "../../core/service/generic/crud.service";

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit {

  customers: Customer[] = [];
  edittingId = 0;

  currentPage = 0;
  totalPage = 0;

  keyword = '';

  customerDetails: Customer = {
    id: 0,
    fullname: '',
    cccd: '',
    phone: '',
    email: '',
    dateOfBirth: new Date(),
    address: '',
    status: 'active',
    gender: ''
};

  customerDto : CustomerDto = this.initCustomerDto();

  state = {
    viewDetials: false,
    showForm: false,
    isEditing: false,
    isSubmitting: false,
    isLoading: true,
    selectedCustomerId: 0,
    searchState: false
  }

  constructor(private customerService: CustomerService,
              private noti: NotificationService,
              private crudService: CrudService) {
  }

  ngOnInit() {
    this.loadCustomers(0);
  }

  loadCustomers(page: number) {
    this.state.isLoading = true;
    if (this.state.searchState && this.keyword.length > 0) {
      this.searchCustomer(this.keyword, page);
    } else {
      this.customerService.getAll(page).subscribe({
        next: response => {
          this.customers = response.data.content;
          this.totalPage = response.data.totalPages;
          this.currentPage = response.data.number;
          this.state.isLoading = false;
        },
        error: err => {
          this.noti.show("Failed to load customers", 'error');
          this.state.isLoading = false;
        }
      });
    }
  }

  searchCustomer(keyword: string, page?: number) {
    this.state.isLoading = true;
    this.customerService.searchWithPage(keyword, page)
      .subscribe({
        next: (response) => {
          this.customers = response.data.content;
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
        this.searchCustomer(this.keyword, this.currentPage + 1);
      } else {
        this.loadCustomers(this.currentPage + 1);
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      if (this.keyword.length > 0 && this.state.searchState){
        this.searchCustomer(this.keyword, this.currentPage - 1);
      } else {
        this.loadCustomers(this.currentPage - 1);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState) {
        this.searchCustomer(this.keyword, page)
      } else{
        this.loadCustomers(page);
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


  OnSubmit() {
    this.state.isSubmitting = true;
    if (this.state.isEditing) {
      this.customerService.update(this.edittingId, this.customerDto ).subscribe({
        next: response => {
          this.noti.show("Customer updated successfully", 'success');
          this.state.isSubmitting = false;
          this.cancelForm();
          this.loadCustomers(this.currentPage);
        }
      })
    }
    else {
      this.customerService.create(this.customerDto).subscribe({
        next: response => {
          this.noti.show("Customer created successfully", 'success');
          this.state.isSubmitting = false;
          this.cancelForm();
          this.loadCustomers(this.currentPage);
        },
        error: err => {
          this.noti.show("Failed to create customer", 'error');
          this.state.isSubmitting = false;
        }
      });
    }
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

  showCreateForm() {
    this.state.showForm = true;
  }

  showEditForm(customer: Customer) {
    this.state.isEditing = true;
    this.state.showForm = true;
    this.edittingId = customer.id;
    this.customerDto = customer;
  }

  onDelete(customerId: number) {
    this.customerService.delete(customerId).subscribe({
      next: response => {
        this.noti.show("Customer deleted successfully", 'success');
        this.loadCustomers(this.currentPage);
      },
      error: err => {
        this.noti.show("Failed to delete customer", 'error');
      }
    });
  }

  viewDetails(customerid: number) {
    this.state.viewDetials = true;
    this.customerService.getById(customerid).subscribe({
      next: response => {
        this.customerDetails = response.data;
      },
      error: err => {
        this.noti.show("Failed to load customer details", 'error');
      }
    });
  }

  closeDetails() {
    this.state.viewDetials = false;
    this.customerDetails = {
      id: 0,
      fullname: '',
      cccd: '',
      phone: '',
      email: '',
      dateOfBirth: new Date(),
      address: '',
      status: 'active',
      gender: ''
    }
  }

  cancelForm() {
    this.state.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.initCustomerDto();
  }

  private initCustomerDto() : CustomerDto {
    return {
      fullname: '',
      cccd: '',
      phone: '',
      email: '',
      dateOfBirth: new Date(),
      address: '',
      status: 'active',
      gender: ''
    }
  }
}
