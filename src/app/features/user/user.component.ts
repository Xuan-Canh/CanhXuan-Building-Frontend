import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../core/service/users.service";
import {UserDto} from "../../shared/model/user";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  users: UserDto[] = [];
  userDto: UserDto = {} as UserDto;

  state = {
    showForm: false,
    isEditing: false,
    isLoading: false,
    isSubmitting: false
  };

  constructor(private userService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.state.isLoading = true;
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users = response;
        this.state.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users: ', error);
        this.state.isLoading = false;
      }
    });
  }

  showCreateForm() {
    this.state.showForm = true;
    this.state.isEditing = false;
    this.userDto = {} as UserDto;
  }

  showEditForm(user: UserDto) {
    this.state.showForm = true;
    this.state.isEditing = true;
    this.userDto = {...user};
  }

  cancelForm() {
    this.state.showForm = false;
    this.userDto = {} as UserDto;
  }

  onSubmit() {
    this.state.isSubmitting = true;
    if (this.state.isEditing) {
      // Update logic
    } else {
      // Create logic
    }
  }

  deleteUser(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      // Delete logic
    }
  }
}
