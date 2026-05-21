/** TradeTracker locale + passphrase config */
export type TTLocaleConfig = {
  locale: string;
  passphrase: string;
  label: string;
  currency: string;
};

/** Parsed campaign from SOAP getCampaigns response */
export type TTCampaign = {
  campaignId: string;
  name: string;
  url: string | null;
  trackingUrl: string | null;
  logoUrl: string | null;
  assignmentStatus: string;
  commissionType: string | null;
  commissionPercentage: number | null;
  commissionFixedFee: number | null;
  currency: string;
  description: string | null;
  deepLinkingSupported: boolean;
  categoryId: string | null;
  categoryName: string | null;
  locale: string;
  raw: Record<string, unknown>;
};

/** Parsed conversion transaction from SOAP getConversionTransactions response */
export type TTTransaction = {
  transactionId: string;
  campaignId: string | null;
  campaignName: string | null;
  affiliateSiteId: string | null;
  reference: string | null;       // our go-link slug passed as ?r=<slug>
  transactionType: string | null; // sale | lead | click
  transactionStatus: string;      // pending | accepted | rejected
  commission: number;
  orderAmount: number | null;
  currency: string;
  registrationDate: string | null;
  locale: string;
  raw: Record<string, unknown>;
};

/** Affiliate site from SOAP getAffiliateSites response */
export type TTAffiliateSite = {
  siteId: string;
  name: string;
  url: string | null;
};
