import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireApprovedPublisher } from "@/lib/publisher-session";
import {
  fetchAwinProgrammes,
  fetchAwinProgrammeDetails,
  fetchAwinPromotions,
  isAwinConfigured,
} from "@/lib/awin/client";
import { collectMerchantHostsFromProgrammeDetails } from "@/lib/awin/merchant-landing-hosts";
import { presentAwinProgrammeDetails } from "@/lib/awin/present-programme-details";
import {
  buildAwinTermsSections,
  presentPromotionOffers,
  type PresentedPromotion,
} from "@/lib/awin/present-terms-creative";

type Params = { params: Promise<{ programmeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const pub = await requireApprovedPublisher();
  if (!pub.ok) {
    return NextResponse.json({ error: pub.message }, { status: pub.status });
  }

  const { programmeId: raw } = await params;
  const programmeId = Number(raw);
  if (!Number.isFinite(programmeId)) {
    return NextResponse.json({ error: "Invalid programme id" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: app } = await supabase
    .from("publisher_awin_applications")
    .select("status")
    .eq("publisher_id", pub.userId)
    .eq("programme_id", programmeId)
    .maybeSingle();

  let allowed = Boolean(app);
  if (!allowed) {
    try {
      const joined = await fetchAwinProgrammes({ relationship: "joined" });
      const ids = new Set(joined.map((p) => p.id));
      allowed = ids.has(programmeId);
    } catch {
      return NextResponse.json({ error: "Could not verify programme access with Awin." }, { status: 502 });
    }
  }

  if (!allowed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: row, error } = await supabase
    .from("awin_programmes")
    .select(
      "programme_id, name, display_url, logo_url, description, currency_code, programme_status, click_through_url, primary_region"
    )
    .eq("programme_id", programmeId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicationStatus = app?.status ?? "not_applied";

  let awinDetails = null;
  let awinTerms = null;
  let awinPromotions: PresentedPromotion[] = [];

  if (isAwinConfigured()) {
    const detailP = fetchAwinProgrammeDetails(programmeId, { relationship: "any" });
    const promoP = fetchAwinPromotions({ advertiserIds: [programmeId], pageSize: 50 });

    const [detailSettled, promoSettled] = await Promise.allSettled([detailP, promoP]);

    let detailsRaw = null;
    if (detailSettled.status === "fulfilled") {
      detailsRaw = detailSettled.value;
      awinDetails = presentAwinProgrammeDetails(detailsRaw, row.currency_code);
      const hosts = collectMerchantHostsFromProgrammeDetails(
        detailsRaw,
        row.display_url as string | null,
        row.click_through_url as string | null
      );
      if (hosts.length > 0) {
        await supabase.from("awin_programmes").update({ valid_domains: hosts }).eq("programme_id", programmeId);
      }
    }

    if (promoSettled.status === "fulfilled") {
      awinPromotions = presentPromotionOffers(promoSettled.value);
    }

    const detailsOk = detailSettled.status === "fulfilled";
    const promosOk = promoSettled.status === "fulfilled";

    awinTerms = buildAwinTermsSections(detailsRaw, awinPromotions);
    if (awinTerms.sections.length === 0 && (detailsOk || promosOk)) {
      awinTerms = {
        sections: [
          {
            id: "awin-terms-empty",
            title: "No separate terms text in API response",
            body:
              "Awin did not return offer-level terms, extra programme copy, or domain/tracking blocks for this programme in this call. Use the Overview tab for the programme description and the Creative tab for active promotions. Always confirm restrictions in your Awin publisher account.",
          },
        ],
      };
    } else if (awinTerms.sections.length === 0) {
      awinTerms = null;
    }
  }

  return NextResponse.json({
    brand: {
      programmeId: row.programme_id,
      name: row.name,
      displayUrl: row.display_url,
      logoUrl: row.logo_url,
      description: row.description,
      currencyCode: row.currency_code,
      programmeStatus: row.programme_status,
      clickThroughUrl: row.click_through_url,
      primaryRegion: row.primary_region,
      applicationStatus,
    },
    awinDetails,
    awinTerms,
    awinPromotions,
  });
}
