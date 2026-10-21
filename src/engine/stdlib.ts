import type { IFile } from "./engine";

// Minimal stand-ins for SAP standard classes (exceptions, ABAP Unit asserts) the runtime needs.
const sources = import.meta.glob<string>("./stdlib/*.abap", { query: "?raw", import: "default", eager: true });

export const stdlib: IFile[] = Object.entries(sources).map(([path, contents]) => ({
  filename: path.split("/").pop()!,
  contents,
}));
