import { DiaSemana } from '../models/modelos';

const dos = (n: number): string => n.toString().padStart(2, '0');

export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

export function sumarDiasISO(iso: string, dias: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const f = new Date(y, m - 1, d + dias);
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}`;
}

export function formatoFecha(iso: string | null | undefined): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
  'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function mesActual(): string {
  const d = new Date();
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export const DIAS_SEMANA: { valor: DiaSemana; nombre: string; abreviatura: string }[] = [
  { valor: 'LUNES', nombre: 'Lunes', abreviatura: 'Lun' },
  { valor: 'MARTES', nombre: 'Martes', abreviatura: 'Mar' },
  { valor: 'MIERCOLES', nombre: 'Miércoles', abreviatura: 'Mié' },
  { valor: 'JUEVES', nombre: 'Jueves', abreviatura: 'Jue' },
  { valor: 'VIERNES', nombre: 'Viernes', abreviatura: 'Vie' },
  { valor: 'SABADO', nombre: 'Sábado', abreviatura: 'Sáb' },
  { valor: 'DOMINGO', nombre: 'Domingo', abreviatura: 'Dom' },
];

export function abreviaturaDia(dia: DiaSemana): string {
  return DIAS_SEMANA.find((d) => d.valor === dia)?.abreviatura ?? dia;
}

export function opcionesHora(): string[] {
  const horas: string[] = [];
  for (let minutos = 6 * 60; minutos <= 22 * 60; minutos += 30) {
    horas.push(`${dos(Math.floor(minutos / 60))}:${dos(minutos % 60)}`);
  }
  return horas;
}
