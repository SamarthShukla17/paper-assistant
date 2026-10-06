"use client";
import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperCard, PaperCardSkeleton } from "@/components/paper-card";
import { PaperPanel } from "@/components/paper-panel";
import type { Paper } from "@/lib/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Paper[] | null>(null);
  const [saved, setSaved] = useState<Paper[]>([]);
  const [tab, setTab] = useState<"results" | "saved">("results");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Paper | null>(null);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((d) => setSaved(d.papers));
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setTab("results");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Search failed");
      setResults(d.papers);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSave(p: Paper) {
    const isSaved = saved.some((s) => s.id === p.id);
    const res = isSaved
      ? await fetch(`/api/saved?id=${encodeURIComponent(p.id)}`, { method: "DELETE" })
      : await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
    setSaved((await res.json()).papers);
  }

  const list = tab === "results" ? results : saved;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-semibold">
            <BookOpen className="size-5" /> Paper Assistant
          </div>
          <form onSubmit={search} className="flex flex-1 gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search arXiv — e.g. retrieval augmented generation"
            />
            <Button type="submit" disabled={loading}>
              <Search className="size-4" /> Search
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1">
        <div className="flex min-h-0 flex-1 flex-col border-r">
          <div className="flex gap-1 p-3">
            <Button size="sm" variant={tab === "results" ? "secondary" : "ghost"} onClick={() => setTab("results")}>
              Results
            </Button>
            <Button size="sm" variant={tab === "saved" ? "secondary" : "ghost"} onClick={() => setTab("saved")}>
              Reading list ({saved.length})
            </Button>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 p-3 pt-0">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <PaperCardSkeleton key={i} />)
              ) : error ? (
                <p className="p-6 text-center text-sm text-destructive">{error}</p>
              ) : list === null ? (
                <Empty title="Search for a topic" body="Find papers on arXiv, get a plain-English summary, and ask questions." />
              ) : list.length === 0 ? (
                <Empty
                  title={tab === "saved" ? "Nothing saved yet" : "No papers found"}
                  body={tab === "saved" ? "Open a paper and hit “Save to reading list”." : "Try different keywords."}
                />
              ) : (
                list.map((p) => (
                  <PaperCard
                    key={p.id}
                    paper={p}
                    selected={selected?.id === p.id}
                    saved={saved.some((s) => s.id === p.id)}
                    onSelect={() => setSelected(p)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {selected ? (
          <aside className="fixed inset-0 z-10 md:static md:w-[440px] md:shrink-0">
            <PaperPanel
              paper={selected}
              saved={saved.some((s) => s.id === selected.id)}
              onToggleSave={() => toggleSave(selected)}
              onClose={() => setSelected(null)}
            />
          </aside>
        ) : (
          <aside className="hidden w-[440px] shrink-0 items-center justify-center p-8 text-center text-sm text-muted-foreground md:flex">
            Select a paper to see its summary and chat about it.
          </aside>
        )}
      </div>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-10 text-center">
      <BookOpen className="mb-2 size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
