import postgres from "postgres";

type QueryRow = Record<string, unknown>;
type QueryResult = QueryRow[] & { count?: number };
type QueryExecutor = {
  unsafe: (query: string, parameters?: readonly unknown[]) => PromiseLike<QueryResult>;
};

export type DatabaseResult<T = QueryRow> = {
  results: T[];
  success: true;
  meta: { changes: number };
};

export type DatabaseStatement = {
  bind: (...values: unknown[]) => DatabaseStatement;
  first: <T = QueryRow>() => Promise<T | null>;
  all: <T = QueryRow>() => Promise<{ results: T[] }>;
  run: () => Promise<{ success: true; meta: { changes: number } }>;
};

export type Database = {
  prepare: (query: string) => DatabaseStatement;
  batch: (statements: DatabaseStatement[]) => Promise<DatabaseResult[]>;
};

type InternalStatement = DatabaseStatement & {
  execute: (executor: QueryExecutor) => Promise<QueryResult>;
};

const numericColumn = /(?:^id$|^active$|^count$|^quantity$|_milli$|_micros$|_pence$|_bps$|_days$|_size_ml$|_no$)/;

function normalizeRow<T = QueryRow>(row: QueryRow): T {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (typeof value === "bigint") return [key, Number(value)];
    if (typeof value === "string" && numericColumn.test(key) && /^-?\d+$/.test(value)) return [key, Number(value)];
    if (value instanceof Date) return [key, value.toISOString()];
    return [key, value];
  })) as T;
}

function postgresQuery(query: string) {
  let parameter = 0;
  return query.replaceAll("`", '"').replace(/\?/g, () => `$${++parameter}`);
}

function connectionUrl() {
  const configured = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL;
  if (!configured) throw new Error("Supabase is not connected. Add the transaction-pooler connection string as POSTGRES_URL in Vercel.");
  const url = new URL(configured);
  url.searchParams.delete("workaround");
  return url.toString();
}

const runtime = globalThis as typeof globalThis & { __CANDLE_POSTGRES__?: ReturnType<typeof postgres> };

function client() {
  if (!runtime.__CANDLE_POSTGRES__) {
    runtime.__CANDLE_POSTGRES__ = postgres(connectionUrl(), {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      ssl: "require",
    });
  }
  return runtime.__CANDLE_POSTGRES__;
}

class PreparedStatement implements InternalStatement {
  private readonly query: string;
  private readonly values: unknown[];

  constructor(query: string, values: unknown[] = []) {
    this.query = query;
    this.values = values;
  }

  bind(...values: unknown[]) {
    return new PreparedStatement(this.query, values);
  }

  async execute(executor: QueryExecutor) {
    return await executor.unsafe(postgresQuery(this.query), this.values);
  }

  async all<T = QueryRow>() {
    const rows = await this.execute(client() as unknown as QueryExecutor);
    return { results: rows.map((row) => normalizeRow<T>(row)) };
  }

  async first<T = QueryRow>() {
    const { results } = await this.all<T>();
    return results[0] ?? null;
  }

  async run() {
    const rows = await this.execute(client() as unknown as QueryExecutor);
    return { success: true as const, meta: { changes: rows.count ?? rows.length } };
  }
}

export function database(): Database {
  const sql = client();
  return {
    prepare: (query) => new PreparedStatement(query),
    async batch(statements: DatabaseStatement[]) {
      return await sql.begin(async (transaction) => {
        const results: DatabaseResult[] = [];
        for (const statement of statements) {
          const rows = await (statement as InternalStatement).execute(transaction as unknown as QueryExecutor);
          results.push({ results: rows.map((row) => normalizeRow(row)), success: true, meta: { changes: rows.count ?? rows.length } });
        }
        return results;
      });
    },
  };
}
