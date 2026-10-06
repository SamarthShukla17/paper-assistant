"use client";
import { Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Paper } from "@/lib/types";

export function PaperCard({
  paper,
  selected,
  saved,
  onSelect,
}: {
  paper: Paper;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer gap-2 p-4 transition hover:shadow-md ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug">{paper.title}</h3>
        {saved && <Bookmark className="size-4 shrink-0 fill-current text-primary" />}
      </div>
      <p className="text-xs text-muted-foreground">
        {paper.authors.slice(0, 3).join(", ")}
        {paper.authors.length > 3 ? " et al." : ""} · {paper.published}
      </p>
      <p className="line-clamp-3 text-sm text-muted-foreground">{paper.abstract}</p>
    </Card>
  );
}

export function PaperCardSkeleton() {
  return (
    <Card className="gap-2 p-4">
      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-12 w-full animate-pulse rounded bg-muted" />
    </Card>
  );
}
