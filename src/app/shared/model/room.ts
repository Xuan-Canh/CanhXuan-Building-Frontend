export interface RoomDto {
  name: string;
  floor: number;
  capacity: number;
  price: number;
  status: string;
  description: string;
  images?: RoomImage[];
  building?: any;
}

export interface Room extends RoomDto {
  id: number;
}

export interface RoomImage {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
}

