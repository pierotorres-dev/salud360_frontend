import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Atencion, Cita, EstadoRegistro, Paciente, PacienteRequest, Pagina } from '../models/modelos';

export interface FiltroPacientes {
  buscar?: string;
  estado?: EstadoRegistro | '';
  orden?: 'apellidos' | 'documento' | 'recientes';
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private api = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  listar(f: FiltroPacientes = {}): Observable<Pagina<Paciente>> {
    let params = new HttpParams()
      .set('page', f.page ?? 0)
      .set('size', f.size ?? 6)
      .set('orden', f.orden ?? 'apellidos');
    if (f.buscar?.trim()) params = params.set('buscar', f.buscar.trim());
    if (f.estado) params = params.set('estado', f.estado);
    return this.http.get<Pagina<Paciente>>(this.api, { params });
  }

  listarActivos(): Observable<Pagina<Paciente>> {
    return this.listar({ estado: 'ACTIVO', size: 100, orden: 'apellidos' });
  }

  obtener(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.api}/${id}`);
  }

  crear(p: PacienteRequest): Observable<Paciente> {
    return this.http.post<Paciente>(this.api, p);
  }

  actualizar(id: number, p: PacienteRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.api}/${id}`, p);
  }

  cambiarEstado(id: number, estado: EstadoRegistro): Observable<Paciente> {
    return this.http.patch<Paciente>(`${this.api}/${id}/estado`, { estado });
  }

  citas(id: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.api}/${id}/citas`);
  }

  atenciones(id: number): Observable<Atencion[]> {
    return this.http.get<Atencion[]>(`${this.api}/${id}/atenciones`);
  }
}
