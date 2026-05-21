import type { Metadata } from "next";
import PORBrandDetailContent from "./PORBrandDetailContent";

export const metadata: Metadata = { title: "Brand Details | Earnytics" };
export default async function Page({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  return <PORBrandDetailContent merchantId={merchantId} />;
}
