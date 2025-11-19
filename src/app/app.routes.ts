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
    path: 'invoices', component: InvoiceComponent
  },
  {
    path: 'orders', component: OrderComponent
  },
  {
    path: 'users', component: UserComponent, canActivate: [authGuard, roleGuard], data: {roles: 'ADMIN'}
  }
];
