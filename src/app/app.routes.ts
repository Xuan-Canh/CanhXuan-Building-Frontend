import { Routes } from '@angular/router';
import {AppComponent} from "./app.component";
import {AuthComponent} from "./features/auth/auth.component";
import {BuildingComponent} from "./features/building/building.component";
import {RoomComponent} from "./features/room/room.component";
import {CustomerComponent} from "./features/customer/customer.component";
import {ContractComponent} from "./features/contract/contract.component";
import {ServiceComponent} from "./features/service/service.component";
import {BillComponent} from "./features/bill/bill.component";
import {OrderComponent} from "./features/order/order.component";
import {UserComponent} from "./features/user/user.component";
import {authGuard} from "./core/guard/auth.guard";
import {roleGuard} from "./core/guard/role.guard";

export const routes: Routes = [
  {
    path: 'login', component: AuthComponent
  },
  {
    path: 'buildings', component: BuildingComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN'}
  },
  {
    path: 'rooms', component: RoomComponent
  },
  {
    path: 'customers', component: CustomerComponent
  },
  {
    path: 'contracts', component: ContractComponent
  },
  {
    path: 'services', component: ServiceComponent
  },
  {
    path: 'bills', component: BillComponent
  },
  {
    path: 'orders', component: OrderComponent
  },
  {
    path: 'users', component: UserComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN'}
  }
];
