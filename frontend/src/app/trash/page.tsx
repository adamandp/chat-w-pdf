// Cache Components validation cannot inspect the subtree gated by browser MSW readiness.
export const instant = false;
import { WorkspaceApp } from "@/components/workspace-app";
export default function Page() {
  return <WorkspaceApp />;
}
