import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug || slug.length < 6 || slug.length > 32) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("publisher_go_links")
    .select("target_url, campaign_id, deep_link")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data?.target_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let redirectUrl = data.target_url.trim();
  // campaign_id is set for Impact links — target_url already has SubId1=slug embedded.
  // No URL mutation needed — just increment click count and redirect.

  const { error: incErr } = await supabase.rpc("increment_publisher_go_link_click", { p_slug: slug });
  void incErr;

  return NextResponse.redirect(redirectUrl, 302);
}
