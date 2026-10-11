import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Atencion, EstadoSeguimiento, Paciente, Seguimiento, SeguimientoRequest } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { PacienteService } from '../../core/services/paciente.service';
import { SeguimientoService } from '../../core/services/seguimiento.service';
import { hoyISO } from '../../core/utils/fechas';
import { erroresPorCampo, mensajeError } from '../../core/utils/http-error';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguimiento.component.html',
})
export class SeguimientoComponent implements OnInit, OnDestroy {
  seleccion = this.fb.nonNullable.group({ pacienteId: [null as number | null] });
  form = this.fb.nonNullable.group({
    atencionId: [null as number | null, Validators.required],
    fecha: [hoyISO(), Validators.required],
    estado: ['EN_SEGUIMIENTO' as EstadoSeguimiento, Validators.required],
    observaciones: ['', [Validators.required, Validators.maxLength(500)]],
  });
  pacientes: Paciente[] = [];
  seguimientos: Seguimiento[] = [];
  atenciones: Atencion[] = [];
  puedeRegistrar: boolean;
  hoy = hoyISO();
  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';
  erroresCampo: Record<string, string> = {};
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private seguimientoService: SeguimientoService,
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    auth: AuthService
  ) {
    this.puedeRegistrar = auth.obtenerRol() === 'PROFESIONAL';
  }

  ngOnInit(): void {
    this.pacienteService.listar({ size: 100, orden: 'apellidos' }).subscribe({
      next: (p) => {
        this.pacientes = p.contenido;
        const id = this.route.snapshot.queryParamMap.get('pacienteId');
        if (id) this.seleccion.controls.pacienteId.setValue(Number(id));
      },
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
    this.sub = this.seleccion.controls.pacienteId.valueChanges.subscribe(() => {
      this.mensaje = '';
      this.cargar();
    });
  }

  get pacienteId(): number | null {
    return this.seleccion.controls.pacienteId.value;
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && ((c.invalid && (c.touched || c.dirty)) || !!this.erroresCampo[campo]);
  }

  private cargar(): void {
    const id = this.pacienteId;
    this.seguimientos = [];
    this.atenciones = [];
    this.error = '';
    this.form.controls.atencionId.setValue(null);
    if (!id) return;
    this.cargando = true;
    this.seguimientoService.porPaciente(id).subscribe({
      next: (lista) => {
        this.seguimientos = lista;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.cargando = false;
      },
    });
    if (this.puedeRegistrar) {
      this.pacienteService.atenciones(id).subscribe({
        next: (lista) => (this.atenciones = lista),
        error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
      });
    }
  }

  guardar(): void {
    const id = this.pacienteId;
    if (this.form.invalid || this.guardando || !id) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: SeguimientoRequest = {
      atencionId: v.atencionId as number,
      fecha: v.fecha,
      observaciones: v.observaciones.trim(),
      estado: v.estado,
    };
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    this.erroresCampo = {};
    this.seguimientoService.crear(datos).subscribe({
      next: (s) => {
        this.guardando = false;
        this.mensaje = `Seguimiento de la atención ${s.atencionCodigo} registrado correctamente.`;
        this.form.patchValue({ atencionId: null, observaciones: '', estado: 'EN_SEGUIMIENTO', fecha: hoyISO() });
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.seguimientoService.porPaciente(id).subscribe({
          next: (lista) => (this.seguimientos = lista),
          error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
        });
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.erroresCampo = erroresPorCampo(err);
        this.error = err.status === 400 && Object.keys(this.erroresCampo).length > 0 ? 'Revise los datos enviados' : mensajeError(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
