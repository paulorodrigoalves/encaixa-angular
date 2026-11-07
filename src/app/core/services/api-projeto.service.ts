import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CotacaoFreteResponse,
  CriarProjetoRequest,
  FinalizarCheckoutRequest,
  PagamentoCartaoRequest,
  PagamentoResponse,
  ProjetoSalvoResponse
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiProjetoService {
  private readonly baseUrl = 'http://localhost:8081/api/projetos';
  private readonly comprasUrl = 'http://localhost:8081/api/compras';

  constructor(private http: HttpClient) {}

  salvarProjeto(request: CriarProjetoRequest): Observable<ProjetoSalvoResponse> {
    return this.http.post<ProjetoSalvoResponse>(this.baseUrl, request);
  }

  listarMeusProjetos(): Observable<ProjetoSalvoResponse[]> {
    return this.http.get<ProjetoSalvoResponse[]>(this.baseUrl);
  }

  cotarFrete(compraId: string, cep: string): Observable<CotacaoFreteResponse> {
    return this.http.get<CotacaoFreteResponse>(`${this.comprasUrl}/${compraId}/cotacao-frete`, {
      params: { cep: cep || '01001000' }
    });
  }

  finalizarCheckout(compraId: string, req: FinalizarCheckoutRequest): Observable<void> {
    return this.http.post<void>(`${this.comprasUrl}/${compraId}/checkout`, req);
  }

  iniciarPagamentoPix(compraId: string): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.comprasUrl}/${compraId}/pagamento/pix`, {});
  }

  pagarComCartao(compraId: string, req: PagamentoCartaoRequest): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.comprasUrl}/${compraId}/pagamento/cartao`, req);
  }

  iniciarPagamentoBoleto(compraId: string): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.comprasUrl}/${compraId}/pagamento/boleto`, {});
  }

  simularAprovacaoPagamento(compraId: string): Observable<PagamentoResponse> {
    return this.http.post<PagamentoResponse>(`${this.comprasUrl}/${compraId}/pagamento/simular-aprovacao`, {});
  }

  consultarPagamento(compraId: string): Observable<PagamentoResponse> {
    return this.http.get<PagamentoResponse>(`${this.comprasUrl}/${compraId}/pagamento`);
  }

  consultarViaCep(cepLimpo: string): Observable<{
    erro?: boolean;
    logradouro?: string;
    complemento?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  }> {
    return this.http.get<{
      erro?: boolean;
      logradouro?: string;
      complemento?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    }>(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  }
}
