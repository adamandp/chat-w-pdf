export function paginate<T extends { id: string }>(
  items: T[],
  request: Request,
) {
  const params = new URL(request.url).searchParams;
  if (!params.has("page")) return items;
  const search = (params.get("search") ?? "").toLowerCase();
  const filtered = items.filter((item) =>
    ("name" in item
      ? String(item.name)
      : "title" in item
        ? String(item.title)
        : ""
    )
      .toLowerCase()
      .includes(search),
  );
  const sort = params.get("sort");
  filtered.sort((a, b) =>
    sort === "Name"
      ? String("name" in a ? a.name : "").localeCompare(
          String("name" in b ? b.name : ""),
        )
      : sort === "Page count"
        ? Number("pages" in b ? b.pages : 0) -
          Number("pages" in a ? a.pages : 0)
        : String("date" in b ? b.date : "").localeCompare(
            String("date" in a ? a.date : ""),
          ),
  );
  const pageSize = Math.max(1, Number(params.get("pageSize")) || 3);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number(params.get("page")) || 1),
  );
  return {
    data: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    paging: { currentPage, pageSize, totalItems: filtered.length, totalPages },
  };
}
