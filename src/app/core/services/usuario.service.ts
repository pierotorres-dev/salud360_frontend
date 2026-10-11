import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.api);
  }

  crear(u: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.api, u);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.api}/${id}/estado`, { activo });
  }
}
