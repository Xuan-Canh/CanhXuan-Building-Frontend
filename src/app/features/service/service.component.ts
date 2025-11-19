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
    this.loadServices();
  }

  loadServices() {
    this.state.isLoading = true;
    this.serviceService.getAll().subscribe({
      next: resposne => {
        this.services = resposne.data;
        this.state.isLoading = false;
      },
      error: err => {
        console.log('Failed to load services', err);
        this.state.isLoading = false;
      }
    });
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
          this.loadServices();
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
          this.loadServices();
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
        this.loadServices();
      },
      error: err => {
        console.log('Failed to delete service', err);
      }
    });
  }
}
