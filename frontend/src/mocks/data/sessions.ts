import type { Session } from "@/features/session/session.interface";
export const sessions: Session[] = [
  "Q3 Financial Summary",
  "Compare annual reports",
  "Marketing strategy",
  "Key findings",
].map((title, i) => ({
  id: `session-${i + 1}`,
  title,
  created: i === 0 ? "2 hours ago" : `${i} day${i > 1 ? "s" : ""} ago`,
  deleted: false,
}));
sessions.push({
  id: "deleted-session",
  title: "Previous financial review",
  created: "2 days ago",
  deleted: true,
});
