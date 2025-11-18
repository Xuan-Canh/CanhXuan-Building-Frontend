import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/service/room.service';
import {Room, RoomDto, RoomImage} from '../../shared/model/room';
import {Building} from "../../shared/model/building";
import {BuildingService} from "../../core/service/building.service";

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
  roomImages: RoomImage[] = [];
  searchName: string = '';
  selectedBuildingId: number = 0;
  showForm: boolean = false;
  showImageModal: boolean = false;
  isEdit: boolean = false;
  selectedFile: File | null = null;
  currentRoomId: number | null = null;

  constructor(private roomService: RoomService,
              private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadBuildings();
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

  loadRooms(): void {
    this.roomService.getAll().subscribe({
      next: (response) => {
        this.rooms = response.data;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  loadBuildings(): void {
    this.buildingService.getAll().subscribe({
      next: (response) => {
        this.buildings = response.data;
      },
      error: (error) => {
        console.error('Error loading buildings:', error);
      }
    })
  }

  search(): void {
    if (this.searchName.trim()) {
      this.roomService.getByName(this.searchName).subscribe({
        next: (response) => {
          this.rooms = response.data;
        },
        error: (error) => {
          console.error('Error searching rooms:', error);
        }
      });
    } else {
      this.loadRooms();
    }
  }

  filterByBuilding(): void {
    if (this.selectedBuildingId) {
      this.roomService.getByBuildingId(Number(this.selectedBuildingId)).subscribe({
        next: (response) => {
          this.rooms = response.data;
        },
        error: (error) => {
          console.error('Error filtering rooms:', error);
        }
      });
    } else {
      this.loadRooms();
    }
  }

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

  saveRoom(roomId?: number): void {
    if (this.isEdit && roomId) {
      this.roomService.update(roomId, this.selectedRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error updating room:', error);
        }
      });
    } else {
      const buildingId = this.selectedRoom.building?.id;
      this.roomService.create(buildingId, this.selectedRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.cancelForm();
        },
        error: (error) => {
          console.error('Error creating room:', error);
        }
      });
    }
  }

  deleteRoom(id: number | undefined): void {
    if (id && confirm('Bạn có chắc muốn xóa phòng này?')) {
      this.roomService.delete(id).subscribe({
        next: () => {
          this.loadRooms();
        },
        error: (error) => {
          console.error('Error deleting room:', error);
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.selectedRoom = this.initRoom();
  }

  viewDetail(id: number | undefined): void {
    if (id) {
      this.roomService.getById(id).subscribe({
        next: (response) => {
          this.selectedRoom = response.data;
          this.showForm = true;
          this.isEdit = true;
        },
        error: (error) => {
          console.error('Error loading room detail:', error);
        }
      });
    }
  }

  showImages(roomId?: number | null): void {
    if (roomId) {
      this.currentRoomId = roomId;
      this.roomService.getImages(roomId).subscribe({
        next: (response) => {
          this.roomImages = response.data;
          this.showImageModal = true;
        },
        error: (error) => {
          console.error('Error loading images:', error);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadImage(): void {
    if (this.selectedFile && this.currentRoomId) {
      this.roomService.uploadImage(this.currentRoomId, this.selectedFile).subscribe({
        next: () => {
          this.showImages(this.currentRoomId);
          this.selectedFile = null;
          // Reset input file
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (error) => {
          console.error('Error uploading image:', error);
        }
      });
    }
  }

  deleteImage(imageId: number): void {
    if (this.currentRoomId && confirm('Bạn có chắc muốn xóa hình ảnh này?')) {
      this.roomService.deleteImage(this.currentRoomId, imageId).subscribe({
        next: () => {
          this.showImages(this.currentRoomId);
        },
        error: (error) => {
          console.error('Error deleting image:', error);
        }
      });
    }
  }

  getImageUrl(fileName: string): string {
    return this.currentRoomId ? this.roomService.getImageUrl(this.currentRoomId, fileName) : '';
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.currentRoomId = null;
    this.roomImages = [];
    this.selectedFile = null;
  }
}
