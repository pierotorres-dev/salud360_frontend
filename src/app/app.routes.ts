import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { inicioGuard, roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PacienteComponent } from './pages/pacientes/paciente/paciente.component';
import { PacienteFormComponent } from './pages/pacientes/paciente-form/paciente-form.component';
import { PacienteDetalleComponent } from './pages/pacientes/paciente-detalle/paciente-detalle.component';
import { ProfesionalComponent } from './pages/profesionales/profesional/profesional.component';
import { ProfesionalFormComponent } from './pages/profesionales/profesional-form/profesional-form.component';
import { HorarioFormComponent } from './pages/profesionales/horario-form/horario-form.component';
import { CitaComponent } from './pages/citas/cita/cita.component';
import { CitaFormComponent } from './pages/citas/cita-form/cita-form.component';
import { AtencionComponent } from './pages/atenciones/atencion/atencion.component';
import { AtencionFormComponent } from './pages/atenciones/atencion-form/atencion-form.component';
import { SeguimientoComponent } from './pages/seguimiento/seguimiento.component';
import { ReporteComponent } from './pages/reportes/reporte.component';
import { UsuarioComponent } from './pages/usuarios/usuario.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [inicioGuard], children: [] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA', 'PROFESIONAL'])], data: { migas: ['Dashboard'] } },

      { path: 'pacientes', component: PacienteComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Pacientes'] } },
      { path: 'pacientes/nuevo', component: PacienteFormComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Pacientes', 'Registrar paciente'] } },
      { path: 'pacientes/:id', component: PacienteDetalleComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Pacientes', 'Detalle del paciente'] } },
      { path: 'pacientes/:id/editar', component: PacienteFormComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Pacientes', 'Editar paciente'] } },

      { path: 'profesionales', component: ProfesionalComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Profesionales'] } },
      { path: 'profesionales/nuevo', component: ProfesionalFormComponent, canActivate: [roleGuard(['ADMINISTRADOR'])], data: { migas: ['Profesionales', 'Registrar profesional'] } },
      { path: 'profesionales/:id/horarios', component: HorarioFormComponent, canActivate: [roleGuard(['ADMINISTRADOR'])], data: { migas: ['Profesionales', 'Horarios de atención'] } },

      { path: 'citas', component: CitaComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA', 'PROFESIONAL'])], data: { migas: ['Citas'] } },
      { path: 'citas/nueva', component: CitaFormComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Citas', 'Nueva cita'] } },
      { path: 'citas/:id/editar', component: CitaFormComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'RECEPCIONISTA'])], data: { migas: ['Citas', 'Reprogramar cita'] } },

      { path: 'atenciones', component: AtencionComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESIONAL'])], data: { migas: ['Atenciones'] } },
      { path: 'atenciones/nueva', component: AtencionFormComponent, canActivate: [roleGuard(['PROFESIONAL'])], data: { migas: ['Atenciones', 'Registrar atención'] } },

      { path: 'seguimiento', component: SeguimientoComponent, canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESIONAL'])], data: { migas: ['Seguimiento'] } },
      { path: 'reportes', component: ReporteComponent, canActivate: [roleGuard(['ADMINISTRADOR'])], data: { migas: ['Reportes'] } },
      { path: 'usuarios', component: UsuarioComponent, canActivate: [roleGuard(['ADMINISTRADOR'])], data: { migas: ['Usuarios'] } },

      { path: 'mi-informacion', component: PacienteDetalleComponent, canActivate: [roleGuard(['PACIENTE'])], data: { migas: ['Mi información'], vistaPaciente: true } },
    ],
  },
  { path: '**', redirectTo: '' },
];
