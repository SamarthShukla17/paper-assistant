import { NextResponse } from "next/server";
import { llmChat } from "@/lib/llm";
import type { ChatMessage } from "@/lib/types";

export async function POST(req: Request) {
  const { title, abstract, history } = (await req.json()) as {
    title: string;
    abstract: string;
    history: ChatMessage[];
  };
  try {
    const reply = await llmChat([
      {
        role: "system",
        content: `You answer questions about one research paper, using ONLY its abstract below. If the abstract doesn't contain the answer, say so briefly. Be concise.\n\nTitle: ${title}\n\nAbstract: ${abstract}`,
      },
      ...history.slice(-6),
    ]);
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
