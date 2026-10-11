import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { UsuarioSesion } from '../core/models/modelos';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar [abierto]="menuAbierto" (cerrarSesion)="salir()" (navegar)="menuAbierto = false"></app-sidebar>
    <div class="s360-contenido">
      <header class="s360-topbar">
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary d-lg-none" (click)="menuAbierto = !menuAbierto" aria-label="Menú">
            <i class="bi bi-list"></i>
          </button>
          <span class="s360-migas">
            Salud 360
            <ng-container *ngFor="let m of migas; let ultimo = last"> / <strong *ngIf="ultimo; else normal">{{ m }}</strong><ng-template #normal>{{ m }}</ng-template></ng-container>
          </span>
        </div>
        <div class="d-flex align-items-center gap-2" *ngIf="usuario">
          <span class="s360-avatar">{{ iniciales }}</span>
          <div class="lh-sm d-none d-sm-block">
            <div class="fw-bold small">{{ usuario.nombre }}</div>
            <div class="text-secondary" style="font-size:.75rem">{{ usuario.correo }}</div>
          </div>
        </div>
      </header>
      <main class="s360-pagina">
        <div class="alert s360-alerta-error d-flex justify-content-between align-items-center" *ngIf="accesoDenegado">
          <span><i class="bi bi-shield-lock"></i> Acceso restringido para su rol</span>
          <button type="button" class="btn-close" (click)="accesoDenegado = false" aria-label="Cerrar"></button>
        </div>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class LayoutComponent implements OnInit, OnDestroy {
  usuario: UsuarioSesion | null;
  migas: string[] = [];
  menuAbierto = false;
  accesoDenegado = false;
  private subs = new Subscription();

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.usuario = auth.obtenerUsuario();
  }

  get iniciales(): string {
    const partes = (this.usuario?.nombre ?? '').replace(/^(Dra?|Lic|Ps)\.\s*/, '').split(' ').filter(Boolean);
    return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.actualizarMigas();
    this.subs.add(
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.actualizarMigas())
    );
    this.subs.add(
      this.route.queryParamMap.subscribe((q) => (this.accesoDenegado = q.get('acceso') === 'denegado'))
    );
  }

  private actualizarMigas(): void {
    let r = this.route.snapshot;
    while (r.firstChild) r = r.firstChild;
    this.migas = (r.data['migas'] as string[] | undefined) ?? [];
  }

  salir(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
