import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserDto} from "../../shared/model/user";
import { Observable } from 'rxjs';
import {environment} from "../../shared/model/enviroment";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private userUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.userUrl}`);
  }


}
