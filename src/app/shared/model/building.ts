import {Image} from "./image";

export interface Building {
  id: number;
  name: string;
  address: string;
  floors: number;
  rooms: number
  description: string;
  mainImage?: string;
  imageCount?: number;
}

export interface CreateBuildingDto {
  name: string;
  address: string;
  floors: number;
  rooms: number
  description: string;
}



export interface BuildingImage extends Image{
  buildingId: number;
}
