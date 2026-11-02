import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { keycloak } from '../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-post-login',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-sm text-slate-600 font-medium">Carregando seu perfil...</p>
    </div>
  `
})
export class PostLoginComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    if (keycloak.hasRealmRole('admin')) {
      this.router.navigate(['/admin'], { replaceUrl: true });
    } else {
      this.router.navigate(['/app/projetos'], { replaceUrl: true });
    }
  }
}
