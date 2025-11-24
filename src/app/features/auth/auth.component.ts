import { Component } from '@angular/core';
import { AuthService } from "../../core/service/auth.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { NotificationService } from "../../core/service/notification.service";
import { UsersService } from '../../core/service/users.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  // Form mode: 'login' | 'register' | 'forgot-password'
  currentMode: 'login' | 'register' | 'forgot-password' = 'login';

  // Login & Register fields
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  city: string = '';
  phone: string = '';

  // Forgot password field
  resetEmail: string = '';

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private nofificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log("AuthComponent initialized");
  }

  // Switch between modes
  switchMode(mode: 'login' | 'register' | 'forgot-password') {
    this.currentMode = mode;
    this.resetForm();
  }

  // Reset form fields
  resetForm() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.email = '';
    this.city = '';
    this.phone = '';
    this.resetEmail = '';
  }

  // Login
  onSubmit() {
    if (this.currentMode === 'login') {
      this.handleLogin();
    } else if (this.currentMode === 'register') {
      this.handleRegister();
    } else if (this.currentMode === 'forgot-password') {
      this.handleForgotPassword();
    }
  }

  // Handle Login
  handleLogin() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.authService.setLoggedIn(true);
            console.log('Login successful', response);
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('userAvatar', response.data.userAvatar);
            this.router.navigate(['/dashboard']);
            this.nofificationService.show(response.message, 'success');
          } else {
            this.nofificationService.show(response.message, 'error');
          }
        },
        error: (error) => {
          console.error('Login error: ', error);
          this.nofificationService.show(error.message || 'Đăng nhập thất bại', 'error');
        }
      });
  }

  // Handle Register
  handleRegister() {
    // Validate password match
    if (this.password !== this.confirmPassword) {
      this.nofificationService.show('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    // Validate password strength
    if (this.password.length < 6) {
      this.nofificationService.show('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    const registerData = {
      username: this.username,
      password: this.password,
      email: this.email,
      city: this.city,
      phone: this.phone
    };

    this.authService.register(registerData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.nofificationService.show('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            this.switchMode('login');
          } else {
            this.nofificationService.show(response.message, 'error');
          }
        },
        error: (error) => {
          console.error('Register error: ', error);
          this.nofificationService.show(error.message || 'Đăng ký thất bại', 'error');
        }
      });
  }

  // Handle Forgot Password
  handleForgotPassword() {
    if (!this.resetEmail) {
      this.nofificationService.show('Vui lòng nhập email', 'error');
      return;
    }

    this.authService.forgotPassword(this.resetEmail)
      .subscribe({
        next: (response) => {
          this.nofificationService.show(response, 'error');
        },
        error: (error) => {
          console.error('Forgot password error: ', error);
          this.nofificationService.show(error.message || 'Không thể gửi email đặt lại mật khẩu', 'error');
        }
      });
  }


  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
