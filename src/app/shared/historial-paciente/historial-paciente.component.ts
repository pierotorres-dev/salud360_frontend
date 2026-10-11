import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Atencion, Paciente } from '../../core/models/modelos';
import { PacienteService } from '../../core/services/paciente.service';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  selector: 'app-historial-paciente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="s360-card p-3 h-100">
      <ng-container *ngIf="paciente; else sinPaciente">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="fs-6 fw-bold m-0">Historial · {{ paciente.nombreCompleto }}</h2>
          <span class="s360-badge PROGRAMADA">{{ paciente.documento }}</span>
        </div>
        <div class="alert s360-alerta-error py-2 small" *ngIf="error">{{ error }}</div>
        <div *ngFor="let a of atenciones" class="border-start border-3 border-success ps-2 mb-3 small">
          <div><strong>{{ a.codigo }}</strong> <span class="text-secondary">· {{ a.fecha | date: 'dd/MM/yyyy' }}</span></div>
          <div>{{ a.motivo }} · {{ a.profesional }}</div>
          <div class="text-secondary" *ngIf="a.observaciones">{{ a.observaciones }}</div>
        </div>
        <p class="text-secondary small mb-0" *ngIf="!cargando && !error && atenciones.length === 0">Sin atenciones registradas</p>
      </ng-container>
      <ng-template #sinPaciente>
        <p class="text-secondary small mb-0">Seleccione un paciente para ver su historial</p>
      </ng-template>
    </div>
  `,
})
export class HistorialPacienteComponent implements OnChanges {
  @Input() paciente: Paciente | null = null;
  @Input() version = 0;

  atenciones: Atencion[] = [];
  cargando = false;
  error = '';

  constructor(private pacienteService: PacienteService) {}

  ngOnChanges(): void {
    this.atenciones = [];
    this.error = '';
    if (!this.paciente) return;
    this.cargando = true;
    this.pacienteService.atenciones(this.paciente.pacienteId).subscribe({
      next: (lista) => {
        this.atenciones = lista;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.cargando = false;
      },
    });
  }
}
