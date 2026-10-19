import type { Session } from "../session/session.interface";
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: string[];
  time: string;
}
export interface SendChat {
  sessionId: string;
  message: string;
  mode: string;
  documentIds: string[];
  file?: File;
}
export interface SendResponse {
  session: Session;
  messages: Message[];
}
