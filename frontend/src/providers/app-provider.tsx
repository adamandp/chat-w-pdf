"use client";
import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
export interface AppProviderProps {
  children: ReactNode;
}
let startup: Promise<unknown> | undefined;
export function AppProvider({ children }: AppProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    startup ??= import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass" }),
    );
    startup.then(() => setReady(true)).catch(() => setError(true));
  }, []);

  return (
    <QueryClientProvider client={client}>
      {ready ? (
        children
      ) : (
        <div className="startup" role="status">
          {error ? (
            <>
              Could not start the mock API.{" "}
              <Button onClick={() => location.reload()}>Retry</Button>
            </>
          ) : (
            "Opening your workspace…"
          )}
        </div>
      )}
    </QueryClientProvider>
  );
}
