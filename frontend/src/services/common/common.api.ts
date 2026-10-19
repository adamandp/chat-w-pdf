import { axiosInstance as http } from "@/lib/axios";

export const commonApi = {
  remove: async (
    kind: "sessions" | "documents",
    id: string,
    permanent = false,
  ) => {
    await http.delete(`/${kind}/${id}`, { params: { permanent } });
  },
  restore: async (kind: "sessions" | "documents", id: string) => {
    await http.post(`/${kind}/${id}/restore`);
  },
};
