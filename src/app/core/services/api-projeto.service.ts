import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CriarProjetoRequest, ProjetoSalvoResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiProjetoService {
  private readonly baseUrl = 'http://localhost:8081/api/projetos';

  constructor(private http: HttpClient) {}

  salvarProjeto(request: CriarProjetoRequest): Observable<ProjetoSalvoResponse> {
    return this.http.post<ProjetoSalvoResponse>(this.baseUrl, request);
  }

  listarMeusProjetos(): Observable<ProjetoSalvoResponse[]> {
    return this.http.get<ProjetoSalvoResponse[]>(this.baseUrl);
  }
}
