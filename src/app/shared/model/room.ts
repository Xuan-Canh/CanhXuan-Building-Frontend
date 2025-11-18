export interface Room {
  id?: number;
  name: string;
  floor: number;
  capacity: number;
  price: number;
  status: string;
  description: string;
  images?: RoomImage[];
  building?: any;
}

export interface RoomImage {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
}

