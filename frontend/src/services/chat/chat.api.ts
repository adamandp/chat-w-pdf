import { axiosInstance as http } from "@/lib/axios";
import { endpoints as e } from "../endpoints";

import type {
  Message,
  SendChat,
  SendResponse,
} from "@/features/chat/chat.interface";

export const chatApi = {
  chats: async (id: string) =>
    (await http.get<Message[]>(`${e.sessions}/${id}/chats`)).data,
  send: async (input: SendChat) => {
    const data = new FormData();
    data.append("message", input.message);
    data.append("sessionId", input.sessionId);
    data.append("mode", input.mode);
    data.append("documentIds", JSON.stringify(input.documentIds));
    if (input.file) data.append("document", input.file);
    return (await http.post<SendResponse>(e.chats, data)).data;
  },
  edit: async (id: string, message: string) =>
    (await http.post<Message>(`${e.chats}/${id}/edit`, { message })).data,
};
