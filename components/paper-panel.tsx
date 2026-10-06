"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, Send, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Paper } from "@/lib/types";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function PaperPanel({
  paper,
  saved,
  onToggleSave,
  onClose,
}: {
  paper: Paper;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setError(null);
    setChat([]);
    post("/api/summarize", { title: paper.title, abstract: paper.abstract })
      .then((d) => !cancelled && setSummary(d.summary))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [paper.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const history = [...chat, { role: "user" as const, content: text }];
    setChat(history);
    setInput("");
    setSending(true);
    try {
      const d = await post("/api/chat", {
        title: paper.title,
        abstract: paper.abstract,
        history,
      });
      setChat([...history, { role: "assistant", content: d.reply }]);
    } catch (e) {
      setChat([...history, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div>
          <h2 className="font-semibold leading-snug">{paper.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{paper.authors.join(", ")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex gap-2 border-b p-3">
        <Button size="sm" variant={saved ? "secondary" : "default"} onClick={onToggleSave}>
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {saved ? "Saved" : "Save to reading list"}
        </Button>
        <a
          href={paper.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <ExternalLink className="size-4" /> PDF
        </a>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-4">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Plain-English summary
            </h3>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : summary === null ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{summary}</p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ask about this paper
            </h3>
            {chat.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ask a follow-up, e.g. “What method do they use?” Answers come from the abstract only.
              </p>
            )}
            <div className="space-y-3">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {sending && <Skeleton className="h-8 w-2/3" />}
              <div ref={endRef} />
            </div>
          </section>
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
        />
        <Button type="submit" size="icon" disabled={sending || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
