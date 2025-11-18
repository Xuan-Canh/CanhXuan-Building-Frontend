import {Component, OnInit} from '@angular/core';
import {ContractService} from "../../core/service/contract.service";
import {Contract, ContractDto} from '../../shared/model/contract';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css'
})
export class ContractComponent implements OnInit{

  contracts: Contract[] = [];

  state = {
    showForm: false,
    viewDetials: false,
    isEditting: false,
    isLoadding: false,
    isSubmitting: false,
    editingId: 0
  };

  initContract(): ContractDto {
    return {
      customerId: 0,
      roomId: 0,
      startDate: new Date(),
      endDate: new Date(),
      depositAmount: 0,
      monthlyRent: 0,
      paymentDueDate: 1,
      note: ''
    };
  }


  constructor(private contractService: ContractService) {
  }

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {
    this.state.isLoadding = true;
    this.contractService.getAll().subscribe({
      next: response => {
        this.contracts = response.data;
        this.state.isLoadding = false;
      },
      error: err => {
        console.error('Failed to load contracts', err);
        this.state.isLoadding = false;
      }
    });
  }

  showCreateForm() {
    this.state.showForm = true;
  }

  showEditForm() {
    this.state.isEditting = true;
    this.state.showForm = true;
  }

  cancelForm() {
    this.state.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.state.isEditting = false;
  }

  deleteContract(id: number) {
    this.contractService.delete(id).subscribe({
      next: response => {
        console.log('Contract deleted successfully');
        this.loadContracts();
      },
      error: err => {
        console.error('Failed to delete contract', err);
      }
    });
  }
}
