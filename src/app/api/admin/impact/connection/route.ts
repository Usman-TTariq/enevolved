import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { isImpactConfigured, testImpactConnection } from "@/lib/impact/client";

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const configured = isImpactConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      ok: false,
      message: "Set IMPACT_ACCOUNT_SID and IMPACT_AUTH_TOKEN in your environment.",
    });
  }

  const result = await testImpactConnection();
  if (!result.ok) {
    return NextResponse.json({ configured: true, ok: false, message: result.error });
  }

  return NextResponse.json({
    configured: true,
    ok: true,
    campaignCount: result.campaignCount,
    message: `Connection successful. Found ${result.campaignCount} campaign(s) in your Impact account.`,
  });
}
