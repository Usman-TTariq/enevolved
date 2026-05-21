import type { Metadata } from "next";
import ImpactBrandDetailContent from "./ImpactBrandDetailContent";

type Props = { params: Promise<{ campaignId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campaignId } = await params;
  return { title: `Campaign ${campaignId} | LinkHexa` };
}

export default async function Page({ params }: Props) {
  const { campaignId } = await params;
  return <ImpactBrandDetailContent campaignId={campaignId} />;
}
