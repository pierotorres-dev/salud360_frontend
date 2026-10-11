import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cita, CitaRequest, EstadoCita, Pagina } from '../models/modelos';

export interface FiltroCitas {
  fecha?: string;
  estado?: EstadoCita | '';
  profesionalId?: number | null;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private api = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  listar(f: FiltroCitas = {}): Observable<Pagina<Cita>> {
    let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 6);
    if (f.fecha) params = params.set('fecha', f.fecha);
    if (f.estado) params = params.set('estado', f.estado);
    if (f.profesionalId) params = params.set('profesionalId', f.profesionalId);
    return this.http.get<Pagina<Cita>>(this.api, { params });
  }

  obtener(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.api}/${id}`);
  }

  crear(c: CitaRequest): Observable<Cita> {
    return this.http.post<Cita>(this.api, c);
  }

  reprogramar(id: number, c: CitaRequest): Observable<Cita> {
    return this.http.put<Cita>(`${this.api}/${id}`, c);
  }

  cambiarEstado(id: number, estado: 'CONFIRMADA' | 'CANCELADA'): Observable<Cita> {
    return this.http.patch<Cita>(`${this.api}/${id}/estado`, { estado });
  }
}
