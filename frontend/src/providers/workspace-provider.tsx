"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
const SessionContext = createContext<[string, (id: string) => void]>([
  "session-1",
  () => {},
]);
export const useWorkspaceSession = () => useContext(SessionContext);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState("session-1");
  return (
    <SessionContext.Provider value={[sessionId, setSessionId]}>
      {children}
    </SessionContext.Provider>
  );
}
