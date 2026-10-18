import { http, HttpResponse, delay } from "msw";
import { documents, sessions, chats, financialAnswer } from "./fixtures";
import type { Message, Feedback } from "@/types/api";
const missing = () =>
  HttpResponse.json({ message: "Item not found" }, { status: 404 });
export const handlers = [
  http.get("/api/sessions", async ({ request }) => {
    await delay(250);
    return HttpResponse.json(
      sessions.filter(
        (s) =>
          s.deleted ===
          (new URL(request.url).searchParams.get("deleted") === "true"),
      ),
    );
  }),
  http.get("/api/documents", async ({ request }) => {
    await delay(250);
    return HttpResponse.json(
      documents.filter(
        (d) =>
          d.deleted ===
          (new URL(request.url).searchParams.get("deleted") === "true"),
      ),
    );
  }),
  http.get("/api/sessions/:id/chats", ({ params }) =>
    sessions.some((s) => s.id === params.id && !s.deleted)
      ? HttpResponse.json(chats[String(params.id)] ?? [])
      : missing(),
  ),
  http.get("/api/sessions/:id/documents", ({ params }) =>
    HttpResponse.json(
      documents.filter(
        (d) => !d.deleted && d.sessionIds.includes(String(params.id)),
      ),
    ),
  ),
  http.patch("/api/sessions/:id", async ({ params, request }) => {
    const s = sessions.find((s) => s.id === params.id);
    const body = (await request.json()) as { title: string };
    if (!s) return missing();
    if (!body.title?.trim())
      return HttpResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    s.title = body.title.trim();
    return HttpResponse.json(s);
  }),
  ...(["sessions", "documents"] as const).flatMap((kind) => [
    http.delete(`/api/${kind}/:id`, ({ params, request }) => {
      const items = kind === "sessions" ? sessions : documents;
      const index = items.findIndex((x) => x.id === params.id);
      if (index < 0) return missing();
      if (new URL(request.url).searchParams.get("permanent") === "true")
        items.splice(index, 1);
      else items[index].deleted = true;
      return new HttpResponse(null, { status: 204 });
    }),
    http.post(`/api/${kind}/:id/restore`, ({ params }) => {
      const item = (kind === "sessions" ? sessions : documents).find(
        (x) => x.id === params.id,
      );
      if (!item) return missing();
      item.deleted = false;
      return HttpResponse.json(item);
    }),
  ]),
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
