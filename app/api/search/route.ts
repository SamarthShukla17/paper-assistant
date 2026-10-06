import { NextResponse } from "next/server";
import { searchArxiv } from "@/lib/arxiv";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ papers: [] });
  try {
    return NextResponse.json({ papers: await searchArxiv(q) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
