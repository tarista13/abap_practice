import { tmTables } from "../engine/tm-db";

/** Shows the mock TM database tables with their fields and rows. */
export function TableBrowser() {
  return (
    <div className="tables">
      <p className="muted small">
        Simplified versions of the SAP TM freight order tables. Every run starts with this data.
        Hover a column name for its meaning.
      </p>
      {tmTables.map(t => (
        <details key={t.name} open>
          <summary><code>{t.name}</code> <span className="muted">{t.text}</span></summary>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {t.fields.map(f => (
                    <th key={f.name} title={f.text} className={f.key ? "key" : undefined}>{f.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((v, j) => <td key={j} className={typeof v === "number" ? "num" : undefined}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  );
}
