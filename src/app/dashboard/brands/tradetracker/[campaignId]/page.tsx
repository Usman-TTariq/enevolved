import type { Metadata } from "next";
import TradeTrackerBrandDetailContent from "./TradeTrackerBrandDetailContent";

export const metadata: Metadata = { title: "Brand Details | Earnytics" };
export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  return <TradeTrackerBrandDetailContent campaignId={campaignId} />;
}
