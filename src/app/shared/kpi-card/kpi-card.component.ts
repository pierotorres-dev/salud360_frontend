import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="s360-kpi" [ngClass]="color">
      <div class="s360-kpi-etiqueta">{{ etiqueta }}</div>
      <div class="s360-kpi-valor">{{ valor }}</div>
      <div class="s360-kpi-sub">{{ detalle }}</div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() etiqueta = '';
  @Input() valor: number | string = 0;
  @Input() detalle = '';
  @Input() color: 'azul' | 'naranja' | 'morado' | 'verde' = 'azul';
}
