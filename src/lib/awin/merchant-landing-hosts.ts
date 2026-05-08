import type { AwinProgrammeDetails } from "./types";

/** Lowercase hostname without leading www. */
export function normalizeMerchantHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Accepts full URL, bare host, or validDomains-style string.
 */
export function hostnameFromAnyUrlOrHost(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  try {
    const u =
      t.startsWith("http://") || t.startsWith("https://") ? new URL(t) : new URL(`https://${t.split("/")[0]}`);
    return normalizeMerchantHost(u.hostname);
  } catch {
    return null;
  }
}

function addHost(set: Set<string>, raw: string | null | undefined): void {
  const h = hostnameFromAnyUrlOrHost(raw ?? undefined);
  if (h) set.add(h);
}

/** Hosts declared in Awin programmedetails (validDomains + programme URLs in that payload). */
export function hostsFromAwinProgrammeDetails(details: AwinProgrammeDetails | null | undefined): string[] {
  const out = new Set<string>();
  const info = details?.programmeInfo;
  addHost(out, info?.displayUrl);
  addHost(out, info?.clickThroughUrl);
  const vd = info?.validDomains;
  if (Array.isArray(vd)) {
    for (const d of vd) {
      if (d && typeof d === "object" && typeof d.domain === "string") {
        addHost(out, d.domain);
      }
    }
  }
  return [...out].sort();
}

/**
 * Full merge for cache: Awin details plus row URLs (list API may omit regional domains).
 */
export function collectMerchantHostsFromProgrammeDetails(
  details: AwinProgrammeDetails | null | undefined,
  displayUrl: string | null,
  clickThroughUrl: string | null
): string[] {
  const out = new Set(hostsFromAwinProgrammeDetails(details));
  addHost(out, displayUrl);
  addHost(out, clickThroughUrl);
  return [...out].sort();
}

/** Hosts from DB row (display, click-through, cached valid_domains). */
export function mergeProgrammeRowHosts(params: {
  displayUrl: string | null;
  clickThroughUrl: string | null;
  validDomains: string[] | null | undefined;
}): string[] {
  const out = new Set<string>();
  addHost(out, params.displayUrl);
  addHost(out, params.clickThroughUrl);
  if (Array.isArray(params.validDomains)) {
    for (const x of params.validDomains) {
      if (typeof x === "string" && x.trim()) addHost(out, x);
    }
  }
  return [...out].sort();
}

/** True if landing URL host equals or is a subdomain of an approved merchant host. */
export function landingHostMatchesApprovedHosts(landingUrl: string, approvedHosts: string[]): boolean {
  let landHost: string;
  try {
    landHost = normalizeMerchantHost(new URL(landingUrl).hostname);
  } catch {
    return false;
  }
  for (const h of approvedHosts) {
    if (!h) continue;
    if (landHost === h || landHost.endsWith(`.${h}`)) return true;
  }
  return false;
}
