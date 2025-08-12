import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export function readJson<T = any>(relativePath: string): T {
  const full = path.resolve(process.cwd(), relativePath);
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

export function readCsv(relativePath: string): any[] {
  const full = path.resolve(process.cwd(), relativePath);
  const content = fs.readFileSync(full, "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true });
}
