import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { MeusProjetosComponent } from './features/cliente/meus-projetos/meus-projetos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'app/projetos', component: MeusProjetosComponent }
];
