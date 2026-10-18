import { WorkspaceApp } from "@/components/workspace-app";
// This workspace waits for the browser mock worker before rendering.
export const instant = false;
export default function Page() {
  return <WorkspaceApp />;
}
