import { http, HttpResponse } from "msw";
import { chats } from "../fixtures";

import type { Feedback } from "@/features/feedback/feedback.interface";
export const feedbackHandlers = [
  http.post("/api/feedback", async ({ request }) => {
    const body = (await request.json()) as Feedback;
    if (
      !["up", "down"].includes(body.rating) ||
      !Object.values(chats)
        .flat()
        .some((m) => m.id === body.messageId && m.role === "assistant")
    )
      return HttpResponse.json(
        { message: "Invalid feedback" },
        { status: 400 },
      );
    return HttpResponse.json(
      { id: crypto.randomUUID(), ...body },
      { status: 201 },
    );
  }),
];
