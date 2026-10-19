import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAdminService } from '../../core/services/api-admin.service';
import {
  CatalogoAdminDTO,
  CompraAdminDTO,
  EtapaProducaoDTO,
  PlanoCorteProjetoDTO,
  RegraPrecificacaoDTO
} from '../../core/models/models';
import { keycloak } from '../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="min-h-screen bg-gray-100 p-8 font-sans">
      <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
            <p class="text-slate-500 mt-1">Gestão de precificação, catálogo de materiais/objetos e esteira da marcenaria</p>
          </div>

          <div class="inline-flex p-1 bg-slate-200 rounded-xl">
            <button (click)="abaAtiva = 'OPERACAO'"
                    [class]="abaAtiva === 'OPERACAO'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold px-4 py-2 rounded-lg text-sm transition-all'
                      : 'text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm transition-all'">
              Pedidos & Precificação
            </button>
            <button (click)="abaAtiva = 'CATALOGO'"
                    [class]="abaAtiva === 'CATALOGO'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold px-4 py-2 rounded-lg text-sm transition-all'
                      : 'text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm transition-all'">
              Catálogo (Materiais & Objetos)
            </button>
          </div>
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

        @if (abaAtiva === 'OPERACAO') {
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

                      <div class="flex flex-wrap items-center gap-3">
                        <div class="text-right mr-2">
                          <span class="block text-xs text-slate-400">Total</span>
                          <span class="text-lg font-bold text-emerald-600">{{ c.valorTotal | currency:'BRL' }}</span>
                        </div>

                        <button (click)="alternarPlanoCorte(c.compraId)"
                                class="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors">
                          {{ planosCorte[c.compraId] ? 'Ocultar Plano de Corte' : 'Ver Plano de Corte (Marcenaria)' }}
                        </button>

                        @if (!c.pedidoId) {
                          <button (click)="aprovarCompra(c.compraId)"
                                  class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                            Confirmar Pagamento & Gerar Pedido
                          </button>
                        }
                      </div>
                    </div>

                    <!-- PLANO DE CORTE DO MARCENEIRO -->
                    @if (planosCorte[c.compraId]; as planos) {
                      <div class="mt-3 p-4 bg-white rounded-xl border border-indigo-200 space-y-4">
                        <div class="flex justify-end">
                          <button (click)="imprimirPlanoCorte()"
                                  class="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                            Imprimir Ordem de Produção
                          </button>
                        </div>
                        @for (pl of planos; track pl.projetoId) {
                          <div class="space-y-3">
                            <div class="flex flex-wrap justify-between items-center border-b border-slate-100 pb-2">
                              <div>
                                <h4 class="text-sm font-bold text-slate-800">
                                  Ficha Técnica de Corte — {{ pl.materialNome }} ({{ pl.tipoMaterialNome }})
                                </h4>
                                <p class="text-xs text-slate-500">
                                  Gaveta informada: <strong>{{ pl.larguraGavetaMm }} x {{ pl.profundidadeGavetaMm }} x {{ pl.alturaGavetaMm }} mm</strong>
                                  · Margem descontada: <strong>{{ pl.margemSegurancaMm }} mm</strong>
                                  · Espessura final parede (c/ revestimento): <strong>{{ pl.espessuraMaterialMm }} mm</strong>
                                </p>
                              </div>
                              <div class="text-right text-xs bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-lg font-semibold">
                                Medida Externa Pronta: {{ pl.larguraExternaOrganizadorMm }} x {{ pl.profundidadeExternaOrganizadorMm }} x {{ pl.alturaGavetaMm }} mm
                                (Qtd: {{ pl.quantidadeOrganizadores }})
                              </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 class="text-xs font-bold uppercase text-slate-500 mb-2">Peças / Painéis para Corte</h5>
                                <table class="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                                  <thead class="bg-slate-100 text-slate-700">
                                    <tr>
                                      <th class="p-2">Peça</th>
                                      <th class="p-2 text-center">Qtd</th>
                                      <th class="p-2 text-right">Comprimento x Altura</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    @for (peca of pl.pecasCorte; track $index) {
                                      <tr class="border-t border-slate-100">
                                        <td class="p-2 font-medium text-slate-800">{{ peca.descricao }}</td>
                                        <td class="p-2 text-center font-bold text-indigo-700">{{ peca.quantidade }}x</td>
                                        <td class="p-2 text-right font-mono">{{ peca.comprimentoMm }} x {{ peca.alturaMm }} mm</td>
                                      </tr>
                                    }
                                  </tbody>
                                </table>
                              </div>

                              <div>
                                <h5 class="text-xs font-bold uppercase text-slate-500 mb-2">Conferência dos Vãos Internos ({{ pl.compartimentos.length }})</h5>
                                <div class="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                                  <table class="w-full text-xs text-left">
                                    <thead class="bg-slate-100 text-slate-700 sticky top-0">
                                      <tr>
                                        <th class="p-2">#</th>
                                        <th class="p-2">Posição (X, Y)</th>
                                        <th class="p-2 text-right">Vão Interno (L x P)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      @for (comp of pl.compartimentos; track comp.indice) {
                                        <tr class="border-t border-slate-100">
                                          <td class="p-2 font-bold text-slate-600">Vão {{ comp.indice }}</td>
                                          <td class="p-2 font-mono text-slate-500">({{ comp.posXMm }}, {{ comp.posYMm }}) mm</td>
                                          <td class="p-2 text-right font-mono font-semibold text-slate-800">
                                            {{ comp.larguraInternaMm }} x {{ comp.profundidadeInternaMm }} mm
                                          </td>
                                        </tr>
                                      }
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    }

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
        }

        @if (abaAtiva === 'CATALOGO' && catalogoAdmin) {
          <!-- SEÇÃO 1: TIPOS DE MATERIAL (BASE TÉCNICA DE ESPESSURA E MARGEM) -->
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
              1. Tipos de Material Base (Espessura Pronta & Margem de Folga)
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Nome Técnico</label>
                <input type="text" [(ngModel)]="novoTipoMat.nome" placeholder="Ex: MDF 6mm + Courino"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Espessura Pronta (mm)</label>
                <input type="number" [(ngModel)]="novoTipoMat.espessuraMm"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Margem Folga Gaveta (mm)</label>
                <input type="number" [(ngModel)]="novoTipoMat.margemMm"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <button (click)="criarTipoMaterial()"
                      class="bg-slate-800 hover:bg-slate-900 text-white py-2 px-4 rounded-lg text-xs font-semibold">
                + Adicionar Tipo Base
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              @for (tm of catalogoAdmin.tiposMaterial; track tm.id) {
                <div class="p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <p class="text-sm font-bold text-slate-800">{{ tm.nome }}</p>
                    <p class="text-xs text-slate-500">Espessura: {{ tm.espessuraMm }}mm · Margem: {{ tm.margemMm }}mm</p>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- SEÇÃO 2: MATERIAIS & REVESTIMENTOS (VELUDO, COURINO, LINHO, ACRÍLICO) -->
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
              2. Materiais & Revestimentos ({{ catalogoAdmin.materiais.length }})
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Nome Comercial</label>
                <input type="text" [(ngModel)]="novoMaterial.nome" placeholder="Ex: Veludo Cinza Chumbo"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Cor</label>
                <input type="text" [(ngModel)]="novoMaterial.cor" placeholder="Ex: Cinza Chumbo"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Adicional Fixo (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="novoMaterial.valorFixoAdicional"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Tipo Material Base</label>
                <select [(ngModel)]="novoMaterial.tipoMaterialId"
                        class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white">
                  @for (tm of catalogoAdmin.tiposMaterial; track tm.id) {
                    <option [value]="tm.id">{{ tm.nome }} ({{ tm.espessuraMm }}mm)</option>
                  }
                </select>
              </div>
              <button (click)="criarMaterial()"
                      class="bg-slate-800 hover:bg-slate-900 text-white py-2 px-4 rounded-lg text-xs font-semibold">
                + Cadastrar Material
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (m of catalogoAdmin.materiais; track m.id) {
                <div class="p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-slate-800">{{ m.nome }}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            [ngClass]="m.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'">
                        {{ m.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500">
                      {{ m.tipoMaterialNome }} ({{ m.espessuraMm }}mm / folga {{ m.margemMm }}mm) · Adicional: {{ m.valorFixoAdicional | currency:'BRL' }}
                    </p>
                  </div>
                  <button (click)="toggleMaterial(m.id)"
                          class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700">
                    {{ m.ativo ? 'Desativar' : 'Ativar' }}
                  </button>
                </div>
              }
            </div>
          </section>

          <!-- SEÇÃO 3: CATÁLOGO DE OBJETOS PARA O GERADOR AUTOMÁTICO -->
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
            <h2 class="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">
              3. Tipos de Objeto do Simulador ({{ catalogoAdmin.tiposObjeto.length }})
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-8 gap-2 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div class="col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">Nome do Objeto</label>
                <input type="text" [(ngModel)]="novoObjeto.nome" placeholder="Ex: Colares Longos"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
                <input type="text" [(ngModel)]="novoObjeto.categoria" placeholder="Joias"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Larg. Mín</label>
                <input type="number" [(ngModel)]="novoObjeto.larguraMinMm"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Larg. Máx</label>
                <input type="number" [(ngModel)]="novoObjeto.larguraMaxMm"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Prof. Mín</label>
                <input type="number" [(ngModel)]="novoObjeto.profundidadeMinMm"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Prof. Máx</label>
                <input type="number" [(ngModel)]="novoObjeto.profundidadeMaxMm"
                       class="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white" />
              </div>
              <button (click)="criarTipoObjeto()"
                      class="bg-slate-800 hover:bg-slate-900 text-white py-2 px-3 rounded-lg text-xs font-semibold">
                + Adicionar
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (obj of catalogoAdmin.tiposObjeto; track obj.id) {
                <div class="p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-slate-800">{{ obj.nome }}</span>
                      <span class="text-xs text-slate-400">({{ obj.categoria }})</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            [ngClass]="obj.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'">
                        {{ obj.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500">
                      Largura: {{ obj.larguraMinMm }}–{{ obj.larguraMaxMm }}mm · Profundidade: {{ obj.profundidadeMinMm }}–{{ obj.profundidadeMaxMm }}mm
                    </p>
                  </div>
                  <button (click)="toggleTipoObjeto(obj.id)"
                          class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700">
                    {{ obj.ativo ? 'Desativar' : 'Ativar' }}
                  </button>
                </div>
              }
            </div>
          </section>
        }
      </div>
    </main>
  `
})
export class AdminComponent implements OnInit {
  abaAtiva: 'OPERACAO' | 'CATALOGO' = 'OPERACAO';

  regraAtual: RegraPrecificacaoDTO | null = null;
  novoPrecoLitro = 18;
  novoPrecoCm2 = 0.35;
  salvandoRegra = false;

  etapasCatalogo: EtapaProducaoDTO[] = [];
  compras: CompraAdminDTO[] = [];
  planosCorte: Record<string, PlanoCorteProjetoDTO[] | undefined> = {};
  catalogoAdmin: CatalogoAdminDTO | null = null;

  novoTipoMat = { nome: '', espessuraMm: 8, margemMm: 4 };
  novoMaterial = { nome: '', cor: '', valorFixoAdicional: 25, tipoMaterialId: '' };
  novoObjeto = {
    nome: '',
    categoria: 'Closet',
    larguraMinMm: 80,
    larguraMaxMm: 160,
    profundidadeMinMm: 120,
    profundidadeMaxMm: 260,
    alturaMinMm: 50
  };

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

    this.carregarCatalogoAdmin();
  }

  carregarCatalogoAdmin(): void {
    this.adminService.obterCatalogoAdmin().subscribe({
      next: (cat) => {
        this.catalogoAdmin = cat;
        if (cat.tiposMaterial.length > 0 && !this.novoMaterial.tipoMaterialId) {
          this.novoMaterial.tipoMaterialId = cat.tiposMaterial[0].id;
        }
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

  alternarPlanoCorte(compraId: string): void {
    if (this.planosCorte[compraId]) {
      delete this.planosCorte[compraId];
      return;
    }
    this.adminService.obterPlanoCorte(compraId).subscribe({
      next: (planos) => {
        this.planosCorte[compraId] = planos;
      },
      error: (err) => this.tratarErro(err)
    });
  }

  imprimirPlanoCorte(): void {
    window.print();
  }

  criarTipoMaterial(): void {
    if (!this.novoTipoMat.nome.trim()) return;
    this.limparMensagens();
    this.adminService.criarTipoMaterial(this.novoTipoMat).subscribe({
      next: () => {
        this.novoTipoMat.nome = '';
        this.mensagemFeedback = 'Tipo de material cadastrado com sucesso!';
        this.carregarCatalogoAdmin();
      },
      error: (err) => this.tratarErro(err)
    });
  }

  criarMaterial(): void {
    if (!this.novoMaterial.nome.trim() || !this.novoMaterial.tipoMaterialId) return;
    this.limparMensagens();
    this.adminService.criarMaterial(this.novoMaterial).subscribe({
      next: () => {
        this.novoMaterial.nome = '';
        this.novoMaterial.cor = '';
        this.mensagemFeedback = 'Material/Revestimento cadastrado com sucesso!';
        this.carregarCatalogoAdmin();
      },
      error: (err) => this.tratarErro(err)
    });
  }

  toggleMaterial(id: string): void {
    this.adminService.toggleAtivoMaterial(id).subscribe({
      next: () => this.carregarCatalogoAdmin(),
      error: (err) => this.tratarErro(err)
    });
  }

  criarTipoObjeto(): void {
    if (!this.novoObjeto.nome.trim()) return;
    this.limparMensagens();
    this.adminService.criarTipoObjeto(this.novoObjeto).subscribe({
      next: () => {
        this.novoObjeto.nome = '';
        this.mensagemFeedback = 'Objeto adicionado ao catálogo do simulador!';
        this.carregarCatalogoAdmin();
      },
      error: (err) => this.tratarErro(err)
    });
  }

  toggleTipoObjeto(id: string): void {
    this.adminService.toggleAtivoTipoObjeto(id).subscribe({
      next: () => this.carregarCatalogoAdmin(),
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
