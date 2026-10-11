import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Horario, Profesional } from '../../../core/models/modelos';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { DIAS_SEMANA, opcionesHora } from '../../../core/utils/fechas';
import { mensajeError } from '../../../core/utils/http-error';

const HORA_INICIO_DEFECTO = '08:00';
const HORA_FIN_DEFECTO = '14:00';

function rangoValido(fila: AbstractControl): ValidationErrors | null {
  const atiende = fila.get('atiende')?.value as boolean;
  const inicio = fila.get('horaInicio')?.value as string;
  const fin = fila.get('horaFin')?.value as string;
  return atiende && inicio >= fin ? { rango: true } : null;
}

@Component({
  selector: 'app-horario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './horario-form.component.html',
})
export class HorarioFormComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  dias = DIAS_SEMANA;
  horas = opcionesHora();
  filas = this.fb.array(this.dias.map(() => this.crearFila()));
  form = this.fb.group({ filas: this.filas });
  profesional: Profesional | null = null;
  id = 0;
  guardando = false;
  cargando = true;
  error = '';
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private profesionalService: ProfesionalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.route.snapshot.queryParamMap.get('registrado')) {
      this.mensaje = 'Profesional registrado. Defina sus horarios de atención.';
    }
    this.profesionalService.obtener(this.id).subscribe({
      next: (p) => {
        this.profesional = p;
        this.cargarHorarios(p.horarios);
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.cargando = false;
      },
    });
  }

  private crearFila() {
    const fila = this.fb.nonNullable.group(
      {
        atiende: false,
        horaInicio: { value: HORA_INICIO_DEFECTO, disabled: true },
        horaFin: { value: HORA_FIN_DEFECTO, disabled: true },
      },
      { validators: rangoValido }
    );
    this.subs.add(
      fila.controls.atiende.valueChanges.subscribe((atiende) => {
        const accion = atiende ? 'enable' : 'disable';
        fila.controls.horaInicio[accion]({ emitEvent: false });
        fila.controls.horaFin[accion]({ emitEvent: false });
        fila.updateValueAndValidity();
      })
    );
    return fila;
  }

  private cargarHorarios(horarios: Horario[]): void {
    this.dias.forEach((dia, i) => {
      const h = horarios.find((x) => x.diaSemana === dia.valor);
      if (h) {
        this.filas.at(i).patchValue({ atiende: true, horaInicio: h.horaInicio, horaFin: h.horaFin });
      }
    });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando || !this.profesional) {
      this.form.markAllAsTouched();
      return;
    }
    const horarios: Horario[] = this.filas.controls
      .map((fila, i) => ({ fila: fila.getRawValue(), dia: this.dias[i].valor }))
      .filter((x) => x.fila.atiende)
      .map((x) => ({ diaSemana: x.dia, horaInicio: x.fila.horaInicio, horaFin: x.fila.horaFin }));
    this.guardando = true;
    this.error = '';
    this.profesionalService.actualizarHorarios(this.id, horarios).subscribe({
      next: (p) => this.router.navigate(['/profesionales'], { queryParams: { horarios: p.nombreCompleto } }),
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.error = mensajeError(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
