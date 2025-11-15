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

export const routes: Routes = [
  {
    path: 'login', component: AuthComponent
  },
  {
    path: 'buildings', component: BuildingComponent
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
  }
];
