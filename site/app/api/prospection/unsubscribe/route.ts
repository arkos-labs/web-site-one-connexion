/**
 * app/api/prospection/unsubscribe/route.ts
 * Lien de désinscription présent dans chaque email de prospection.
 */
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase
    .from("prospects")
    .update({ sequence_status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(
    "<html><body style='font-family:sans-serif;text-align:center;padding:40px'><p>Vous avez été désinscrit avec succès.</p></body></html>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
