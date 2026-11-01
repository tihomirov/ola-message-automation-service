import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Api, AppConfig, ShopTest, errorText } from '../api';

@Component({
  selector: 'app-shop',
  imports: [FormsModule, JsonPipe, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressBarModule],
  template: `
    <h2>Shop (flow 2)</h2>
    <p class="hint">Used to fetch order details (sizes) from the shop admin. The service logs in by itself
      and logs in again when the session expires. The cookie is only a fallback.
      With neither set, requests are sent without a session: use <b>Fetch</b> below to see whether the shop allows that.</p>
    @if (error()) { <p class="error">{{ error() }}</p> }
    @if (shop(); as s) {
      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" class="full"><mat-label>Shop admin base URL</mat-label>
            <input matInput [(ngModel)]="s.base_url" /></mat-form-field>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Login email</mat-label>
              <input matInput [(ngModel)]="s.login_email" autocomplete="off" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Login password</mat-label>
              <input matInput type="password" [(ngModel)]="s.login_password" autocomplete="new-password" />
              <mat-hint>Leave as is to keep the saved one</mat-hint></mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full"><mat-label>Fallback: Cookie header from DevTools</mat-label>
            <textarea matInput rows="3" [(ngModel)]="s.cookie" spellcheck="false"></textarea>
            <mat-hint>Optional. Leave as is to keep the saved one; clear to remove</mat-hint></mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button mat-flat-button (click)="save()" [disabled]="busy()"><mat-icon svgIcon="save" /> Save</button>
        </mat-card-actions>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Test with an order</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Order number (from the email)</mat-label>
              <input matInput [(ngModel)]="number" placeholder="CD109" /></mat-form-field>
            <button mat-stroked-button (click)="test()" [disabled]="busy() || !number.trim()">Fetch</button>
          </div>
          @if (busy()) { <mat-progress-bar mode="indeterminate" /> }
          @if (result(); as r) {
            <p>Status: <b [class.ok]="r.status === 'ok'" [class.error]="r.status !== 'ok'">{{ r.status }}</b> {{ r.detail }}</p>
            <p class="hint">Session cookies: {{ r.cookie_names.join(', ') || 'none' }}</p>
            @if (r.summary) { <pre>{{ r.summary | json }}</pre> }
            @if (r.order) { <pre>{{ r.order | json }}</pre> }
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    mat-card { margin-bottom: 16px; }
    .full { width: 100%; }
    .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .row mat-form-field { flex: 1 1 220px; }
    .hint { color: var(--mat-sys-on-surface-variant); font-size: 13px; }
    .error { color: var(--mat-sys-error); }
    .ok { color: #2e7d32; }
    pre { white-space: pre-wrap; word-break: break-word; background: var(--mat-sys-surface-container); padding: 12px; border-radius: 6px; }
  `,
})
export class ShopPage {
  private readonly api = inject(Api);
  private readonly snack = inject(MatSnackBar);
  readonly shop = signal<AppConfig['shop'] | null>(null);
  readonly result = signal<ShopTest | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  number = '';

  constructor() {
    this.api.config().then((r) => this.shop.set({ ...r.config.shop })).catch((e: unknown) => this.error.set(errorText(e)));
  }

  async save() {
    const s = this.shop();
    if (!s) return;
    this.busy.set(true);
    try {
      const r = await this.api.saveConfig({ shop: s });
      this.shop.set({ ...r.config.shop });
      this.snack.open('Saved', 'OK', { duration: 3000 });
    } catch (e) {
      this.snack.open(errorText(e), 'OK');
    } finally {
      this.busy.set(false);
    }
  }

  async test() {
    this.busy.set(true);
    this.result.set(null);
    try {
      this.result.set(await this.api.shopTest(this.number.trim()));
    } catch (e) {
      this.snack.open(errorText(e), 'OK');
    } finally {
      this.busy.set(false);
    }
  }
}
