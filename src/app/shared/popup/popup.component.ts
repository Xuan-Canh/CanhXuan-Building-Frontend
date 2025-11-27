// src/app/shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupData, PopupService } from '../../core/service/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-overlay" *ngIf="dialogData.isOpen" (click)="onCancel()">
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
        <div class="dialog-icon" [class]="'icon-' + dialogData.type">
          <span>{{ getIcon() }}</span>
        </div>
        <h3 class="dialog-title">{{ dialogData.title }}</h3>
        <p class="dialog-message">{{ dialogData.message }}</p>
        <div class="dialog-actions">
          <button class="btn-cancel" (click)="onCancel()">
            {{ dialogData.cancelText }}
          </button>
          <button class="btn-confirm" [class]="'btn-' + dialogData.type" (click)="onConfirm()">
            {{ dialogData.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .confirm-dialog {
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .dialog-icon {
      text-align: center;
      font-size: 48px;
      margin-bottom: 16px;
    }

    .dialog-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 12px 0;
      text-align: center;
    }

    .dialog-message {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 24px 0;
      text-align: center;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
    }

    .dialog-actions button {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancel {
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }

    .btn-cancel:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-confirm {
      color: white;
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .btn-warning:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .btn-info:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  `]
})
export class PopupComponent implements OnInit {
  dialogData: PopupData = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy'
  };

  constructor(private confirmService: PopupService) {}

  ngOnInit() {
    this.confirmService.dialog$.subscribe(data => {
      this.dialogData = data;
    });
  }

  onConfirm() {
    this.confirmService.confirm();
  }

  onCancel() {
    this.confirmService.cancel();
  }

  getIcon(): string {
    switch (this.dialogData.type) {
      case 'danger': return '⚠️';
      case 'warning': return '❗';
      case 'info': return 'ℹ️';
      default: return '⚠️';
    }
  }
}
