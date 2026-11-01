import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Api, AppConfig, DryRun, errorText } from '../api';

type Form = Omit<AppConfig, 'template'> & {
  lists: { senders: string; forwarders: string; to: string };
};

const toLines = (a: string[]) => a.join('\n');
const fromLines = (s: string) => s.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean);

@Component({
  selector: 'app-settings',
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressBarModule, MatExpansionModule],
  template: `
    <h2>Settings</h2>
    @if (error()) { <p class="error">{{ error() }}</p> }
    @if (f(); as f) {
      @if (problems().length) {
        <mat-card class="problems">
          <mat-card-content>
            <strong>The mail worker is not running:</strong>
            <ul>@for (p of problems(); track p) { <li>{{ p }}</li> }</ul>
          </mat-card-content>
        </mat-card>
      }

      @if (warnings().length) {
        <mat-card class="warnings">
          <mat-card-content>
            @for (w of warnings(); track w) { <div>⚠️ {{ w }}</div> }
          </mat-card-content>
        </mat-card>
      }

      <mat-card>
        <mat-card-header><mat-card-title>Flow</mat-card-title></mat-card-header>
        <mat-card-content>
          <mat-slide-toggle [(ngModel)]="f.features.fetch_order_details" (change)="touch()">
            Fetch order details from the shop (flow 2)
          </mat-slide-toggle>
          <p class="hint">
            Off (flow 1): the message is built from the order email only, without sizes.
            On (flow 2): the service also logs in to the shop admin and adds sizes. Configure it on the <b>Shop</b> page, which appears after saving.
          </p>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Mailbox (order emails)</mat-card-title></mat-card-header>
        <mat-card-content>
          <mat-slide-toggle [(ngModel)]="f.mailbox.enabled" (change)="touch()">Poll the mailbox</mat-slide-toggle>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Gmail address</mat-label>
              <input matInput [(ngModel)]="f.mailbox.username" (input)="touch()" autocomplete="off" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>App password</mat-label>
              <input matInput type="password" [(ngModel)]="f.mailbox.password" (input)="touch()" autocomplete="new-password" />
              <mat-hint>Leave as is to keep the saved one</mat-hint></mat-form-field>
          </div>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Check every (seconds)</mat-label>
              <input matInput type="number" min="15" [(ngModel)]="f.mailbox.poll_interval_seconds" (input)="touch()" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Look back (days)</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="f.mailbox.lookback_days" (input)="touch()" />
              <mat-hint>Also the catch-up window after downtime</mat-hint></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Send attempts before "failed"</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="f.mailbox.max_attempts" (input)="touch()" /></mat-form-field>
          </div>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Shop sender(s)</mat-label>
              <textarea matInput rows="2" [(ngModel)]="f.lists.senders" (input)="touch()"></textarea>
              <mat-hint>One per line</mat-hint></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Accept manual "Fwd:" from</mat-label>
              <textarea matInput rows="2" [(ngModel)]="f.lists.forwarders" (input)="touch()"></textarea>
              <mat-hint>Optional, one per line</mat-hint></mat-form-field>
          </div>
          <mat-expansion-panel class="adv">
            <mat-expansion-panel-header><mat-panel-title>Advanced</mat-panel-title></mat-expansion-panel-header>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>IMAP host</mat-label><input matInput [(ngModel)]="f.mailbox.host" (input)="touch()" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Port</mat-label><input matInput type="number" [(ngModel)]="f.mailbox.port" (input)="touch()" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Folder</mat-label><input matInput [(ngModel)]="f.mailbox.folder" (input)="touch()" /></mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Processed label</mat-label><input matInput [(ngModel)]="f.mailbox.processed_label" (input)="touch()" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Ignored label</mat-label><input matInput [(ngModel)]="f.mailbox.ignored_label" (input)="touch()" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Failed label</mat-label><input matInput [(ngModel)]="f.mailbox.failed_label" (input)="touch()" /></mat-form-field>
            </div>
          </mat-expansion-panel>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Email notifications</mat-card-title></mat-card-header>
        <mat-card-content>
          <mat-slide-toggle [(ngModel)]="f.email.enabled" (change)="touch()">Send notifications by email</mat-slide-toggle>
          <div class="row">
            <mat-form-field appearance="outline" class="wide"><mat-label>Send to</mat-label>
              <textarea matInput rows="2" [(ngModel)]="f.lists.to" (input)="touch()"></textarea>
              <mat-hint>One address per line</mat-hint></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Sender name</mat-label>
              <input matInput [(ngModel)]="f.email.from_name" (input)="touch()" /></mat-form-field>
          </div>
          <p class="hint">The subject and message text are on the <b>Message</b> page.</p>
          <mat-expansion-panel class="adv">
            <mat-expansion-panel-header><mat-panel-title>SMTP (advanced)</mat-panel-title></mat-expansion-panel-header>
            <p class="hint">Empty username/password = same as the mailbox account.</p>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>SMTP host</mat-label><input matInput [(ngModel)]="f.email.smtp_host" (input)="touch()" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Port (587 STARTTLS / 465 SSL)</mat-label><input matInput type="number" [(ngModel)]="f.email.smtp_port" (input)="touch()" /></mat-form-field>
            </div>
            <div class="row">
              <mat-form-field appearance="outline"><mat-label>Username</mat-label><input matInput [(ngModel)]="f.email.username" (input)="touch()" autocomplete="off" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput type="password" [(ngModel)]="f.email.password" (input)="touch()" autocomplete="new-password" /></mat-form-field>
            </div>
          </mat-expansion-panel>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Storage</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="row">
            <mat-form-field appearance="outline"><mat-label>Max DB size (MB)</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="f.storage.max_size_mb" (input)="touch()" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Keep history (days)</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="f.storage.retention_days" (input)="touch()" /></mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="actions sticky">
        <button mat-flat-button (click)="save()" [disabled]="busy() || !dirty()"><mat-icon svgIcon="save" /> Save</button>
        <button mat-stroked-button (click)="testMailbox()" [disabled]="busy() || dirty()">Test mailbox</button>
        <button mat-stroked-button (click)="testEmail()" [disabled]="busy() || dirty()">Send test email</button>
        <button mat-stroked-button (click)="dryRun()" [disabled]="busy() || dirty()">Dry run</button>
        @if (dirty()) { <span class="hint">Save first to test</span> }
      </div>
      @if (busy()) { <mat-progress-bar mode="indeterminate" /> }

      @if (dry(); as d) {
        <mat-card>
          <mat-card-header><mat-card-title>Dry run: what the next poll would send</mat-card-title></mat-card-header>
          <mat-card-content>
            <p>Found {{ d.found }} email(s): {{ d.previews.length }} new order(s), {{ d.duplicates }} already sent, {{ d.ignored }} not an order. Nothing was sent or labelled.</p>
            @for (p of d.previews; track $index) {
              <h4>{{ p.subject }}</h4>
              <pre>{{ p.text }}</pre>
            }
          </mat-card-content>
        </mat-card>
      }
    }
  `,
  styles: `
    mat-card { margin-bottom: 16px; }
    .row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
    .row mat-form-field { flex: 1 1 220px; }
    .row .wide { flex: 2 1 300px; }
    .hint { color: var(--mat-sys-on-surface-variant); font-size: 13px; }
    .adv { margin-top: 12px; box-shadow: none; border: 1px solid var(--mat-sys-outline-variant); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 12px 0; }
    .sticky { position: sticky; bottom: 0; background: var(--mat-sys-surface); z-index: 1; }
    .problems { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .warnings { background: #fff8e1; color: #5d4300; }
    .error { color: var(--mat-sys-error); }
    pre { white-space: pre-wrap; word-break: break-word; background: var(--mat-sys-surface-container); padding: 12px; border-radius: 6px; }
  `,
})
export class SettingsPage {
  private readonly api = inject(Api);
  private readonly snack = inject(MatSnackBar);
  readonly f = signal<Form | null>(null);
  readonly problems = signal<string[]>([]);
  readonly warnings = signal<string[]>([]);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly dry = signal<DryRun | null>(null);
  private readonly version = signal(0);
  private saved = '';
  readonly dirty = computed(() => {
    this.version();
    const f = this.f();
    return !!f && JSON.stringify(f) !== this.saved;
  });

  constructor() {
    void this.load();
  }

  touch() {
    this.version.update((v) => v + 1);
  }

  private setForm(cfg: AppConfig, problems: string[], warnings: string[] = []) {
    const { template: _t, ...rest } = cfg;
    const form: Form = {
      ...structuredClone(rest),
      lists: {
        senders: toLines(cfg.mailbox.allowed_senders),
        forwarders: toLines(cfg.mailbox.allowed_forwarders),
        to: toLines(cfg.email.to),
      },
    };
    this.f.set(form);
    this.saved = JSON.stringify(form);
    this.problems.set(problems);
    this.warnings.set(warnings);
    this.touch();
  }

  async load() {
    try {
      const r = await this.api.config();
      this.setForm(r.config, r.problems, r.warnings);
    } catch (e) {
      this.error.set(errorText(e));
    }
  }

  async save() {
    const f = this.f();
    if (!f) return;
    this.busy.set(true);
    try {
      const r = await this.api.saveConfig({
        features: f.features,
        mailbox: { ...f.mailbox, allowed_senders: fromLines(f.lists.senders), allowed_forwarders: fromLines(f.lists.forwarders) },
        email: { ...f.email, to: fromLines(f.lists.to) },
        storage: f.storage,
      });
      this.setForm(r.config, r.problems, r.warnings);
      await this.api.loadMeta();
      this.snack.open(r.problems.length ? 'Saved. The worker is not running yet: see above.' : 'Saved. Mail worker restarted.', 'OK', { duration: 4000 });
    } catch (e) {
      this.snack.open(errorText(e), 'OK');
    } finally {
      this.busy.set(false);
    }
  }

  private async run<T>(fn: () => Promise<T>, ok: (r: T) => string) {
    this.busy.set(true);
    try {
      this.snack.open(ok(await fn()), 'OK', { duration: 6000 });
    } catch (e) {
      this.snack.open(errorText(e), 'OK');
    } finally {
      this.busy.set(false);
    }
  }

  testMailbox() {
    return this.run(() => this.api.testMailbox(),
      (r) => `Mailbox OK${r.gmail ? ' (Gmail)' : ''}: ${r.waiting} unprocessed order email(s)`);
  }

  testEmail() {
    return this.run(() => this.api.testEmail(), (r) => `Test email sent to ${r.to.join(', ')}`);
  }

  dryRun() {
    this.dry.set(null);
    return this.run(() => this.api.dryRun(), (r) => {
      this.dry.set(r);
      return `Dry run: ${r.previews.length} message(s) would be sent`;
    });
  }
}
