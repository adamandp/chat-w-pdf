import type { Message } from "@/features/chat/chat.interface";
import { sessions } from "./sessions";
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
