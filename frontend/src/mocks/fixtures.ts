import type { PdfDocument, Session, Message } from "@/types/api";
export const documents: PdfDocument[] = [
  [
    "Annual Report 2023.pdf",
    "Company Financial Report",
    56,
    12,
    "2024-03-15",
    "pink",
  ],
  [
    "Annual Report 2022.pdf",
    "Financial Performance",
    48,
    8,
    "2024-02-10",
    "mint",
  ],
  [
    "Financial Analysis.pdf",
    "Q3 Analysis and Insights",
    32,
    15,
    "2024-01-28",
    "purple",
  ],
  ["Market Research.pdf", "Industry Trends 2024", 24, 4, "2024-01-20", "blue"],
  [
    "Product Strategy.pdf",
    "Strategic Planning Document",
    18,
    1,
    "2024-01-12",
    "yellow",
  ],
  [
    "Competitive Analysis.pdf",
    "Market Competitive Landscape",
    28,
    1,
    "2024-01-05",
    "pink",
  ],
].map((d, i) => ({
  id: `doc-${i + 1}`,
  name: String(d[0]),
  filename: String(d[0]),
  description: String(d[1]),
  pages: Number(d[2]),
  page: Number(d[3]),
  date: String(d[4]),
  color: String(d[5]),
  size: "2.4 MB",
  analyzed: [0, 1, 4].includes(i),
  deleted: false,
  sessionIds: i < 3 ? ["session-1", "session-2", "session-3", "session-4"] : [],
}));
export const sessions: Session[] = [
  "Q3 Financial Summary",
  "Compare annual reports",
  "Marketing strategy",
  "Key findings",
].map((title, i) => ({
  id: `session-${i + 1}`,
  title,
  created: i === 0 ? "2 hours ago" : `${i} day${i > 1 ? "s" : ""} ago`,
  deleted: false,
}));
export const financialAnswer =
  "Here are the key financial highlights from the three annual reports:\n\nRevenue Growth|All three companies showed consistent revenue growth over the past three years, with Company A leading at 12.4% CAGR [1], followed by Company B at 9.8% [2], and Company C at 7.1% [3].\n\nProfitability|Company A achieved the highest net profit margin at 18.2% in 2023 [1], while Company B and C recorded 14.6% [2] and 11.3% [3] respectively.\n\nKey Drivers|The growth was primarily driven by increased market share [1][2] and operational efficiency improvements [3].";
export const chats: Record<string, Message[]> = Object.fromEntries(
  sessions.map((s) => [
    s.id,
    [
      {
        id: `${s.id}-user`,
        role: "user",
        content:
          "What are the key financial highlights from these three annual reports?",
        sources: [],
        time: "10:24 AM",
      },
      {
        id: `${s.id}-answer`,
        role: "assistant",
        content: financialAnswer,
        sources: ["doc-1", "doc-2", "doc-3"],
        time: "10:24 AM",
      },
    ],
  ]),
);
// Separate deleted fixtures make Trash immediately reviewable without hiding active examples.
sessions.push({
  id: "deleted-session",
  title: "Previous financial review",
  created: "2 days ago",
  deleted: true,
});
documents.push({
  ...documents[3],
  id: "deleted-document",
  name: "Archived Research.pdf",
  deleted: true,
});
