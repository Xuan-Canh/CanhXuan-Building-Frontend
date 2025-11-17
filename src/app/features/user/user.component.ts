import {Component, OnInit} from '@angular/core';
import {UsersService} from "../../core/service/users.service";
import {UserDto} from "../../shared/model/user";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit{

  users: UserDto[] = [];

  constructor(private userService: UsersService) {
  }

  ngOnInit() {
    console.log('UserComponent initialized');
    this.userService.getAll().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error) => {
        console.error('Error fetching users: ', error);
      }
    });
  }

}
