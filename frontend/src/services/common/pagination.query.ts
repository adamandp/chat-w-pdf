import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { WebResponse } from "@/features/common/common.interface";
export function usePagedItems<T>(
  domain: "sessions" | "documents",
  page: number,
  search = "",
  sort = "Last modified",
  deleted = false,
  pageSize = 3,
) {
  return useQuery({
    queryKey: [domain, "paged", { page, pageSize, search, sort, deleted }],
    queryFn: async () =>
      (
        await axiosInstance.get<WebResponse<T[]>>(`/${domain}`, {
          params: { page, pageSize, search, sort, deleted },
        })
      ).data,
  });
}
