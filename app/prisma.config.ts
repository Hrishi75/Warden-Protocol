/// <reference types="node" />
import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local automatically; the Prisma CLI does not.
// Load it here so `prisma migrate` / `generate` pick up DATABASE_URL from Neon.
for (const file of [".env.local", ".env"]) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] !== undefined) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://sentinel:sentinel_dev@localhost:5433/sentinel_protocol",
  },
});
