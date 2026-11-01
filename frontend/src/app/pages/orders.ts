import { DatePipe, JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Api, OrderDetail, OrderRow, errorText } from '../api';
import { MessageView } from '../message-view';

@Component({
  selector: 'app-orders',
  imports: [DatePipe, JsonPipe, FormsModule, MessageView, MatExpansionModule, MatSelectModule, MatFormFieldModule, MatPaginatorModule, MatButtonModule, MatIconModule],
  template: `
    <div class="head">
      <h2>Orders</h2>
      <div class="tools">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="status" (selectionChange)="page = 0; load()">
            <mat-option value="">All</mat-option>
            <mat-option value="sent">Sent</mat-option>
            <mat-option value="retry">Retrying</mat-option>
            <mat-option value="failed">Failed</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-icon-button (click)="load()" aria-label="Refresh"><mat-icon svgIcon="refresh" /></button>
      </div>
    </div>
    @if (error()) { <p class="error">{{ error() }}</p> }
    @if (!items().length && !error()) { <p class="muted">No orders yet. They appear here once the mail worker sends a notification.</p> }
    <mat-accordion>
      @for (o of items(); track o.number) {
        <mat-expansion-panel (opened)="open(o.number)">
          <mat-expansion-panel-header>
            <mat-panel-title>№{{ o.number }}</mat-panel-title>
            <mat-panel-description>
              <span class="chip" [class]="o.status">{{ o.status }}</span>
              <span class="when">{{ o.updated_at | date: 'dd.MM.yyyy HH:mm' }}</span>
            </mat-panel-description>
          </mat-expansion-panel-header>
          @if (o.last_error) { <p class="error">Last error ({{ o.attempts }} attempts): {{ o.last_error }}</p> }
          @if (details()[o.number]; as d) {
            @if (d.message) {
              <h4>Sent message</h4>
              <app-message-view [text]="d.message" />
            }
            @if (d.fetch_status) { <p>Shop fetch: {{ d.fetch_status }}</p> }
            @if (d.data) {
              <details><summary>Parsed email data</summary><pre>{{ d.data | json }}</pre></details>
            }
          }
        </mat-expansion-panel>
      }
    </mat-accordion>
    @if (total() > pageSize) {
      <mat-paginator [length]="total()" [pageSize]="pageSize" [pageIndex]="page" (page)="onPage($event)" />
    }
  `,
  styles: `
    .head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .tools { display: flex; align-items: center; gap: 8px; }
    .filter { width: 160px; }
    .chip { padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-right: 12px; background: var(--mat-sys-surface-container-high); }
    .chip.sent { background: #e8f5e9; color: #1b5e20; }
    .chip.retry { background: #fff8e1; color: #8d6e00; }
    .chip.failed { background: #ffebee; color: #b71c1c; }
    .when { color: var(--mat-sys-on-surface-variant); }
    pre { white-space: pre-wrap; word-break: break-word; background: var(--mat-sys-surface-container); padding: 12px; border-radius: 6px; }
    .error { color: var(--mat-sys-error); }
    .muted { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class OrdersPage {
  private readonly api = inject(Api);
  readonly items = signal<OrderRow[]>([]);
  readonly total = signal(0);
  readonly details = signal<Record<string, OrderDetail>>({});
  readonly error = signal('');
  status = '';
  page = 0;
  readonly pageSize = 25;

  constructor() {
    void this.load();
  }

  async load() {
    try {
      const r = await this.api.orders(this.pageSize, this.page * this.pageSize, this.status || undefined);
      this.items.set(r.items);
      this.total.set(r.total);
      this.error.set('');
    } catch (e) {
      this.error.set(errorText(e));
    }
  }

  onPage(e: PageEvent) {
    this.page = e.pageIndex;
    void this.load();
  }

  async open(num: string) {
    if (this.details()[num]) return;
    try {
      const d = await this.api.order(num);
      this.details.update((all) => ({ ...all, [num]: d }));
    } catch (e) {
      this.error.set(errorText(e));
    }
  }
}
