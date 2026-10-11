import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from '../models/modelos';

export function mensajeError(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo conectar con el servidor';
  if (err.status === 403) return 'Acceso restringido para su rol';
  const api = err.error as ErrorApi | null;
  if (api && typeof api === 'object' && api.message) return api.message;
  return 'Ocurrió un error inesperado';
}

export function erroresPorCampo(err: HttpErrorResponse): Record<string, string> {
  const api = err.error as ErrorApi | null;
  return err.status === 400 && api?.errors ? api.errors : {};
}
