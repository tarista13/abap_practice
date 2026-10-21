import type { IFile, RunResult } from "./engine";

export interface RunRequest {
  id: number;
  userFiles: IFile[];
  testFiles: IFile[];
}

export interface RunResponse {
  id: number;
  result: RunResult;
}
