// src/app/core/service/popup.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface PopupData {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'warning' | 'danger' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private dialogData: PopupData = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy'
  };

  private dialogSubject = new Subject<PopupData>();
  private resolveCallback: ((value: boolean) => void) | null = null;

  dialog$ = this.dialogSubject.asObservable();

  show(data: Partial<PopupData>): Promise<boolean> {
    this.dialogData = {
      isOpen: true,
      title: data.title || 'Xác nhận',
      message: data.message || 'Bạn có chắc chắn?',
      confirmText: data.confirmText || 'Xác nhận',
      cancelText: data.cancelText || 'Hủy',
      type: data.type || 'warning'
    };

    this.dialogSubject.next(this.dialogData);

    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  confirm() {
    this.close(true);
  }

  cancel() {
    this.close(false);
  }

  private close(result: boolean) {
    this.dialogData.isOpen = false;
    this.dialogSubject.next(this.dialogData);

    if (this.resolveCallback) {
      this.resolveCallback(result);
      this.resolveCallback = null;
    }
  }
}
