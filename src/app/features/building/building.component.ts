import {Component, OnInit} from '@angular/core';
import {Building, BuildingImage, CreateBuildingDto} from '../../shared/model/building';
import {BuildingService} from "../../core/service/building.service";
import {NotificationService} from "../../core/service/notification.service";
import {BuildingImageService} from "../../core/service/building-image.service";
import {forkJoin} from "rxjs";
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
  buildingImageMaps: Map<number, BuildingImage[]> = new Map<number, BuildingImage[]>();
  selectedFiles: File[] = [];

  loading = false;
  showForm = false;
  submitting = false;
  editting = false;
  edittingId = 0;
  currenImageIndex = 0;
  showImageModal = false;
  uploadingImage = false;

  newBuilding: CreateBuildingDto = {
    name: '',
    address: '',
    floors: 0,
    rooms: 0,
    description: ''
  }

  constructor(private buildingService: BuildingService,
              private imageService: BuildingImageService,
              private noti: NotificationService) {
  }

  ngOnInit() {
    console.log('BuildingComponent initialized');
    this.loadBuildings();
  }

  loadBuildings() {
    this.loading = true;
    this.buildingService.getAll().subscribe({
      next: (response) => {
        this.buildings = response.data;
        this.buildings.forEach((building) => {
          this.loadBuildingImages(building.id);
        });
        this.loading = false;
        console.log(this.buildings);
        console.log('Buildings loaded successfully');
      },
      error: (error) => {
        this.noti.show('Failed to load buildings', 'error');
        this.loading = false;
      }
    })
  }

  loadBuildingImages(buildingId: number) {
    this.imageService.getBuildingImages(buildingId).subscribe({
      next: (response) => {
        this.buildingImageMaps.set(buildingId, response.data);
        const building = this.buildings.find(b => b.id === buildingId);
        if (building && response.data.length > 0) {
          building.mainImage = response.data[0].fileName;
          building.imageCount = response.data.length;
        }
      },
      error: (error) => {
        this.noti.show('Failed to load building images', 'error');
      }
    });
  }

  viewBuildingImages(buildingId: number) {
    const images = this.buildingImageMaps.get(buildingId);
    if (images && images.length > 0) {
      this.buildingImages = images;
      this.currenImageIndex = 0;
      this.showImageModal = true;
    } else {
      this.noti.show('Chung cư này chưa có ảnh', 'info');
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const maxSizePerFile = 10 * 1024 * 1024;
      const invalidFiles = Array.from(files).filter((file: any) => file.size > maxSizePerFile);

      if (invalidFiles.length > 0) {
        this.noti.show('Một số file lớn hơn 10MB. Vui lòng chọn file nhỏ hơn.', 'error');
        event.target.value = '';
        return;
      }

      this.selectedFiles = Array.from(files);
      console.log('Files selected:', this.selectedFiles.length);
    }
  }

  uploadImages(buildingId: number) {
    if (this.selectedFiles.length === 0) {
      this.noti.show('Vui lòng chọn ảnh', 'info');
      return;
    }

    console.log(`Starting upload for building ${buildingId}`);
    this.uploadingImage = true;

    const uploads$ = this.selectedFiles.map(file => {
      console.log(`Preparing upload: ${file.name}`);
      return this.imageService.uploadBuildingImage(buildingId, file);
    });

    forkJoin(uploads$).subscribe({
      next: (results) => {
        console.log('Upload completed:', results);
        this.noti.show('Upload ảnh thành công!', 'success');
        this.loadImages(buildingId);
        this.loadBuildingImages(buildingId);
        this.selectedFiles = [];
        this.uploadingImage = false;
      },
      error: (err) => {
        // console.error('Upload error:', err);
        // this.noti.show(`Upload ảnh thất bại: ${err.message}`, 'error');
        this.uploadingImage = false;
      }
    });
  }

  deleteImage(buildingId: number, imageId: number) {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) {
      return;
    }

    this.imageService.deleteBuildingImage(buildingId, imageId).subscribe({
      next: () => {
        this.buildingImages = this.buildingImages.filter(img => img.id !== imageId);
        this.loadBuildingImages(buildingId);
        this.noti.show('Xóa ảnh thành công', 'success');
      },
      error: (err) => {
        console.error('Delete image error:', err);
        this.noti.show('Xóa ảnh thất bại', 'error');
      }
    });
  }

  getImageUrl(fileName: string) {
    return this.imageService.getBuildingImageUrl(fileName);
  }

  loadImages(buildingId: number) {
    this.imageService.getBuildingImages(buildingId).subscribe({
      next: (response) => {
        this.buildingImages = response.data;
        console.log('Loaded images:', response.data);
      },
      error: (err) => {
        console.error('Load images error:', err);
      }
    });
  }

  addbuilding() {
    this.showForm = true;
  }

  submitBuilding() {
    if (!this.newBuilding.name || !this.newBuilding.address) {
      this.noti.show('Vui lòng điền tên và địa chỉ', 'error');
      return;
    }

    this.submitting = true;

    if (this.editting) {
      this.buildingService.update(this.edittingId, this.newBuilding)
        .subscribe({
          next: (response) => {
            this.noti.show('Cập nhật chung cư thành công', 'success');
            this.loadBuildings();
            this.resetForm();
          },
          error: (err) => {
            console.error(err);
            this.noti.show('Lỗi khi cập nhật chung cư', 'error');
            this.submitting = false;
          }
        });
    } else {
      this.buildingService.create(this.newBuilding).subscribe({
        next: (response) => {
          this.noti.show('Thêm chung cư thành công', 'success');
          this.loadBuildings();
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.noti.show('Lỗi khi thêm chung cư', 'error');
          this.submitting = false;
        }
      });
    }
  }

  editBuilding(id: number) {
    const building = this.buildings.find(building => building.id === id);

    if (!building) {
      this.noti.show('Không tìm thấy chung cư', 'error');
      return;
    }

    this.newBuilding = {
      name: building.name,
      address: building.address,
      floors: building.floors,
      rooms: building.rooms,
      description: building.description
    };

    this.showForm = true;
    this.editting = true;
    this.edittingId = id;
    this.loadImages(id);
  }

  deletebuilding(id: number) {
    if (!confirm('Bạn có chắc muốn xóa chung cư này?')) {
      return;
    }

    this.buildingService.delete(id)
      .subscribe({
        next: (response) => {
          this.noti.show('Xóa chung cư thành công', 'success');
          this.loadBuildings();
        },
        error: (err) => {
          console.error(err);
          this.noti.show('Lỗi khi xóa chung cư', 'error');
        }
      });
  }

  cancelForm() {
    this.resetForm();
  }

  resetForm() {
    this.showForm = false;
    this.submitting = false;
    this.editting = false;
    this.edittingId = 0;
    this.buildingImages = [];
    this.selectedFiles = [];
    this.newBuilding = {
      name: '',
      address: '',
      floors: 0,
      rooms: 0,
      description: ''
    };
  }

  openImageModal(index: number) {
    this.currenImageIndex = index;
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  previousImage() {
    if (this.buildingImages.length > 0) {
      this.currenImageIndex =
        (this.currenImageIndex - 1 + this.buildingImages.length) % this.buildingImages.length;
    }
  }

  nextImage() {
    if (this.buildingImages.length > 0) {
      this.currenImageIndex = (this.currenImageIndex + 1) % this.buildingImages.length;
    }
  }

  getCurrentImage(): BuildingImage | null {
    return this.buildingImages[this.currenImageIndex] || null;
  }

  handleKeyPress(event: KeyboardEvent) {
    if (this.showImageModal) {
      if (event.key === 'ArrowLeft') {
        this.previousImage();
      } else if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'Escape') {
        this.closeImageModal();
      }
    }
  }
}
