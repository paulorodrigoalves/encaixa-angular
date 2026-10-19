import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CatalogoAdminDTO,
  CompraAdminDTO,
  EtapaProducaoDTO,
  PlanoCorteProjetoDTO,
  RegistrarEtapaRequest,
  RegraPrecificacaoDTO
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiAdminService {
  private readonly baseUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  obterRegraPrecificacao(): Observable<RegraPrecificacaoDTO> {
    return this.http.get<RegraPrecificacaoDTO>(`${this.baseUrl}/precificacao`);
  }

  atualizarRegraPrecificacao(precoPorLitro: number, precoPorCm2Divisoria: number): Observable<RegraPrecificacaoDTO> {
    return this.http.post<RegraPrecificacaoDTO>(`${this.baseUrl}/precificacao`, {
      precoPorLitro,
      precoPorCm2Divisoria
    });
  }

  listarEtapasCatalogo(): Observable<EtapaProducaoDTO[]> {
    return this.http.get<EtapaProducaoDTO[]>(`${this.baseUrl}/etapas-producao`);
  }

  listarCompras(): Observable<CompraAdminDTO[]> {
    return this.http.get<CompraAdminDTO[]>(`${this.baseUrl}/compras`);
  }

  obterPlanoCorte(compraId: string): Observable<PlanoCorteProjetoDTO[]> {
    return this.http.get<PlanoCorteProjetoDTO[]>(`${this.baseUrl}/compras/${compraId}/plano-corte`);
  }

  aprovarCompra(compraId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/compras/${compraId}/aprovar`, {});
  }

  registrarEtapa(pedidoId: string, req: RegistrarEtapaRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/pedidos/${pedidoId}/etapas`, req);
  }

  obterCatalogoAdmin(): Observable<CatalogoAdminDTO> {
    return this.http.get<CatalogoAdminDTO>(`${this.baseUrl}/catalogo`);
  }

  criarTipoMaterial(req: { nome: string; espessuraMm: number; margemMm: number }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/catalogo/tipos-material`, req);
  }

  criarMaterial(req: { nome: string; cor: string; valorFixoAdicional: number; tipoMaterialId: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/catalogo/materiais`, req);
  }

  toggleAtivoMaterial(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/catalogo/materiais/${id}/toggle-ativo`, {});
  }

  criarTipoObjeto(req: {
    nome: string;
    categoria: string;
    larguraMinMm: number;
    larguraMaxMm: number;
    profundidadeMinMm: number;
    profundidadeMaxMm: number;
    alturaMinMm: number | null;
  }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/catalogo/tipos-objeto`, req);
  }

  toggleAtivoTipoObjeto(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/catalogo/tipos-objeto/${id}/toggle-ativo`, {});
  }
}


