# Paper Assistant

A small web app for exploring research papers. Search arXiv by keyword, get a plain-English summary of any paper, ask follow-up questions about it, and save the ones you care about to a reading list.

Built with Next.js (App Router), TypeScript, Tailwind CSS and shadcn/ui. There is no database and no login: the reading list is a single JSON file, and the AI is Google Gemini through its free API tier.

## What it does

| Feature | How it works |
| --- | --- |
| **Search** | Your keywords go to the free public [arXiv API](https://info.arxiv.org/help/api/index.html) (no key needed). Results show title, authors, date, abstract and a PDF link. |
| **Summarize** | The paper's abstract is sent to Gemini with one prompt that asks for a short plain-English explanation. |
| **Chat** | Ask follow-up questions about the selected paper. Gemini sees only that paper's abstract plus the last 6 messages. No RAG, no vector database. |
| **Reading list** | Saved papers are written to `data/reading-list.json` on disk and survive restarts. |

The UI is a single page: search bar on top, results on the left, and a side panel on the right with the summary, chat and save button. On narrow screens the panel goes full-screen.

### Limitations (by design)

- **arXiv only.** It covers physics, maths, computer science, statistics and related fields, but not papers that only appear in journals.
- **Abstracts only.** Summaries and chat never see the full paper text, so details from the body of a paper can't be answered.
- **Keyword search.** Specific terms such as `retrieval augmented generation` work better than long questions.
- **Single user.** No authentication, and one shared reading list.

## Quick start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (check with `node -v`)
- A free Gemini API key (next step)

### 2. Get a free Gemini API key

1. Go to https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key** and copy it.

### 3. Install and configure

```bash
git clone https://github.com/SamarthShukla17/paper-assistant.git
cd paper-assistant
npm install
cp .env.local.example .env.local
```

Open `.env.local` and paste your key:

```
GEMINI_API_KEY=your_key_here
```

### 4. Run it

```bash
npm run dev
```

Open http://localhost:3000.

Search and the reading list work without a key. Summaries and chat need it.

## Try it: a 2-minute walkthrough

1. Type `retrieval augmented generation` in the search bar and press Enter. Skeleton cards show while results load.
2. Click the first result. The side panel opens and a plain-English summary appears after a few seconds.
3. In the chat box ask `What method do they use?`, then a follow-up like `Why does it matter?`.
4. Click **Save to reading list**. The button changes to **Saved** and the card gets a bookmark icon.
5. Open the **Reading list** tab to see it. Use **PDF** to open the original paper.

## Configuration

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | For summaries and chat | none | Your Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Override the model name |

Google retires models over time. If you see a `404 ... no longer available` error, set `GEMINI_MODEL` to a current model listed at https://ai.google.dev/gemini-api/docs/models.

## Project structure

```
app/
  page.tsx               # the single page: search, results, reading list, panel
  layout.tsx
  api/
    search/route.ts      # GET  ?q=...   -> arXiv search
    summarize/route.ts   # POST          -> abstract -> summary
    chat/route.ts        # POST          -> abstract + last 6 messages -> reply
    saved/route.ts       # GET / POST / DELETE reading list
components/
  paper-card.tsx         # result card + loading skeleton
  paper-panel.tsx        # summary, chat, save button
  ui/                    # shadcn/ui primitives
lib/
  arxiv.ts               # arXiv Atom feed -> Paper objects
  llm.ts                 # Gemini call (plain fetch, retries on 429/503)
  store.ts               # reads/writes data/reading-list.json
  types.ts
data/reading-list.json   # created on first save (git-ignored)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |

## Troubleshooting

- **"GEMINI_API_KEY is not set"**: create `.env.local` as in step 3, then restart `npm run dev`. Env files are only read at startup.
- **Gemini error 503 / "high demand"**: a temporary overload on Google's side. The app retries a few times; if it still fails, click the paper again.
- **Gemini error 404 about the model**: set `GEMINI_MODEL` as described above.
- **Gemini error 429**: you hit the free-tier rate limit. Wait a minute.
- **Port 3000 in use**: stop the other process, or run `npm run dev -- -p 3001`.
- **No search results**: try broader or different keywords. arXiv may also rate-limit rapid repeated requests.
- **Reset the reading list**: delete `data/reading-list.json`.

## Security notes

- `.env.local` is git-ignored. Never commit your API key.
- The reading list file is stored locally and is not encrypted.
- This is a demo, not production software: no auth, no rate limiting on its own API routes. Don't deploy it publicly with your key attached.

## Out of scope

Authentication, PDF text extraction, vector search or embeddings, multi-user support, deployment configs and tests.
