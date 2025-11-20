import {Component, OnInit} from '@angular/core';
import {ServiceService} from "../../core/service/service.service";
import {Service, ServiceDto} from "../../shared/model/service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-serviceService',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './service.component.html',
  styleUrl: './service.component.css'
})
export class ServiceComponent implements OnInit{

  services: Service[] = [];

  serviceDto = this.initServiceDto();

  edittingId = 0;

  currentPage = 0;
  totalPage = 0;

  state = {
    showForm : false,
    isEditing : false,
    isLoading : false,
    isSubmitting: false
  }

  initServiceDto(): ServiceDto {
    return {
      name: '',
      description: '',
      price: 0,
      unit: '',
      type: 'FIXED'
    }
  }

  constructor(private serviceService: ServiceService) {
  }

  ngOnInit() {
    this.loadServices(0);
  }

  loadServices(page: number) {
    this.state.isLoading = true;
    this.serviceService.getAll(page).subscribe({
      next: resposne => {
        this.services = resposne.data.content;
        this.currentPage = resposne.data.number;
        this.totalPage = resposne.data.totalPages;
        this.state.isLoading = false;
      },
      error: err => {
        console.log('Failed to load services', err);
        this.state.isLoading = false;
      }
    });
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      this.loadServices(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.loadServices(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      this.loadServices(page);
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

  showCreateForm() {
    this.state.showForm = true;
  }

  showEditForm(service: Service) {
    this.state.isEditing= true;
    this.state.showForm= true;
    this.edittingId = service.id;
    this.serviceDto = service;
  }

  resetForm() {
    this.serviceDto = this.initServiceDto();
  }

  cancelForm() {
    this.state.isEditing = false;
    this.state.showForm = false;
    this.edittingId = 0;
    this.resetForm();
  }

  onSubmit() {
    if (this.edittingId && this.state.isEditing) {
      this.state.isSubmitting = true;
      this.serviceService.update(this.edittingId, this.serviceDto).subscribe({
        next: response => {
          console.log('Service updated successfully');
          this.state.isSubmitting = false;
          this.cancelForm();
          this.loadServices(this.currentPage);
        },
        error: err => {
          console.log('Failed to update service', err);
          this.state.isSubmitting = false;
        }
      });
    } else {
      this.state.isSubmitting = true;
      this.serviceService.create(this.serviceDto).subscribe({
        next: response => {
          console.log('Service created successfully');
          this.state.isSubmitting = false;
          this.cancelForm();
          this.loadServices(this.currentPage);
        },
        error: err => {
          console.log('Failed to create service', err);
          this.state.isSubmitting = false;
        }
      });
    }
  }

  deleteService(serviceId: number) {
    this.serviceService.delete(serviceId).subscribe({
      next: response => {
        console.log('Service deleted successfully');
        this.loadServices(this.currentPage);
      },
      error: err => {
        console.log('Failed to delete service', err);
      }
    });
  }
}
