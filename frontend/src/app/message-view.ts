import { Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Segment {
  quote: boolean;
  text: string;
}

const START = '[[quote]]';
const END = '[[/quote]]';

/** Splits a message into normal text and [[quote]]…[[/quote]] boxes (text for the customer). */
export function splitMessage(text: string): Segment[] {
  const out: Segment[] = [];
  let buf: string[] = [];
  let inQuote = false;
  const flush = (quote: boolean) => {
    const t = buf.join('\n').replace(/^\n+|\n+$/g, '');
    if (t) out.push({ quote, text: t });
    buf = [];
  };
  for (const line of text.split('\n')) {
    const mark = line.trim();
    if (mark === START && !inQuote) { flush(false); inQuote = true; continue; }
    if (mark === END && inQuote) { flush(true); inQuote = false; continue; }
    buf.push(line);
  }
  flush(inQuote);
  return out;
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // http:// on a LAN address is not a secure context: classic fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

@Component({
  selector: 'app-message-view',
  imports: [MatButtonModule, MatIconModule],
  template: `
    @for (s of segments(); track $index) {
      @if (s.quote) {
        <div class="quote">
          <div class="qtext">{{ s.text }}</div>
          <button mat-stroked-button class="copy" (click)="copy(s.text, $index)">
            <mat-icon svgIcon="content_copy" /> {{ copied() === $index ? 'Copied' : 'Copy' }}
          </button>
        </div>
      } @else {
        <div class="plain">{{ s.text }}</div>
      }
    }
  `,
  styles: `
    :host { display: block; }
    .plain { white-space: pre-wrap; word-break: break-word; margin: 6px 0; }
    .quote { border-left: 4px solid var(--mat-sys-primary); background: var(--mat-sys-surface-container-high);
             border-radius: 4px; padding: 10px 14px; margin: 10px 0; }
    .qtext { white-space: pre-wrap; word-break: break-word; }
    .copy { margin-top: 8px; }
  `,
})
export class MessageView {
  readonly text = input.required<string>();
  readonly segments = computed(() => splitMessage(this.text()));
  readonly copied = signal<number | null>(null);

  async copy(text: string, index: number) {
    await copyText(text);
    this.copied.set(index);
    setTimeout(() => this.copied.set(null), 2000);
  }
}
