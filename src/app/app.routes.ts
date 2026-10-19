import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { MeusProjetosComponent } from './features/cliente/meus-projetos/meus-projetos.component';
import { AdminComponent } from './features/admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'app/projetos', component: MeusProjetosComponent },
  { path: 'admin', component: AdminComponent }
];
