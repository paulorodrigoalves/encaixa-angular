import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Futuras rotas lazy loaded:
  // { path: 'app', loadChildren: () => import('./features/cliente/cliente.routes').then(m => m.routes) },
  // { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.routes) }
];
