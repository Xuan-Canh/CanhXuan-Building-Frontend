import { Injectable } from '@angular/core';
import {ImageService} from "./generic/image.service";
import {Observable} from "rxjs";
import {BuildingImage} from "../../shared/model/building";
import {ApiResponse} from "../../shared/model/api-response";

@Injectable({
  providedIn: 'root'
})
export class BuildingImageService {

  constructor(private imageService: ImageService) { }

  uploadBuildingImage(buildingId: number, imageFile: File): Observable<ApiResponse<BuildingImage>> {
    return this.imageService.upLoadImage('buildings', buildingId, imageFile);
  }

  getBuildingImages(buildingId: number): Observable<ApiResponse<BuildingImage[]>> {
    return this.imageService.getImages('buildings', buildingId);
  }

  deleteBuildingImage(buildingId: number, imageId: number): Observable<ApiResponse<any>> {
    return this.imageService.deleteImage('buildings', buildingId, imageId);
  }

  getBuildingImageUrl(buildingId: number, fileName: string): string {
    return this.imageService.getImageUrl('buildings', buildingId, fileName);
  }
}
