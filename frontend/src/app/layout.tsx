// Cache Components validation cannot inspect the subtree gated by browser MSW readiness.
export const instant = false;
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MockProvider } from "@/providers/mock-provider";
import { QueryProvider } from "@/providers/query-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Chat with PDF",
  description: "Your documents, clearer answers. A mock PDF chat workspace.",
};
export interface RootLayoutProps {
  children: ReactNode;
}
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <MockProvider
          isMocking={process.env.NEXT_PUBLIC_API_MOCKING ?? "enabled"}
        >
          <QueryProvider>
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </QueryProvider>
        </MockProvider>
      </body>
    </html>
  );
}
