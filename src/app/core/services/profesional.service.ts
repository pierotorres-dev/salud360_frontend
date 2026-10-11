import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Disponibilidad, Horario, Profesional, ProfesionalRequest } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private api = `${environment.apiUrl}/profesionales`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(this.api);
  }

  obtener(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.api}/${id}`);
  }

  crear(p: ProfesionalRequest): Observable<Profesional> {
    return this.http.post<Profesional>(this.api, p);
  }

  actualizarHorarios(id: number, horarios: Horario[]): Observable<Profesional> {
    return this.http.put<Profesional>(`${this.api}/${id}/horarios`, { horarios });
  }

  disponibilidad(id: number, fecha: string): Observable<Disponibilidad> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<Disponibilidad>(`${this.api}/${id}/disponibilidad`, { params });
  }
}
