import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Cita, Paciente } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { mensajeError } from '../../../core/utils/http-error';
import { HistorialPacienteComponent } from '../../../shared/historial-paciente/historial-paciente.component';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, HistorialPacienteComponent],
  templateUrl: './paciente-detalle.component.html',
})
export class PacienteDetalleComponent implements OnInit {
  paciente: Paciente | null = null;
  citas: Cita[] = [];
  vistaPaciente: boolean;
  puedeGestionar: boolean;
  verHistorial: boolean;
  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private pacienteService: PacienteService
  ) {
    const rol = auth.obtenerRol();
    this.vistaPaciente = !!route.snapshot.data['vistaPaciente'];
    this.puedeGestionar = rol === 'ADMINISTRADOR' || rol === 'RECEPCIONISTA';
    this.verHistorial = rol === 'ADMINISTRADOR' || rol === 'PACIENTE';
  }

  ngOnInit(): void {
    const id = this.vistaPaciente
      ? this.auth.obtenerUsuario()?.pacienteId
      : Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.cargando = false;
      this.error = 'No se encontró el paciente solicitado';
      return;
    }
    this.pacienteService.obtener(id).subscribe({
      next: (p) => {
        this.paciente = p;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.cargando = false;
      },
    });
    this.pacienteService.citas(id).subscribe({
      next: (lista) => (this.citas = lista),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
  }
}
