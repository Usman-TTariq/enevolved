export type PORMerchant = {
  merchantId: string;
  name: string;
  url: string | null;
  trackingUrl: string | null;      // AffiliateURL
  logoUrl: string | null;          // Creative120x60
  category: string | null;
  description: string | null;
  commissionRate: string | null;   // "10%"
  averageCommission: string | null;
  averageBasket: string | null;
  cookieLength: number | null;
  deepLinks: boolean;
  merchantStatus: string;
  affiliateStatus: string | null;  // JOINED | NOT JOINED | PENDING
  conversionRatio: string | null;
  approvalRate: string | null;
  voidRate: string | null;
};

export type PORTransaction = {
  networkOrderId: string;
  merchantId: string | null;
  merchantName: string | null;
  orderDate: string | null;
  dateAdded: string | null;
  dateUpdated: string | null;
  orderValue: number;
  affiliateCommission: number;
  transactionType: string | null;  // Sale | Lead
  transactionStatus: string;       // pending | validated | void
  paidToAffiliate: boolean;
  customTrackingId: string | null; // our go-link slug
};
