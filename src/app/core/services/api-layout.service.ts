import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreviewLayoutRequest, PreviewLayoutResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiLayoutService {
  private readonly baseUrl = 'http://localhost:8081/api/public/layout/preview';

  constructor(private http: HttpClient) {}

  gerarPreview(request: PreviewLayoutRequest): Observable<PreviewLayoutResponse> {
    return this.http.post<PreviewLayoutResponse>(this.baseUrl, request);
  }
}
