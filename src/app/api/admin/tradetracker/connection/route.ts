import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { testTTConnection, isTTConfigured } from "@/lib/tradetracker/client";

export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  return NextResponse.json({
    configured: isTTConfigured(),
    customerId: process.env.TRADETRACKER_CUSTOMER_ID ? "set" : "missing",
    locales: {
      nl_NL: process.env.TRADETRACKER_PASSPHRASE_NL ? "set" : "missing",
      fr_FR: process.env.TRADETRACKER_PASSPHRASE_FR ? "set" : "missing",
      en_GB: process.env.TRADETRACKER_PASSPHRASE_UK ? "set" : "missing",
    },
  });
}

export async function POST(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  try {
    const results = await testTTConnection();
    return NextResponse.json({ ok: results.every((r) => r.ok), results });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Test failed" }, { status: 500 });
  }
}
