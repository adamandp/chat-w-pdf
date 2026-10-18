import axios from "axios";
import { endpoints as e } from "./endpoints";
import type {
  Session,
  PdfDocument,
  Message,
  SendChat,
  SendResponse,
  Feedback,
} from "@/types/api";
export const http = axios.create({ baseURL: "/api", timeout: 15000 });
export const api = {
  sessions: async (deleted = false) =>
    (await http.get<Session[]>(e.sessions, { params: { deleted } })).data,
  documents: async (deleted = false) =>
    (await http.get<PdfDocument[]>(e.documents, { params: { deleted } })).data,
  sessionDocuments: async (id: string) =>
    (await http.get<PdfDocument[]>(`${e.sessions}/${id}/documents`)).data,
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
  rename: async (id: string, title: string) =>
    (await http.patch<Session>(`${e.sessions}/${id}`, { title })).data,
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
  feedback: async (feedback: Feedback) => {
    await http.post(e.feedback, feedback);
  },
};
