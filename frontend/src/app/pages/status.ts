import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api, Status, errorText } from '../api';

function dur(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}

@Component({
  selector: 'app-status',
  imports: [DecimalPipe, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="head">
      <h2>Status</h2>
      <button mat-stroked-button (click)="load()" [disabled]="loading()"><mat-icon svgIcon="refresh" /> Refresh</button>
    </div>
    @if (loading() && !s()) { <mat-progress-bar mode="indeterminate" /> }
    @if (error()) { <p class="error">{{ error() }}</p> }
    @if (s(); as s) {
      <div class="grid">
        <mat-card>
          <mat-card-header><mat-card-title>Mail worker</mat-card-title></mat-card-header>
          <mat-card-content>
            <table>
              <tr><td>State</td><td>
                @if (s.worker.running) { <span class="ok">running</span> }
                @else { <span class="bad">not running</span> }
              </td></tr>
              @for (p of s.worker.problems; track p) { <tr><td></td><td class="bad">{{ p }}</td></tr> }
              @for (w of s.worker.warnings ?? []; track w) { <tr><td></td><td class="warn">⚠️ {{ w }}</td></tr> }
              <tr><td>Last poll</td><td>{{ s.worker.last_poll || '—' }}</td></tr>
              <tr><td>Last OK</td><td>{{ s.worker.last_ok || '—' }}</td></tr>
              @if (s.worker.last_result; as r) {
                <tr><td>Last result</td><td>found {{ r['found'] }}, sent {{ r['sent'] }}, duplicates {{ r['duplicates'] }}, ignored {{ r['ignored'] }}, retry {{ r['retry'] }}, failed {{ r['failed'] }}</td></tr>
              }
              @if (s.worker.last_error) { <tr><td>Last error</td><td class="bad">{{ s.worker.last_error }}</td></tr> }
              <tr><td>Orders</td><td>sent {{ s.worker.orders?.['sent'] ?? 0 }}, retry {{ s.worker.orders?.['retry'] ?? 0 }}, failed {{ s.worker.orders?.['failed'] ?? 0 }}, ignored emails {{ s.worker.orders?.['ignored'] ?? 0 }}</td></tr>
              <tr><td>DB size</td><td>{{ s.worker.db_size_kb ?? '?' }} KB</td></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Runtime</mat-card-title></mat-card-header>
          <mat-card-content>
            <table>
              <tr><td>Mode</td><td>{{ modeText(s.mode) }}</td></tr>
              <tr><td>Now</td><td>{{ s.now }} ({{ s.timezone }})</td></tr>
              <tr><td>Process uptime</td><td>{{ dur(s.process_uptime_s) }}</td></tr>
              <tr><td>VM uptime</td><td>{{ dur(s.vm_uptime_s) }}</td></tr>
              <tr><td>Memory available</td><td>{{ s.memory_mib.MemAvailable ?? '?' }} / {{ s.memory_mib.MemTotal ?? '?' }} MiB</td></tr>
              <tr><td>Swap free</td><td>{{ s.memory_mib.SwapFree ?? '?' }} / {{ s.memory_mib.SwapTotal ?? '?' }} MiB</td></tr>
              <tr><td>Service memory</td><td>{{ s.memory_mib.ProcessRSS ?? '?' }} MiB</td></tr>
              <tr><td>Frontend build</td><td>{{ s.build_commit || 'dev' }}</td></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Network</mat-card-title></mat-card-header>
          <mat-card-content>
            <table>
              @for (n of s.network; track n.target) {
                <tr><td>{{ n.target }}</td><td [class.ok]="n.ok" [class.bad]="!n.ok">{{ n.ok ? 'OK' : 'FAIL' }}</td><td>{{ n.ms }} ms</td></tr>
                @if (n.error) { <tr><td></td><td colspan="2" class="bad small">{{ n.error }}</td></tr> }
              }
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Background survival</mat-card-title></mat-card-header>
          <mat-card-content>
            <table>
              <tr><td>Availability</td><td>{{ s.heartbeat.availability | number: '1.1-1' }}% over {{ dur(s.heartbeat.span_s) }}</td></tr>
              <tr><td>Recording since</td><td>{{ s.heartbeat.first || '—' }}</td></tr>
              <tr><td>Service starts</td><td>{{ s.heartbeat.starts }}</td></tr>
            </table>
            @if (s.heartbeat.gaps.length) {
              <h4>Gaps (newest first)</h4>
              <table class="small">
                @for (g of s.heartbeat.gaps.slice(0, 10); track g.from) {
                  <tr><td>{{ g.from }}</td><td>{{ dur(g.seconds) }}</td><td>{{ g.kind }}</td></tr>
                }
              </table>
            } @else { <p class="ok small">No gaps</p> }
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: `
    .head { display: flex; align-items: center; justify-content: space-between; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 4px 6px 4px 0; vertical-align: top; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    td:first-child { color: var(--mat-sys-on-surface-variant); white-space: nowrap; }
    .ok { color: #2e7d32; font-weight: 500; }
    .bad { color: var(--mat-sys-error); font-weight: 500; }
    .warn { color: #8d6e00; }
    .small { font-size: 12px; }
    .error { color: var(--mat-sys-error); }
  `,
})
export class StatusPage {
  private readonly api = inject(Api);
  readonly s = signal<Status | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly dur = dur;

  constructor() {
    void this.load();
    const t = setInterval(() => void this.load(), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }

  modeText(mode: string): string {
    return mode === 'flow2' ? 'Flow 2: email + order details from the shop'
      : mode === 'flow1' ? 'Flow 1: email only' : 'config.yaml is invalid';
  }

  async load() {
    this.loading.set(true);
    try {
      this.s.set(await this.api.status());
      this.error.set('');
    } catch (e) {
      this.error.set(errorText(e));
    } finally {
      this.loading.set(false);
    }
  }
}
