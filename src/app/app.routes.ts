import {Routes} from '@angular/router';
import {AuthComponent} from "./features/auth/auth.component";
import {BuildingComponent} from "./features/building/building.component";
import {RoomComponent} from "./features/room/room.component";
import {CustomerComponent} from "./features/customer/customer.component";
import {ContractComponent} from "./features/contract/contract.component";
import {ServiceComponent} from "./features/service/service.component";
import {OrderComponent} from "./features/order/order.component";
import {UserComponent} from "./features/user/user.component";
import {authGuard} from "./core/guard/auth.guard";
import {roleGuard} from "./core/guard/role.guard";
import {InvoiceComponent} from "./features/invoice/invoice.component";
import {DashboardComponent} from "./features/dashboard/dashboard.component";
import {ProfileComponent} from "./features/profile/profile.component";

export const routes: Routes = [
  {
    path: 'login', component: AuthComponent
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [authGuard]
  },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN, USER'}
  },
  {
    path: 'buildings', component: BuildingComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN, USER'}
  },
  {
    path: 'rooms', component: RoomComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN, USER'}
  },
  {
    path: 'customers', component: CustomerComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN'}
  },
  {
    path: 'contracts', component: ContractComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN, USER'}
  },
  {
    path: 'services', component: ServiceComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN'}
  },
  {
    path: 'invoices', component: InvoiceComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN, USER'}
  },
  {
    path: 'orders', component: OrderComponent
  },
  {
    path: 'users', component: UserComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN'}
  }
];
