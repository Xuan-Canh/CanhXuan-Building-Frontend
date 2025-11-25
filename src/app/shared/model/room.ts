export interface RoomDto extends CreateRoomDto {

  building?: any;
}

export interface CreateRoomDto {
  name: string;
  floor: number;
  capacity: number;
  price: number;
  status: string;
  description: string;
  images?: RoomImage[];
  buildingId: number;
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

