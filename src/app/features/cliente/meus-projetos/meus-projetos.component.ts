import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiProjetoService } from '../../../core/services/api-projeto.service';
import {
  CotacaoFreteResponse,
  EnderecoDTO,
  OpcaoFreteDTO,
  ProjetoSalvoResponse
} from '../../../core/models/models';
import { keycloak } from '../../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-meus-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="min-h-screen bg-gray-100 p-8 font-sans">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Meus Projetos & Pedidos</h1>
            <p class="text-slate-500 mt-1">Configure seu carrinho, calcule o frete e acompanhe a produção</p>
          </div>
          <a routerLink="/"
             class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Adicionar Outra Gaveta
          </a>
        </div>

        @if (mensagemSucesso) {
          <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
            {{ mensagemSucesso }}
          </div>
        }
        @if (mensagemErro) {
          <div class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {{ mensagemErro }}
          </div>
        }

        <!-- CARD DE CHECKOUT / FRETE PARA CARRINHO EM ABERTO -->
        @if (compraAbertaId && cotacao) {
          <section class="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm space-y-5">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  Carrinho Aberto ({{ cotacao.totalItens }} organizador(es))
                </span>
                <h2 class="text-xl font-bold text-slate-800 mt-1">Finalizar Endereço de Entrega & Frete</h2>
                <p class="text-xs text-slate-500">
                  Pacote estimado pelo sistema: <strong>{{ cotacao.pacote.larguraCm }} x {{ cotacao.pacote.profundidadeCm }} x {{ cotacao.pacote.alturaCm }} cm</strong>
                  · Peso total estimado: <strong>{{ cotacao.pacote.pesoKg }} kg</strong>
                </p>
              </div>
              <div class="text-right">
                <span class="block text-xs text-slate-400">Subtotal Gavetas + Frete</span>
                <span class="text-2xl font-bold text-emerald-600">
                  {{ (cotacao.subtotalProjetos + (freteSelecionado?.valorFrete || 0)) | currency:'BRL' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">CEP</label>
                <div class="flex gap-1">
                  <input type="text" [(ngModel)]="endereco.cep" placeholder="01001-000"
                         class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
                  <button type="button" (click)="recalcularFrete()"
                          class="bg-slate-800 hover:bg-slate-900 text-white px-3 rounded-lg text-xs font-semibold">
                    Calcular
                  </button>
                </div>
              </div>
              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">Telefone / WhatsApp</label>
                <input type="text" [(ngModel)]="telefone" placeholder="(11) 99999-9999"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div class="md:col-span-4">
                <label class="block text-xs font-medium text-slate-600 mb-1">Rua / Logradouro</label>
                <input type="text" [(ngModel)]="endereco.logradouro" placeholder="Av. Paulista"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">Número</label>
                <input type="text" [(ngModel)]="endereco.numero" placeholder="1000"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
              </div>

              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">Complemento</label>
                <input type="text" [(ngModel)]="endereco.complemento" placeholder="Apto 42"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">Bairro</label>
                <input type="text" [(ngModel)]="endereco.bairro" placeholder="Bela Vista"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div class="md:col-span-4">
                <label class="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
                <input type="text" [(ngModel)]="endereco.cidade" placeholder="São Paulo"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">UF</label>
                <input type="text" [(ngModel)]="endereco.estado" maxlength="2" placeholder="SP"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg uppercase" />
              </div>
            </div>

            <!-- Opções de Frete -->
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase text-slate-500">Escolha a Transportadora</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                @for (op of cotacao.opcoesFrete; track op.transportadora) {
                  <div (click)="freteSelecionado = op"
                       class="p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                       [ngClass]="freteSelecionado?.transportadora === op.transportadora
                         ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                         : 'border-slate-200 hover:border-slate-300 bg-slate-50'">
                    <div>
                      <p class="text-sm font-bold text-slate-800">{{ op.transportadora }}</p>
                      <p class="text-xs text-slate-500">Entrega em até {{ op.prazoDias }} dias úteis</p>
                    </div>
                    <span class="text-sm font-bold text-emerald-700">{{ op.valorFrete | currency:'BRL' }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button (click)="confirmarCheckout()" [disabled]="finalizandoCheckout"
                      class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {{ finalizandoCheckout ? 'Confirmando...' : 'Fechar Compra com Frete Selecionado' }}
              </button>
            </div>
          </section>
        }

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
                          {{ p.statusCompra === 'APROVADA' ? 'Pagamento Aprovado' : (p.transportadora ? 'Aguardando Pagamento' : 'No Carrinho') }}
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
                      <span class="text-xs text-slate-400">Valor do Organizador</span>
                      <p class="text-xl font-bold text-emerald-600">{{ p.valorTotal | currency:'BRL' }}</p>
                      @if (p.transportadora) {
                        <span class="block text-[11px] text-slate-500">
                          + Frete {{ p.transportadora }} ({{ p.valorFrete | currency:'BRL' }})
                        </span>
                      }
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

  compraAbertaId: string | null = null;
  cotacao: CotacaoFreteResponse | null = null;
  freteSelecionado: OpcaoFreteDTO | null = null;

  telefone = '';
  endereco: EnderecoDTO = {
    cep: '01310-100',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP'
  };

  finalizandoCheckout = false;
  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;

  constructor(private projetoService: ApiProjetoService) {}

  ngOnInit(): void {
    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }
    this.carregarProjetos();
  }

  carregarProjetos(): void {
    this.isLoading = true;
    this.projetoService.listarMeusProjetos().subscribe({
      next: (lista) => {
        this.projetos = lista;
        this.isLoading = false;

        // Verifica se existe uma compra ainda sem transportadora definida (carrinho aberto)
        const emAberto = lista.find(p => p.compraId && !p.transportadora && p.statusCompra === 'FECHADA');
        if (emAberto) {
          this.compraAbertaId = emAberto.compraId;
          this.recalcularFrete();
        } else {
          this.compraAbertaId = null;
          this.cotacao = null;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar projetos', err);
        this.isLoading = false;
      }
    });
  }

  recalcularFrete(): void {
    if (!this.compraAbertaId) return;
    this.projetoService.cotarFrete(this.compraAbertaId, this.endereco.cep).subscribe({
      next: (cot) => {
        this.cotacao = cot;
        if (cot.opcoesFrete.length > 0) {
          this.freteSelecionado = cot.opcoesFrete[0];
        }
        if (cot.telefoneAtual && cot.telefoneAtual !== '00000000000') {
          this.telefone = cot.telefoneAtual;
        }
        if (cot.enderecoAtual) {
          this.endereco = { ...cot.enderecoAtual };
        }
      },
      error: (err) => console.error('Erro ao cotar frete', err)
    });
  }

  confirmarCheckout(): void {
    if (!this.compraAbertaId || !this.freteSelecionado) return;
    if (!this.telefone.trim() || !this.endereco.cep.trim() || !this.endereco.logradouro.trim() || !this.endereco.numero.trim() || !this.endereco.cidade.trim()) {
      this.mensagemErro = 'Preencha telefone, CEP, rua, número e cidade para calcular a entrega.';
      return;
    }

    this.finalizandoCheckout = true;
    this.mensagemErro = null;
    this.mensagemSucesso = null;

    this.projetoService.finalizarCheckout(this.compraAbertaId, {
      telefone: this.telefone,
      endereco: this.endereco,
      transportadora: this.freteSelecionado.transportadora,
      valorFrete: this.freteSelecionado.valorFrete,
      prazoFreteDias: this.freteSelecionado.prazoDias
    }).subscribe({
      next: () => {
        this.finalizandoCheckout = false;
        this.mensagemSucesso = 'Compra fechada com sucesso! Agora aguarde a confirmação do pagamento pela loja.';
        this.carregarProjetos();
      },
      error: (err) => {
        this.finalizandoCheckout = false;
        this.mensagemErro = err?.error?.erro || 'Erro ao fechar compra.';
      }
    });
  }
}
