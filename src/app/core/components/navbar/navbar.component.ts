import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { keycloak } from '../../keycloak/keycloak.config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center cursor-pointer" routerLink="/">
            <span class="text-2xl font-bold text-slate-800 tracking-tight">Encaixa</span>
            <span class="ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">BETA</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <a routerLink="/" class="text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-md text-sm transition-colors">
              Simulador
            </a>
            
            <ng-container *ngIf="!isLoggedIn">
              <button (click)="login()" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Entrar
              </button>
            </ng-container>

            <ng-container *ngIf="isLoggedIn">
              <a routerLink="/app/projetos" class="text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-md text-sm transition-colors">
                Meus Projetos
              </a>
              <a *ngIf="isAdmin" routerLink="/admin" class="text-indigo-600 hover:text-indigo-900 font-medium px-3 py-2 rounded-md text-sm transition-colors">
                Admin
              </a>
              <div class="ml-4 pl-4 border-l border-gray-200 flex items-center space-x-3">
                <span class="text-sm font-medium text-slate-700">{{ username }}</span>
                <button (click)="logout()" class="text-red-600 hover:text-red-800 text-sm font-medium px-2 transition-colors">
                  Sair
                </button>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username = '';

  constructor() {}

  async ngOnInit() {
    this.isLoggedIn = !!keycloak.authenticated;
    
    if (this.isLoggedIn) {
      await keycloak.loadUserProfile();
      this.username = keycloak.profile?.firstName || keycloak.profile?.username || '';
      
      // Checa se o usuario tem a role 'admin' dentro do realm access
      this.isAdmin = keycloak.hasRealmRole('admin');
    }
  }

  login() {
    keycloak.login({ redirectUri: window.location.origin + '/app/projetos' });
  }

  logout() {
    keycloak.logout({ redirectUri: window.location.origin });
  }
}
