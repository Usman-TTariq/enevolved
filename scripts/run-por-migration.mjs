/**
 * Run POR schema migration via Supabase Management API
 * Usage: node scripts/run-por-migration.mjs
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local manually
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx < 1) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const SUPABASE_URL      = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Extract project ref from URL
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

// Read migration SQL files
const porSchema     = readFileSync(join(__dirname, "..", "supabase", "migrations", "por_schema.sql"), "utf8");
const goLinksMig    = readFileSync(join(__dirname, "..", "supabase", "migrations", "20260521_go_links_multi_network.sql"), "utf8");

async function runSQL(sql, label) {
  console.log(`\n▶ Running: ${label}`);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    // Try alternative endpoint
    console.log(`  Management API failed (${res.status}), trying SQL via RPC…`);
    return null;
  }
  console.log(`  ✓ Done (HTTP ${res.status})`);
  return text;
}

async function runViaSupabase(sql, label) {
  console.log(`\n▶ Running via service role: ${label}`);
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Split into individual statements and run each
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let ok = 0, fail = 0;
  for (const stmt of statements) {
    const { error } = await supabase.rpc("exec_sql", { sql: stmt + ";" }).single();
    if (error) {
      // If exec_sql RPC doesn't exist, we need another approach
      console.log(`  ! ${error.message?.slice(0, 120)}`);
      fail++;
    } else {
      ok++;
    }
  }
  console.log(`  ${ok} ok, ${fail} failed`);
}

// First try Management API (needs personal access token, so likely fails with service_role)
// Then fall back to logging instructions
async function main() {
  console.log("PaidOnResults Migration Runner");
  console.log("================================");
  console.log(`Project: ${projectRef}`);

  const result1 = await runSQL(porSchema, "por_schema.sql");
  const result2 = await runSQL(goLinksMig, "20260521_go_links_multi_network.sql");

  if (result1 === null || result2 === null) {
    console.log("\n⚠  Management API requires a Personal Access Token (not service_role).");
    console.log("   Please run the migrations manually in the Supabase SQL Editor:");
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log("\n   Files to run (in order):");
    console.log("   1. supabase/migrations/por_schema.sql");
    console.log("   2. supabase/migrations/20260521_go_links_multi_network.sql");
  }
}

main().catch(console.error);
