import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Atencion, Catalogo, Cita, EstadoCita, Indicadores, Profesional } from '../../core/models/modelos';
import { CatalogoService } from '../../core/services/catalogo.service';
import { FiltroReporte, ReporteService } from '../../core/services/reporte.service';
import { ProfesionalService } from '../../core/services/profesional.service';
import { Celda, exportarExcel, exportarPdf } from '../../core/utils/exportar';
import { formatoFecha, hoyISO, sumarDiasISO } from '../../core/utils/fechas';
import { mensajeError } from '../../core/utils/http-error';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';

export type Pestana = 'citas' | 'atenciones' | 'indicadores';

const TITULOS: Record<Pestana, string> = {
  citas: 'citas por periodo',
  atenciones: 'atenciones realizadas',
  indicadores: 'indicadores generales',
};

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, KpiCardComponent],
  templateUrl: './reporte.component.html',
})
export class ReporteComponent implements OnInit, OnDestroy {
  filtros = this.fb.nonNullable.group({
    desde: [sumarDiasISO(hoyISO(), -30), Validators.required],
    hasta: [hoyISO(), Validators.required],
    profesionalId: [''],
    servicioId: [''],
    estado: [''],
  });
  tab: Pestana = 'atenciones';
  profesionales: Profesional[] = [];
  servicios: Catalogo[] = [];
  citas: Cita[] = [];
  atenciones: Atencion[] = [];
  indicadores: Indicadores | null = null;
  rango = { desde: '', hasta: '' };
  cargando = false;
  error = '';
  formatoFecha = formatoFecha;
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService,
    private profesionalService: ProfesionalService,
    private catalogoService: CatalogoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profesionalService.listar().subscribe({
      next: (lista) => (this.profesionales = lista),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
    this.catalogoService.servicios().subscribe({
      next: (lista) => (this.servicios = lista),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
    this.sub = this.route.queryParamMap.subscribe((q) => {
      const tab = q.get('tab');
      this.tab = tab === 'citas' || tab === 'indicadores' ? tab : 'atenciones';
      this.consultar();
    });
  }

  cambiarTab(tab: Pestana): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, queryParamsHandling: 'merge' });
  }

  get titulo(): string {
    return TITULOS[this.tab];
  }

  get totalRegistros(): number {
    return this.tab === 'citas' ? this.citas.length : this.atenciones.length;
  }

  get citasCanceladas(): number {
    return this.indicadores?.citasPorEstado.find((c) => c.etiqueta === 'CANCELADA')?.cantidad ?? 0;
  }

  get puedeExportar(): boolean {
    if (this.cargando) return false;
    if (this.tab === 'indicadores') return this.indicadores !== null;
    return this.totalRegistros > 0;
  }

  consultar(): void {
    if (this.filtros.invalid) {
      this.filtros.markAllAsTouched();
      return;
    }
    const f = this.filtros.getRawValue();
    const filtro: FiltroReporte = {
      desde: f.desde,
      hasta: f.hasta,
      profesionalId: f.profesionalId ? Number(f.profesionalId) : null,
      servicioId: f.servicioId ? Number(f.servicioId) : null,
      estado: f.estado as '' | EstadoCita,
    };
    this.rango = { desde: f.desde, hasta: f.hasta };
    this.cargando = true;
    this.error = '';
    const fallo = (err: HttpErrorResponse) => {
      this.error = mensajeError(err);
      this.cargando = false;
    };
    if (this.tab === 'citas') {
      this.reporteService.citas(filtro).subscribe({
        next: (lista) => {
          this.citas = lista;
          this.cargando = false;
        },
        error: fallo,
      });
    } else if (this.tab === 'atenciones') {
      this.reporteService.atenciones(filtro).subscribe({
        next: (lista) => {
          this.atenciones = lista;
          this.cargando = false;
        },
        error: fallo,
      });
    } else {
      this.reporteService.indicadores({ desde: f.desde, hasta: f.hasta }).subscribe({
        next: (i) => {
          this.indicadores = i;
          this.cargando = false;
        },
        error: fallo,
      });
    }
  }

  async descargarExcel(): Promise<void> {
    const nombre = `reporte_${this.tab}_${this.rango.desde}_${this.rango.hasta}`;
    try {
      if (this.tab === 'atenciones') {
        const filas: Celda[][] = this.atenciones.map((a) => [
          a.codigo, formatoFecha(a.fecha), a.paciente, a.profesional, a.servicio ?? '—',
        ]);
        await exportarExcel(nombre, ['N.°', 'Fecha', 'Paciente', 'Profesional', 'Servicio'], filas);
      } else if (this.tab === 'citas') {
        const filas: Celda[][] = this.citas.map((c) => [
          c.codigo, formatoFecha(c.fecha), c.hora, c.paciente, c.profesional, c.servicio, c.estado,
        ]);
        await exportarExcel(nombre, ['Código', 'Fecha', 'Hora', 'Paciente', 'Profesional', 'Servicio', 'Estado'], filas);
      } else if (this.indicadores) {
        const filas: Celda[][] = [
          ...this.indicadores.citasPorEstado.map((c): Celda[] => ['Citas por estado', c.etiqueta, c.cantidad]),
          ...this.indicadores.atencionesPorServicio.map((c): Celda[] => ['Atenciones por servicio', c.etiqueta, c.cantidad]),
        ];
        await exportarExcel(nombre, ['Tabla', 'Concepto', 'Cantidad'], filas);
      }
    } catch {
      this.error = 'No se pudo generar el archivo Excel';
    }
  }

  descargarPdf(): void {
    exportarPdf();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
