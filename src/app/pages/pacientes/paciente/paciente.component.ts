import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, debounceTime } from 'rxjs';
import { Paciente, Pagina } from '../../../core/models/modelos';
import { PacienteService } from '../../../core/services/paciente.service';
import { mensajeError } from '../../../core/utils/http-error';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PaginacionComponent],
  templateUrl: './paciente.component.html',
})
export class PacienteComponent implements OnInit, OnDestroy {
  filtros = this.fb.nonNullable.group({
    buscar: [''],
    estado: [''],
    orden: ['apellidos'],
  });
  pagina: Pagina<Paciente> | null = null;
  numeroPagina = 0;
  cargando = false;
  error = '';
  mensaje = '';
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const guardado = this.route.snapshot.queryParamMap.get('guardado');
    if (guardado) this.mensaje = `Paciente ${guardado} guardado correctamente.`;
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
    this.pacienteService
      .listar({
        buscar: f.buscar,
        estado: f.estado as '' | 'ACTIVO' | 'INACTIVO',
        orden: f.orden as 'apellidos' | 'documento' | 'recientes',
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

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
