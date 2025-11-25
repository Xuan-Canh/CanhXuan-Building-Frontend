import {Component, OnInit, HostListener} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {CommonModule} from "@angular/common";
import {AuthService} from "../../../core/service/auth.service";
import {NotificationService} from "../../../core/service/notification.service";
import { UsersService } from '../../../core/service/users.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit{
  LogoUrl = 'assets/logo.png'
  isLogged = false;
  userName = '';
  userAvatar = '';
  showUserMenu = false;

  menuItems = [
    { label: 'Home', route: '', icon: 'home' },
    { label: 'About-us', route: 'about-us' , icon: 'about-us'},
    { label: 'Contact', route: 'contact', icon: 'contact' }
  ]

  constructor(private authService: AuthService,
              private notificationService: NotificationService,
              private userService: UsersService,
              private router: Router) {
    console.log('Component loaded');
  }

  ngOnInit() {
    console.log('admin-header loaded');

    // Subscribe to logged in status
    this.authService.loggedIn$.subscribe(value => {
      this.isLogged = value;
      if (!value) {
        // Clear user info when logged out
        this.userName = '';
        this.userAvatar = '';
      }
    });

    // Subscribe to user avatar changes
    this.authService.userAvatar$.subscribe(avatar => {
      this.userAvatar = avatar || 'assets/logo.png';
    });

    // Initialize from localStorage
    this.userName = localStorage.getItem('username') || '';
    this.userAvatar = localStorage.getItem('userAvatar') || 'assets/logo.png';
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

  getAvatarUrl() {
    const username = this.userName || localStorage.getItem('username');
    const avatar = this.userAvatar || localStorage.getItem('userAvatar');
    return this.userService.getAvatarUrl(username, avatar);
  }

  logout() {
    this.authService.logout();
    this.authService.setLoggedIn(false);
    this.authService.setUserAvatar('assets/logo.png');
    this.authService.setRole('');

    localStorage.clear();
    console.log('logout');
    this.notificationService.show('Logout successful', 'success');
    this.showUserMenu = false;
    this.router.navigate(['login']);
  }

}
