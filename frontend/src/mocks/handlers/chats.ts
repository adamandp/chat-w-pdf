import { http, HttpResponse, delay } from "msw";
import { documents, sessions, chats, financialAnswer } from "../fixtures";
import type { Message } from "@/features/chat/chat.interface";

const missing = () =>
  HttpResponse.json({ message: "Item not found" }, { status: 404 });
export const chatsHandlers = [
  http.post("/api/chats", async ({ request }) => {
    await delay(700);
    const form = await request.formData();
    const message = String(form.get("message") ?? "").trim();
    if (!message)
      return HttpResponse.json(
        { message: "Message is required" },
        { status: 400 },
      );
    if (message === "/error")
      return HttpResponse.json(
        { message: "Demo request failed. Please try again." },
        { status: 500 },
      );
    let session = sessions.find(
      (s) => s.id === form.get("sessionId") && !s.deleted,
    );
    if (!session) {
      session = {
        id: crypto.randomUUID(),
        title: message.slice(0, 45),
        created: "Just now",
        deleted: false,
      };
      sessions.unshift(session);
      chats[session.id] = [];
    }
    let ids = JSON.parse(String(form.get("documentIds") ?? "[]")) as string[];
    ids = ids.filter((id) => documents.some((d) => d.id === id && !d.deleted));
    const file = form.get("document");
    if (file instanceof File && file.size) {
      if (file.type !== "application/pdf")
        return HttpResponse.json(
          { message: "Only PDF files are accepted" },
          { status: 400 },
        );
      const doc = {
        ...documents[0],
        id: crypto.randomUUID(),
        name: file.name,
        filename: file.name,
        sessionIds: [session.id],
        pages: 1,
        page: 1,
        deleted: false,
      };
      documents.push(doc);
      ids.push(doc.id);
    }
    ids.forEach((id) => {
      const doc = documents.find((d) => d.id === id);
      if (doc && !doc.sessionIds.includes(session.id))
        doc.sessionIds.push(session.id);
    });
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const messages: Message[] = [
      {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        sources: [],
        time,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          form.get("mode") === "General Knowledge"
            ? "This is a mock general knowledge response. Connect a real backend to generate answers tailored to your question."
            : ids.length
              ? ids.length === 3
                ? financialAnswer
                : "This is a simulated document answer for UI testing. Your selected PDF is linked below. Connect a real backend to generate a summary of its contents."
              : "Attach or choose a PDF to ask questions about your documents. This demo uses simulated answers.",
        sources: form.get("mode") === "General Knowledge" ? [] : ids,
        time,
      },
    ];
    chats[session.id].push(...messages);
    return HttpResponse.json({ session, messages }, { status: 201 });
  }),
  http.post("/api/chats/:id/edit", async ({ params, request }) => {
    const body = (await request.json()) as { message: string };
    const message = Object.values(chats)
      .flat()
      .find((m) => m.id === params.id && m.role === "user");
    if (!message) return missing();
    if (!body.message?.trim())
      return HttpResponse.json(
        { message: "Message is required" },
        { status: 400 },
      );
    message.content = body.message.trim();
    return HttpResponse.json(message);
  }),
];
