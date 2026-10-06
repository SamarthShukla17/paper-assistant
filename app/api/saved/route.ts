import { NextResponse } from "next/server";
import { addPaper, readList, removePaper } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ papers: await readList() });
}

export async function POST(req: Request) {
  return NextResponse.json({ papers: await addPaper(await req.json()) });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  return NextResponse.json({ papers: await removePaper(id) });
}
