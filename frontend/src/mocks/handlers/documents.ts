import { paginate } from "./paginate";
import { http, HttpResponse, delay } from "msw";
import { documents } from "../fixtures";

export const documentsHandlers = [
  http.get("/api/documents", async ({ request }) => {
    await delay(250);
    return HttpResponse.json(
      paginate(
        documents.filter(
          (d) =>
            d.deleted ===
            (new URL(request.url).searchParams.get("deleted") === "true"),
        ),
        request,
      ),
    );
  }),
  http.get("/api/sessions/:id/documents", ({ params }) =>
    HttpResponse.json(
      documents.filter(
        (d) => !d.deleted && d.sessionIds.includes(String(params.id)),
      ),
    ),
  ),
];
