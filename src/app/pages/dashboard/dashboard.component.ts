import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Conteo, DashboardResumen } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { mensajeError } from '../../core/utils/http-error';
import { mesActual } from '../../core/utils/fechas';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';

const COLORES = ['#205fae', '#2f9e6e', '#7a50d0', '#eea008', '#e8821e', '#6b7280'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, KpiCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  resumen: DashboardResumen | null = null;
  error = '';
  periodo = mesActual();
  puedeCrearCita: boolean;

  constructor(private dashboardService: DashboardService, auth: AuthService) {
    const rol = auth.obtenerRol();
    this.puedeCrearCita = rol === 'ADMINISTRADOR' || rol === 'RECEPCIONISTA';
  }

  ngOnInit(): void {
    this.dashboardService.resumen().subscribe({
      next: (r) => (this.resumen = r),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
  }

  get totalAtenciones(): number {
    return (this.resumen?.atencionesPorServicio ?? []).reduce((s, c) => s + c.cantidad, 0);
  }

  color(i: number): string {
    return COLORES[i % COLORES.length];
  }

  porcentaje(c: Conteo): number {
    return this.totalAtenciones === 0 ? 0 : Math.round((c.cantidad * 100) / this.totalAtenciones);
  }

  get fondoDona(): string {
    const datos = this.resumen?.atencionesPorServicio ?? [];
    if (this.totalAtenciones === 0) return '#e3e8ef';
    let acumulado = 0;
    const tramos = datos.map((c, i) => {
      const inicio = acumulado;
      acumulado += (c.cantidad * 100) / this.totalAtenciones;
      return `${this.color(i)} ${inicio}% ${acumulado}%`;
    });
    return `conic-gradient(${tramos.join(', ')})`;
  }

  alturaBarra(c: Conteo): number {
    const max = Math.max(1, ...(this.resumen?.citasPorDia ?? []).map((d) => d.cantidad));
    return (c.cantidad * 100) / max;
  }
}
