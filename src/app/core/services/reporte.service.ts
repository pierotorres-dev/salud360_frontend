import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Atencion, Cita, EstadoCita, Indicadores } from '../models/modelos';

export interface FiltroReporte {
  desde?: string;
  hasta?: string;
  profesionalId?: number | null;
  servicioId?: number | null;
  estado?: EstadoCita | '';
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private api = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  citas(f: FiltroReporte): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.api}/citas`, { params: this.parametros(f) });
  }

  atenciones(f: FiltroReporte): Observable<Atencion[]> {
    return this.http.get<Atencion[]>(`${this.api}/atenciones`, { params: this.parametros(f) });
  }

  indicadores(f: FiltroReporte): Observable<Indicadores> {
    return this.http.get<Indicadores>(`${this.api}/indicadores`, { params: this.parametros(f) });
  }

  private parametros(f: FiltroReporte): HttpParams {
    let params = new HttpParams();
    if (f.desde) params = params.set('desde', f.desde);
    if (f.hasta) params = params.set('hasta', f.hasta);
    if (f.profesionalId) params = params.set('profesionalId', f.profesionalId);
    if (f.servicioId) params = params.set('servicioId', f.servicioId);
    if (f.estado) params = params.set('estado', f.estado);
    return params;
  }
}
