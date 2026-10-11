import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Seguimiento, SeguimientoRequest } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  constructor(private http: HttpClient) {}

  porPaciente(pacienteId: number): Observable<Seguimiento[]> {
    return this.http.get<Seguimiento[]>(`${environment.apiUrl}/pacientes/${pacienteId}/seguimientos`);
  }

  crear(s: SeguimientoRequest): Observable<Seguimiento> {
    return this.http.post<Seguimiento>(`${environment.apiUrl}/seguimientos`, s);
  }
}
