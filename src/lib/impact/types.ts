/** Shape returned by GET /Mediapartners/{AccountSid}/Campaigns */
export type ImpactCampaign = {
  CampaignId: string;
  CampaignName: string;
  ContractStatus?: string;
  Currency?: string;
  AdvertiserName?: string;
  AdvertiserUrl?: string;
  TrackingLink?: string;
  CampaignLogoUri?: string;
  CampaignDescription?: string;
  CampaignUrl?: string;
  AllowsDeeplinking?: string;
  DeeplinkDomains?: string[];
};

/** Shape returned by GET /Mediapartners/{AccountSid}/Actions */
export type ImpactAction = {
  Id: string;
  CampaignId?: string;
  CampaignName?: string;
  ActionDate?: string;
  ActionStatus?: string;
  /** Publisher payout / commission */
  Payout?: string | number;
  Currency?: string;
  /** Sale amount (gross order value) */
  Amount?: string | number;
  SaleAmount?: string | number;
  Oid?: string;
  OrderId?: string;
  SubId1?: string;
  SubId2?: string;
  SubId3?: string;
  SubId4?: string;
  SubId5?: string;
};

/** Normalised row after parsing the Impact Actions API response */
export type ParsedImpactAction = {
  actionId: string;
  campaignId: string | null;
  orderId: string | null;
  actionStatus: string | null;
  payout: number;
  payoutCurrency: string;
  saleAmount: number;
  saleCurrency: string;
  actionDate: string;
  /** SubId3 from Impact — we pass our go-link slug here */
  subId3: string | null;
};
