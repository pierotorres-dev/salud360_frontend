import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, debounceTime } from 'rxjs';
import { Cita, EstadoCita, Pagina, Profesional } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { mensajeError } from '../../../core/utils/http-error';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PaginacionComponent],
  templateUrl: './cita.component.html',
})
export class CitaComponent implements OnInit, OnDestroy {
  filtros = this.fb.nonNullable.group({
    fecha: [''],
    estado: [''],
    profesionalId: [''],
  });
  pagina: Pagina<Cita> | null = null;
  numeroPagina = 0;
  profesionales: Profesional[] = [];
  gestiona: boolean;
  cargando = false;
  error = '';
  mensaje = '';
  registrada = '';
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private profesionalService: ProfesionalService,
    private route: ActivatedRoute,
    auth: AuthService
  ) {
    const rol = auth.obtenerRol();
    this.gestiona = rol === 'ADMINISTRADOR' || rol === 'RECEPCIONISTA';
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.registrada = q.get('registrada') ?? '';
    if (this.registrada) {
      this.mensaje = `Cita ${this.registrada} registrada correctamente (HTTP 201 Created). El profesional está disponible en el horario elegido.`;
    }
    const reprogramada = q.get('reprogramada');
    if (reprogramada) this.mensaje = `Cita ${reprogramada} reprogramada correctamente.`;

    if (this.gestiona) {
      this.profesionalService.listar().subscribe({
        next: (lista) => (this.profesionales = lista),
        error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
      });
    }
    this.listar();
    this.sub = this.filtros.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.numeroPagina = 0;
      this.listar();
    });
  }

  listar(): void {
    const f = this.filtros.getRawValue();
    this.cargando = true;
    this.error = '';
    this.citaService
      .listar({
        fecha: f.fecha,
        estado: f.estado as '' | EstadoCita,
        profesionalId: f.profesionalId ? Number(f.profesionalId) : null,
        page: this.numeroPagina,
        size: 6,
      })
      .subscribe({
        next: (p) => {
          this.pagina = p;
          this.cargando = false;
        },
        error: (err: HttpErrorResponse) => {
          this.error = mensajeError(err);
          this.cargando = false;
        },
      });
  }

  irA(p: number): void {
    this.numeroPagina = p;
    this.listar();
  }

  puedeConfirmar(c: Cita): boolean {
    return c.estado === 'PROGRAMADA';
  }

  esPendiente(c: Cita): boolean {
    return c.estado === 'PROGRAMADA' || c.estado === 'CONFIRMADA';
  }

  confirmar(c: Cita): void {
    this.cambiarEstado(c, 'CONFIRMADA', `Cita ${c.codigo} confirmada correctamente.`);
  }

  cancelar(c: Cita): void {
    if (!confirm(`¿Cancelar la cita ${c.codigo}?`)) return;
    this.cambiarEstado(c, 'CANCELADA', `Cita ${c.codigo} cancelada correctamente.`);
  }

  private cambiarEstado(c: Cita, estado: 'CONFIRMADA' | 'CANCELADA', exito: string): void {
    this.error = '';
    this.mensaje = '';
    this.registrada = '';
    this.citaService.cambiarEstado(c.citaId, estado).subscribe({
      next: () => {
        this.mensaje = exito;
        this.listar();
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.listar();
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
