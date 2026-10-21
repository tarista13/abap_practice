# ABAP Practice for SAP TM

A browser-based app for learning ABAP with SAP Transportation Management (TM) examples.
ABAP code is compiled to JavaScript with the open-source [abaplint transpiler](https://github.com/abaplint/transpiler)
and runs entirely in the browser — no SAP system needed.

- **Playground**: write and run ABAP programs; `WRITE` output, syntax errors and runtime errors are shown.
- **Challenges**: implement a class and check it against hidden ABAP Unit tests.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # verify samples run and every challenge's solution passes
npm run build    # static site in dist/, host it anywhere
```

## How it works

| Piece | Where |
|---|---|
| Compile + run ABAP (abaplint syntax check → transpile → execute) | `src/engine/engine.ts` |
| Runs the engine in a Web Worker, kills runs after 10 s | `src/engine/worker.ts`, `src/engine/client.ts` |
| Minimal SAP standard classes (`CX_ROOT`, `CX_SY_*`, `CL_ABAP_UNIT_ASSERT`) | `src/engine/stdlib/*.abap` |
| Mock SAP TM tables and their rows | `src/engine/tm-db.ts` |
| In-memory SQLite database (sql.js) behind `SELECT` | `src/engine/database.ts` |
| Code editor (Monaco, the VS Code editor) | `src/components/AbapEditor.tsx` |
| Playground examples | `src/samples/` |
| Challenges | `src/challenges/` |

## The mock TM database

Every run gets a fresh in-memory SQLite database with simplified freight order tables:
`/SCMTMS/D_TORROT` (header), `/SCMTMS/D_TORITE` (items) and `/SCMTMS/D_TORSTP` (stops); items
and stops point to their header via `PARENT_KEY = DB_KEY`. The Tables button in the playground
shows all fields and rows. `SELECT`, `SELECT SINGLE`, `COUNT`/`SUM`, `JOIN`, `ORDER BY` and
`FOR ALL ENTRIES` work. To add a table or rows, edit `tmTables` in `src/engine/tm-db.ts`
(challenge tests depend on the rows, so run `npm run check` afterwards).

## Adding a challenge

1. Create `src/challenges/<id>/` with `starter.abap`, `solution.abap` (a global class) and
   `tests.abap` (local test classes `FOR TESTING` using `cl_abap_unit_assert`).
2. Add an `index.ts` like `src/challenges/fo-weight/index.ts` and list it in `src/challenges/index.ts`.
3. Run `npm run check` — it fails if the solution doesn't pass or the starter already does.

## Known limitations

- Only standard classes in `src/engine/stdlib` exist. Anything else (e.g. `CL_ABAP_CHAR_UTILITIES`,
  BOPF, real TM objects) reports as unknown; add stand-ins there as lessons need them.
- Inline declarations such as `DATA(lo_x) = NEW ...` or `CATCH ... INTO DATA(lx)` at program level
  (outside methods) are not always emitted by the transpiler; declare those variables with `DATA` first.
  Inside methods they work. The app shows a hint when this happens.
- The TM tables are simplified: only a few fields each, no client (`MANDT`) field, and readable
  keys like `FO1` instead of RAW16 GUIDs. Field names follow the real tables but should be
  double-checked against an actual TM system before relying on them.
