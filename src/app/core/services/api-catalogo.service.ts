import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogoCompletoDTO } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiCatalogoService {
  private readonly baseUrl = 'http://localhost:8081/api/public/catalogo';

  constructor(private http: HttpClient) {}

  obterCatalogo(): Observable<CatalogoCompletoDTO> {
    return this.http.get<CatalogoCompletoDTO>(this.baseUrl);
  }
}
