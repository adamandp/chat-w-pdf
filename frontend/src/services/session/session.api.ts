import { axiosInstance as http } from "@/lib/axios";
import { endpoints as e } from "../endpoints";

import type { Session } from "@/features/session/session.interface";

export const sessionApi = {
  sessions: async (deleted = false) =>
    (await http.get<Session[]>(e.sessions, { params: { deleted } })).data,
  rename: async (id: string, title: string) =>
    (await http.patch<Session>(`${e.sessions}/${id}`, { title })).data,
};
