import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AtencionRequest, EstadoSeguimiento, Paciente } from '../../../core/models/modelos';
import { AtencionService } from '../../../core/services/atencion.service';
import { AuthService } from '../../../core/services/auth.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { hoyISO } from '../../../core/utils/fechas';
import { erroresPorCampo, mensajeError } from '../../../core/utils/http-error';
import { HistorialPacienteComponent } from '../../../shared/historial-paciente/historial-paciente.component';

@Component({
  selector: 'app-atencion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HistorialPacienteComponent],
  templateUrl: './atencion-form.component.html',
})
export class AtencionFormComponent implements OnInit, OnDestroy {
  form = this.fb.nonNullable.group({
    pacienteId: [null as number | null, Validators.required],
    fecha: [hoyISO(), Validators.required],
    estadoSeguimiento: ['EN_SEGUIMIENTO' as '' | EstadoSeguimiento],
    motivo: ['', [Validators.required, Validators.maxLength(200)]],
    observaciones: ['', Validators.maxLength(500)],
  });
  pacientes: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  profesionalSesion: string;
  hoy = hoyISO();
  guardando = false;
  error = '';
  erroresCampo: Record<string, string> = {};
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private atencionService: AtencionService,
    private pacienteService: PacienteService,
    private router: Router,
    auth: AuthService
  ) {
    this.profesionalSesion = `${auth.obtenerUsuario()?.nombre ?? ''} (sesión)`;
  }

  ngOnInit(): void {
    this.pacienteService.listarActivos().subscribe({
      next: (p) => (this.pacientes = p.contenido),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
    this.sub = this.form.controls.pacienteId.valueChanges.subscribe((id) => {
      this.pacienteSeleccionado = this.pacientes.find((p) => p.pacienteId === id) ?? null;
    });
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && ((c.invalid && (c.touched || c.dirty)) || !!this.erroresCampo[campo]);
  }

  guardar(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: AtencionRequest = {
      pacienteId: v.pacienteId as number,
      fecha: v.fecha,
      motivo: v.motivo.trim(),
      observaciones: v.observaciones.trim() || null,
      estadoSeguimiento: v.estadoSeguimiento || null,
    };
    this.guardando = true;
    this.error = '';
    this.erroresCampo = {};
    this.atencionService.crear(datos).subscribe({
      next: (a) => {
        const queryParams: Record<string, string> = { registrada: a.codigo };
        if (a.citaCodigo) queryParams['cita'] = a.citaCodigo;
        this.router.navigate(['/atenciones'], { queryParams });
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.erroresCampo = erroresPorCampo(err);
        this.error = err.status === 400 ? 'Revise los datos enviados' : mensajeError(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
