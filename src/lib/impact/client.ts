import type { ImpactCampaign } from "./types";

const IMPACT_BASE = "https://api.impact.com";

function getConfig() {
  const accountSid = process.env.IMPACT_ACCOUNT_SID?.trim();
  const authToken = process.env.IMPACT_AUTH_TOKEN?.trim();
  return { accountSid, authToken };
}

export function isImpactConfigured(): boolean {
  const { accountSid, authToken } = getConfig();
  return Boolean(accountSid && authToken);
}

function basicAuthHeader(accountSid: string, authToken: string): string {
  return "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
}

/** Normalise Impact API list responses — single objects are wrapped in an array. */
function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val != null && typeof val === "object") return [val as T];
  return [];
}

/**
 * Fetch all joined campaigns (programmes) for the configured media partner.
 * Impact returns paginated results; we walk all pages.
 */
export async function fetchImpactCampaigns(): Promise<ImpactCampaign[]> {
  const { accountSid, authToken } = getConfig();
  if (!accountSid || !authToken) {
    throw new Error("Missing IMPACT_ACCOUNT_SID or IMPACT_AUTH_TOKEN");
  }

  const auth = basicAuthHeader(accountSid, authToken);
  const out: ImpactCampaign[] = [];
  const PAGE_SIZE = 1000;

  for (let page = 1; page <= 50; page++) {
    const url = new URL(`${IMPACT_BASE}/Mediapartners/${encodeURIComponent(accountSid)}/Campaigns`);
    url.searchParams.set("PageSize", String(PAGE_SIZE));
    url.searchParams.set("Page", String(page));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: auth,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Impact Campaigns API ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const batch = toArray<ImpactCampaign>(data["Campaigns"]);

    if (batch.length === 0) break;
    out.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return out;
}

export async function testImpactConnection(): Promise<
  { ok: true; campaignCount: number } | { ok: false; error: string }
> {
  try {
    if (!isImpactConfigured()) {
      return { ok: false, error: "IMPACT_ACCOUNT_SID or IMPACT_AUTH_TOKEN is not set" };
    }
    const campaigns = await fetchImpactCampaigns();
    return { ok: true, campaignCount: campaigns.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
