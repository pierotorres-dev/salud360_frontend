import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Catalogo } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  constructor(private http: HttpClient) {}

  especialidades(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${environment.apiUrl}/especialidades`);
  }

  servicios(): Observable<Catalogo[]> {
    return this.http.get<Catalogo[]>(`${environment.apiUrl}/servicios`);
  }
}
