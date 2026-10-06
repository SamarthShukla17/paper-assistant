import type { Paper } from "./types";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const tag = (xml: string, name: string) =>
  clean(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "");

export async function searchArxiv(query: string, max = 12): Promise<Paper[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
    query
  )}&start=0&max_results=${max}&sortBy=relevance`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`arXiv returned ${res.status}`);
  const xml = await res.text();

  return xml
    .split("<entry>")
    .slice(1)
    .map((entry) => {
      const idUrl = tag(entry, "id");
      const id = idUrl.split("/abs/")[1] ?? idUrl;
      const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) =>
        clean(m[1])
      );
      return {
        id,
        title: tag(entry, "title"),
        authors,
        abstract: tag(entry, "summary"),
        pdfUrl: `https://arxiv.org/pdf/${id}`,
        published: tag(entry, "published").slice(0, 10),
      };
    });
}
