import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiProjetoService } from '../../../core/services/api-projeto.service';
import { ProjetoSalvoResponse } from '../../../core/models/models';
import { keycloak } from '../../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-meus-projetos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen bg-gray-100 p-8 font-sans">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Meus Projetos</h1>
            <p class="text-slate-500 mt-1">Organizadores configurados e salvos na sua conta</p>
          </div>
          <a routerLink="/"
             class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Novo Projeto
          </a>
        </div>

        @if (isLoading) {
          <div class="flex justify-center items-center py-16">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
          </div>
        } @else if (projetos.length === 0) {
          <div class="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <p class="text-slate-600 text-lg font-medium">Você ainda não salvou nenhum projeto.</p>
            <p class="text-slate-400 text-sm mt-1">Volte ao simulador para configurar sua primeira gaveta sob medida.</p>
            <a routerLink="/"
               class="inline-block mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Ir para o Simulador
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (p of projetos; track p.id) {
              <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {{ p.status }}
                    </span>
                    <h3 class="text-lg font-bold text-slate-800 mt-2">{{ p.templateNome }}</h3>
                    <p class="text-sm text-slate-500">{{ p.materialNome }} ({{ p.espessuraMaterialMm }}mm)</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-slate-400">Valor Total</span>
                    <p class="text-xl font-bold text-emerald-600">{{ p.valorTotal | currency:'BRL' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-sm">
                  <div class="bg-slate-50 p-2 rounded-lg">
                    <span class="block text-xs text-slate-400">Medidas (L x P x A)</span>
                    <span class="font-semibold text-slate-700">{{ p.larguraMm }} x {{ p.profundidadeMm }} x {{ p.alturaMm }} mm</span>
                  </div>
                  <div class="bg-slate-50 p-2 rounded-lg">
                    <span class="block text-xs text-slate-400">Compartimentos</span>
                    <span class="font-semibold text-slate-700">{{ p.totalCompartimentos }} vãos</span>
                  </div>
                  <div class="bg-slate-50 p-2 rounded-lg">
                    <span class="block text-xs text-slate-400">Margem Folga</span>
                    <span class="font-semibold text-slate-700">{{ p.margemSegurancaMm }} mm</span>
                  </div>
                </div>

                <div class="flex justify-between items-center text-xs text-slate-400 pt-2">
                  <span>Criado em {{ p.criadoEm | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span>Qtd: {{ p.quantidade }}</span>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </main>
  `
})
export class MeusProjetosComponent implements OnInit {
  projetos: ProjetoSalvoResponse[] = [];
  isLoading = true;

  constructor(private projetoService: ApiProjetoService) {}

  ngOnInit(): void {
    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }

    this.projetoService.listarMeusProjetos().subscribe({
      next: (lista) => {
        this.projetos = lista;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar projetos', err);
        this.isLoading = false;
      }
    });
  }
}
