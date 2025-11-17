import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  collapsed$ = this.collapsedSubject.asObservable();

  toggleSidebar() {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }

  setCollapsed(value: boolean) {
    this.collapsedSubject.next(value);
  }

  isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }
}
