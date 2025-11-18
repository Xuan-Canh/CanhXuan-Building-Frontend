import { Component, OnInit } from '@angular/core';
import {CustomerService} from "../../core/service/customer.service";
import {NotificationService} from "../../core/service/notification.service";
import {Customer, CustomerDto} from "../../shared/model/customer";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

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

  customerDetails: Customer = {
    id: 0,
    fullname: '',
    cccd: '',
    phone: '',
    email: '',
    dateOfBirth: new Date(),
    address: '',
    status: 'active'
};

  customerDto : CustomerDto = this.initCustomerDto();

  state = {
    viewDetials: false,
    showForm: false,
    isEditing: false,
    isSubmitting: false,
    isLoading: true,
    selectedCustomerId: 0
  }

  constructor(private customerService: CustomerService,
              private noti: NotificationService) {
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.state.isLoading = true;
    this.customerService.getAll().subscribe({
      next: response => {
        this.customers = response.data;
        this.state.isLoading = false;
      },
      error: err => {
        this.noti.show("Failed to load customers", 'error');
        this.state.isLoading = false;
      }
    });
  }

  OnSubmit() {
    this.state.isSubmitting = true;
    if (this.state.isEditing) {
      this.customerService.update(this.edittingId, this.customerDto ).subscribe({
        next: response => {
          this.noti.show("Customer updated successfully", 'success');
          this.state.isSubmitting = false;
          this.cancelForm();
          this.loadCustomers();
        }
      })
    }
    else {
      this.customerService.create(this.customerDto).subscribe({
        next: response => {
          this.noti.show("Customer created successfully", 'success');
          this.state.isSubmitting = false;
          this.cancelForm();
          this.loadCustomers();
        },
        error: err => {
          this.noti.show("Failed to create customer", 'error');
          this.state.isSubmitting = false;
        }
      });
    }
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
        this.loadCustomers();
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
      status: 'active'
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
      status: 'active'
    }
  }
}
