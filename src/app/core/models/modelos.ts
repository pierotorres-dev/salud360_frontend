export type Rol = 'ADMINISTRADOR' | 'RECEPCIONISTA' | 'PROFESIONAL' | 'PACIENTE';
export type EstadoRegistro = 'ACTIVO' | 'INACTIVO';
export type EstadoCita = 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';
export type EstadoSeguimiento = 'EN_SEGUIMIENTO' | 'FINALIZADO';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export interface LoginRequest { correo: string; contrasena: string; }

export interface UsuarioSesion {
  usuarioId: number;
  nombre: string;
  correo: string;
  rol: { rolId: number; nombreRol: Rol };
  pacienteId: number | null;
  profesionalId: number | null;
}

export interface LoginResponse {
  token: string;
  tipo: 'Bearer';
  expiraEn: number;
  usuario: UsuarioSesion;
}

export interface Pagina<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface ErrorApi {
  status: number;
  error: string;
  message: string;
  errors?: Record<string, string>;
  timestamp?: string;
}

export interface Paciente {
  pacienteId: number;
  documento: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  direccion: string | null;
  estado: EstadoRegistro;
  tieneUsuario: boolean;
}

export interface PacienteRequest {
  documento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  direccion: string | null;
}

export interface Horario { horarioId?: number; diaSemana: DiaSemana; horaInicio: string; horaFin: string; }

export interface Profesional {
  profesionalId: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  especialidadId: number;
  especialidad: string;
  correo: string;
  telefono: string | null;
  activo: boolean;
  horarios: Horario[];
}

export interface ProfesionalRequest {
  nombres: string;
  apellidos: string;
  especialidadId: number;
  correo: string;
  telefono: string | null;
  contrasena: string;
}

export interface Slot { hora: string; estado: 'LIBRE' | 'OCUPADO' | 'PASADO'; citaCodigo: string | null; }

export interface Disponibilidad {
  profesionalId: number;
  profesional: string;
  especialidad: string;
  fecha: string;
  diaSemana: DiaSemana;
  horaInicio: string | null;
  horaFin: string | null;
  slots: Slot[];
}

export interface Catalogo { id: number; nombre: string; }

export interface Cita {
  citaId: number;
  codigo: string;
  pacienteId: number;
  paciente: string;
  pacienteDocumento: string;
  profesionalId: number;
  profesional: string;
  servicioId: number;
  servicio: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: EstadoCita;
}

export interface CitaRequest {
  pacienteId: number;
  profesionalId: number;
  servicioId: number;
  fecha: string;
  hora: string;
  motivo: string;
}

export interface Atencion {
  atencionId: number;
  codigo: string;
  pacienteId: number;
  paciente: string;
  pacienteDocumento: string;
  profesionalId: number;
  profesional: string;
  citaId: number | null;
  citaCodigo: string | null;
  servicio: string | null;
  fecha: string;
  motivo: string;
  observaciones: string | null;
}

export interface AtencionRequest {
  pacienteId: number;
  fecha: string;
  motivo: string;
  observaciones: string | null;
  estadoSeguimiento: EstadoSeguimiento | null;
}

export interface Seguimiento {
  seguimientoId: number;
  pacienteId: number;
  atencionId: number;
  atencionCodigo: string;
  atencionMotivo: string;
  profesional: string;
  fecha: string;
  observaciones: string;
  estado: EstadoSeguimiento;
}

export interface SeguimientoRequest {
  atencionId: number;
  fecha: string;
  observaciones: string;
  estado: EstadoSeguimiento;
}

export interface Conteo { etiqueta: string; cantidad: number; }

export interface DashboardResumen {
  pacientesRegistrados: number;
  citasProgramadas: number;
  atencionesRealizadas: number;
  profesionalesActivos: number;
  ultimasCitas: Cita[];
  atencionesPorServicio: Conteo[];
  citasPorDia: Conteo[];
}

export interface Indicadores {
  desde: string;
  hasta: string;
  totalCitas: number;
  citasPorEstado: Conteo[];
  totalAtenciones: number;
  pacientesAtendidos: number;
  atencionesPorServicio: Conteo[];
}

export interface Usuario {
  usuarioId: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  fechaCreacion: string;
  pacienteId: number | null;
  profesionalId: number | null;
}

export interface UsuarioRequest {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: Exclude<Rol, 'PROFESIONAL'>;
  pacienteId: number | null;
}
