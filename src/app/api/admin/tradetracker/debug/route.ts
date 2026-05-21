import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { authenticateTT, getTTLocales } from "@/lib/tradetracker/client";

/**
 * Debug endpoint — shows raw SOAP response and parsed campaign count per locale.
 * Call GET /api/admin/tradetracker/debug to diagnose why campaigns are limited.
 */
export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const locales = getTTLocales();
  const results = [];

  for (const cfg of locales) {
    try {
      const session = await authenticateTT(cfg);
      const sites   = await session.getAffiliateSites();

      const siteDetails = [];
      for (const site of sites) {
        // Parse campaigns (our XML extractor)
        const campaigns = await session.getCampaigns(site.siteId);

        // Also try with limit in the filter
        const campaignsWithLimit = await session.getCampaignsWithLimit(site.siteId, 1000);

        siteDetails.push({
          siteId:              site.siteId,
          siteName:            site.name,
          parsedCount:         campaigns.length,
          parsedWithLimitCount: campaignsWithLimit.length,
          campaignNames:       campaigns.map((c) => `[${c.assignmentStatus}] ${c.name} (${c.campaignId})`),
        });
      }

      results.push({ locale: cfg.locale, siteCount: sites.length, sites: siteDetails });
    } catch (e) {
      results.push({ locale: cfg.locale, error: e instanceof Error ? e.message : "Unknown" });
    }
  }

  return NextResponse.json(results, { status: 200 });
}
