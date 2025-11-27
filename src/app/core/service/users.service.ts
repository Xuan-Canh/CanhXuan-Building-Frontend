import { Injectable } from '@angular/core';
import {User, UserDto} from "../../shared/model/user";
import { Observable } from 'rxjs';
import { ApiResponse, Page } from '../../shared/model/api-response';
import { CrudService } from './generic/crud.service';
import {environment} from "../../shared/model/enviroment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  profileUrl = `${environment.apiUrl}/users/profile`;

  constructor(private crudService: CrudService,
              private http: HttpClient) { }

  getAll(page: number): Observable<ApiResponse<Page<User>>> {
    return this.crudService.getAllWithPage('users', page);
  }

  getProfile(username: string) : Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.profileUrl}/${username}`);
  }

  getAvatarUrl(username: string | null, avatarUrl: string | null): string {
    return `${this.profileUrl}/${username}/image/${avatarUrl}`;
  }

  create(user: UserDto) : Observable<ApiResponse<User>> {
    return this.crudService.create('users', user);
  }

  changeAvatar(usename: string, avatar: File) : Observable<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return this.http.post<ApiResponse<User>>(`${this.profileUrl}/${usename}/avatar`, formData);
  }

  editProfile(username: string, user: User) : Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.profileUrl}/${username}`, user);
  }

  update(userId: number, userDto: UserDto) : Observable<ApiResponse<User>> {
    return this.crudService.update('users', userId, userDto);
  }

  delete(userId: number) : Observable<ApiResponse<any>> {
    return this.crudService.delete('users', userId);
  }
}
