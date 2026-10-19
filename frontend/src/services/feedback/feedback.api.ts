import { axiosInstance as http } from "@/lib/axios";
import { endpoints as e } from "../endpoints";

import type { Feedback } from "@/features/feedback/feedback.interface";
export const feedbackApi = {
  feedback: async (feedback: Feedback) => {
    await http.post(e.feedback, feedback);
  },
};
