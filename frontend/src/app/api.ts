import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Secrets come back from the API as this string; sending it back keeps the stored value. */
export const MASK = '••••••';

export interface Me {
  configured: boolean;
  logged_in: boolean;
}

export interface Meta {
  fetch_order_details: boolean;
  build_commit: string;
}

export interface LinkCfg {
  name: string;
  url: string;
}

export interface AppConfig {
  features: { fetch_order_details: boolean };
  mailbox: {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password: string;
    folder: string;
    poll_interval_seconds: number;
    lookback_days: number;
    allowed_senders: string[];
    allowed_forwarders: string[];
    processed_label: string;
    ignored_label: string;
    failed_label: string;
    max_attempts: number;
  };
  email: {
    enabled: boolean;
    smtp_host: string;
    smtp_port: number;
    username: string;
    password: string;
    from_name: string;
    to: string[];
    subject: string;
  };
  shop: { base_url: string; login_email: string; login_password: string; cookie: string };
  storage: { db_path: string; max_size_mb: number; retention_days: number };
  template: { text: string; links: LinkCfg[] };
}

export interface ConfigResponse {
  config: AppConfig;
  problems: string[];
}

export interface OrderRow {
  number: string;
  status: 'sent' | 'retry' | 'failed';
  attempts: number;
  fetch_status: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends OrderRow {
  message: string | null;
  message_id: string | null;
  data: Record<string, unknown> | null;
}

export interface Status {
  now: string;
  timezone: string;
  mode: 'flow1' | 'flow2' | 'invalid-config';
  build_commit: string;
  process_uptime_s: number;
  vm_uptime_s: number;
  memory_mib: {
    MemTotal?: number;
    MemAvailable?: number;
    SwapTotal?: number;
    SwapFree?: number;
    ProcessRSS?: number;
  };
  network: { target: string; ok: boolean; ms: number; error: string }[];
  worker: {
    running: boolean;
    problems: string[];
    last_poll: string | null;
    last_ok: string | null;
    last_error: string;
    last_result: Record<string, number> | null;
    db_size_kb?: number;
    orders?: Record<string, number>;
    db_error?: string;
  };
  heartbeat: {
    interval_s: number;
    first: string | null;
    last: string | null;
    starts: number;
    availability: number;
    span_s: number;
    gaps: { from: string; to: string; seconds: number; kind: string }[];
  };
}

export interface Preview {
  text: string;
  html?: string;
  subject: string;
  error: string | null;
  source: string;
}

export interface DryRun {
  found: number;
  sent: number;
  duplicates: number;
  ignored: number;
  retry: number;
  failed: number;
  previews: { subject: string; text: string }[];
}

export interface ShopTest {
  status: string;
  detail: string;
  summary: Record<string, unknown> | null;
  order: Record<string, unknown> | null;
  cookie_names: string[];
}

export function errorText(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    const detail = (e.error as { detail?: unknown } | null)?.detail;
    if (typeof detail === 'string') return detail;
    if (e.status === 0) return 'Server is not reachable';
    return `${e.status} ${e.statusText}`;
  }
  return e instanceof Error ? e.message : String(e);
}

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  readonly meta = signal<Meta | null>(null);

  me() {
    return firstValueFrom(this.http.get<Me>('/api/auth/me'));
  }
  login(password: string) {
    return firstValueFrom(this.http.post('/api/auth/login', { password }));
  }
  logout() {
    return firstValueFrom(this.http.post('/api/auth/logout', {}));
  }
  async loadMeta(): Promise<Meta> {
    const m = await firstValueFrom(this.http.get<Meta>('/api/meta'));
    this.meta.set(m);
    return m;
  }
  status() {
    return firstValueFrom(this.http.get<Status>('/api/system/status'));
  }
  orders(limit: number, offset: number, status?: string) {
    const params: Record<string, string> = { limit: String(limit), offset: String(offset) };
    if (status) params['status'] = status;
    return firstValueFrom(this.http.get<{ total: number; items: OrderRow[] }>('/api/orders', { params }));
  }
  order(num: string) {
    return firstValueFrom(this.http.get<OrderDetail>(`/api/orders/${encodeURIComponent(num)}`));
  }
  config() {
    return firstValueFrom(this.http.get<ConfigResponse>('/api/config'));
  }
  saveConfig(update: Partial<{ [K in keyof AppConfig]: Partial<AppConfig[K]> }>) {
    return firstValueFrom(this.http.put<ConfigResponse>('/api/config', update));
  }
  testEmail() {
    return firstValueFrom(this.http.post<{ ok: boolean; to: string[] }>('/api/actions/test-email', {}));
  }
  testMailbox() {
    return firstValueFrom(
      this.http.post<{ ok: boolean; gmail: boolean; waiting: number }>('/api/actions/test-mailbox', {}),
    );
  }
  dryRun() {
    return firstValueFrom(this.http.post<DryRun>('/api/actions/dry-run', {}));
  }
  shopTest(num: string) {
    return firstValueFrom(this.http.post<ShopTest>('/api/actions/shop-test', { number: num }));
  }
  templateDefault() {
    return firstValueFrom(
      this.http.get<{ text: string; subject: string; variables: Record<string, string> }>('/api/template/default'),
    );
  }
  preview(body: { text: string; subject?: string; links?: LinkCfg[]; number?: string }) {
    return firstValueFrom(this.http.post<Preview>('/api/template/preview', body));
  }
}
