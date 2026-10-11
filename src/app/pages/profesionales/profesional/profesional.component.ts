import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Profesional } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { abreviaturaDia } from '../../../core/utils/fechas';
import { mensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-profesional',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profesional.component.html',
})
export class ProfesionalComponent implements OnInit {
  profesionales: Profesional[] = [];
  esAdmin: boolean;
  cargando = true;
  error = '';
  mensaje = '';
  abreviaturaDia = abreviaturaDia;

  constructor(
    private profesionalService: ProfesionalService,
    private route: ActivatedRoute,
    auth: AuthService
  ) {
    this.esAdmin = auth.obtenerRol() === 'ADMINISTRADOR';
  }

  ngOnInit(): void {
    const nombre = this.route.snapshot.queryParamMap.get('horarios');
    if (nombre) this.mensaje = `Horarios de ${nombre} actualizados correctamente.`;
    this.profesionalService.listar().subscribe({
      next: (lista) => {
        this.profesionales = lista;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.cargando = false;
      },
    });
  }
}
