import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/service/room.service';
import { Room, RoomDto, RoomImage } from '../../shared/model/room';
import { Building } from "../../shared/model/building";
import { BuildingService } from "../../core/service/building.service";
import { NotificationService } from "../../core/service/notification.service";

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  rooms: Room[] = [];
  buildings: Building[] = [];
  selectedRoom: RoomDto = this.initRoom();
  selectedRoomDetail: Room | null = null; // Thêm biến cho chi tiết phòng
  roomImages: RoomImage[] = [];
  showForm: boolean = false;
  showDetailModal: boolean = false; // Đổi tên từ showDetail thành showDetailModal
  isEdit: boolean = false;
  selectedFile: File | null = null;
  currentRoomId: number = 0;

  keyword = '';
  state = {
    isLoading: false,
    searchState: false
  };

  currentPage = 0;
  totalPage = 0;

  isAdmin = false;

  constructor(
    private roomService: RoomService,
    private buildingService: BuildingService, // Thêm BuildingService
    private noti: NotificationService
  ) {
    const currentRole = localStorage.getItem('role');
    this.isAdmin = currentRole === 'ADMIN';
  }

  ngOnInit(): void {
    this.loadRooms(0);
    this.loadBuildings(0,100);
  }

  initRoom(): RoomDto {
    return {
      name: '',
      floor: 0,
      capacity: 0,
      price: 0,
      status: 'available',
      description: ''
    };
  }

  loadBuildings(page: number, size?: number): void {
    this.buildingService.getAll(page, size).subscribe({
      next: (response) => {
        this.buildings = response.data.content;
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
        this.noti.show('Không thể tải danh sách tòa nhà', 'error');
      }
    });
  }

  loadRooms(page: number): void {
    if (this.state.searchState && this.keyword.length > 0) {
      this.searchRooms(this.keyword, page);
    } else {
      this.roomService.getAll(page).subscribe({
        next: (response) => {
          this.rooms = response.data.content;
          this.totalPage = response.data.totalPages;
          this.currentPage = response.data.number;

          console.log('Loaded rooms:', {
            currentPage: this.currentPage,
            totalPage: this.totalPage,
            roomsCount: this.rooms.length
          });
        },
        error: (error) => {
          console.error('Error loading rooms:', error);
          this.noti.show('Không thể tải danh sách phòng', 'error');
        }
      });
    }
  }

  searchRooms(keyword: string, page?: number) {
    this.state.isLoading = true;
    this.roomService.searchWithPage(keyword, page)
      .subscribe({
        next: (response) => {
          this.rooms = response.data.content;
          this.currentPage = response.data.number;
          this.totalPage = response.data.totalPages;
          this.state.searchState = true;
          this.state.isLoading = false;
        },
        error: err => {
          this.noti.show('Lỗi tìm kiếm', 'error');
          this.state.isLoading = false;
        }
      });
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState) {
        this.searchRooms(this.keyword, this.currentPage + 1);
      } else {
        this.loadRooms(this.currentPage + 1);
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      if (this.keyword.length > 0 && this.state.searchState) {
        this.searchRooms(this.keyword, this.currentPage - 1);
      } else {
        this.loadRooms(this.currentPage - 1);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState) {
        this.searchRooms(this.keyword, page)
      } else {
        this.loadRooms(page);
      }
    }
  }

  getPageNumbers(): number[] {
    const maxPages = 5;
    const pages: number[] = [];

    if (this.totalPage <= maxPages) {
      for (let i = 0; i < this.totalPage; i++) {
        pages.push(i);
      }
    } else {
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

  // CRUD operations
  showCreateForm(): void {
    this.selectedRoom = this.initRoom();
    this.isEdit = false;
    this.showForm = true;
  }

  showEditForm(room: Room): void {
    this.selectedRoom = { ...room };
    this.isEdit = true;
    this.showForm = true;
  }

  saveRoom(id?: number): void {
    if (this.isEdit && id) {
      this.roomService.update(id, this.selectedRoom).subscribe({
        next: () => {
          this.noti.show('Cập nhật phòng thành công', 'success');
          this.loadRooms(this.currentPage);
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating room:', error);
          this.noti.show('Lỗi cập nhật phòng', 'error');
        }
      });
    } else {
      const buildingId = this.selectedRoom.building?.id;
      if (buildingId) {
        this.roomService.create(buildingId, this.selectedRoom).subscribe({
          next: () => {
            this.noti.show('Thêm phòng thành công', 'success');
            this.loadRooms(this.currentPage);
            this.cancelForm();
          },
          error: (error) => {
            console.error('Error creating room:', error);
            this.noti.show('Lỗi thêm phòng', 'error');
          }
        });
      } else {
        this.noti.show('Vui lòng chọn tòa nhà', 'info');
      }
    }
  }

  deleteRoom(id: number | undefined): void {
    if (!this.isAdmin) return;

    if (id && confirm('Bạn có chắc muốn xóa phòng này?')) {
      this.roomService.delete(id).subscribe({
        next: () => {
          this.noti.show('Xóa phòng thành công', 'success');
          this.loadRooms(this.currentPage);
        },
        error: (error) => {
          console.error('Error deleting room:', error);
          this.noti.show('Lỗi xóa phòng', 'error');
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.selectedRoom = this.initRoom();
  }

  // View room detail with images - Method mới
  viewRoomDetail(roomId: number): void {
    if (!roomId) return;

    // Tìm thông tin phòng từ danh sách hiện tại
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      this.selectedRoomDetail = room;
      this.currentRoomId = roomId;
      this.showDetailModal = true;

      // Load danh sách ảnh
      this.loadRoomImages(roomId);
    } else {
      // Nếu không tìm thấy trong danh sách, gọi API
      this.roomService.getById(roomId).subscribe({
        next: (response) => {
          this.selectedRoomDetail = response.data;
          this.currentRoomId = roomId;
          this.showDetailModal = true;
          this.loadRoomImages(roomId);
        },
        error: (error) => {
          console.error('Error loading room detail:', error);
          this.noti.show('Không thể tải thông tin phòng', 'error');
        }
      });
    }
  }

  // Load room images
  loadRoomImages(roomId: number): void {
    this.roomService.getImages(roomId).subscribe({
      next: (response) => {
        this.roomImages = response.data;
      },
      error: (error) => {
        console.error('Error loading images:', error);
        this.roomImages = [];
      }
    });
  }

  // Image operations
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        this.noti.show('Vui lòng chọn file ảnh', 'info');
        return;
      }
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.noti.show('Kích thước ảnh không được vượt quá 5MB', 'info');
        return;
      }
      this.selectedFile = file;
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      this.noti.show('Vui lòng chọn ảnh', 'info');
      return;
    }

    if (!this.currentRoomId) {
      this.noti.show('Không tìm thấy thông tin phòng', 'error');
      return;
    }

    this.roomService.uploadImage(this.currentRoomId, this.selectedFile).subscribe({
      next: () => {
        this.noti.show('Upload ảnh thành công', 'success');
        this.loadRoomImages(this.currentRoomId);
        this.selectedFile = null;

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.noti.show('Lỗi upload ảnh', 'error');
      }
    });
  }

  deleteImage(imageId: number): void {
    if (!this.isAdmin) return;

    if (this.currentRoomId && confirm('Bạn có chắc muốn xóa hình ảnh này?')) {
      this.roomService.deleteImage(this.currentRoomId, imageId).subscribe({
        next: () => {
          this.noti.show('Xóa ảnh thành công', 'success');
          this.loadRoomImages(this.currentRoomId);
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.noti.show('Lỗi xóa ảnh', 'error');
        }
      });
    }
  }

  getImageUrl(fileName: string): string {
    return this.currentRoomId ? this.roomService.getImageUrl(this.currentRoomId, fileName) : '';
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedRoomDetail = null;
    this.currentRoomId = 0;
    this.roomImages = [];
    this.selectedFile = null;
  }
}
