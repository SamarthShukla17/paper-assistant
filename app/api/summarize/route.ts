import { NextResponse } from "next/server";
import { llmChat } from "@/lib/llm";

export async function POST(req: Request) {
  const { title, abstract } = await req.json();
  try {
    const summary = await llmChat([
      {
        role: "system",
        content:
          "You explain research papers in plain English for a smart non-expert. Use 3-4 short sentences: what problem it tackles, what they did, why it matters. No jargon without explanation.",
      },
      { role: "user", content: `Title: ${title}\n\nAbstract: ${abstract}` },
    ]);
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
