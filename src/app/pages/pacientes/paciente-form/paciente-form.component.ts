import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EstadoRegistro, PacienteRequest } from '../../../core/models/modelos';
import { PacienteService } from '../../../core/services/paciente.service';
import { erroresPorCampo, mensajeError } from '../../../core/utils/http-error';
import { hoyISO } from '../../../core/utils/fechas';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './paciente-form.component.html',
})
export class PacienteFormComponent implements OnInit {
  form = this.fb.nonNullable.group({
    documento: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.maxLength(80)]],
    apellidos: ['', [Validators.required, Validators.maxLength(80)]],
    fechaNacimiento: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.maxLength(15)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    direccion: ['', Validators.maxLength(150)],
    estado: ['ACTIVO' as EstadoRegistro],
  });
  id: number | null = null;
  estadoOriginal: EstadoRegistro = 'ACTIVO';
  hoy = hoyISO();
  guardando = false;
  error = '';
  erroresCampo: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.form.controls.estado.disable();
      return;
    }
    this.id = Number(id);
    this.pacienteService.obtener(this.id).subscribe({
      next: (p) => {
        this.estadoOriginal = p.estado;
        this.form.patchValue({ ...p, direccion: p.direccion ?? '' });
      },
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
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
    const datos: PacienteRequest = {
      documento: v.documento,
      nombres: v.nombres,
      apellidos: v.apellidos,
      fechaNacimiento: v.fechaNacimiento,
      telefono: v.telefono,
      correo: v.correo,
      direccion: v.direccion || null,
    };
    this.guardando = true;
    this.error = '';
    this.erroresCampo = {};
    const peticion = this.id ? this.pacienteService.actualizar(this.id, datos) : this.pacienteService.crear(datos);
    peticion.subscribe({
      next: (p) => {
        if (this.id && v.estado !== this.estadoOriginal) {
          this.pacienteService.cambiarEstado(p.pacienteId, v.estado).subscribe({
            next: () => this.volver(p.nombreCompleto),
            error: (err: HttpErrorResponse) => this.mostrarError(err),
          });
        } else {
          this.volver(p.nombreCompleto);
        }
      },
      error: (err: HttpErrorResponse) => this.mostrarError(err),
    });
  }

  private mostrarError(err: HttpErrorResponse): void {
    this.guardando = false;
    this.erroresCampo = erroresPorCampo(err);
    if (err.status === 409) {
      this.error = `Error 409 · ${mensajeError(err)}. No se ${this.id ? 'actualizó' : 'creó'} el paciente.`;
      this.erroresCampo['documento'] = 'El documento ya existe en el sistema.';
    } else {
      this.error = err.status === 400 ? 'Revise los datos enviados' : mensajeError(err);
    }
  }

  private volver(nombre: string): void {
    this.router.navigate(['/pacientes'], { queryParams: { guardado: nombre } });
  }
}
