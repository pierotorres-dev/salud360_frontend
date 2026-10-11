import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { erroresPorCampo, mensajeError } from '../../core/utils/http-error';

const CORREO_RECORDADO = 'correoRecordado';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
    recordarme: [false],
  });
  cargando = false;
  error = '';
  info = '';
  erroresCampo: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.auth.estaAutenticado()) {
      this.router.navigateByUrl(this.auth.rutaInicio());
      return;
    }
    const recordado = localStorage.getItem(CORREO_RECORDADO);
    if (recordado) {
      this.form.patchValue({ correo: recordado, recordarme: true });
    }
    if (this.route.snapshot.queryParamMap.get('sesion') === 'expirada') {
      this.info = 'Su sesión expiró. Ingrese nuevamente.';
    }
  }

  invalido(campo: 'correo' | 'contrasena'): boolean {
    const c = this.form.controls[campo];
    return (c.invalid && c.touched) || !!this.erroresCampo[campo];
  }

  olvido(): void {
    this.info = 'Comuníquese con el administrador del sistema para restablecer su contraseña.';
  }

  ingresar(): void {
    if (this.form.invalid || this.cargando) {
      this.form.markAllAsTouched();
      return;
    }
    const { correo, contrasena, recordarme } = this.form.getRawValue();
    this.cargando = true;
    this.error = '';
    this.erroresCampo = {};
    this.auth.login({ correo, contrasena }).subscribe({
      next: () => {
        if (recordarme) localStorage.setItem(CORREO_RECORDADO, correo);
        else localStorage.removeItem(CORREO_RECORDADO);
        this.router.navigateByUrl(this.auth.rutaInicio());
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.erroresCampo = erroresPorCampo(err);
        this.error = err.status === 401 ? (err.error?.message ?? 'Credenciales incorrectas') : mensajeError(err);
      },
    });
  }
}
