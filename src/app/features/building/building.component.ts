import {Component, OnInit} from '@angular/core';
import {Building, BuildingImage, CreateBuildingDto} from '../../shared/model/building';
import {BuildingService} from "../../core/service/building.service";
import {NotificationService} from "../../core/service/notification.service";
import {BuildingImageService} from "../../core/service/building-image.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building.component.html',
  styleUrl: './building.component.css'
})
export class BuildingComponent implements OnInit {
  buildings: Building[] = [];
  selectedFiles: File[] = [];
  editingBuilding: Building | null = null;

  state = {
    loading: false,
    showForm: false,
    submitting: false,
    editing: false,
    editingId: 0,
    uploading: false
  };

  newBuilding: CreateBuildingDto = {
    name: '',
    address: '',
    floors: 0,
    rooms: 0,
    description: ''
  };

  constructor(
    private buildingService: BuildingService,
    private imageService: BuildingImageService,
    private noti: NotificationService
  ) {}

  ngOnInit() {
    this.loadBuildings();
  }

  loadBuildings() {
    this.state.loading = true;
    this.buildingService.getAll().subscribe({
      next: (response) => {
        this.buildings = response.data;
        this.buildings.forEach((building) => {
          building.mainImage = building.images[0]?.fileName || null;
        })
        this.state.loading = false;
      },
      error: () => {
        this.noti.show('Lỗi tải danh sách chung cư', 'error');
        this.state.loading = false;
      }
    });
  }

  getMainImage(buildingId: number): string | null {
    const building = this.buildings.find(b => b.id === buildingId);
    return building?.mainImage || null;
  }

  addBuilding() {
    this.state.showForm = true;
    this.state.editing = false;
    this.editingBuilding = null;
    this.resetForm();
  }

  editBuilding(id: number) {
    this.state.editing = true;
    this.state.editingId = id;
    this.state.showForm = true;

    // Load chi tiết building để lấy danh sách ảnh đầy đủ
    this.buildingService.getById(id).subscribe({
      next: (response) => {
        this.editingBuilding = response.data;
        this.newBuilding = {
          name: response.data.name,
          address: response.data.address,
          floors: response.data.floors,
          rooms: response.data.rooms,
          description: response.data.description
        };
      },
      error: () => {
        this.noti.show('Lỗi tải thông tin chung cư', 'error');
        const building = this.buildings.find(b => b.id === id);
        if (building) {
          this.newBuilding = { ...building };
        }
      }
    });
  }

  submitBuilding() {
    if (!this.newBuilding.name || !this.newBuilding.address) {
      this.noti.show('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    this.state.submitting = true;
    const request = this.state.editing
      ? this.buildingService.update(this.state.editingId, this.newBuilding)
      : this.buildingService.create(this.newBuilding);

    request.subscribe({
      next: () => {
        this.noti.show(
          this.state.editing ? 'Cập nhật thành công' : 'Thêm mới thành công',
          'success'
        );
        this.loadBuildings();
        this.cancelForm();
      },
      error: () => {
        this.noti.show('Có lỗi xảy ra', 'error');
        this.state.submitting = false;
      }
    });
  }

  deleteBuilding(id: number) {
    if (confirm('Bạn có chắc muốn xóa chung cư này?')) {
      this.buildingService.delete(id).subscribe({
        next: () => {
          this.noti.show('Xóa thành công', 'success');
          this.loadBuildings();
        },
        error: () => this.noti.show('Lỗi khi xóa', 'error')
      });
    }
  }

  cancelForm() {
    this.state.showForm = false;
    this.state.editing = false;
    this.state.editingId = 0;
    this.state.submitting = false;
    this.selectedFiles = [];
    this.editingBuilding = null;
    this.resetForm();
  }

  resetForm() {
    this.newBuilding = {
      name: '',
      address: '',
      floors: 0,
      rooms: 0,
      description: ''
    };
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadImages(buildingId: number) {
    if (this.selectedFiles.length === 0) {
      this.noti.show('Chưa chọn file nào', 'error');
      return;
    }

    this.state.uploading = true;

    const uploads = this.selectedFiles.map(file =>
      this.imageService.uploadBuildingImage(buildingId, file)
    );

    forkJoin(uploads).subscribe({
      next: (results) => {
        this.noti.show(`Upload thành công ${results.length} ảnh`, 'success');
        this.selectedFiles = [];
        this.state.uploading = false;

        // Reload chi tiết building
        this.buildingService.getById(buildingId).subscribe({
          next: (response) => {
            this.editingBuilding = response.data;
            this.loadBuildings(); // Cập nhật list
          }
        });
      },
      error: () => {
        this.noti.show('Có lỗi khi upload', 'error');
        this.state.uploading = false;
      }
    });
  }

  deleteImage(buildingId: number, imageId: number) {
    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
      this.imageService.deleteBuildingImage(buildingId, imageId).subscribe({
        next: () => {
          this.noti.show('Xóa ảnh thành công', 'success');

          // Reload chi tiết building
          this.buildingService.getById(buildingId).subscribe({
            next: (response) => {
              this.editingBuilding = response.data;
              this.loadBuildings(); // Cập nhật list
            }
          });
        },
        error: () => this.noti.show('Lỗi khi xóa ảnh', 'error')
      });
    }
  }

  // Helper methods
  trackByImageId(index: number, image: BuildingImage): number {
    return image.id;
  }

  getImageUrl(buildingId: number, filename: string): string {
    return this.imageService.getBuildingImageUrl(buildingId, filename);
  }
}
