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
            <h1 class="text-3xl font-bold text-slate-800">Meus Projetos & Pedidos</h1>
            <p class="text-slate-500 mt-1">Acompanhe seus organizadores sob medida e o status de fabricação</p>
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
                <div>
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              [ngClass]="p.statusCompra === 'APROVADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                          {{ p.statusCompra === 'APROVADA' ? 'Pagamento Aprovado' : 'Aguardando Aprovação' }}
                        </span>
                        @if (p.etapaAtual) {
                          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            {{ p.etapaAtual }}
                          </span>
                        }
                      </div>
                      <h3 class="text-lg font-bold text-slate-800 mt-2">{{ p.templateNome }}</h3>
                      <p class="text-sm text-slate-500">{{ p.materialNome }} ({{ p.espessuraMaterialMm }}mm)</p>
                    </div>
                    <div class="text-right">
                      <span class="text-xs text-slate-400">Valor Total</span>
                      <p class="text-xl font-bold text-emerald-600">{{ p.valorTotal | currency:'BRL' }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-sm">
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

                  <!-- Linha do Tempo de Produção -->
                  @if (p.historicoEtapas && p.historicoEtapas.length > 0) {
                    <div class="mt-4 pt-4 border-t border-slate-100">
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Status de Produção</h4>
                        @if (p.prazoEstimadoDias) {
                          <span class="text-xs text-slate-400">Prazo estimado: {{ p.prazoEstimadoDias }} dias úteis</span>
                        }
                      </div>

                      @if (p.codigoRastreio) {
                        <div class="mb-3 p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between text-xs">
                          <span class="text-indigo-700 font-medium">Código de Rastreio:</span>
                          <span class="font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {{ p.codigoRastreio }}
                          </span>
                        </div>
                      }

                      <ol class="relative border-l border-slate-200 ml-2 space-y-3 mt-2">
                        @for (etapa of p.historicoEtapas; track $index; let isLast = $last) {
                          <li class="ml-4">
                            <div class="absolute w-2.5 h-2.5 rounded-full -left-[5.5px] mt-1"
                                 [ngClass]="isLast ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'"></div>
                            <div class="flex justify-between items-baseline">
                              <span class="text-xs font-semibold" [ngClass]="isLast ? 'text-slate-900' : 'text-slate-600'">
                                {{ etapa.nomeEtapa }}
                              </span>
                              <span class="text-[11px] text-slate-400">{{ etapa.criadoEm | date:'dd/MM HH:mm' }}</span>
                            </div>
                            @if (etapa.observacao) {
                              <p class="text-xs text-slate-500 mt-0.5">{{ etapa.observacao }}</p>
                            }
                          </li>
                        }
                      </ol>
                    </div>
                  }
                </div>

                <div class="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-50">
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
