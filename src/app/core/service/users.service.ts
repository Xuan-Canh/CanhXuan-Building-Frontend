import { Injectable } from '@angular/core';
import {User, UserDto} from "../../shared/model/user";
import { Observable } from 'rxjs';
import { ApiResponse, Page } from '../../shared/model/api-response';
import { CrudService } from './generic/crud.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private crudService: CrudService) { }

  getAll(page: number): Observable<ApiResponse<Page<User>>> {
    return this.crudService.getAll('users', page);
  }

  create(user: UserDto) : Observable<ApiResponse<User>> {
    return this.crudService.create('users', user);
  }

  update(userId: number, userDto: UserDto) : Observable<ApiResponse<User>> {
    return this.crudService.update('users', userId, userDto)
  }

  delete(userId: number) : Observable<ApiResponse<any>> {
    return this.crudService.delete('user', userId);
  }
}
