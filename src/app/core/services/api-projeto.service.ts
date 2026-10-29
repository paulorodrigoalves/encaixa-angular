import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CotacaoFreteResponse,
  CriarProjetoRequest,
  FinalizarCheckoutRequest,
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
    return this.http.post<PagamentoResponse>(`//pagamento/pix`, {});
  }

  consultarPagamento(compraId: string): Observable<PagamentoResponse> {
    return this.http.get<PagamentoResponse>(`//pagamento`);
  }
}
