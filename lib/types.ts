export type Paper = {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  pdfUrl: string;
  published: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };
