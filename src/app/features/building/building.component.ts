import {Component, OnInit} from '@angular/core';
import {Building, BuildingImage, CreateBuildingDto} from '../../shared/model/building';
import {BuildingService} from "../../core/service/building.service";
import {NotificationService} from "../../core/service/notification.service";
import {BuildingImageService} from "../../core/service/building-image.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building.component.html',
  styleUrl: './building.component.css'
})
export class BuildingComponent implements OnInit {
  buildings: Building[] = [];
  buildingImages: BuildingImage[] = [];
  buildingImageMaps: Map<number, BuildingImage[]> = new Map();
  carouselIndexes: Map<number, number> = new Map();
  selectedFiles: File[] = [];

  loading = false;
  showForm = false;
  submitting = false;
  editting = false;
  edittingId = 0;
  currentBuildingId = 0;
  uploadingImage = false;

  newBuilding: CreateBuildingDto = {
    name: '',
    address: '',
    floors: 0,
    rooms: 0,
    description: ''
  }

  constructor(
    private buildingService: BuildingService,
    private imageService: BuildingImageService,
    private noti: NotificationService
  ) {}

  ngOnInit() {
    this.loadBuildings();
  }

  loadBuildings() {
    this.loading = true;
    this.buildingService.getAll().subscribe({
      next: (response) => {
        this.buildings = response.data;
        this.buildings.forEach(b => {
          this.loadBuildingImages(b.id);
          this.carouselIndexes.set(b.id, 0);
        });
        this.loading = false;
      },
      error: (err) => {
        this.noti.show('Lỗi tải danh sách chung cư', 'error');
        this.loading = false;
      }
    });
  }

  loadBuildingImages(buildingId: number) {
    this.imageService.getBuildingImages(buildingId).subscribe({
      next: (images) => {
        this.buildingImageMaps.set(buildingId, images.data);
        // Cập nhật buildingImages nếu đang edit building này
        if (this.editting && this.currentBuildingId === buildingId) {
          this.buildingImages = images.data;
        }
      },
      error: (err) => console.error('Error loading images:', err)
    });
  }

  getBuildingImages(buildingId: number): BuildingImage[] {
    return this.buildingImageMaps.get(buildingId) || [];
  }

  getCurrentImage(buildingId: number): BuildingImage {
    const images = this.getBuildingImages(buildingId);
    const index = this.carouselIndexes.get(buildingId) || 0;
    return images[index];
  }

  getCarouselIndex(buildingId: number): number {
    return this.carouselIndexes.get(buildingId) || 0;
  }

  setCarouselIndex(buildingId: number, index: number) {
    this.carouselIndexes.set(buildingId, index);
  }

  previousImage(buildingId: number) {
    const images = this.getBuildingImages(buildingId);
    const currentIndex = this.carouselIndexes.get(buildingId) || 0;
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    this.carouselIndexes.set(buildingId, newIndex);
  }

  nextImage(buildingId: number) {
    const images = this.getBuildingImages(buildingId);
    const currentIndex = this.carouselIndexes.get(buildingId) || 0;
    const newIndex = (currentIndex + 1) % images.length;
    this.carouselIndexes.set(buildingId, newIndex);
  }

  getImageUrl(buildingId: number, fileName: string): string {
    return this.imageService.getBuildingImageUrl(buildingId, fileName);
  }

  addbuilding() {
    this.showForm = true;
    this.editting = false;
    this.newBuilding = {
      name: '',
      address: '',
      floors: 0,
      rooms: 0,
      description: ''
    };
  }

  editBuilding(id: number) {
    const building = this.buildings.find(b => b.id === id);
    if (building) {
      this.showForm = true;
      this.editting = true;
      this.edittingId = id;
      this.currentBuildingId = id;
      this.newBuilding = { ...building };
      this.buildingImages = this.getBuildingImages(id);
    }
  }

  submitBuilding() {
    if (!this.newBuilding.name || !this.newBuilding.address) {
      this.noti.show('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    this.submitting = true;
    const request = this.editting
      ? this.buildingService.update(this.edittingId, this.newBuilding)
      : this.buildingService.create(this.newBuilding);

    request.subscribe({
      next: (data) => {
        this.noti.show(
          this.editting ? 'Cập nhật thành công' : 'Thêm mới thành công',
          'success'
        );
        this.loadBuildings();
        this.cancelForm();
        this.submitting = false;
      },
      error: (err) => {
        this.noti.show('Có lỗi xảy ra', 'error');
        this.submitting = false;
      }
    });
  }

  deletebuilding(id: number) {
    if (confirm('Bạn có chắc muốn xóa chung cư này?')) {
      this.buildingService.delete(id).subscribe({
        next: () => {
          this.noti.show('Xóa thành công', 'success');
          this.loadBuildings();
        },
        error: (err) => {
          this.noti.show('Lỗi khi xóa', 'error');
        }
      });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editting = false;
    this.edittingId = 0;
    this.selectedFiles = [];
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadImages(buildingId: number) {
    if (this.selectedFiles.length === 0) {
      this.noti.show('Chưa chọn file nào', 'error');
      return;
    }

    this.uploadingImage = true;
    let uploadedCount = 0;
    let errorCount = 0;

    // Upload từng file
    this.selectedFiles.forEach((file, index) => {
      this.imageService.uploadBuildingImage(buildingId, file).subscribe({
        next: () => {
          uploadedCount++;
          if (uploadedCount + errorCount === this.selectedFiles.length) {
            this.finishUpload(buildingId, uploadedCount, errorCount);
          }
        },
        error: (err) => {
          errorCount++;
          console.error(`Lỗi upload file ${file.name}:`, err);
          if (uploadedCount + errorCount === this.selectedFiles.length) {
            this.finishUpload(buildingId, uploadedCount, errorCount);
          }
        }
      });
    });
  }

  private finishUpload(buildingId: number, successCount: number, errorCount: number) {
    this.uploadingImage = false;
    this.selectedFiles = [];

    if (errorCount === 0) {
      this.noti.show(`Upload thành công ${successCount} ảnh`, 'success');
    } else if (successCount > 0) {
      this.noti.show(`Upload ${successCount} ảnh, ${errorCount} ảnh lỗi`, 'error');
    } else {
      this.noti.show('Upload thất bại', 'error');
    }

    // Load lại ảnh và cập nhật UI
    this.loadBuildingImages(buildingId);

    // Reset input file
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


  deleteImage(buildingId: number, imageId: number) {
    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
      this.imageService.deleteBuildingImage(buildingId, imageId).subscribe({
        next: () => {
          this.noti.show('Xóa ảnh thành công', 'success');
          this.loadBuildingImages(buildingId);
        },
        error: (err) => {
          this.noti.show('Lỗi khi xóa ảnh', 'error');
        }
      });
    }
  }
}
