import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Rol, UsuarioSesion } from '../models/modelos';

const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

interface JwtPayload { sub: string; rol: Rol; iat: number; exp: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credenciales)
      .pipe(tap((resp) => this.guardarSesion(resp)));
  }

  guardarSesion(resp: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, resp.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(resp.usuario));
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  obtenerUsuario(): UsuarioSesion | null {
    const json = localStorage.getItem(USUARIO_KEY);
    return json ? (JSON.parse(json) as UsuarioSesion) : null;
  }

  private payload(): JwtPayload | null {
    const token = this.obtenerToken();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }

  obtenerRol(): Rol | null {
    return this.payload()?.rol ?? null;
  }

  estaAutenticado(): boolean {
    const p = this.payload();
    return !!p && p.exp * 1000 > Date.now();
  }

  rutaInicio(): string {
    return this.obtenerRol() === 'PACIENTE' ? '/mi-informacion' : '/dashboard';
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  }
}
