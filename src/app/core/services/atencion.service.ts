import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Atencion, AtencionRequest, Pagina } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private api = `${environment.apiUrl}/atenciones`;

  constructor(private http: HttpClient) {}

  listar(page = 0, size = 6): Observable<Pagina<Atencion>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Pagina<Atencion>>(this.api, { params });
  }

  crear(a: AtencionRequest): Observable<Atencion> {
    return this.http.post<Atencion>(this.api, a);
  }
}
