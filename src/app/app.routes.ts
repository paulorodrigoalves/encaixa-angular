import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { MeusProjetosComponent } from './features/cliente/meus-projetos/meus-projetos.component';
import { AdminComponent } from './features/admin/admin.component';
import { PostLoginComponent } from './features/auth/post-login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/post-login', component: PostLoginComponent },
  { path: 'app/projetos', component: MeusProjetosComponent },
  { path: 'admin', component: AdminComponent }
];

