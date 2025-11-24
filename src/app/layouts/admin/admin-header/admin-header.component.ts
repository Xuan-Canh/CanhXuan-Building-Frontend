import {Component, OnInit, HostListener} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {CommonModule} from "@angular/common";
import {AuthService} from "../../../core/service/auth.service";
import {NotificationService} from "../../../core/service/notification.service";

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit{
  isLogged = false;
  userName = '';
  userAvatar = 'assets/logo.png';
  showUserMenu = false;
  
  menuItems = [
    { label: 'Home', route: '', icon: 'home' },
    { label: 'About-us', route: 'about-us' , icon: 'about-us'},
    { label: 'Contact', route: 'contact', icon: 'contact' }
  ]
  
  constructor(private authService: AuthService,
              private notificationService: NotificationService) {
    console.log('Component loaded');
  }
  
  ngOnInit() {
    console.log('admin-header loaded');
    this.authService.loggedIn$.subscribe(value => this.isLogged = value);
    this.userName = localStorage.getItem('username') || '';
  }
  
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile')) {
      this.showUserMenu = false;
    }
  }
  
  logout() {
    this.authService.logout();
    this.authService.setLoggedIn(false);
    localStorage.clear();
    console.log('logout');
    this.notificationService.show('Logout successful', 'success');
    this.showUserMenu = false;
  }
}