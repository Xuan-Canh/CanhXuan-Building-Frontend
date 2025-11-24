import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {User} from "../../shared/model/user";
import {UsersService} from "../../core/service/users.service";
import {NotificationService} from "../../core/service/notification.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  isEditMode = false;
  username = localStorage.getItem('username');
  avatarFile: File | null = null;

  userProfile: User = {
    id: 0,
    username: '',
    password: '',
    email: '',
    phone: '',
    city: '',
    avatarUrl: '',
    role: ''
  };

  avatarPreview: string | null = null;

  constructor(private userService: UsersService,
              private noti: NotificationService) {
  }


  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    if (this.username) {
      this.userService.getProfile(this.username).subscribe({
        next: (response) => {
          this.userProfile = response.data;
          this.editProfile = {...this.userProfile};
        },
        error: (error) => {
          console.error('Error fetching profile: ', error);
        }
      });
    } else {
      this.noti.show('No username found in local storage', 'error');
    }
  }

  editProfile = {...this.userProfile};

  toggleEditMode() {
    if (this.isEditMode) {
      this.editProfile = {...this.userProfile};
      this.avatarFile = null;
      this.avatarPreview = null; // ✅ Reset preview
    }
    this.isEditMode = !this.isEditMode;
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.avatarFile = input.files[0];

      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.avatarFile);
    }
  }

  submitAvatar() {
    if (this.avatarFile) {
      this.userService.changeAvatar(this.userProfile.username, this.avatarFile).subscribe({
        next: (response) => {
          this.userProfile = response.data;
          this.isEditMode = false;
          this.avatarFile = null;
          this.avatarPreview = null;
          this.noti.show('Avatar updated successfully', 'success');
        },
        error: (error) => {
          this.noti.show('Error updating avatar', 'error');
        }
      });
    }
  }

  saveProfile() {
      this.userService.editProfile(this.userProfile.username, this.editProfile).subscribe({
        next: (response) => {
          this.userProfile = response.data;
          this.isEditMode = false;
          this.noti.show('Profile updated successfully', 'success');
        },
        error: (error) => {
          this.noti.show('Error updating profile', 'error');
        }
      });
  }

  getAvatarUrl(): string {
    if (this.userProfile.avatarUrl) {
      return this.userService.getAvatarUrl(this.userProfile.username, this.userProfile.avatarUrl);
    } else {
      return 'assets/avatar.png'; // Đường dẫn đến ảnh mặc định
    }
  }
}
