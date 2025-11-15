import { Component } from '@angular/core';
import {AuthService} from "../../core/service/auth.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

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
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    console.log("AuthComponent initialized");
  }

  onSubmit() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('username', response.data.username);
        }
      });
  }
}
