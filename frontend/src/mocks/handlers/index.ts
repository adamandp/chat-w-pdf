import { sessionsHandlers } from "./sessions";
import { documentsHandlers } from "./documents";
import { lifecycleHandlers } from "./lifecycle";
import { chatsHandlers } from "./chats";
import { feedbackHandlers } from "./feedback";
export const handlers = [
  ...sessionsHandlers,
  ...documentsHandlers,
  ...lifecycleHandlers,
  ...chatsHandlers,
  ...feedbackHandlers,
];
