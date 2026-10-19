import { sessionApi } from "./session/session.api";
import { documentApi } from "./document/document.api";
import { chatApi } from "./chat/chat.api";
import { feedbackApi } from "./feedback/feedback.api";
import { commonApi } from "./common/common.api";
export const api = {
  ...sessionApi,
  ...documentApi,
  ...chatApi,
  ...feedbackApi,
  ...commonApi,
};
