import { http, HttpResponse } from "msw";
import { documents, sessions } from "../fixtures";

const missing = () =>
  HttpResponse.json({ message: "Item not found" }, { status: 404 });
export const lifecycleHandlers = [
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
];
