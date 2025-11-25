export interface ApiResponse<T> {
  success: boolean;
  message: string;
  errors: string[];
  data: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
