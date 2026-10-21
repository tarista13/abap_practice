// In-memory SQLite database (sql.js, compiled to WebAssembly) that backs ABAP SQL statements.
import initSqlJs, { type SqlJsConfig, type SqlJsStatic } from "sql.js";
import { SQLiteDatabaseClient } from "@abaplint/database-sqlite";

let config: SqlJsConfig | undefined;
let sqlJs: Promise<SqlJsStatic> | undefined;

/** Tells sql.js where to find its .wasm file; needed in the browser, not in Node. */
export function configureSqlJs(c: SqlJsConfig): void {
  config = c;
}

// SQLiteDatabaseClient.connect() always calls initSqlJs() without a config; load sql.js once
// with ours and hand each run a fresh database instead.
class FreshSQLiteClient extends SQLiteDatabaseClient {
  private readonly SQL: SqlJsStatic;

  constructor(SQL: SqlJsStatic) {
    super();
    this.SQL = SQL;
  }

  override async connect(): Promise<void> {
    (this as any).sqlite = new this.SQL.Database();
    abap.builtin.sy.get().dbsys?.set(this.name);
  }
}

/** Creates a new database with the given tables and rows and makes it the ABAP default connection. */
export async function connectDatabase(schema: string[], seed: string[]): Promise<void> {
  sqlJs ??= initSqlJs(config);
  const client = new FreshSQLiteClient(await sqlJs);
  abap.context.databaseConnections["DEFAULT"] = client;
  await client.connect();
  await client.execute(schema);
  await client.execute(seed);
}

declare global {
  // the transpiled code and runtime use a global "abap" instance
  // eslint-disable-next-line no-var
  var abap: import("@abaplint/runtime").ABAP;
}
