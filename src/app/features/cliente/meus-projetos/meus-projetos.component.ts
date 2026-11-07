import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiProjetoService } from '../../../core/services/api-projeto.service';
import {
  CotacaoFreteResponse,
  EnderecoDTO,
  LayoutGerado,
  MetodoPagamento,
  OpcaoFreteDTO,
  PagamentoCartaoRequest,
  PagamentoResponse,
  ProjetoSalvoResponse
} from '../../../core/models/models';
import { GavetaSvgComponent } from '../../../shared/components/gaveta-svg/gaveta-svg.component';
import { keycloak } from '../../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-meus-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GavetaSvgComponent],
  template: `
    <main class="min-h-screen bg-gray-100 p-8 font-sans">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-800">Meus Projetos & Pedidos</h1>
            <p class="text-slate-500 mt-1">Configure seu carrinho, calcule o frete, escolha o pagamento e acompanhe a produção</p>
          </div>
          <a routerLink="/"
             class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Adicionar Outra Gaveta
          </a>
        </div>

        @if (mensagemSucesso) {
          <div class="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>✅ {{ mensagemSucesso }}</span>
            <button (click)="mensagemSucesso = null" class="text-emerald-600 hover:text-emerald-900 font-bold text-base">&times;</button>
          </div>
        }
        @if (mensagemErro) {
          <div class="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>⚠️ {{ mensagemErro }}</span>
            <button (click)="mensagemErro = null" class="text-red-500 hover:text-red-800 font-bold text-base">&times;</button>
          </div>
        }

        <!-- CARD DE PAGAMENTO (compra fechada aguardando pagamento) -->
        @if (compraAguardandoPagamentoId) {
          <section class="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-sm space-y-5">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                  Etapa de Pagamento
                </span>
                <h2 class="text-xl font-bold text-slate-800 mt-1">Escolha como deseja pagar seu pedido</h2>
                <p class="text-sm text-slate-500">
                  Total com frete incluso: <strong class="text-emerald-700 text-base">{{ totalAguardandoPagamento | currency:'BRL' }}</strong>
                </p>
              </div>

              <!-- Seletor de Forma de Pagamento -->
              <div class="flex gap-2 bg-slate-100 p-1 rounded-xl">
                <button type="button" (click)="selecionarMetodoPagamento('PIX')"
                        [ngClass]="metodoPagamentoSelecionado === 'PIX'
                          ? 'bg-white text-slate-900 shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 font-medium'"
                        class="px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5">
                  <span>⚡</span> PIX
                </button>
                <button type="button" (click)="selecionarMetodoPagamento('CARTAO_CREDITO')"
                        [ngClass]="metodoPagamentoSelecionado === 'CARTAO_CREDITO'
                          ? 'bg-white text-slate-900 shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 font-medium'"
                        class="px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5">
                  <span>💳</span> Cartão de Crédito
                </button>
                <button type="button" (click)="selecionarMetodoPagamento('BOLETO')"
                        [ngClass]="metodoPagamentoSelecionado === 'BOLETO'
                          ? 'bg-white text-slate-900 shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 font-medium'"
                        class="px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5">
                  <span>📄</span> Boleto
                </button>
              </div>
            </div>

            <!-- ABA 1: PIX -->
            @if (metodoPagamentoSelecionado === 'PIX') {
              <div class="space-y-4">
                @if (!pagamento || pagamento.metodoPagamento === 'BOLETO') {
                  <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <p class="text-sm font-bold text-slate-800">Pagamento Instantâneo via PIX</p>
                      <p class="text-xs text-slate-500">Gere o QR Code ou código Copia e Cola. A liberação para a marcenaria é imediata.</p>
                    </div>
                    <button (click)="pagarComPix()" [disabled]="processandoPagamento"
                            class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0">
                      {{ processandoPagamento ? 'Gerando PIX...' : 'Gerar QR Code PIX' }}
                    </button>
                  </div>
                }

                @if (pagamento && pagamento.metodoPagamento !== 'BOLETO') {
                  <div class="grid md:grid-cols-[200px_1fr] gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    @if (pagamento.pixQrBase64) {
                      <img [src]="'data:image/png;base64,' + pagamento.pixQrBase64" alt="QR Code PIX"
                           class="w-48 h-48 border border-slate-200 rounded-xl bg-white p-2 mx-auto" />
                    }
                    <div class="space-y-3">
                      <p class="text-sm font-medium text-slate-700">Escaneie o QR Code no app do seu banco ou use o PIX Copia e Cola:</p>
                      @if (pagamento.pixCopiaCola) {
                        <textarea readonly rows="3" [value]="pagamento.pixCopiaCola"
                                  class="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"></textarea>
                        <div class="flex flex-wrap gap-2">
                          <button (click)="copiarCodigoPagamento()"
                                  class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold">
                            {{ codigoCopiado ? '✓ Código Copiado!' : '📋 Copiar Código PIX' }}
                          </button>
                          <button (click)="confirmarPagamentoSimulado()" [disabled]="processandoPagamento"
                                  class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold">
                            {{ processandoPagamento ? 'Confirmando...' : '✅ Simular Confirmação do PIX' }}
                          </button>
                        </div>
                      }
                      <p class="text-xs text-slate-400">Aguardando confirmação do pagamento... assim que confirmado, seu pedido entra em produção automaticamente.</p>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- ABA 2: CARTÃO DE CRÉDITO -->
            @if (metodoPagamentoSelecionado === 'CARTAO_CREDITO') {
              <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div class="md:col-span-5">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Número do Cartão</label>
                    <input type="text"
                           [(ngModel)]="dadosCartao.numeroCartao"
                           (ngModelChange)="formatarNumeroCartao($event)"
                           maxlength="19"
                           placeholder="0000 0000 0000 0000"
                           class="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white font-mono placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-4">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Nome Impresso no Cartão</label>
                    <input type="text"
                           [(ngModel)]="dadosCartao.nomeTitular"
                           placeholder="Ex: JOAO M SILVA"
                           class="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white uppercase placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Validade</label>
                    <input type="text"
                           [(ngModel)]="dadosCartao.validade"
                           (ngModelChange)="formatarValidadeCartao($event)"
                           maxlength="5"
                           placeholder="MM/AA"
                           class="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white text-center placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-1">
                    <label class="block text-xs font-medium text-slate-600 mb-1">CVV</label>
                    <input type="text"
                           [(ngModel)]="dadosCartao.cvv"
                           maxlength="4"
                           placeholder="123"
                           class="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white text-center placeholder:text-slate-300" />
                  </div>
                </div>

                <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
                  <div class="w-full md:w-72">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Parcelamento (sem juros)</label>
                    <select [(ngModel)]="dadosCartao.parcelas"
                            class="w-full p-2.5 text-sm border border-slate-300 rounded-lg bg-white">
                      @for (p of opcoesParcelas; track p) {
                        <option [ngValue]="p">
                          {{ p }}x de {{ (totalAguardandoPagamento / p) | currency:'BRL' }} sem juros
                        </option>
                      }
                    </select>
                  </div>

                  <button type="button" (click)="pagarComCartao()" [disabled]="processandoPagamento"
                          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    {{ processandoPagamento ? 'Processando Cartão...' : '💳 Finalizar Pagamento com Cartão' }}
                  </button>
                </div>
              </div>
            }

            <!-- ABA 3: BOLETO BANCÁRIO -->
            @if (metodoPagamentoSelecionado === 'BOLETO') {
              <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                @if (!pagamento || pagamento.metodoPagamento !== 'BOLETO') {
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-bold text-slate-800">Boleto Bancário Registrado</p>
                      <p class="text-xs text-slate-500">Pagável em qualquer banco ou lotérica até o vencimento (compensação em até 1 dia útil).</p>
                    </div>
                    <button (click)="gerarBoleto()" [disabled]="processandoPagamento"
                            class="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0">
                      {{ processandoPagamento ? 'Gerando Boleto...' : '📄 Emitir Boleto Bancário' }}
                    </button>
                  </div>
                } @else {
                  <div class="space-y-3">
                    <p class="text-xs font-bold uppercase text-slate-500">Linha Digitável do Boleto</p>
                    <input type="text" readonly [value]="pagamento.pixCopiaCola"
                           class="w-full p-3 text-sm font-mono border border-slate-300 rounded-lg bg-white" />
                    <div class="flex flex-wrap gap-2">
                      <button (click)="copiarCodigoPagamento()"
                              class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold">
                        {{ codigoCopiado ? '✓ Linha Digitável Copiada!' : '📋 Copiar Linha Digitável' }}
                      </button>
                      <button (click)="confirmarPagamentoSimulado()" [disabled]="processandoPagamento"
                              class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold">
                        {{ processandoPagamento ? 'Confirmando...' : '✅ Simular Compensação do Boleto' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        }

        <!-- CARD DE CHECKOUT / FRETE PARA CARRINHO EM ABERTO -->
        @if (compraAbertaId && cotacao) {
          <section class="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm space-y-5">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  Carrinho Aberto ({{ cotacao.totalItens }} organizador(es))
                </span>
                <h2 class="text-xl font-bold text-slate-800 mt-1">Finalizar Endereço de Entrega, Frete & Pagamento</h2>
                <p class="text-xs text-slate-500">
                  Pacote estimado pelo sistema: <strong>{{ cotacao.pacote.larguraCm }} x {{ cotacao.pacote.profundidadeCm }} x {{ cotacao.pacote.alturaCm }} cm</strong>
                  · Peso total estimado: <strong>{{ cotacao.pacote.pesoKg }} kg</strong>
                </p>
              </div>
              <div class="text-right">
                <span class="block text-xs text-slate-400">Subtotal Gavetas + Frete</span>
                <span class="text-2xl font-bold text-emerald-600">
                  {{ totalCarrinhoComFrete | currency:'BRL' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">CEP *</label>
                <div class="flex gap-1">
                  <input type="text"
                         name="cep"
                         [(ngModel)]="endereco.cep"
                         (ngModelChange)="aoDigitarCep($event)"
                         maxlength="9"
                         placeholder="Digite o CEP"
                         [ngClass]="camposInvalidos['cep'] ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300'"
                         class="w-full p-2 text-sm border rounded-lg placeholder:text-slate-300" />
                  <button type="button" (click)="buscarCepERecalcular()" [disabled]="buscandoCep"
                          class="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-3 rounded-lg text-xs font-semibold">
                    {{ buscandoCep ? '...' : 'Calcular' }}
                  </button>
                </div>
                @if (buscandoCep) {
                  <span class="block text-[11px] text-indigo-600 mt-1">Buscando endereço pelo CEP...</span>
                }
                @if (erroCep) {
                  <span class="block text-[11px] text-amber-700 mt-1">{{ erroCep }}</span>
                }
              </div>

              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">Telefone / WhatsApp *</label>
                <input type="text"
                       name="telefone"
                       [(ngModel)]="telefone"
                       (ngModelChange)="aoDigitarTelefone($event)"
                       maxlength="15"
                       placeholder="Digite seu WhatsApp"
                       [ngClass]="camposInvalidos['telefone'] ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300'"
                       class="w-full p-2 text-sm border rounded-lg placeholder:text-slate-300" />
              </div>

              <div class="md:col-span-4">
                <label class="block text-xs font-medium text-slate-600 mb-1">Rua / Logradouro *</label>
                <input type="text"
                       name="logradouro"
                       [(ngModel)]="endereco.logradouro"
                       (ngModelChange)="camposInvalidos['logradouro'] = false"
                       placeholder="Preenchido pelo CEP"
                       [ngClass]="camposInvalidos['logradouro'] ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300'"
                       class="w-full p-2 text-sm border rounded-lg placeholder:text-slate-300" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">Número *</label>
                <input type="text"
                       name="numero"
                       [(ngModel)]="endereco.numero"
                       (ngModelChange)="camposInvalidos['numero'] = false"
                       placeholder="Nº ou S/N"
                       [ngClass]="camposInvalidos['numero'] ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300'"
                       class="w-full p-2 text-sm border rounded-lg placeholder:text-slate-300" />
              </div>

              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">Complemento</label>
                <input type="text"
                       name="complemento"
                       [(ngModel)]="endereco.complemento"
                       placeholder="Apto, Bloco, Casa (opcional)"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg placeholder:text-slate-300" />
              </div>

              <div class="md:col-span-3">
                <label class="block text-xs font-medium text-slate-600 mb-1">Bairro</label>
                <input type="text"
                       name="bairro"
                       [(ngModel)]="endereco.bairro"
                       placeholder="Preenchido pelo CEP"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg placeholder:text-slate-300" />
              </div>

              <div class="md:col-span-4">
                <label class="block text-xs font-medium text-slate-600 mb-1">Cidade *</label>
                <input type="text"
                       name="cidade"
                       [(ngModel)]="endereco.cidade"
                       (ngModelChange)="camposInvalidos['cidade'] = false"
                       placeholder="Preenchido pelo CEP"
                       [ngClass]="camposInvalidos['cidade'] ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400' : 'border-slate-300'"
                       class="w-full p-2 text-sm border rounded-lg placeholder:text-slate-300" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">UF</label>
                <input type="text"
                       name="estado"
                       [(ngModel)]="endereco.estado"
                       maxlength="2"
                       placeholder="UF"
                       class="w-full p-2 text-sm border border-slate-300 rounded-lg uppercase placeholder:text-slate-300" />
              </div>
            </div>

            <!-- Opções de Frete -->
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase text-slate-500">1. Escolha a Transportadora</label>
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

            <!-- Opções de Forma de Pagamento no Checkout -->
            <div class="space-y-3">
              <label class="block text-xs font-bold uppercase text-slate-500">2. Escolha a Forma de Pagamento</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div (click)="metodoPagamentoSelecionado = 'PIX'"
                     class="p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3"
                     [ngClass]="metodoPagamentoSelecionado === 'PIX'
                       ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                       : 'border-slate-200 hover:border-slate-300 bg-slate-50'">
                  <span class="text-xl">⚡</span>
                  <div>
                    <p class="text-sm font-bold text-slate-800">PIX</p>
                    <p class="text-xs text-slate-500">QR Code e Copia e Cola · Liberação imediata</p>
                  </div>
                </div>

                <div (click)="metodoPagamentoSelecionado = 'CARTAO_CREDITO'"
                     class="p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3"
                     [ngClass]="metodoPagamentoSelecionado === 'CARTAO_CREDITO'
                       ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                       : 'border-slate-200 hover:border-slate-300 bg-slate-50'">
                  <span class="text-xl">💳</span>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Cartão de Crédito</p>
                    <p class="text-xs text-slate-500">Até 12x sem juros · Aprovação na hora</p>
                  </div>
                </div>

                <div (click)="metodoPagamentoSelecionado = 'BOLETO'"
                     class="p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3"
                     [ngClass]="metodoPagamentoSelecionado === 'BOLETO'
                       ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                       : 'border-slate-200 hover:border-slate-300 bg-slate-50'">
                  <span class="text-xl">📄</span>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Boleto Bancário</p>
                    <p class="text-xs text-slate-500">Linha digitável · Compensação em 1 dia útil</p>
                  </div>
                </div>
              </div>

              <!-- Formulário inline de Cartão caso selecionado já no checkout -->
              @if (metodoPagamentoSelecionado === 'CARTAO_CREDITO') {
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 mt-2">
                  <div class="md:col-span-4">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Número do Cartão *</label>
                    <input type="text"
                           name="numeroCartao"
                           [(ngModel)]="dadosCartao.numeroCartao"
                           (ngModelChange)="formatarNumeroCartao($event)"
                           maxlength="19"
                           placeholder="0000 0000 0000 0000"
                           class="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white font-mono placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-3">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Nome no Cartão *</label>
                    <input type="text"
                           name="nomeTitular"
                           [(ngModel)]="dadosCartao.nomeTitular"
                           placeholder="NOME IMPRESSO"
                           class="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white uppercase placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Validade *</label>
                    <input type="text"
                           name="validade"
                           [(ngModel)]="dadosCartao.validade"
                           (ngModelChange)="formatarValidadeCartao($event)"
                           maxlength="5"
                           placeholder="MM/AA"
                           class="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-center placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-1">
                    <label class="block text-xs font-medium text-slate-600 mb-1">CVV *</label>
                    <input type="text"
                           name="cvv"
                           [(ngModel)]="dadosCartao.cvv"
                           maxlength="4"
                           placeholder="123"
                           class="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white text-center placeholder:text-slate-300" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Parcelas</label>
                    <select name="parcelas" [(ngModel)]="dadosCartao.parcelas"
                            class="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white">
                      @for (p of opcoesParcelas; track p) {
                        <option [ngValue]="p">{{ p }}x de {{ (totalCarrinhoComFrete / p) | currency:'BRL' }}</option>
                      }
                    </select>
                  </div>
                </div>
              }
            </div>

            <div class="flex justify-end pt-2">
              <button (click)="confirmarCheckout()" [disabled]="finalizandoCheckout"
                      class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                @if (finalizandoCheckout) {
                  Processando Pedido...
                } @else if (metodoPagamentoSelecionado === 'CARTAO_CREDITO') {
                  Fechar Compra e Pagar com Cartão
                } @else if (metodoPagamentoSelecionado === 'BOLETO') {
                  Fechar Compra e Gerar Boleto
                } @else {
                  Fechar Compra e Gerar PIX
                }
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

                  <div class="mt-3">
                    <button (click)="svgVisivel[p.id] = !svgVisivel[p.id]"
                            class="w-full py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors">
                      {{ svgVisivel[p.id] ? 'Ocultar Desenho 2D da Gaveta' : 'Visualizar Desenho 2D da Gaveta' }}
                    </button>
                    @if (svgVisivel[p.id]) {
                      <div class="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <app-gaveta-svg
                          [layout]="montarLayoutParaSvg(p)"
                          [medidas]="{ larguraMm: p.larguraMm, profundidadeMm: p.profundidadeMm, alturaMm: p.alturaMm }">
                        </app-gaveta-svg>
                      </div>
                    }
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
export class MeusProjetosComponent implements OnInit, OnDestroy {
  projetos: ProjetoSalvoResponse[] = [];
  isLoading = true;
  svgVisivel: Record<string, boolean> = {};

  compraAbertaId: string | null = null;
  cotacao: CotacaoFreteResponse | null = null;
  freteSelecionado: OpcaoFreteDTO | null = null;

  telefone = '';
  endereco: EnderecoDTO = {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'SP'
  };
  camposInvalidos: Record<string, boolean> = {};
  buscandoCep = false;
  erroCep: string | null = null;
  private ultimoCepBuscado = '';

  metodoPagamentoSelecionado: MetodoPagamento = 'PIX';
  opcoesParcelas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  dadosCartao: PagamentoCartaoRequest = {
    numeroCartao: '',
    nomeTitular: '',
    validade: '',
    cvv: '',
    parcelas: 1
  };

  compraAguardandoPagamentoId: string | null = null;
  totalAguardandoPagamento = 0;
  pagamento: PagamentoResponse | null = null;
  processandoPagamento = false;
  codigoCopiado = false;
  private pollingPagamento: ReturnType<typeof setInterval> | null = null;

  finalizandoCheckout = false;
  mensagemSucesso: string | null = null;
  mensagemErro: string | null = null;

  constructor(
    private projetoService: ApiProjetoService,
    private cdr: ChangeDetectorRef
  ) {}

  get totalCarrinhoComFrete(): number {
    return (this.cotacao?.subtotalProjetos || 0) + (this.freteSelecionado?.valorFrete || 0);
  }

  ngOnInit(): void {
    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }
    this.carregarProjetos();
  }

  ngOnDestroy(): void {
    this.pararPolling();
  }

  selecionarMetodoPagamento(metodo: MetodoPagamento): void {
    this.metodoPagamentoSelecionado = metodo;
    this.mensagemErro = null;
  }

  formatarNumeroCartao(valor: string): void {
    const digitos = (valor || '').replace(/\D/g, '').slice(0, 16);
    this.dadosCartao.numeroCartao = digitos.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatarValidadeCartao(valor: string): void {
    const digitos = (valor || '').replace(/\D/g, '').slice(0, 4);
    this.dadosCartao.validade = digitos.length > 2
      ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
      : digitos;
  }

  aoDigitarTelefone(valor: string): void {
    const digitos = (valor || '').replace(/\D/g, '').slice(0, 11);
    if (digitos.length > 10) {
      this.telefone = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    } else if (digitos.length > 6) {
      this.telefone = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    } else if (digitos.length > 2) {
      this.telefone = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    } else {
      this.telefone = digitos;
    }
    this.camposInvalidos['telefone'] = false;
  }

  private atualizarPagamentoPendente(lista: ProjetoSalvoResponse[]): void {
    const aguardando = lista.find(p => p.compraId && p.transportadora && p.statusCompra === 'FECHADA');
    if (!aguardando) {
      this.compraAguardandoPagamentoId = null;
      this.pagamento = null;
      this.pararPolling();
      return;
    }
    const mesmaCompra = lista.filter(p => p.compraId === aguardando.compraId);
    this.compraAguardandoPagamentoId = aguardando.compraId;
    this.totalAguardandoPagamento =
      mesmaCompra.reduce((s, p) => s + p.valorTotal * p.quantidade, 0) + (aguardando.valorFrete || 0);
  }

  pagarComPix(compraIdAlvo?: string): void {
    const id = compraIdAlvo || this.compraAguardandoPagamentoId;
    if (!id) return;
    this.processandoPagamento = true;
    this.mensagemErro = null;
    this.projetoService.iniciarPagamentoPix(id).subscribe({
      next: (pg) => {
        this.processandoPagamento = false;
        this.pagamento = pg;
        this.iniciarPolling();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.processandoPagamento = false;
        this.mensagemErro = err?.error?.erro || 'Não foi possível gerar o PIX.';
        this.cdr.detectChanges();
      }
    });
  }

  pagarComCartao(compraIdAlvo?: string): void {
    const id = compraIdAlvo || this.compraAguardandoPagamentoId;
    if (!id) return;

    const digitosCartao = (this.dadosCartao.numeroCartao || '').replace(/\D/g, '');
    if (digitosCartao.length < 13) {
      this.mensagemErro = 'Informe um número de cartão válido (13 a 16 dígitos).';
      return;
    }
    if (!(this.dadosCartao.nomeTitular || '').trim()) {
      this.mensagemErro = 'Informe o nome impresso no cartão.';
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2,4}$/.test((this.dadosCartao.validade || '').trim())) {
      this.mensagemErro = 'Informe a validade do cartão no formato MM/AA.';
      return;
    }
    if (!/^\d{3,4}$/.test((this.dadosCartao.cvv || '').trim())) {
      this.mensagemErro = 'Informe o código CVV de 3 ou 4 dígitos do cartão.';
      return;
    }

    this.processandoPagamento = true;
    this.mensagemErro = null;
    this.projetoService.pagarComCartao(id, this.dadosCartao).subscribe({
      next: () => {
        this.processandoPagamento = false;
        this.pararPolling();
        this.pagamento = null;
        this.mensagemSucesso = `Pagamento no Cartão de Crédito (${this.dadosCartao.parcelas}x) aprovado! Seu pedido já entrou em produção na marcenaria.`;
        this.carregarProjetos();
      },
      error: (err) => {
        this.processandoPagamento = false;
        this.mensagemErro = err?.error?.erro || 'Não foi possível processar o cartão de crédito.';
      }
    });
  }

  gerarBoleto(compraIdAlvo?: string): void {
    const id = compraIdAlvo || this.compraAguardandoPagamentoId;
    if (!id) return;
    this.processandoPagamento = true;
    this.mensagemErro = null;
    this.projetoService.iniciarPagamentoBoleto(id).subscribe({
      next: (pg) => {
        this.processandoPagamento = false;
        this.pagamento = pg;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.processandoPagamento = false;
        this.mensagemErro = err?.error?.erro || 'Não foi possível emitir o boleto.';
      }
    });
  }

  confirmarPagamentoSimulado(): void {
    if (!this.compraAguardandoPagamentoId) return;
    this.processandoPagamento = true;
    this.mensagemErro = null;
    this.projetoService.simularAprovacaoPagamento(this.compraAguardandoPagamentoId).subscribe({
      next: () => {
        this.processandoPagamento = false;
        this.pararPolling();
        this.pagamento = null;
        this.mensagemSucesso = 'Pagamento confirmado com sucesso! Seu pedido já entrou na esteira de produção.';
        this.carregarProjetos();
      },
      error: (err) => {
        this.processandoPagamento = false;
        this.mensagemErro = err?.error?.erro || 'Erro ao confirmar pagamento.';
      }
    });
  }

  copiarCodigoPagamento(): void {
    if (!this.pagamento?.pixCopiaCola) return;
    navigator.clipboard.writeText(this.pagamento.pixCopiaCola).then(() => {
      this.codigoCopiado = true;
      setTimeout(() => (this.codigoCopiado = false), 2000);
    });
  }

  private iniciarPolling(): void {
    this.pararPolling();
    this.pollingPagamento = setInterval(() => {
      if (!this.compraAguardandoPagamentoId) return;
      this.projetoService.consultarPagamento(this.compraAguardandoPagamentoId).subscribe({
        next: (pg) => {
          this.pagamento = pg;
          if (pg.status === 'APROVADO') {
            this.pararPolling();
            this.mensagemSucesso = 'Pagamento confirmado! Seu pedido entrou em produção.';
            this.pagamento = null;
            this.carregarProjetos();
          } else if (pg.status !== 'PENDENTE') {
            this.pararPolling();
            this.pagamento = null;
            this.mensagemErro = 'O pagamento não foi concluído. Escolha uma forma de pagamento para tentar novamente.';
          }
        },
        error: () => {}
      });
    }, 5000);
  }

  private pararPolling(): void {
    if (this.pollingPagamento) {
      clearInterval(this.pollingPagamento);
      this.pollingPagamento = null;
    }
  }

  carregarProjetos(acaoPosCarregar?: () => void): void {
    this.isLoading = true;
    this.projetoService.listarMeusProjetos().subscribe({
      next: (lista) => {
        this.projetos = lista;
        this.atualizarPagamentoPendente(lista);
        this.isLoading = false;

        // Verifica se existe uma compra ainda sem transportadora definida (carrinho aberto)
        const emAberto = lista.find(p => p.compraId && !p.transportadora && p.statusCompra === 'FECHADA');
        if (emAberto) {
          this.compraAbertaId = emAberto.compraId;
          this.recalcularFrete(true);
        } else {
          this.compraAbertaId = null;
          this.cotacao = null;
        }

        if (acaoPosCarregar) {
          acaoPosCarregar();
        }
      },
      error: (err) => {
        console.error('Erro ao buscar projetos', err);
        this.isLoading = false;
      }
    });
  }

  aoDigitarCep(valor: string): void {
    const digitos = (valor || '').replace(/\D/g, '').slice(0, 8);
    this.endereco.cep = digitos.length > 5
      ? `${digitos.slice(0, 5)}-${digitos.slice(5)}`
      : digitos;
    this.erroCep = null;
    this.camposInvalidos['cep'] = false;

    if (digitos.length === 8 && digitos !== this.ultimoCepBuscado) {
      this.consultarViaCep(digitos, true);
    } else if (digitos.length < 8) {
      this.ultimoCepBuscado = '';
    }
  }

  buscarCepERecalcular(): void {
    const digitos = (this.endereco.cep || '').replace(/\D/g, '');
    if (digitos.length === 8) {
      this.consultarViaCep(digitos, true);
    } else {
      this.recalcularFrete(false);
    }
  }

  consultarViaCep(cepLimpo: string, atualizarFrete = true): void {
    this.buscandoCep = true;
    this.erroCep = null;
    this.ultimoCepBuscado = cepLimpo;

    this.projetoService.consultarViaCep(cepLimpo).subscribe({
      next: (dados) => {
        this.buscandoCep = false;
        if (dados && !dados.erro) {
          this.endereco = {
            ...this.endereco,
            cep: `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`,
            logradouro: dados.logradouro || this.endereco.logradouro || '',
            bairro: dados.bairro || this.endereco.bairro || '',
            cidade: dados.localidade || this.endereco.cidade || '',
            estado: dados.uf || this.endereco.estado || 'SP',
            complemento: this.endereco.complemento || dados.complemento || ''
          };
          this.camposInvalidos['cep'] = false;
          if (this.endereco.logradouro) this.camposInvalidos['logradouro'] = false;
          if (this.endereco.cidade) this.camposInvalidos['cidade'] = false;
        } else {
          this.erroCep = 'CEP não encontrado. Preencha rua e cidade manualmente.';
        }
        this.cdr.detectChanges();
        if (atualizarFrete) {
          this.recalcularFrete(false);
        }
      },
      error: () => {
        this.buscandoCep = false;
        this.erroCep = 'Não foi possível consultar o CEP automaticamente.';
        this.cdr.detectChanges();
        if (atualizarFrete) {
          this.recalcularFrete(false);
        }
      }
    });
  }

  recalcularFrete(carregarEnderecoSalvo = false): void {
    if (!this.compraAbertaId) return;
    this.projetoService.cotarFrete(this.compraAbertaId, this.endereco.cep).subscribe({
      next: (cot) => {
        this.cotacao = cot;
        if (cot.opcoesFrete.length > 0) {
          const selecionadaAtual = this.freteSelecionado?.transportadora;
          this.freteSelecionado = cot.opcoesFrete.find(o => o.transportadora === selecionadaAtual) || cot.opcoesFrete[0];
        }
        if (carregarEnderecoSalvo) {
          if (cot.telefoneAtual && cot.telefoneAtual !== '00000000000') {
            this.telefone = cot.telefoneAtual;
          }
          if (cot.enderecoAtual && cot.enderecoAtual.cep) {
            this.endereco = {
              cep: cot.enderecoAtual.cep || '',
              logradouro: cot.enderecoAtual.logradouro || '',
              numero: cot.enderecoAtual.numero || '',
              complemento: cot.enderecoAtual.complemento || '',
              bairro: cot.enderecoAtual.bairro || '',
              cidade: cot.enderecoAtual.cidade || '',
              estado: cot.enderecoAtual.estado || 'SP'
            };
            this.ultimoCepBuscado = (cot.enderecoAtual.cep || '').replace(/\D/g, '');
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao cotar frete', err)
    });
  }

  confirmarCheckout(): void {
    if (!this.compraAbertaId || !this.freteSelecionado) return;

    const tel = (this.telefone || '').trim();
    const cep = (this.endereco.cep || '').trim();
    const rua = (this.endereco.logradouro || '').trim();
    const num = (this.endereco.numero || '').trim();
    const cid = (this.endereco.cidade || '').trim();

    this.camposInvalidos = {
      cep: !cep,
      telefone: !tel,
      logradouro: !rua,
      numero: !num,
      cidade: !cid
    };

    const faltando: string[] = [];
    if (!cep) faltando.push('CEP');
    if (!tel) faltando.push('Telefone / WhatsApp');
    if (!rua) faltando.push('Rua / Logradouro');
    if (!num) faltando.push('Número');
    if (!cid) faltando.push('Cidade');

    if (faltando.length > 0) {
      this.mensagemErro = `Por favor, preencha os campos obrigatórios destacados em vermelho: ${faltando.join(', ')}.`;
      return;
    }

    // Se escolheu Cartão já no checkout, valida os dados do cartão antes de fechar a compra
    if (this.metodoPagamentoSelecionado === 'CARTAO_CREDITO') {
      const digitosCartao = (this.dadosCartao.numeroCartao || '').replace(/\D/g, '');
      if (digitosCartao.length < 13 || !(this.dadosCartao.nomeTitular || '').trim()
          || !/^(0[1-9]|1[0-2])\/\d{2,4}$/.test((this.dadosCartao.validade || '').trim())
          || !/^\d{3,4}$/.test((this.dadosCartao.cvv || '').trim())) {
        this.mensagemErro = 'Preencha todos os dados do Cartão de Crédito (número, nome, validade MM/AA e CVV) para finalizar.';
        return;
      }
    }

    const idCompra = this.compraAbertaId;
    const metodoEscolhido = this.metodoPagamentoSelecionado;

    this.finalizandoCheckout = true;
    this.mensagemErro = null;
    this.mensagemSucesso = null;

    this.projetoService.finalizarCheckout(idCompra, {
      telefone: tel,
      endereco: {
        cep,
        logradouro: rua,
        numero: num,
        complemento: (this.endereco.complemento || '').trim(),
        bairro: (this.endereco.bairro || '').trim(),
        cidade: cid,
        estado: (this.endereco.estado || 'SP').trim().toUpperCase()
      },
      transportadora: this.freteSelecionado.transportadora,
      valorFrete: this.freteSelecionado.valorFrete,
      prazoFreteDias: this.freteSelecionado.prazoDias
    }).subscribe({
      next: () => {
        this.finalizandoCheckout = false;
        this.carregarProjetos(() => {
          if (metodoEscolhido === 'CARTAO_CREDITO') {
            this.pagarComCartao(idCompra);
          } else if (metodoEscolhido === 'BOLETO') {
            this.gerarBoleto(idCompra);
          } else {
            this.pagarComPix(idCompra);
          }
        });
      },
      error: (err) => {
        this.finalizandoCheckout = false;
        this.mensagemErro = err?.error?.erro || 'Erro ao fechar compra.';
      }
    });
  }

  montarLayoutParaSvg(p: ProjetoSalvoResponse): LayoutGerado {
    return {
      larguraTotalMm: p.larguraMm - p.margemSegurancaMm,
      profundidadeTotalMm: p.profundidadeMm - p.margemSegurancaMm,
      alturaTotalMm: p.alturaMm,
      divisorias: p.divisorias || [],
      objetosPosicionados: [],
      espessuraDivisoriaMm: p.espessuraMaterialMm,
      orcamento: {
        valorMaterial: 0,
        valorDivisorias: 0,
        valorVolume: 0,
        valorTotal: p.valorTotal
      }
    };
  }
}
