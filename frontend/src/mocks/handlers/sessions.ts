import { paginate } from "./paginate";
import { http, HttpResponse, delay } from "msw";
import { sessions, chats } from "../fixtures";

const missing = () =>
  HttpResponse.json({ message: "Item not found" }, { status: 404 });
export const sessionsHandlers = [
  http.get("/api/sessions", async ({ request }) => {
    await delay(250);
    return HttpResponse.json(
      paginate(
        sessions.filter(
          (s) =>
            s.deleted ===
            (new URL(request.url).searchParams.get("deleted") === "true"),
        ),
        request,
      ),
    );
  }),
  http.get("/api/sessions/:id/chats", ({ params }) =>
    sessions.some((s) => s.id === params.id && !s.deleted)
      ? HttpResponse.json(chats[String(params.id)] ?? [])
      : missing(),
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
];
