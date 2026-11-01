import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { Api } from './api';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #nav [mode]="mobile() ? 'over' : 'side'" [opened]="!mobile()" class="nav">
        <div class="brand">OLA backoffice</div>
        <mat-nav-list>
          @for (item of items(); track item.path) {
            <a mat-list-item [routerLink]="item.path" routerLinkActive #rla="routerLinkActive"
               [activated]="rla.isActive" (click)="mobile() && nav.close()">
              <mat-icon matListItemIcon [svgIcon]="item.icon" />
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="foot">
          build {{ api.meta()?.build_commit || 'dev' }}
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="bar">
          @if (mobile()) {
            <button mat-icon-button (click)="nav.toggle()" aria-label="Menu"><mat-icon svgIcon="menu" /></button>
          }
          <span class="title">Order notifications</span>
          <span class="spacer"></span>
          <button mat-button (click)="logout()"><mat-icon svgIcon="logout" /> Log out</button>
        </mat-toolbar>
        <main class="content"><router-outlet /></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .container { height: 100vh; }
    .nav { width: 220px; display: flex; flex-direction: column; }
    .brand { font: var(--mat-sys-title-medium); padding: 20px 16px 8px; }
    .foot { margin-top: auto; padding: 16px; color: var(--mat-sys-on-surface-variant); font-size: 12px; }
    .bar { position: sticky; top: 0; z-index: 2; background: var(--mat-sys-surface-container); }
    .title { font: var(--mat-sys-title-medium); }
    .spacer { flex: 1; }
    .content { padding: 16px; max-width: 1100px; }
  `,
})
export class Shell {
  readonly api = inject(Api);
  private readonly router = inject(Router);
  readonly nav = viewChild.required<MatSidenav>('nav');
  readonly mobile = toSignal(
    inject(BreakpointObserver).observe('(max-width: 800px)').pipe(map((s) => s.matches)),
    { initialValue: false },
  );
  readonly items = computed(() => [
    { path: '/status', icon: 'monitor_heart', label: 'Status' },
    { path: '/orders', icon: 'receipt_long', label: 'Orders' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
    { path: '/template', icon: 'edit_note', label: 'Message' },
    ...(this.api.meta()?.fetch_order_details ? [{ path: '/shop', icon: 'storefront', label: 'Shop' }] : []),
  ]);

  async logout() {
    await this.api.logout().catch(() => undefined);
    void this.router.navigate(['/login']);
  }
}
