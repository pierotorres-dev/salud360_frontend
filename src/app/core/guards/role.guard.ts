import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models/modelos';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: Rol[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.obtenerRol();
  if (auth.estaAutenticado() && rol !== null && roles.includes(rol)) {
    return true;
  }
  return router.createUrlTree([auth.rutaInicio()], { queryParams: { acceso: 'denegado' } });
};

export const inicioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return inject(Router).createUrlTree([auth.rutaInicio()]);
};
