import { Component } from '@angular/core';
import {AuthService} from "../../core/service/auth.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {NotificationService} from "../../core/service/notification.service";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  username: string = '';
  password: string = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private nofificationService: NotificationService,
    private router: Router
  ) {
  }

  ngOnInit() {
    console.log("AuthComponent initialized");
  }

  onSubmit() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.authService.setLoggedIn(true);
            console.log('Login successful', response);
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role)
            this.router.navigate(['']);
            this.nofificationService.show(response.message, 'success');
          } else {
            this.nofificationService.show(response.message, 'error');
          }
        },
        error: (error) => {
          console.error('Login error: ', error);
          this.nofificationService.show(error.message, 'error');
        }
      });
  }
}
