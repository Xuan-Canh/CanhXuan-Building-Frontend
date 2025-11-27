import {Component, OnInit} from '@angular/core';
import {Building, BuildingImage, CreateBuildingDto} from '../../shared/model/building';
import {BuildingService} from "../../core/service/building.service";
import {NotificationService} from "../../core/service/notification.service";
import {BuildingImageService} from "../../core/service/building-image.service";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {forkJoin} from 'rxjs';
import {PopupService} from "../../core/service/popup.service";

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
  currentPage = 0;
  totalPage = 0;

  keyword = '';

  isAdmin = false;

  state = {
    loading: false,
    showForm: false,
    submitting: false,
    editing: false,
    editingId: 0,
    uploading: false,
    searchState: false
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
    private noti: NotificationService,
    private popup: PopupService
  ) {
    const currentRole = localStorage.getItem('role');
    this.isAdmin = currentRole === 'ADMIN';
  }

  ngOnInit() {
    this.loadBuildings(0);
  }

  loadBuildings(page: number) {
    this.state.loading = true;
    if (this.state.searchState && this.keyword.length > 0) {
      this.searchCustomer(this.keyword, page);
    } else {
      this.buildingService.getAll(page).subscribe({
        next: (response) => {
          this.buildings = response.data.content;
          this.currentPage = response.data.number;
          this.totalPage = response.data.totalPages;

          this.buildings.forEach((building) => {
            building.mainImage = building.images[0]?.fileName || null;
            building.imageCount = building.images?.length || 0;
          });
          this.state.loading = false;
        },
        error: () => {
          this.noti.show('Lỗi tải danh sách chung cư', 'error');
          this.state.loading = false;
        }
      });
    }
  }

  searchCustomer(keyword: string, page?: number) {
    this.state.loading = true;
    this.buildingService.searchWithPage(keyword, page)
      .subscribe({
        next: (response) => {
          this.buildings = response.data.content;
          this.currentPage = response.data.number;
          this.totalPage = response.data.totalPages;
          this.buildings.forEach((building) => {
            building.mainImage = building.images[0]?.fileName || null;
            building.imageCount = building.images?.length || 0;
          });
          this.state.searchState = true;
          this.state.loading = false;
        },
        error: err => {
          this.noti.show('Loi tim kiem', 'error');
          this.state.loading = false;
        }
      });
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage + 1 < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState){
        this.searchCustomer(this.keyword, this.currentPage + 1);
      } else {
        this.loadBuildings(this.currentPage + 1);
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      if (this.keyword.length > 0 && this.state.searchState){
        this.searchCustomer(this.keyword, this.currentPage - 1);
      } else {
        this.loadBuildings(this.currentPage - 1);
      }
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPage) {
      if (this.keyword.length > 0 && this.state.searchState) {
        this.searchCustomer(this.keyword, page)
      } else{
        this.loadBuildings(page);
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
      next: (response) => {
        if (response.success) {
          const message = this.state.editing ? 'Cập nhật thành công' : 'Tạo mới thành công';
          this.noti.show(message, 'success');
          this.loadBuildings(this.currentPage);
          this.cancelForm();
        } else {
          if (response.errors.length>0) {
            response.errors.forEach((error) => {
              this.noti.show(error, 'error');
            });
            this.state.submitting = false;
          } else {
            const message = response.message;
            this.noti.show(message, 'error');
            this.state.submitting = false;
          }
        }
      },
      error: (error) => {
        this.noti.show(error.message , 'error');
        this.state.submitting = false;
      }
    });
  }

  async deleteBuilding(id: number) {
    const confirmed = await this.popup.show({
      title: 'Xóa chung cư',
      message: 'Bạn có chắc chắn muốn xóa chung cư này? Hành động này không thể hoàn tác.',
      confirmText: '🗑️ Xóa',
      cancelText: '✕ Hủy',
      type: 'danger'
    });

    if (confirmed) {
      this.buildingService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.noti.show('Xóa thành công', 'success');
            this.loadBuildings(this.currentPage);
          }
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
            this.loadBuildings(this.currentPage); // Cập nhật list
          }
        });
      },
      error: () => {
        this.noti.show('Có lỗi khi upload', 'error');
        this.state.uploading = false;
      }
    });
  }

  async deleteImage(buildingId: number, imageId: number) {
    const confirmed = await this.popup.show({
      title: 'Xóa hình ảnh',
      message: 'Bạn có chắc chắn muốn xóa hình ảnh này?',
      confirmText: '🗑️ Xóa',
      cancelText: '✕ Hủy',
      type: 'warning'
    });

    if (confirmed) {
      this.imageService.deleteBuildingImage(buildingId, imageId).subscribe({
        next: () => {
          this.noti.show('Xóa ảnh thành công', 'success');

          // Reload chi tiết building
          this.buildingService.getById(buildingId).subscribe({
            next: (response) => {
              this.editingBuilding = response.data;
              this.loadBuildings(this.currentPage);
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
