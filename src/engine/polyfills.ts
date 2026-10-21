// The abaplint runtime uses Node's Buffer for hex/xstring handling; provide it in the browser.
// Imported before anything else in the worker.
import { Buffer } from "buffer";

(globalThis as any).Buffer ??= Buffer;
