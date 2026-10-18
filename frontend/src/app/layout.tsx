import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProvider } from "@/providers/app-provider";
import "@/styles/globals.css";
// The browser mock worker initializes before the workspace can render.
export const instant = false;
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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
