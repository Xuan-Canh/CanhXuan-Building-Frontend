import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../core/service/users.service";
import {User, UserDto} from "../../shared/model/user";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { NotificationService } from '../../core/service/notification.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  users: User[] = [];
  userDto: UserDto = {} as UserDto;
  editingUserId: number | null = null;
  currentPage = 0;
  totalPage = 0;

  state = {
    showForm: false,
    isEditing: false,
    isLoading: false,
    isSubmitting: false
  };

  constructor(
    private userService: UsersService,
    private noti: NotificationService
  ) {}

  ngOnInit() {
    this.loadUsers(0);
  }

  loadUsers(page: number) {
    this.state.isLoading = true;
    this.userService.getAll(page).subscribe({
      next: (response) => {
        this.users = response.data.content;
        this.state.isLoading = false;
        this.totalPage = response.data.totalPages;
      },
      error: (error) => {
        console.error('Error fetching users: ', error);
        this.noti.show('Lỗi khi tải danh sách người dùng', 'error');
        this.state.isLoading = false;
      }
    });
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      this.loadUsers(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.loadUsers(this.currentPage - 1);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      this.loadUsers(page);
    }
  }

// Helper method để tạo mảng số trang
  getPageNumbers(): number[] {
    const maxPages = 5; // Hiển thị tối đa 5 nút
    const pages: number[] = [];

    if (this.totalPage <= maxPages) {
      // Hiển thị tất cả nếu ít trang
      for (let i = 0; i < this.totalPage; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị thông minh
      let startPage = Math.max(0, this.currentPage - 2);
      let endPage = Math.min(this.totalPage - 1, startPage + maxPages - 1);

      if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(0, endPage - maxPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  showCreateForm() {
    this.state.showForm = true;
    this.state.isEditing = false;
    this.editingUserId = null;
    this.userDto = {} as UserDto;
  }

  showEditForm(user: User) {
    this.state.showForm = true;
    this.state.isEditing = true;
    this.editingUserId = user.id;
    this.userDto = {
      username: user.username,
      password: '', // Không hiển thị password cũ
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role
    };
  }

  cancelForm() {
    this.state.showForm = false;
    this.state.isEditing = false;
    this.editingUserId = null;
    this.userDto = {} as UserDto;
  }

  onSubmit() {
    this.state.isSubmitting = true;
    
    if (this.state.isEditing && this.editingUserId) {
      // Cập nhật user
      this.userService.update(this.editingUserId, this.userDto).subscribe({
        next: (response) => {
          // Cập nhật user trong danh sách
          const index = this.users.findIndex(u => u.id === this.editingUserId);
          if (index !== -1) {
            this.users[index] = response.data;
          }
          this.state.isSubmitting = false;
          this.noti.show('Cập nhật người dùng thành công', 'success');
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating user: ', error);
          this.noti.show('Lỗi khi cập nhật người dùng', 'error');
          this.state.isSubmitting = false;
        }
      });
    } else {
      // Tạo user mới
      this.userService.create(this.userDto).subscribe({
        next: (response) => {
          this.users.push(response.data);
          this.state.isSubmitting = false;
          this.noti.show('Tạo người dùng thành công', 'success');
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error creating user: ', error);
          this.noti.show('Lỗi khi tạo người dùng', 'error');
          this.state.isSubmitting = false;
        }
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          // Xóa user khỏi danh sách
          this.users = this.users.filter(u => u.id !== id);
          this.noti.show('Xóa người dùng thành công', 'success');
        },
        error: (error) => {
          console.error('Error deleting user: ', error);
          this.noti.show('Lỗi khi xóa người dùng', 'error');
        }
      });
    }
  }
}