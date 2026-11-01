import { KeyValuePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime } from 'rxjs';
import { Api, LinkCfg, Preview, errorText } from '../api';
import { MessageView } from '../message-view';

@Component({
  selector: 'app-template',
  imports: [FormsModule, KeyValuePipe, MessageView, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatExpansionModule, MatSnackBarModule],
  template: `
    <h2>Message</h2>
    @if (error()) { <p class="error">{{ error() }}</p> }
    <div class="cols">
      <div class="edit">
        <mat-card>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email subject</mat-label>
              <input matInput [(ngModel)]="subject" (input)="changed()" />
              <mat-hint>{{ '{number} {customer_name} {phone} {total} {delivery} {payment}' }}</mat-hint>
            </mat-form-field>

            <div class="tbar">
              <strong>Message template</strong>
              <span class="spacer"></span>
              <button mat-button (click)="loadDefault()">Load default</button>
              <button mat-button (click)="text = ''; changed()" [disabled]="!text">Reset to default</button>
            </div>
            @if (!text) {
              <p class="hint">Empty = the <b>default template</b> is used (see the preview). Click <b>Load default</b> to edit a copy of it.</p>
            } @else {
              <p class="hint">Lines between <code>[[quote]]</code> and <code>[[/quote]]</code> are the text for the customer: a box in the email, a Copy button here and on the Orders page.</p>
            }
            <mat-form-field appearance="outline" class="full">
              <textarea matInput class="code" rows="18" [(ngModel)]="text" (input)="changed()" spellcheck="false"
                        placeholder="Jinja template, e.g. 🛍 №{{ '{{' }} order.number {{ '}}' }}"></textarea>
            </mat-form-field>

            <strong>Links</strong>
            <p class="hint">URL templates. In the message: <code>{{ '{{' }} links.WhatsApp {{ '}}' }}</code>, or all of them via <code>links_list</code>. A link is skipped when the order has no phone.</p>
            @for (l of links; track $index) {
              <div class="link">
                <mat-form-field appearance="outline" class="lname"><mat-label>Name</mat-label>
                  <input matInput [(ngModel)]="l.name" (input)="changed()" /></mat-form-field>
                <mat-form-field appearance="outline" class="lurl"><mat-label>URL</mat-label>
                  <input matInput [(ngModel)]="l.url" (input)="changed()" spellcheck="false" /></mat-form-field>
                <button mat-icon-button (click)="links.splice($index, 1); changed()" aria-label="Remove"><mat-icon svgIcon="delete" /></button>
              </div>
            }
            <button mat-stroked-button (click)="links.push({ name: '', url: '' }); changed()"><mat-icon svgIcon="add" /> Add link</button>

            <mat-expansion-panel class="vars">
              <mat-expansion-panel-header><mat-panel-title>Available variables</mat-panel-title></mat-expansion-panel-header>
              <table>
                @for (v of variables() | keyvalue; track v.key) {
                  <tr><td><code>{{ v.key }}</code></td><td>{{ v.value }}</td></tr>
                }
              </table>
              <p class="hint">Jinja syntax: <code>{{ '{%' }} if order.comment {{ '%}' }}…{{ '{%' }} endif {{ '%}' }}</code>, <code>{{ '{%' }} for it in items {{ '%}' }}…{{ '{%' }} endfor {{ '%}' }}</code>. If the template breaks at runtime, the built-in message is sent instead.</p>
            </mat-expansion-panel>
          </mat-card-content>
        </mat-card>
        <div class="actions">
          <button mat-flat-button (click)="save()" [disabled]="busy() || !dirty() || !!preview()?.error"><mat-icon svgIcon="save" /> Save</button>
          @if (preview()?.error) { <span class="error">Fix the template error to save</span> }
        </div>
      </div>

      <div class="prev">
        <mat-card>
          <mat-card-header><mat-card-title>Preview</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full" subscriptSizing="dynamic">
              <mat-label>Preview with order №</mat-label>
              <input matInput [(ngModel)]="number" (input)="changed()" placeholder="empty = sample order" />
            </mat-form-field>
            @if (preview(); as p) {
              <p class="hint">Data: {{ p.source }}</p>
              <div class="subject">{{ p.subject }}</div>
              @if (p.error) { <pre class="perr">{{ p.error }}</pre> }
              @else { <div class="mail"><app-message-view [text]="p.text" /></div> }
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .cols { display: grid; gap: 16px; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: start; }
    @media (max-width: 1000px) { .cols { grid-template-columns: 1fr; } }
    .prev { position: sticky; top: 72px; }
    .full { width: 100%; }
    .tbar { display: flex; align-items: center; margin: 12px 0 4px; }
    .spacer { flex: 1; }
    .code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; }
    .link { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .lname { flex: 0 1 140px; } .lurl { flex: 1 1 260px; }
    .vars { margin-top: 16px; box-shadow: none; border: 1px solid var(--mat-sys-outline-variant); }
    td { padding: 4px 8px 4px 0; vertical-align: top; }
    .hint { color: var(--mat-sys-on-surface-variant); font-size: 13px; }
    .subject { font-weight: 500; margin-bottom: 8px; }
    .mail { background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); border-radius: 6px; padding: 8px 12px; }
    pre { white-space: pre-wrap; word-break: break-word; background: var(--mat-sys-surface-container); padding: 12px; border-radius: 6px; margin: 0; }
    .perr { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .actions { display: flex; gap: 12px; align-items: center; padding: 12px 0; }
    .error { color: var(--mat-sys-error); }
  `,
})
export class TemplatePage {
  private readonly api = inject(Api);
  private readonly snack = inject(MatSnackBar);
  text = '';
  subject = '';
  links: LinkCfg[] = [];
  number = '';
  readonly preview = signal<Preview | null>(null);
  readonly variables = signal<Record<string, string>>({});
  readonly error = signal('');
  readonly busy = signal(false);
  private readonly version = signal(0);
  private saved = '';
  private readonly refresh$ = new Subject<void>();
  readonly dirty = computed(() => {
    this.version();
    return this.snapshot() !== this.saved;
  });

  constructor() {
    this.refresh$.pipe(debounceTime(400), takeUntilDestroyed(inject(DestroyRef))).subscribe(() => void this.runPreview());
    void this.load();
  }

  private snapshot() {
    return JSON.stringify([this.text, this.subject, this.links]);
  }

  async load() {
    try {
      const [cfg, def] = await Promise.all([this.api.config(), this.api.templateDefault()]);
      this.text = cfg.config.template.text;
      this.subject = cfg.config.email.subject;
      this.links = structuredClone(cfg.config.template.links);
      this.variables.set(def.variables);
      this.saved = this.snapshot();
      this.changed();
    } catch (e) {
      this.error.set(errorText(e));
    }
  }

  changed() {
    this.version.update((v) => v + 1);
    this.refresh$.next();
  }

  async loadDefault() {
    const d = await this.api.templateDefault();
    this.text = d.text;
    this.subject = d.subject;
    this.changed();
  }

  async runPreview() {
    try {
      this.preview.set(await this.api.preview({
        text: this.text, subject: this.subject, links: this.links, number: this.number.trim() || undefined,
      }));
    } catch (e) {
      this.error.set(errorText(e));
    }
  }

  async save() {
    this.busy.set(true);
    try {
      await this.api.saveConfig({
        template: { text: this.text, links: this.links.filter((l) => l.name.trim() && l.url.trim()) },
        email: { subject: this.subject },
      });
      await this.load();
      this.snack.open('Saved. New orders use this message.', 'OK', { duration: 4000 });
    } catch (e) {
      this.snack.open(errorText(e), 'OK');
    } finally {
      this.busy.set(false);
    }
  }
}
