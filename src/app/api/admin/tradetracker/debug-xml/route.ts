import { NextResponse } from "next/server";
import { requireAdmin } from "../../require-admin";
import { authenticateTT, getTTLocales } from "@/lib/tradetracker/client";

/** Returns raw XML of the first campaign item — use to diagnose field names */
export async function GET(req: Request) {
  const err = requireAdmin(req);
  if (err) return err;

  const locales = getTTLocales();
  if (!locales.length) return NextResponse.json({ error: "No TT credentials" }, { status: 500 });

  try {
    const session = await authenticateTT(locales[0]);
    const sites   = await session.getAffiliateSites();
    if (!sites.length) return NextResponse.json({ error: "No affiliate sites" }, { status: 500 });

    // Fetch 10 campaigns and find first accepted one (has real commission data)
    const raw = await session.getRawXml(
      "getCampaigns",
      `<affiliateSiteID xsi:type="xsd:nonNegativeInteger">${sites[0].siteId}</affiliateSiteID>` +
      `<options xsi:type="tns:CampaignFilter"><limit xsi:type="xsd:nonNegativeInteger">50</limit></options>`
    );

    // Extract all <item> blocks, return the first accepted one (has commission data)
    let pos = 0, snippet = "";
    while (pos < raw.length) {
      const s = raw.indexOf("<item", pos);
      if (s === -1) break;
      const s2 = raw.indexOf("<item", s + 1);
      const block = s2 > -1 ? raw.slice(s, s2) : raw.slice(s, s + 6000);
      if (block.includes("accepted")) { snippet = block; break; }
      pos = s2 > -1 ? s2 : raw.length;
    }
    if (!snippet) snippet = raw.slice(raw.indexOf("<item"), raw.indexOf("<item") + 6000);

    return new Response(snippet, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown" }, { status: 500 });
  }
}
