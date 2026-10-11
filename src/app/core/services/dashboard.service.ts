import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResumen } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  resumen(): Observable<DashboardResumen> {
    return this.http.get<DashboardResumen>(`${this.api}/resumen`);
  }
}
