import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent {
  userName = localStorage.getItem('userName');
  userAvatar = 'assets/logo.png';
  menuItems = [
    { label: 'Home', route: '', icon: 'home' },
    { labeo: 'About-us', route: 'about-us' , icon: 'about-us'},
    { label: 'Contact', route: 'contact', icon: 'contact' }
  ]

  constructor() {
    console.log('Component loaded');
  }

  logout() {
    console.log('logout');
  }
}
