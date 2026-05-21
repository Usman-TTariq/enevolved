import type { ParsedImpactAction } from "./types";

const IMPACT_BASE = "https://api.impact.com";

let lastImpactCallMs = 0;
const MIN_INTERVAL_MS = 500;

async function paceImpactRequest(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastImpactCallMs;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastImpactCallMs = Date.now();
}

function getConfig() {
  const accountSid = process.env.IMPACT_ACCOUNT_SID?.trim();
  const authToken = process.env.IMPACT_AUTH_TOKEN?.trim();
  return { accountSid, authToken };
}

function basicAuthHeader(accountSid: string, authToken: string): string {
  return "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
}

function formatImpactDate(d: Date): string {
  // Impact API requires full ISO 8601 with explicit UTC offset e.g. 2024-01-01T00:00:00+0000
  return d.toISOString().slice(0, 19) + "+0000";
}

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val != null && typeof val === "object") return [val as T];
  return [];
}

function numStr(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function str(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

const MAX_PAGE_SIZE = 1000;
// Impact API allows max 45 days per request — use 40 to stay safely under
const MAX_CHUNK_DAYS = 40;

export type ImpactActionPair = { raw: unknown; parsed: ParsedImpactAction };

/** Fetch a single ≤40-day window with pagination */
async function fetchChunk(
  accountSid: string,
  auth: string,
  chunkStart: Date,
  chunkEnd: Date
): Promise<ImpactActionPair[]> {
  const out: ImpactActionPair[] = [];

  for (let page = 1; page <= 200; page++) {
    const url = new URL(
      `${IMPACT_BASE}/Mediapartners/${encodeURIComponent(accountSid)}/Actions`
    );
    url.searchParams.set("ActionDateStart", formatImpactDate(chunkStart));
    url.searchParams.set("ActionDateEnd", formatImpactDate(chunkEnd));
    url.searchParams.set("PageSize", String(MAX_PAGE_SIZE));
    url.searchParams.set("Page", String(page));

    await paceImpactRequest();

    let res: Response | null = null;
    for (let attempt = 0; attempt <= 3; attempt++) {
      res = await fetch(url.toString(), {
        headers: { Authorization: auth, Accept: "application/json" },
        cache: "no-store",
      });
      if (res.status !== 429) break;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 60_000));
    }

    if (!res || !res.ok) {
      const text = await (res?.text() ?? Promise.resolve("")).catch(() => "");
      throw new Error(`Impact Actions API ${res?.status ?? "no-response"}: ${text.slice(0, 400)}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const actionsWrapper = data["Actions"] as Record<string, unknown> | undefined;
    const batch = toArray<Record<string, unknown>>(actionsWrapper?.["Action"]);

    if (batch.length === 0) break;

    for (const row of batch) {
      const parsed = parseImpactActionRow(row);
      if (parsed) out.push({ raw: row, parsed });
    }

    if (batch.length < MAX_PAGE_SIZE) break;
  }

  return out;
}

/**
 * Fetch Impact Actions for a date window.
 * Automatically splits ranges > 40 days into chunks (API max = 45 days).
 */
export async function fetchImpactActionsRange(options: {
  startDate: Date;
  endDate: Date;
}): Promise<ImpactActionPair[]> {
  const { accountSid, authToken } = getConfig();
  if (!accountSid || !authToken) {
    throw new Error("Missing IMPACT_ACCOUNT_SID or IMPACT_AUTH_TOKEN");
  }

  const auth = basicAuthHeader(accountSid, authToken);
  const chunkMs = MAX_CHUNK_DAYS * 24 * 60 * 60 * 1000;
  const out: ImpactActionPair[] = [];

  let cursor = new Date(options.startDate.getTime());
  const finalEnd = options.endDate;

  while (cursor < finalEnd) {
    const chunkEnd = new Date(Math.min(cursor.getTime() + chunkMs - 1, finalEnd.getTime()));
    const chunk = await fetchChunk(accountSid, auth, cursor, chunkEnd);
    out.push(...chunk);
    // advance to next day after chunkEnd
    cursor = new Date(chunkEnd.getTime() + 1);
  }

  return out;
}

export function parseImpactActionRow(row: unknown): ParsedImpactAction | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;

  const idRaw = r["Id"] ?? r["ActionId"] ?? r["id"];
  const actionId = typeof idRaw === "string" ? idRaw.trim() : typeof idRaw === "number" ? String(idRaw) : null;
  if (!actionId) return null;

  const campaignId = str(r["CampaignId"] ?? r["Campaign_Id"] ?? r["campaign_id"]);
  const orderId = str(r["Oid"] ?? r["OrderId"] ?? r["order_id"]);
  const actionStatus = str(r["ActionStatus"] ?? r["action_status"]);

  const payout = numStr(r["Payout"] ?? r["payout"]);
  const payoutCurrency = str(r["Currency"] ?? r["currency"]) ?? "USD";

  const saleAmount = numStr(r["Amount"] ?? r["SaleAmount"] ?? r["sale_amount"] ?? r["amount"]);
  const saleCurrency = str(r["Currency"] ?? r["currency"]) ?? "USD";

  const dateRaw = r["ActionDate"] ?? r["action_date"] ?? r["Date"];
  const actionDate =
    typeof dateRaw === "string" && dateRaw.trim()
      ? dateRaw.trim().includes("Z") || dateRaw.trim().includes("+")
        ? dateRaw.trim()
        : dateRaw.trim() + "Z"
      : new Date().toISOString();

  const subId3 = str(r["SubId3"] ?? r["sub_id3"] ?? r["subId3"]);

  return {
    actionId,
    campaignId,
    orderId,
    actionStatus,
    payout,
    payoutCurrency,
    saleAmount,
    saleCurrency,
    actionDate,
    subId3,
  };
}
