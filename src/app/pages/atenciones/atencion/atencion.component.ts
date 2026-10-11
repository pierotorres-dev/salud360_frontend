import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Atencion, Pagina } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { AtencionService } from '../../../core/services/atencion.service';
import { mensajeError } from '../../../core/utils/http-error';
import { PaginacionComponent } from '../../../shared/paginacion/paginacion.component';

@Component({
  selector: 'app-atencion',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginacionComponent],
  templateUrl: './atencion.component.html',
})
export class AtencionComponent implements OnInit {
  pagina: Pagina<Atencion> | null = null;
  numeroPagina = 0;
  esProfesional: boolean;
  cargando = false;
  error = '';
  mensaje = '';

  constructor(
    private atencionService: AtencionService,
    private route: ActivatedRoute,
    auth: AuthService
  ) {
    this.esProfesional = auth.obtenerRol() === 'PROFESIONAL';
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const codigo = q.get('registrada');
    if (codigo) {
      const cita = q.get('cita');
      this.mensaje = `Atención ${codigo} registrada correctamente.` + (cita ? ` La cita ${cita} pasó a ATENDIDA.` : '');
    }
    this.listar();
  }

  listar(): void {
    this.cargando = true;
    this.error = '';
    this.atencionService.listar(this.numeroPagina).subscribe({
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
}
