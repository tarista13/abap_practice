// Simplified SAP TM freight order tables (TOR = Transportation Order) with sample data.
// The table and field names follow the real /SCMTMS/ tables, but only a small subset of
// fields is modelled and keys are readable strings instead of RAW16 GUIDs.
import type { IFile } from "./engine";

interface Field {
  name: string;
  /** ABAP Dictionary data type, e.g. CHAR, QUAN, UNIT, INT4 */
  type: string;
  length?: number;
  decimals?: number;
  key?: boolean;
  text: string;
}

export interface TableDef {
  name: string;
  text: string;
  fields: Field[];
  rows: (string | number)[][];
}

const key = (name: string, text: string): Field => ({ name, type: "CHAR", length: 32, key: true, text });
const parent = (text: string): Field => ({ name: "PARENT_KEY", type: "CHAR", length: 32, text });
const weight: Field[] = [
  { name: "GRO_WEI_VAL", type: "QUAN", length: 15, decimals: 3, text: "Gross weight" },
  { name: "GRO_WEI_UNI", type: "UNIT", length: 3, text: "Gross weight unit" },
];

export const tmTables: TableDef[] = [
  {
    name: "/SCMTMS/D_TORROT",
    text: "Freight order / booking header (root node)",
    fields: [
      key("DB_KEY", "Node key"),
      { name: "TOR_ID", type: "CHAR", length: 20, text: "Document number" },
      { name: "TOR_CAT", type: "CHAR", length: 2, text: "Category: TO = freight order, BO = freight booking" },
      { name: "TOR_TYPE", type: "CHAR", length: 4, text: "Document type" },
      { name: "LIFECYCLE", type: "CHAR", length: 2, text: "Status: 01 New, 02 In process, 05 Completed, 10 Canceled" },
      { name: "TSPID", type: "CHAR", length: 10, text: "Carrier (business partner)" },
      { name: "MOT", type: "CHAR", length: 2, text: "Mode of transport: 01 Road, 03 Sea" },
      ...weight,
    ],
    rows: [
      ["FO1", "6100000101", "TO", "ZFOR", "02", "CARRIER_A", "01", 1450.5, "KG"],
      ["FO2", "6100000102", "TO", "ZFOR", "01", "CARRIER_A", "01", 820, "KG"],
      ["FO3", "6100000103", "TO", "ZFOR", "10", "CARRIER_A", "01", 300, "KG"],
      ["FO4", "6100000104", "TO", "ZFOR", "05", "CARRIER_B", "01", 2210, "KG"],
      ["FO5", "6100000105", "TO", "ZFOR", "02", "CARRIER_B", "01", 640, "KG"],
      ["BO1", "6200000201", "BO", "ZFBO", "02", "CARRIER_C", "03", 18000, "KG"],
    ],
  },
  {
    name: "/SCMTMS/D_TORITE",
    text: "Freight order items",
    fields: [
      key("DB_KEY", "Node key"),
      parent("Key of the freight order (/SCMTMS/D_TORROT-DB_KEY)"),
      { name: "ITEM_ID", type: "CHAR", length: 10, text: "Item number" },
      { name: "ITEM_CAT", type: "CHAR", length: 3, text: "Category: PRD product, PKG package, AVR vehicle" },
      { name: "ITEM_DESCR", type: "CHAR", length: 40, text: "Description" },
      ...weight,
      { name: "QUA_PCS_VAL", type: "QUAN", length: 15, decimals: 3, text: "Quantity" },
      { name: "QUA_PCS_UNI", type: "UNIT", length: 3, text: "Quantity unit" },
    ],
    rows: [
      ["FO1-10", "FO1", "10", "AVR", "Truck 40t", 0, "KG", 1, "EA"],
      ["FO1-20", "FO1", "20", "PRD", "Office chairs", 950.5, "KG", 40, "EA"],
      ["FO1-30", "FO1", "30", "PRD", "Desks", 500, "KG", 10, "EA"],
      ["FO2-10", "FO2", "10", "PKG", "Pallet", 20, "KG", 1, "EA"],
      ["FO2-20", "FO2", "20", "PRD", "Filing cabinets", 1760, "LB", 8, "EA"],
      ["FO3-10", "FO3", "10", "PRD", "Lamps", 300, "KG", 60, "EA"],
      ["FO4-10", "FO4", "10", "PRD", "Conference tables", 2210, "KG", 12, "EA"],
      ["FO5-10", "FO5", "10", "PRD", "Monitor arms", 640, "KG", 200, "EA"],
      ["BO1-10", "BO1", "10", "PRD", "Container of seating", 18000, "KG", 1, "EA"],
    ],
  },
  {
    name: "/SCMTMS/D_TORSTP",
    text: "Freight order stops",
    fields: [
      key("DB_KEY", "Node key"),
      parent("Key of the freight order (/SCMTMS/D_TORROT-DB_KEY)"),
      { name: "SEQ_NUM", type: "INT4", length: 10, text: "Stop sequence" },
      { name: "STOP_CAT", type: "CHAR", length: 1, text: "O = outbound (loading), I = inbound (unloading)" },
      { name: "LOG_LOCID", type: "CHAR", length: 20, text: "Location" },
    ],
    rows: [
      ["FO1-S1", "FO1", 1, "O", "PLANT_GRR"],
      ["FO1-S2", "FO1", 2, "I", "HUB_DTW"],
      ["FO1-S3", "FO1", 3, "I", "DC_CHI"],
      ["FO2-S1", "FO2", 1, "O", "PLANT_GRR"],
      ["FO2-S2", "FO2", 2, "I", "DC_ATL"],
      ["FO3-S1", "FO3", 1, "O", "PLANT_GRR"],
      ["FO3-S2", "FO3", 2, "I", "DC_CHI"],
      ["FO4-S1", "FO4", 1, "O", "PLANT_ATH"],
      ["FO4-S2", "FO4", 2, "I", "HUB_DTW"],
      ["FO4-S3", "FO4", 3, "I", "DC_CHI"],
      ["FO4-S4", "FO4", 4, "I", "DC_MSP"],
      ["FO5-S1", "FO5", 1, "O", "PLANT_ATH"],
      ["FO5-S2", "FO5", 2, "I", "DC_ATL"],
      ["BO1-S1", "BO1", 1, "O", "PORT_RTM"],
      ["BO1-S2", "BO1", 2, "I", "PORT_NYC"],
    ],
  },
];

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pad = (n: number) => String(n).padStart(6, "0");

/** abapGit-style TABL definitions so abaplint and the transpiler know the tables */
function toTablXml(t: TableDef): string {
  const fields = t.fields.map(f => `
    <DD03P>
     <FIELDNAME>${f.name}</FIELDNAME>${f.key ? "\n     <KEYFLAG>X</KEYFLAG>" : ""}
     <DATATYPE>${f.type}</DATATYPE>${f.length ? `\n     <LENG>${pad(f.length)}</LENG>` : ""}${f.decimals ? `\n     <DECIMALS>${pad(f.decimals)}</DECIMALS>` : ""}
     <DDTEXT>${escapeXml(f.text)}</DDTEXT>
    </DD03P>`).join("");
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>${t.name}</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <DDTEXT>${escapeXml(t.text)}</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
   </DD02V>
   <DD03P_TABLE>${fields}
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>
`;
}

// abapGit encodes "/" in object names as "#"
export const tmTableFiles: IFile[] = tmTables.map(t => ({
  filename: `${t.name.toLowerCase().replace(/\//g, "#")}.tabl.xml`,
  contents: toTablXml(t),
}));

const sqlValue = (v: string | number) => (typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`);

/** INSERT statements loading the sample rows */
export const tmSeedSql: string[] = tmTables.flatMap(t => t.rows.map(row =>
  `INSERT INTO "${t.name.toLowerCase()}" (${t.fields.map(f => `"${f.name.toLowerCase()}"`).join(", ")}) ` +
  `VALUES (${row.map(sqlValue).join(", ")});`));
