import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Api, errorText } from '../api';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="wrap">
      <mat-card class="card">
        <mat-card-header><mat-card-title>OLA backoffice</mat-card-title></mat-card-header>
        <mat-card-content>
          @if (notConfigured()) {
            <p class="hint">No password is set yet. On the server run:</p>
            <pre>.venv/bin/python -m app.cli set-password</pre>
          } @else {
            <form (ngSubmit)="submit()">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Password</mat-label>
                <input matInput type="password" name="password" [(ngModel)]="password" autocomplete="current-password" autofocus required />
              </mat-form-field>
              @if (error()) { <p class="error">{{ error() }}</p> }
              <button mat-flat-button class="full" type="submit" [disabled]="busy() || !password">Log in</button>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box; }
    .card { width: 100%; max-width: 360px; }
    .full { width: 100%; }
    .error { color: var(--mat-sys-error); margin: 0 0 12px; }
    .hint { color: var(--mat-sys-on-surface-variant); }
    pre { background: var(--mat-sys-surface-container); padding: 8px; border-radius: 6px; overflow-x: auto; }
  `,
})
export class LoginPage {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notConfigured = signal(false);

  constructor() {
    this.api.me().then((m) => {
      if (!m.configured) this.notConfigured.set(true);
      else if (m.logged_in) void this.router.navigate(['/']);
    }).catch((e: unknown) => this.error.set(errorText(e)));
  }

  async submit() {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.api.login(this.password);
      await this.router.navigate(['/']);
    } catch (e) {
      this.error.set(errorText(e));
    } finally {
      this.busy.set(false);
    }
  }
}
