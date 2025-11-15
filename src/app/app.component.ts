import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AdminHeaderComponent} from "./layouts/admin/admin-header/admin-header.component";
import {AdminSidebarComponent} from "./layouts/admin/admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CanhXuan-Building-Frontend';
}
