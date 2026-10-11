import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, Subject, Subscription, catchError, merge, of, switchMap } from 'rxjs';
import { Catalogo, Cita, CitaRequest, Disponibilidad, Paciente, Profesional, Slot } from '../../../core/models/modelos';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { CitaService } from '../../../core/services/cita.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { hoyISO } from '../../../core/utils/fechas';
import { erroresPorCampo, mensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cita-form.component.html',
})
export class CitaFormComponent implements OnInit, OnDestroy {
  form = this.fb.nonNullable.group({
    pacienteId: [null as number | null, Validators.required],
    servicioId: [null as number | null, Validators.required],
    profesionalId: [null as number | null, Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.maxLength(200)]],
  });
  id: number | null = null;
  citaActual: Cita | null = null;
  hoy = hoyISO();
  pacientes: Paciente[] = [];
  servicios: Catalogo[] = [];
  profesionales: Profesional[] = [];
  disponibilidad: Disponibilidad | null = null;
  cargandoDisponibilidad = false;
  errorDisponibilidad = '';
  guardando = false;
  error = '';
  erroresCampo: Record<string, string> = {};
  private recargar$ = new Subject<void>();
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private profesionalService: ProfesionalService,
    private catalogoService: CatalogoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pacienteService.listarActivos().subscribe({
      next: (p) => (this.pacientes = p.contenido),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
    this.catalogoService.servicios().subscribe({
      next: (lista) => (this.servicios = lista),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
    this.profesionalService.listar().subscribe({
      next: (lista) => (this.profesionales = lista.filter((p) => p.activo)),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });

    this.subs.add(this.recargar$.pipe(switchMap(() => this.pedirDisponibilidad())).subscribe((d) => this.mostrar(d)));
    this.subs.add(
      merge(this.form.controls.profesionalId.valueChanges, this.form.controls.fecha.valueChanges).subscribe(() =>
        this.recargar$.next()
      )
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = Number(id);
      this.citaService.obtener(this.id).subscribe({
        next: (c) => {
          this.citaActual = c;
          this.form.patchValue({
            pacienteId: c.pacienteId,
            servicioId: c.servicioId,
            profesionalId: c.profesionalId,
            fecha: c.fecha,
            hora: c.hora,
            motivo: c.motivo,
          });
        },
        error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
      });
    } else {
      const pacienteId = this.route.snapshot.queryParamMap.get('pacienteId');
      if (pacienteId) this.form.patchValue({ pacienteId: Number(pacienteId) });
    }
  }

  get horasOfrecidas(): Slot[] {
    return (this.disponibilidad?.slots ?? []).filter((s) => s.estado !== 'PASADO');
  }

  etiquetaHora(s: Slot): string {
    if (s.estado !== 'OCUPADO') return s.hora;
    return s.citaCodigo === this.citaActual?.codigo ? `${s.hora} (cita actual)` : `${s.hora} (ocupado)`;
  }

  elegir(s: Slot): void {
    if (s.estado !== 'LIBRE') return;
    this.form.controls.hora.setValue(s.hora);
    this.form.controls.hora.markAsDirty();
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
    const datos: CitaRequest = {
      pacienteId: v.pacienteId as number,
      profesionalId: v.profesionalId as number,
      servicioId: v.servicioId as number,
      fecha: v.fecha,
      hora: v.hora,
      motivo: v.motivo.trim(),
    };
    this.guardando = true;
    this.error = '';
    this.erroresCampo = {};
    const peticion = this.id ? this.citaService.reprogramar(this.id, datos) : this.citaService.crear(datos);
    peticion.subscribe({
      next: (c) =>
        this.router.navigate(['/citas'], { queryParams: this.id ? { reprogramada: c.codigo } : { registrada: c.codigo } }),
      error: (err: HttpErrorResponse) => this.mostrarError(err),
    });
  }

  private pedirDisponibilidad(): Observable<Disponibilidad | null> {
    const { profesionalId, fecha } = this.form.getRawValue();
    this.errorDisponibilidad = '';
    if (!profesionalId || !fecha) {
      this.cargandoDisponibilidad = false;
      return of(null);
    }
    this.cargandoDisponibilidad = true;
    return this.profesionalService.disponibilidad(profesionalId, fecha).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorDisponibilidad = mensajeError(err);
        return of(null);
      })
    );
  }

  private mostrar(d: Disponibilidad | null): void {
    this.cargandoDisponibilidad = false;
    this.disponibilidad = d;
    const hora = this.form.controls.hora.value;
    if (hora && !this.horasOfrecidas.some((s) => s.hora === hora)) {
      this.form.controls.hora.setValue('');
    }
  }

  private mostrarError(err: HttpErrorResponse): void {
    this.guardando = false;
    this.erroresCampo = erroresPorCampo(err);
    const mensaje = mensajeError(err);
    if (err.status === 409) {
      const conflictoHorario = mensaje.includes('horario seleccionado') || mensaje.includes('fecha y hora seleccionadas');
      this.error = `Error 409 · ${mensaje}.${conflictoHorario ? ' Seleccione otro horario.' : ''}`;
      if (conflictoHorario) this.erroresCampo['hora'] = mensaje;
      this.recargar$.next();
    } else if (err.status === 400) {
      this.error = Object.keys(this.erroresCampo).length > 0 ? 'Revise los datos enviados' : mensaje;
    } else {
      this.error = mensaje;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
