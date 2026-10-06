import { promises as fs } from "fs";
import path from "path";
import type { Paper } from "./types";

const FILE = path.join(process.cwd(), "data", "reading-list.json");

export async function readList(): Promise<Paper[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function write(list: Paper[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2));
}

export async function addPaper(p: Paper) {
  const list = await readList();
  if (!list.some((x) => x.id === p.id)) list.unshift(p);
  await write(list);
  return list;
}

export async function removePaper(id: string) {
  const list = (await readList()).filter((x) => x.id !== id);
  await write(list);
  return list;
}
