import { NextResponse } from "next/server";
import { requireAdmin } from "../require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-origin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ActionRow = {
  action_id: string;
  publisher_id: string | null;
  go_link_slug: string | null;
  sub_id3: string | null;
  payout: number | string | null;
  payout_currency: string | null;
  sale_amount: number | string | null;
  sale_currency: string | null;
};

type Agg = {
  txnCount: number;
  saleByCurrency: Record<string, number>;
  commissionByCurrency: Record<string, number>;
};

function emptyAgg(): Agg {
  return { txnCount: 0, saleByCurrency: {}, commissionByCurrency: {} };
}

function addToAgg(agg: Agg, row: ActionRow): void {
  agg.txnCount += 1;
  const sc = (row.sale_currency ?? "USD").toUpperCase();
  const pc = (row.payout_currency ?? "USD").toUpperCase();
  agg.saleByCurrency[sc] = (agg.saleByCurrency[sc] ?? 0) + Number(row.sale_amount ?? 0);
  agg.commissionByCurrency[pc] = (agg.commissionByCurrency[pc] ?? 0) + Number(row.payout ?? 0);
}

export async function GET(request: Request) {
  const err = requireAdmin(request);
  if (err) return err;

  const publisherId = new URL(request.url).searchParams.get("publisherId")?.trim() ?? "";
  if (!UUID_RE.test(publisherId)) {
    return NextResponse.json({ error: "Invalid publisherId" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const origin = getSiteOrigin();

  try {
    // 1. Load all go-links for this publisher
    const { data: linkRows, error: linkErr } = await supabase
      .from("publisher_go_links")
      .select("id, slug, target_url, deep_link, click_count, created_at, campaign_id")
      .eq("publisher_id", publisherId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (linkErr) {
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }

    const links = (linkRows ?? []) as {
      id: string;
      slug: string;
      target_url: string;
      deep_link: boolean;
      click_count: number | null;
      created_at: string;
      campaign_id: string | null;
    }[];

    // 2. Resolve campaign names from impact_campaigns
    const campaignIds = [...new Set(links.map((l) => l.campaign_id).filter(Boolean))] as string[];
    const campaignMap = new Map<string, string | null>();
    if (campaignIds.length > 0) {
      const { data: camps } = await supabase
        .from("impact_campaigns")
        .select("impact_id, name")
        .in("impact_id", campaignIds);
      for (const c of camps ?? []) {
        campaignMap.set(String(c.impact_id), c.name as string | null);
      }
    }

    // 3. For each slug, aggregate impact_actions
    const slugs = links.map((l) => l.slug);
    const linkedBySlug = new Map<string, Agg>();
    const otherBySlug  = new Map<string, Agg>();
    for (const s of slugs) {
      linkedBySlug.set(s, emptyAgg());
      otherBySlug.set(s, emptyAgg());
    }

    if (slugs.length > 0) {
      // Fetch all impact_actions matching any of these slugs
      const { data: actionRows } = await supabase
        .from("impact_actions")
        .select("action_id, publisher_id, go_link_slug, sub_id3, payout, payout_currency, sale_amount, sale_currency")
        .in("go_link_slug", slugs);

      const pubNorm = publisherId.trim().toLowerCase();

      for (const r of (actionRows ?? []) as ActionRow[]) {
        const key = r.go_link_slug ?? "";
        if (!key || !linkedBySlug.has(key)) continue;

        if (r.publisher_id && r.publisher_id.trim().toLowerCase() !== pubNorm) {
          addToAgg(otherBySlug.get(key) ?? emptyAgg(), r);
        } else {
          addToAgg(linkedBySlug.get(key)!, r);
        }
      }
    }

    const payload = links.map((l) => {
      const stats = linkedBySlug.get(l.slug) ?? emptyAgg();
      const other  = otherBySlug.get(l.slug)  ?? emptyAgg();
      return {
        id: l.id,
        slug: l.slug,
        shortUrl: `${origin}/go/short/${l.slug}`,
        clicks: Number(l.click_count ?? 0),
        brandName: l.campaign_id ? (campaignMap.get(l.campaign_id) ?? null) : null,
        stats: {
          txnCount: stats.txnCount,
          saleByCurrency: stats.saleByCurrency,
          commissionByCurrency: stats.commissionByCurrency,
          otherPublisherTxnCount: other.txnCount,
          otherPublisherSaleByCurrency: other.saleByCurrency,
          otherPublisherCommissionByCurrency: other.commissionByCurrency,
        },
      };
    });

    return NextResponse.json({ publisherId, links: payload });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
