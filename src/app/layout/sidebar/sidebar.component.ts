import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Rol } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';

interface ItemMenu { etiqueta: string; ruta: string; icono: string; roles: Rol[]; }

const MENU: ItemMenu[] = [
  { etiqueta: 'Dashboard', ruta: '/dashboard', icono: 'bi-speedometer2', roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'PROFESIONAL'] },
  { etiqueta: 'Pacientes', ruta: '/pacientes', icono: 'bi-people', roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
  { etiqueta: 'Profesionales', ruta: '/profesionales', icono: 'bi-person-badge', roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
  { etiqueta: 'Citas', ruta: '/citas', icono: 'bi-calendar-check', roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'PROFESIONAL'] },
  { etiqueta: 'Atenciones', ruta: '/atenciones', icono: 'bi-clipboard2-pulse', roles: ['ADMINISTRADOR', 'PROFESIONAL'] },
  { etiqueta: 'Seguimiento', ruta: '/seguimiento', icono: 'bi-journal-medical', roles: ['ADMINISTRADOR', 'PROFESIONAL'] },
  { etiqueta: 'Reportes', ruta: '/reportes', icono: 'bi-bar-chart', roles: ['ADMINISTRADOR'] },
  { etiqueta: 'Usuarios', ruta: '/usuarios', icono: 'bi-person-gear', roles: ['ADMINISTRADOR'] },
  { etiqueta: 'Mi información', ruta: '/mi-informacion', icono: 'bi-person-vcard', roles: ['PACIENTE'] },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="s360-sidebar" [class.abierto]="abierto">
      <div class="s360-logo">
        <span class="s360-logo-icono"><i class="bi bi-heart-fill"></i></span>
        <div>
          <div class="s360-logo-titulo">Salud 360</div>
          <div class="s360-logo-sub">Centro Integral de Salud</div>
        </div>
      </div>
      <ul class="s360-menu">
        <li *ngFor="let item of items">
          <a [routerLink]="item.ruta" routerLinkActive="activo" (click)="navegar.emit()">
            <i class="bi" [ngClass]="item.icono"></i> {{ item.etiqueta }}
          </a>
        </li>
      </ul>
      <button type="button" class="s360-cerrar" (click)="cerrarSesion.emit()">
        <i class="bi bi-box-arrow-right"></i> Cerrar sesión
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() abierto = false;
  @Output() cerrarSesion = new EventEmitter<void>();
  @Output() navegar = new EventEmitter<void>();

  items: ItemMenu[];

  constructor(auth: AuthService) {
    const rol = auth.obtenerRol();
    this.items = MENU.filter((i) => rol !== null && i.roles.includes(rol));
  }
}
