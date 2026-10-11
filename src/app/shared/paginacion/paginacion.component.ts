import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center px-3 py-2 small text-secondary" *ngIf="totalElementos > 0">
      <span>Mostrando {{ desde }}–{{ hasta }} de {{ totalElementos }} {{ etiqueta }}</span>
      <ul class="pagination pagination-sm mb-0" *ngIf="totalPaginas > 1">
        <li class="page-item" [class.disabled]="pagina === 0">
          <button type="button" class="page-link" (click)="ir(pagina - 1)" aria-label="Anterior">‹</button>
        </li>
        <li class="page-item" *ngFor="let p of paginas" [class.active]="p === pagina">
          <button type="button" class="page-link" (click)="ir(p)">{{ p + 1 }}</button>
        </li>
        <li class="page-item" [class.disabled]="pagina >= totalPaginas - 1">
          <button type="button" class="page-link" (click)="ir(pagina + 1)" aria-label="Siguiente">›</button>
        </li>
      </ul>
    </div>
  `,
})
export class PaginacionComponent {
  @Input() pagina = 0;
  @Input() tamanio = 6;
  @Input() totalElementos = 0;
  @Input() totalPaginas = 0;
  @Input() etiqueta = 'registros';
  @Output() cambiarPagina = new EventEmitter<number>();

  get desde(): number {
    return this.totalElementos === 0 ? 0 : this.pagina * this.tamanio + 1;
  }

  get hasta(): number {
    return Math.min((this.pagina + 1) * this.tamanio, this.totalElementos);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }

  ir(p: number): void {
    if (p >= 0 && p < this.totalPaginas && p !== this.pagina) {
      this.cambiarPagina.emit(p);
    }
  }
}
