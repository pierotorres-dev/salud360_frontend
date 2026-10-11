import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Paciente, Rol, Usuario, UsuarioRequest } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { PacienteService } from '../../core/services/paciente.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { erroresPorCampo, mensajeError } from '../../core/utils/http-error';

type RolNuevo = Exclude<Rol, 'PROFESIONAL'>;

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
})
export class UsuarioComponent implements OnInit, OnDestroy {
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(60)]],
    rol: ['' as '' | RolNuevo, Validators.required],
    pacienteId: [null as number | null],
  });
  usuarios: Usuario[] = [];
  pacientesSinCuenta: Paciente[] = [];
  usuarioActualId: number | undefined;
  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';
  erroresCampo: Record<string, string> = {};
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private pacienteService: PacienteService,
    auth: AuthService
  ) {
    this.usuarioActualId = auth.obtenerUsuario()?.usuarioId;
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPacientes();
    this.sub = this.form.controls.rol.valueChanges.subscribe((rol) => {
      const paciente = this.form.controls.pacienteId;
      paciente.setValidators(rol === 'PACIENTE' ? Validators.required : null);
      paciente.setValue(null);
      paciente.updateValueAndValidity();
    });
  }

  get esPaciente(): boolean {
    return this.form.controls.rol.value === 'PACIENTE';
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && ((c.invalid && (c.touched || c.dirty)) || !!this.erroresCampo[campo]);
  }

  private cargarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (lista) => {
        this.usuarios = lista;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = mensajeError(err);
        this.cargando = false;
      },
    });
  }

  private cargarPacientes(): void {
    this.pacienteService.listarActivos().subscribe({
      next: (p) => (this.pacientesSinCuenta = p.contenido.filter((x) => !x.tieneUsuario)),
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos: UsuarioRequest = {
      nombre: v.nombre.trim(),
      correo: v.correo.trim(),
      contrasena: v.contrasena,
      rol: v.rol as RolNuevo,
      pacienteId: v.rol === 'PACIENTE' ? v.pacienteId : null,
    };
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    this.erroresCampo = {};
    this.usuarioService.crear(datos).subscribe({
      next: (u) => {
        this.guardando = false;
        this.mensaje = `Usuario ${u.nombre} creado correctamente.`;
        this.form.reset();
        this.cargarUsuarios();
        this.cargarPacientes();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.erroresCampo = erroresPorCampo(err);
        const mensaje = mensajeError(err);
        if (err.status === 409 && mensaje.includes('correo')) this.erroresCampo['correo'] = mensaje;
        this.error = err.status === 400 && Object.keys(this.erroresCampo).length > 0 ? 'Revise los datos enviados' : mensaje;
      },
    });
  }

  cambiarEstado(u: Usuario): void {
    this.error = '';
    this.mensaje = '';
    this.usuarioService.cambiarEstado(u.usuarioId, !u.activo).subscribe({
      next: (actualizado) => {
        this.mensaje = `Usuario ${actualizado.nombre} ${actualizado.activo ? 'activado' : 'desactivado'} correctamente.`;
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => (this.error = mensajeError(err)),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
