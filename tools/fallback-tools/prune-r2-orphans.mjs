#!/usr/bin/env node
/**
 * Deletes orphaned objects from the R2 fallback bucket, with a mandatory local
 * backup first.
 *
 * The only orphan today is `bones/silence/`. The oracle-bones engine used to
 * emit a fifth "silence" verdict; it was removed and its 15% weight
 * redistributed across the four survivors (see
 * packages/oracle-bones-engine/src/engine.ts). OracleBonesVerdict now has
 * exactly four members and image-provider.ts maps only those four to bucket
 * folders, so nothing can ever serve a silence image again.
 *
 * SAFETY, in order:
 *   1. Only prefixes on the ALLOWED list below can be targeted. Anything else
 *      is refused outright, so a typo cannot wipe live hexagram art.
 *   2. Every object is DOWNLOADED to a local backup directory before any
 *      deletion, and the backup is verified byte-for-byte by size.
 *   3. Dry-run is the DEFAULT. Deletion needs --commit explicitly.
 *   4. Objects are listed from the bucket itself, never guessed.
 *
 * Usage:
 *   node --env-file=.env tools/fallback-tools/prune-r2-orphans.mjs            # dry run
 *   node --env-file=.env tools/fallback-tools/prune-r2-orphans.mjs --commit   # really delete
 *
 * Needs the S3-API credentials (R2_ACCOUNT_ID / R2_BUCKET / R2_ACCESS_KEY_ID /
 * R2_SECRET_ACCESS_KEY) from the repo-root .env, not the public URL.
 */
import { mkdir, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectsCommand } =
  require("@aws-sdk/client-s3");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

/** Nothing outside this list can be deleted, whatever is passed on the CLI. */
const ALLOWED_PREFIXES = ["bones/silence/"];

const COMMIT = process.argv.includes("--commit");
const prefixArg = process.argv.find((a) => a.startsWith("--prefix="))?.split("=")[1];
const PREFIX = prefixArg ?? ALLOWED_PREFIXES[0];

if (!ALLOWED_PREFIXES.includes(PREFIX)) {
  console.error(`REFUSED: "${PREFIX}" is not an allowed prefix.`);
  console.error(`Allowed: ${ALLOWED_PREFIXES.join(", ")}`);
  process.exit(1);
}

for (const k of ["R2_ACCOUNT_ID", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]) {
  if (!process.env[k]?.trim()) {
    console.error(`Missing ${k}. Run with --env-file=.env (repo root).`);
    process.exit(1);
  }
}

const BUCKET = process.env.R2_BUCKET.trim();
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
});

async function listAll(prefix) {
  const out = [];
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }),
    );
    for (const o of res.Contents ?? []) out.push({ key: o.Key, size: o.Size });
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return out;
}

async function backup(objects, dir) {
  await mkdir(dir, { recursive: true });
  let bytes = 0;
  for (const o of objects) {
    const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: o.key }));
    const buf = Buffer.from(await res.Body.transformToByteArray());
    if (buf.length !== o.size) {
      throw new Error(`backup size mismatch for ${o.key}: got ${buf.length}, expected ${o.size}`);
    }
    const dest = path.join(dir, o.key.replace(/[/\\]/g, "__"));
    await writeFile(dest, buf);
    bytes += buf.length;
  }
  // Re-verify from disk: the backup must be complete before anything is deleted.
  const files = await readdir(dir);
  if (files.length !== objects.length) {
    throw new Error(`backup incomplete: ${files.length} files on disk vs ${objects.length} objects`);
  }
  let onDisk = 0;
  for (const f of files) onDisk += (await stat(path.join(dir, f))).size;
  if (onDisk !== bytes) throw new Error("backup byte total mismatch after re-read");
  return { count: files.length, bytes };
}

const objects = await listAll(PREFIX);
console.log(`Bucket: ${BUCKET}`);
console.log(`Prefix: ${PREFIX}`);
console.log(`Objetos encontrados: ${objects.length}`);
if (!objects.length) {
  console.log("Nada que borrar.");
  process.exit(0);
}
const totalBytes = objects.reduce((s, o) => s + o.size, 0);
console.log(`Tamano total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log("\nPrimeras claves:");
for (const o of objects.slice(0, 8)) console.log(`  ${o.key} (${o.size} B)`);
if (objects.length > 8) console.log(`  ... y ${objects.length - 8} mas`);

if (!COMMIT) {
  console.log("\nDRY RUN: no se borro nada. Repite con --commit para ejecutar.");
  process.exit(0);
}

const backupDir = path.join(repoRoot, "tools", "output", "r2-backup", PREFIX.replace(/[/\\]/g, "_"));
console.log(`\nRespaldando en ${path.relative(repoRoot, backupDir)} ...`);
const b = await backup(objects, backupDir);
console.log(`Respaldo verificado: ${b.count} archivos, ${(b.bytes / 1024 / 1024).toFixed(2)} MB`);

console.log("\nBorrando...");
for (let i = 0; i < objects.length; i += 1000) {
  const chunk = objects.slice(i, i + 1000);
  const res = await client.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: chunk.map((o) => ({ Key: o.key })), Quiet: false },
    }),
  );
  if (res.Errors?.length) {
    console.error("Errores al borrar:");
    for (const e of res.Errors) console.error(`  ${e.Key}: ${e.Message}`);
    process.exit(1);
  }
  console.log(`  borrados ${Math.min(i + 1000, objects.length)}/${objects.length}`);
}

const left = await listAll(PREFIX);
console.log(`\nVerificacion final: quedan ${left.length} objetos bajo ${PREFIX}`);
console.log(left.length === 0 ? "Limpieza OK." : "ATENCION: quedaron objetos.");
