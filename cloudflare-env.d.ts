interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success?: boolean;
  meta?: Record<string, unknown>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1ExecResult {
  count?: number;
  duration?: number;
}

declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "cloudflare:workers" {
  export const env: { DB: D1Database };
}

interface CandleRuntimeGlobal {
  __CANDLE_RUNTIME_ENV__?: { DB?: D1Database };
}
