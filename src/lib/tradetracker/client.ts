/**
 * TradeTracker SOAP 1.1 RPC-encoded client.
 * No third-party dependencies — uses fetch + hand-rolled XML building/parsing.
 */
import type { TTAffiliateSite, TTCampaign, TTLocaleConfig, TTTransaction } from "./types";

const SOAP_ENDPOINT = "https://ws.tradetracker.com/soap/affiliate";
const TT_NS = "https://ws.tradetracker.com/soap/affiliate";
const CUSTOMER_ID = process.env.TRADETRACKER_CUSTOMER_ID ?? "";

export function getTTLocales(): TTLocaleConfig[] {
  const configs: TTLocaleConfig[] = [];
  if (process.env.TRADETRACKER_PASSPHRASE_NL) {
    configs.push({ locale: "nl_NL", passphrase: process.env.TRADETRACKER_PASSPHRASE_NL, label: "Netherlands", currency: "EUR" });
  }
  if (process.env.TRADETRACKER_PASSPHRASE_FR) {
    configs.push({ locale: "fr_FR", passphrase: process.env.TRADETRACKER_PASSPHRASE_FR, label: "France", currency: "EUR" });
  }
  if (process.env.TRADETRACKER_PASSPHRASE_UK) {
    configs.push({ locale: "en_GB", passphrase: process.env.TRADETRACKER_PASSPHRASE_UK, label: "United Kingdom", currency: "GBP" });
  }
  return configs;
}

export function isTTConfigured(): boolean {
  return Boolean(CUSTOMER_ID && getTTLocales().length > 0);
}

// ─── XML helpers ─────────────────────────────────────────────────────────────

function soapEnvelope(methodName: string, innerXml: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<SOAP-ENV:Envelope` +
    ` xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"` +
    ` xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"` +
    ` xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` +
    ` xmlns:xsd="http://www.w3.org/2001/XMLSchema"` +
    ` xmlns:tns="${TT_NS}">` +
    `<SOAP-ENV:Body SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">` +
    `<tns:${methodName}>${innerXml}</tns:${methodName}>` +
    `</SOAP-ENV:Body></SOAP-ENV:Envelope>`
  );
}

/** Extract text content of the FIRST occurrence of <tagName ...>...</tagName> */
function tagValue(xml: string, tagName: string): string | null {
  const re = new RegExp(`<${tagName}(?:[^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const m = xml.match(re);
  if (!m) return null;
  return m[1].trim().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}

/** Same as tagValue but returns null when the tag is xsi:nil="true" (empty SOAP field) */
function tagValueNonNil(xml: string, tagName: string): string | null {
  // Self-closing nil: <tagName xsi:nil="true"/> → skip
  const nilRe = new RegExp(`<${tagName}[^>]*xsi:nil\\s*=\\s*["']true["'][^>]*/?>`, "i");
  if (nilRe.test(xml)) return null;
  return tagValue(xml, tagName);
}

/** Extract all top-level <item> blocks (handles nesting) */
function extractItems(xml: string): string[] {
  const items: string[] = [];
  let pos = 0;
  while (pos < xml.length) {
    const start = xml.indexOf("<item", pos);
    if (start === -1) break;

    // Find the end of the opening tag
    const openEnd = xml.indexOf(">", start);
    if (openEnd === -1) break;

    // Self-closing <item ... />
    if (xml[openEnd - 1] === "/") {
      items.push(xml.slice(start, openEnd + 1));
      pos = openEnd + 1;
      continue;
    }

    // Scan from AFTER the opening <item> tag.
    // depth=0 means we are directly inside <item>; the first closing tag at depth 0
    // is the matching </item>.
    let depth = 0;
    let i = openEnd + 1;
    let found = false;

    while (i < xml.length) {
      const lt = xml.indexOf("<", i);
      if (lt === -1) break;
      const gt = xml.indexOf(">", lt);
      if (gt === -1) break;
      const tag = xml.slice(lt, gt + 1);

      if (tag.startsWith("</")) {
        if (depth === 0) {
          // This is the matching </item>
          items.push(xml.slice(start, gt + 1));
          pos = gt + 1;
          found = true;
          break;
        }
        depth--;
      } else if (!tag.endsWith("/>")) {
        // Regular open tag (not self-closing)
        depth++;
      }
      i = gt + 1;
    }
    if (!found) break;
  }
  return items;
}

/** Extract a named child block from XML fragment (first match, returns inner content) */
function childBlock(xml: string, tagName: string): string | null {
  const startTag = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, "i");
  const m = xml.match(startTag);
  if (!m || m.index === undefined) return null;
  const bodyStart = m.index + m[0].length;
  const endTag = `</${tagName}>`;
  const endIdx = xml.indexOf(endTag, bodyStart);
  if (endIdx === -1) return null;
  return xml.slice(bodyStart, endIdx);
}

// ─── Session-aware SOAP calls ─────────────────────────────────────────────────

export class TTSession {
  private cookie: string;
  private locale: string;

  constructor(cookie: string, locale: string) {
    this.cookie = cookie;
    this.locale = locale;
  }

  private async call(methodName: string, bodyXml: string): Promise<string> {
    const body = soapEnvelope(methodName, bodyXml);
    const res = await fetch(SOAP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": `"${TT_NS}/${methodName}"`,
        "Cookie": this.cookie,
      },
      body,
      // Prevent Next.js caching
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`TradeTracker SOAP ${methodName} ${res.status}: ${text.slice(0, 400)}`);
    }
    return res.text();
  }

  async getAffiliateSites(): Promise<TTAffiliateSite[]> {
    const xml = await this.call(
      "getAffiliateSites",
      `<options xsi:type="tns:AffiliateSiteFilter"></options>`
    );
    const items = extractItems(xml);
    return items.map((item) => ({
      siteId: tagValue(item, "ID") ?? "",
      name: tagValue(item, "name") ?? "",
      url: tagValue(item, "URL"),
    })).filter((s) => s.siteId);
  }

  /** Expose raw XML for debugging */
  async getRawXml(method: string, bodyXml: string): Promise<string> {
    return this.call(method, bodyXml);
  }

  private parseCampaignItems(xml: string, locale: string): TTCampaign[] {
    const items = extractItems(xml);
    return items.map((item): TTCampaign => {
      const infoBlock  = childBlock(item, "info") ?? "";
      // category is inside info block (confirmed from SOAP response)
      const catBlock   = childBlock(infoBlock, "category") ?? "";
      const id         = tagValue(item, "ID") ?? "";
      const trackingUrl = tagValue(infoBlock, "trackingURL");
      const deeplink   = tagValue(infoBlock, "deeplinkingSupported");
      const desc       = tagValue(infoBlock, "campaignDescription") ?? tagValue(infoBlock, "shopDescription");
      // category name: must skip the first <name> in item (campaign name) and find the one inside category
      const catId      = tagValue(catBlock, "ID");
      const catName    = catBlock ? tagValue(catBlock, "name") : null;

      // Commission: search directly in full item XML to avoid nesting issues.
      // TradeTracker CampaignCommission WSDL fields:
      const saleVariable = tagValueNonNil(item, "saleCommissionVariable");  // % of sale
      const saleFixed    = tagValueNonNil(item, "saleCommissionFixed");      // fixed per sale
      const leadComm     = tagValueNonNil(item, "leadCommission");           // per lead
      const clickComm    = tagValueNonNil(item, "clickCommission");          // per click
      const fixedComm    = tagValueNonNil(item, "fixedCommission");          // general fixed

      // Determine commission type and value
      let commissionType: string | null = null;
      let commissionPercentage: number | null = null;
      let commissionFixedFee: number | null = null;

      const pf = (v: string | null) => (v ? parseFloat(v) : 0);
      if (pf(saleVariable) > 0) {
        commissionType = "percentage";
        commissionPercentage = pf(saleVariable);
      } else if (pf(saleFixed) > 0) {
        commissionType = "fixed";
        commissionFixedFee = pf(saleFixed);
      } else if (pf(leadComm) > 0) {
        commissionType = "lead";
        commissionFixedFee = pf(leadComm);
      } else if (pf(clickComm) > 0) {
        commissionType = "click";
        commissionFixedFee = pf(clickComm);
      } else if (pf(fixedComm) > 0) {
        commissionType = "fixed";
        commissionFixedFee = pf(fixedComm);
      }

      return {
        campaignId: id,
        name: tagValue(item, "name") ?? `Campaign ${id}`,
        url: tagValue(item, "URL"),
        trackingUrl,
        logoUrl: tagValue(infoBlock, "imageURL"),
        assignmentStatus: tagValue(infoBlock, "assignmentStatus") ?? "accepted",
        commissionType,
        commissionPercentage,
        commissionFixedFee,
        currency: "EUR",
        description: desc ? desc.slice(0, 400) : null,
        deepLinkingSupported: deeplink === "1" || deeplink === "true",
        categoryId:   catId   ?? null,
        categoryName: catName ?? null,
        locale,
        raw: { id, name: tagValue(item, "name"), url: tagValue(item, "URL"), trackingUrl, assignmentStatus: tagValue(infoBlock, "assignmentStatus"), categoryId: catId, categoryName: catName, saleVariable, saleFixed, leadComm },
      };
    }).filter((c) => c.campaignId);
  }

  async getCampaigns(affiliateSiteId: string): Promise<TTCampaign[]> {
    const xml = await this.call(
      "getCampaigns",
      `<affiliateSiteID xsi:type="xsd:nonNegativeInteger">${affiliateSiteId}</affiliateSiteID>` +
      `<options xsi:type="tns:CampaignFilter"/>`
    );
    return this.parseCampaignItems(xml, this.locale);
  }

  /** Same as getCampaigns but with explicit limit — for pagination debugging */
  async getCampaignsWithLimit(affiliateSiteId: string, limit: number, offset = 0): Promise<TTCampaign[]> {
    const xml = await this.call(
      "getCampaigns",
      `<affiliateSiteID xsi:type="xsd:nonNegativeInteger">${affiliateSiteId}</affiliateSiteID>` +
      `<options xsi:type="tns:CampaignFilter">` +
      `<limit xsi:type="xsd:nonNegativeInteger">${limit}</limit>` +
      `<offset xsi:type="xsd:nonNegativeInteger">${offset}</offset>` +
      `</options>`
    );
    return this.parseCampaignItems(xml, this.locale);
  }

  async getConversionTransactions(
    affiliateSiteId: string,
    opts: { dateFrom?: Date; dateTo?: Date; offset?: number; limit?: number }
  ): Promise<TTTransaction[]> {
    const { dateFrom, dateTo, offset = 0, limit = 500 } = opts;

    const filterParts = [
      `<limit xsi:type="xsd:nonNegativeInteger">${limit}</limit>`,
      `<offset xsi:type="xsd:nonNegativeInteger">${offset}</offset>`,
    ];
    if (dateFrom) {
      filterParts.push(`<registrationDateFrom xsi:type="xsd:dateTime">${dateFrom.toISOString().replace(".000Z", "+00:00")}</registrationDateFrom>`);
    }
    if (dateTo) {
      filterParts.push(`<registrationDateTo xsi:type="xsd:dateTime">${dateTo.toISOString().replace(".000Z", "+00:00")}</registrationDateTo>`);
    }

    const xml = await this.call(
      "getConversionTransactions",
      `<affiliateSiteID xsi:type="xsd:nonNegativeInteger">${affiliateSiteId}</affiliateSiteID>` +
      `<options xsi:type="tns:ConversionTransactionFilter">${filterParts.join("")}</options>`
    );

    const items = extractItems(xml);
    return items.map((item): TTTransaction => {
      const campaignBlock = childBlock(item, "campaign") ?? "";
      return {
        transactionId: tagValue(item, "ID") ?? "",
        campaignId: tagValue(campaignBlock, "ID"),
        campaignName: tagValue(campaignBlock, "name"),
        affiliateSiteId,
        reference: tagValue(item, "reference"),
        transactionType: tagValue(item, "transactionType"),
        transactionStatus: tagValue(item, "transactionStatus") ?? "pending",
        commission: parseFloat(tagValue(item, "commission") ?? "0") || 0,
        orderAmount: (() => { const v = tagValue(item, "orderAmount"); return v ? parseFloat(v) : null; })(),
        currency: tagValue(item, "currency") ?? "EUR",
        registrationDate: tagValue(item, "registrationDate"),
        locale: this.locale,
        raw: {
          id: tagValue(item, "ID"),
          campaignId: tagValue(campaignBlock, "ID"),
          reference: tagValue(item, "reference"),
          status: tagValue(item, "transactionStatus"),
          commission: tagValue(item, "commission"),
          orderAmount: tagValue(item, "orderAmount"),
          currency: tagValue(item, "currency"),
          registrationDate: tagValue(item, "registrationDate"),
        },
      };
    }).filter((t) => t.transactionId);
  }
}

/** Authenticate with a specific locale — returns a TTSession */
export async function authenticateTT(cfg: TTLocaleConfig): Promise<TTSession> {
  const body = soapEnvelope(
    "authenticate",
    `<customerID xsi:type="xsd:nonNegativeInteger">${CUSTOMER_ID}</customerID>` +
    `<passphrase xsi:type="xsd:normalizedString">${cfg.passphrase}</passphrase>` +
    `<sandbox xsi:type="xsd:boolean">false</sandbox>` +
    `<locale xsi:type="tns:Locale">${cfg.locale}</locale>` +
    `<demo xsi:type="xsd:boolean">false</demo>`
  );

  const res = await fetch(SOAP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": `"${TT_NS}/authenticate"`,
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`TradeTracker authenticate ${res.status}: ${text.slice(0, 400)}`);
  }

  // Extract PHPSESSID cookie
  const setCookie = res.headers.get("set-cookie") ?? res.headers.get("Set-Cookie") ?? "";
  if (!setCookie) {
    // Try to proceed anyway — some environments might handle sessions differently
    await res.text();
    return new TTSession("", cfg.locale);
  }
  const phpSessMatch = setCookie.match(/PHPSESSID=([^;]+)/i);
  const cookie = phpSessMatch ? `PHPSESSID=${phpSessMatch[1]}` : setCookie.split(";")[0] ?? "";
  await res.text();
  return new TTSession(cookie, cfg.locale);
}

/** Fetch all campaigns from all configured locales (with pagination) */
export async function fetchAllTTCampaigns(): Promise<TTCampaign[]> {
  const locales = getTTLocales();
  if (!locales.length) throw new Error("No TradeTracker credentials configured");

  const allCampaigns: TTCampaign[] = [];
  const seenIds = new Set<string>();
  const PAGE = 250; // max per request

  for (const cfg of locales) {
    try {
      const session = await authenticateTT(cfg);
      const sites = await session.getAffiliateSites();

      for (const site of sites) {
        try {
          let offset = 0;
          while (true) {
            const page = await session.getCampaignsWithLimit(site.siteId, PAGE, offset);
            for (const c of page) {
              if (!seenIds.has(c.campaignId)) {
                seenIds.add(c.campaignId);
                allCampaigns.push(c);
              }
            }
            if (page.length < PAGE) break; // last page
            offset += PAGE;
          }
        } catch {
          // skip individual site errors
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      throw new Error(`TradeTracker ${cfg.locale} auth/fetch failed: ${msg}`);
    }
  }

  return allCampaigns;
}

/** Test connection — returns status for each locale */
export async function testTTConnection(): Promise<
  Array<{ locale: string; label: string; ok: boolean; campaignCount?: number; siteCount?: number; error?: string }>
> {
  const locales = getTTLocales();
  if (!locales.length) {
    return [{ locale: "—", label: "No credentials", ok: false, error: "No TRADETRACKER_PASSPHRASE_* env vars set" }];
  }

  const results = [];
  for (const cfg of locales) {
    try {
      const session = await authenticateTT(cfg);
      const sites = await session.getAffiliateSites();
      let campaignCount = 0;
      for (const site of sites) {
        try {
          const camps = await session.getCampaigns(site.siteId);
          campaignCount += camps.length;
        } catch { /* skip */ }
      }
      results.push({ locale: cfg.locale, label: cfg.label, ok: true, campaignCount, siteCount: sites.length });
    } catch (e) {
      results.push({ locale: cfg.locale, label: cfg.label, ok: false, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }
  return results;
}
