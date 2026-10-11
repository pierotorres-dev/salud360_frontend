import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Catalogo, ProfesionalRequest } from '../../../core/models/modelos';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { erroresPorCampo, mensajeError } from '../../../core/utils/http-error';

@Component({
  selector: 'app-profesional-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profesional-form.component.html',
})
export class ProfesionalFormComponent implements OnInit {
  form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(80)]],
    apellidos: ['', [Validators.required, Validators.maxLength(80)]],
    especialidadId: [null as number | null, Validators.required],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    telefono: ['', Validators.maxLength(15)],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(60)]],
  });
  especialidades: Catalogo[] = [];
  guardando = false;
  error = '';
  erroresCampo: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private profesionalService: ProfesionalService,
    private catalogoService: CatalogoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catalogoService.especialidades().subscribe({
      next: (lista) => (this.especialidades = lista),
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
    const datos: ProfesionalRequest = {
      nombres: v.nombres,
      apellidos: v.apellidos,
      especialidadId: v.especialidadId as number,
      correo: v.correo,
      telefono: v.telefono || null,
      contrasena: v.contrasena,
    };
    this.guardando = true;
    this.error = '';
    this.erroresCampo = {};
    this.profesionalService.crear(datos).subscribe({
      next: (p) =>
        this.router.navigate(['/profesionales', p.profesionalId, 'horarios'], { queryParams: { registrado: 1 } }),
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.erroresCampo = erroresPorCampo(err);
        if (err.status === 409) {
          this.error = `Error 409 · ${mensajeError(err)}. No se registró el profesional.`;
          this.erroresCampo['correo'] = 'El correo ya está registrado.';
        } else {
          this.error = err.status === 400 ? 'Revise los datos enviados' : mensajeError(err);
        }
      },
    });
  }
}
