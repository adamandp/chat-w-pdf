export interface PdfDocument {
  id: string;
  name: string;
  filename: string;
  description: string;
  pages: number;
  page: number;
  date: string;
  size: string;
  color: string;
  analyzed: boolean;
  deleted: boolean;
  sessionIds: string[];
}
export interface Session {
  id: string;
  title: string;
  created: string;
  deleted: boolean;
}
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
export interface Feedback {
  messageId: string;
  rating: "up" | "down";
}
