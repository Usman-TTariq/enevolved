import type { PORMerchant, PORTransaction } from "./types";

const BASE = "http://affiliate.paidonresults.com/api";
const API_KEY   = process.env.PAIDONRESULTS_API_KEY   ?? "";
const AFFILIATE = process.env.PAIDONRESULTS_AFFILIATE_ID ?? "";

// ─── Tiny XML tag extractor ────────────────────────────────────────────────
function tagVal(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1]?.trim() ?? "";
}

function allBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi");
  return xml.match(re) ?? [];
}

// ─── Merchants ─────────────────────────────────────────────────────────────
export async function fetchMerchants(): Promise<PORMerchant[]> {
  const fields = [
    "MerchantID", "MerchantCaption", "MerchantCategory", "MerchantName",
    "MerchantURL", "Creative120x60", "AverageBasket", "VoidRate",
    "MerchantStatus", "AffiliateStatus", "ConversionRatio", "ApprovalRate",
    "CookieLength", "AffiliateURL", "SampleCommissionRates", "AverageCommission",
    "DeepLinks",
  ].join(",");

  const url =
    `${BASE}/merchant-directory?apikey=${API_KEY}&Format=XML&AffiliateID=${AFFILIATE}` +
    `&MerchantCategories=ALL&Fields=${fields}&JoinedMerchants=YES&MerchantsNotJoined=YES`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`POR merchants HTTP ${res.status}`);
  const xml = await res.text();

  return allBlocks(xml, "Merchants").map((block): PORMerchant => {
    const cookieRaw = tagVal(block, "CookieLength");
    const merchantId = tagVal(block, "MerchantID");
    const affiliateId = AFFILIATE;

    // Build tracking URL: http://www.paidonresults.net/c/{affiliateId}/1/{merchantId}/
    // Actual tracking with custom ID: /c/{affiliateId}/1/{merchantId}/{customId}
    const rawAffUrl = tagVal(block, "AffiliateURL");
    // Normalise to base (strip trailing custom id if present)
    const trackingBase = rawAffUrl
      ? rawAffUrl.replace(/\/\d+$/, "") // strip trailing number
      : `http://www.paidonresults.net/c/${affiliateId}/1/${merchantId}`;

    return {
      merchantId,
      name:              tagVal(block, "MerchantName"),
      url:               tagVal(block, "MerchantURL") || null,
      trackingUrl:       trackingBase || null,
      logoUrl:           tagVal(block, "Creative120x60") || null,
      category:          tagVal(block, "MerchantCategory") || null,
      description:       tagVal(block, "MerchantCaption") || null,
      commissionRate:    tagVal(block, "SampleCommissionRates") || null,
      averageCommission: tagVal(block, "AverageCommission") || null,
      averageBasket:     tagVal(block, "AverageBasket") || null,
      cookieLength:      cookieRaw && cookieRaw !== "NA" ? parseInt(cookieRaw) || null : null,
      deepLinks:         tagVal(block, "DeepLinks").toUpperCase() === "YES",
      merchantStatus:    tagVal(block, "MerchantStatus") || "LIVE",
      affiliateStatus:   tagVal(block, "AffiliateStatus") || null,
      conversionRatio:   tagVal(block, "ConversionRatio") || null,
      approvalRate:      tagVal(block, "ApprovalRate") || null,
      voidRate:          tagVal(block, "VoidRate") || null,
    };
  }).filter((m) => m.merchantId);
}

// ─── Transactions ───────────────────────────────────────────────────────────
export async function fetchTransactions(opts: {
  fromDate?: string;  // YYYY-MM-DD
  toDate?: string;
} = {}): Promise<PORTransaction[]> {

  const fields = [
    "NetworkOrderID", "MerchantID", "MerchantName", "ClickDate",
    "CustomTrackingID", "AffiliateCommission", "OrderNotes", "AffiliateID",
    "DateAdded", "HTTPReferal", "OrderDate", "OrderValue", "PaidtoAffiliate",
    "DateUpdated", "CreativeName", "TransactionType",
  ].join(",");

  let url =
    `${BASE}/transactions?apikey=${API_KEY}&Format=XML&AffiliateID=${AFFILIATE}` +
    `&Fields=${fields}&DateFormat=YYYY-MM-DD+HH:MN:SS` +
    `&GetNewSales=YES&GetChanges=YES&GetPaidTransactions=YES` +
    `&PendingSales=YES&ValidatedSales=YES&VoidSales=YES`;

  if (opts.fromDate) url += `&StartDate=${opts.fromDate}`;
  if (opts.toDate)   url += `&EndDate=${opts.toDate}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`POR transactions HTTP ${res.status}`);
  const xml = await res.text();

  return allBlocks(xml, "Transactions").map((block): PORTransaction => {
    const statusRaw = tagVal(block, "TransactionType");
    const paidRaw   = tagVal(block, "PaidtoAffiliate").toUpperCase();

    // Determine status from context — POR uses PendingSales/ValidatedSales flags
    // We'll normalise from the GetChanges flags or just keep as "pending" default
    const transactionStatus = paidRaw === "YES" ? "validated" : "pending";

    return {
      networkOrderId:    tagVal(block, "NetworkOrderID"),
      merchantId:        tagVal(block, "MerchantID") || null,
      merchantName:      tagVal(block, "MerchantName") || null,
      orderDate:         tagVal(block, "OrderDate") || null,
      dateAdded:         tagVal(block, "DateAdded") || null,
      dateUpdated:       tagVal(block, "DateUpdated") || null,
      orderValue:        parseFloat(tagVal(block, "OrderValue")) || 0,
      affiliateCommission: parseFloat(tagVal(block, "AffiliateCommission")) || 0,
      transactionType:   statusRaw || null,
      transactionStatus,
      paidToAffiliate:   paidRaw === "YES",
      customTrackingId:  tagVal(block, "CustomTrackingID") || null,
    };
  }).filter((t) => t.networkOrderId);
}

// ─── Build tracking URL for a go-link ──────────────────────────────────────
export function buildTrackingUrl(merchantId: string, slug: string, landingPage?: string): string {
  const base = `http://www.paidonresults.net/c/${AFFILIATE}/1/${merchantId}/${encodeURIComponent(slug)}`;
  if (landingPage?.startsWith("http")) {
    return `${base}?url=${encodeURIComponent(landingPage)}`;
  }
  return base;
}
