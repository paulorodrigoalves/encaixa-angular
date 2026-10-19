import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAdminService } from '../../core/services/api-admin.service';
import {
  CompraAdminDTO,
  EtapaProducaoDTO,
  RegraPrecificacaoDTO
} from '../../core/models/models';
import { keycloak } from '../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-gray-100 p-8 font-sans">
      <div class="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
          <p class="text-slate-500 mt-1">Gestão de regras de precificação, aprovação de compras e esteira de marcenaria</p>
        </div>

        @if (mensagemFeedback) {
          <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            {{ mensagemFeedback }}
          </div>
        }
        @if (mensagemErro) {
          <div class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {{ mensagemErro }}
          </div>
        }

        <!-- CARD: REGRA DE PRECIFICAÇÃO -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 class="text-xl font-bold text-slate-800">Regra de Precificação Vigente</h2>
              @if (regraAtual) {
                <p class="text-xs text-slate-400 mt-0.5">
                  Vigente desde {{ regraAtual.vigenteDesde | date:'dd/MM/yyyy HH:mm' }} (por {{ regraAtual.criadoPor }})
                </p>
              }
            </div>
            <div class="flex flex-wrap items-end gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Preço por Litro (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="novoPrecoLitro"
                       class="w-36 p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Preço por cm² Divisória (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="novoPrecoCm2"
                       class="w-44 p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <button (click)="salvarRegraPreco()" [disabled]="salvandoRegra"
                      class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {{ salvandoRegra ? 'Atualizando...' : 'Publicar Nova Regra' }}
              </button>
            </div>
          </div>
        </section>

        <!-- CARD: ESTEIRA DE COMPRAS E PEDIDOS -->
        <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
            Compras & Esteira de Produção ({{ compras.length }})
          </h2>

          @if (compras.length === 0) {
            <p class="text-slate-500 text-sm py-8 text-center">Nenhuma compra registrada até o momento.</p>
          } @else {
            <div class="space-y-4">
              @for (c of compras; track c.compraId) {
                <div class="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              [ngClass]="c.statusCompra === 'APROVADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                          Compra {{ c.statusCompra }}
                        </span>
                        @if (c.etapaAtual) {
                          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                            Etapa: {{ c.etapaAtual }}
                          </span>
                        }
                      </div>
                      <h3 class="text-base font-bold text-slate-800 mt-1">
                        {{ c.clienteNome }} <span class="text-xs font-normal text-slate-500">({{ c.clienteEmail }})</span>
                      </h3>
                      <p class="text-xs text-slate-400">
                        {{ c.totalProjetos }} projeto(s) · Criada em {{ c.criadoEm | date:'dd/MM/yyyy HH:mm' }}
                        @if (c.codigoRastreio) { · Rastreio: <strong class="text-slate-700">{{ c.codigoRastreio }}</strong> }
                      </p>
                    </div>

                    <div class="flex items-center gap-4">
                      <div class="text-right">
                        <span class="block text-xs text-slate-400">Total</span>
                        <span class="text-lg font-bold text-emerald-600">{{ c.valorTotal | currency:'BRL' }}</span>
                      </div>

                      @if (!c.pedidoId) {
                        <button (click)="aprovarCompra(c.compraId)"
                                class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                          Confirmar Pagamento & Gerar Pedido
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Controle de Etapas se já existe Pedido -->
                  @if (c.pedidoId; as pid) {
                    <div class="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div class="md:col-span-4">
                        <label class="block text-xs font-medium text-slate-600 mb-1">Avançar para Etapa</label>
                        <select [(ngModel)]="etapaSelecionada[pid]"
                                class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white">
                          @for (et of etapasCatalogo; track et.id) {
                            <option [value]="et.id">
                              {{ et.ordem }}. {{ et.nome }} {{ et.usaRastreio ? '(Exige Rastreio)' : '' }}
                            </option>
                          }
                        </select>
                      </div>
                      <div class="md:col-span-3">
                        <label class="block text-xs font-medium text-slate-600 mb-1">Código Rastreio (se envio)</label>
                        <input type="text" [(ngModel)]="rastreioInput[pid]" placeholder="Ex: BR123456789"
                               class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div class="md:col-span-3">
                        <label class="block text-xs font-medium text-slate-600 mb-1">Observação</label>
                        <input type="text" [(ngModel)]="obsInput[pid]" placeholder="Opcional..."
                               class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div class="md:col-span-2">
                        <button (click)="registrarEtapa(pid)"
                                class="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors">
                          Registrar Etapa
                        </button>
                      </div>
                    </div>

                    @if (c.historicoEtapas.length > 0) {
                      <div class="pt-2 flex flex-wrap gap-2">
                        @for (h of c.historicoEtapas; track h.id) {
                          <span class="px-2 py-1 rounded bg-white border border-slate-200 text-[11px] text-slate-600">
                            <strong>{{ h.nomeEtapa }}</strong> ({{ h.criadoEm | date:'dd/MM HH:mm' }})
                            @if (h.observacao) { - {{ h.observacao }} }
                          </span>
                        }
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }
        </section>
      </div>
    </main>
  `
})
export class AdminComponent implements OnInit {
  regraAtual: RegraPrecificacaoDTO | null = null;
  novoPrecoLitro = 18;
  novoPrecoCm2 = 0.35;
  salvandoRegra = false;

  etapasCatalogo: EtapaProducaoDTO[] = [];
  compras: CompraAdminDTO[] = [];

  etapaSelecionada: Record<string, string> = {};
  rastreioInput: Record<string, string> = {};
  obsInput: Record<string, string> = {};

  mensagemFeedback: string | null = null;
  mensagemErro: string | null = null;

  constructor(private adminService: ApiAdminService) {}

  ngOnInit(): void {
    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }
    this.carregarDados();
  }

  carregarDados(): void {
    this.adminService.obterRegraPrecificacao().subscribe({
      next: (r) => {
        this.regraAtual = r;
        this.novoPrecoLitro = r.precoPorLitro;
        this.novoPrecoCm2 = r.precoPorCm2Divisoria;
      },
      error: (err) => this.tratarErro(err)
    });

    this.adminService.listarEtapasCatalogo().subscribe({
      next: (etapas) => {
        this.etapasCatalogo = etapas;
        this.carregarCompras();
      },
      error: (err) => this.tratarErro(err)
    });
  }

  carregarCompras(): void {
    this.adminService.listarCompras().subscribe({
      next: (lista) => {
        this.compras = lista;
        if (this.etapasCatalogo.length > 0) {
          for (const c of lista) {
            if (c.pedidoId && !this.etapaSelecionada[c.pedidoId]) {
              this.etapaSelecionada[c.pedidoId] = this.etapasCatalogo[0].id;
            }
          }
        }
      },
      error: (err) => this.tratarErro(err)
    });
  }

  salvarRegraPreco(): void {
    this.salvandoRegra = true;
    this.limparMensagens();
    this.adminService.atualizarRegraPrecificacao(this.novoPrecoLitro, this.novoPrecoCm2).subscribe({
      next: (nova) => {
        this.regraAtual = nova;
        this.salvandoRegra = false;
        this.mensagemFeedback = 'Nova regra de precificação publicada com sucesso!';
      },
      error: (err) => {
        this.salvandoRegra = false;
        this.tratarErro(err);
      }
    });
  }

  aprovarCompra(compraId: string): void {
    this.limparMensagens();
    this.adminService.aprovarCompra(compraId).subscribe({
      next: () => {
        this.mensagemFeedback = 'Compra aprovada e pedido enviado para a esteira de produção!';
        this.carregarCompras();
      },
      error: (err) => this.tratarErro(err)
    });
  }

  registrarEtapa(pedidoId: string): void {
    this.limparMensagens();
    const etapaId = this.etapaSelecionada[pedidoId];
    if (!etapaId) return;

    this.adminService.registrarEtapa(pedidoId, {
      etapaId,
      codigoRastreio: this.rastreioInput[pedidoId],
      observacao: this.obsInput[pedidoId]
    }).subscribe({
      next: () => {
        this.mensagemFeedback = 'Etapa de produção registrada com sucesso!';
        this.obsInput[pedidoId] = '';
        this.carregarCompras();
      },
      error: (err) => this.tratarErro(err)
    });
  }

  private limparMensagens(): void {
    this.mensagemFeedback = null;
    this.mensagemErro = null;
  }

  private tratarErro(err: any): void {
    if (err?.status === 403) {
      this.mensagemErro = 'Acesso negado: sua conta não possui a role ADMIN.';
    } else {
      this.mensagemErro = err?.error?.erro || 'Erro ao comunicar com o servidor administrativo.';
    }
  }
}
