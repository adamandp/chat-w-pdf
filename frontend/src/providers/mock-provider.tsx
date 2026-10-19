"use client";
import { useEffect, useState, type ReactNode } from "react";
import { initMocks } from "@/mocks";
import { Button } from "@/components/ui/button";
export interface AppProviderProps {
  children: ReactNode;
}
let startup: Promise<unknown> | undefined;
export function MockProvider({
  children,
  isMocking,
}: AppProviderProps & { isMocking: string }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isMocking !== "enabled") return;
    startup ??= initMocks();
    startup.then(() => setReady(true)).catch(() => setError(true));
  }, [isMocking]);

  return (
    <>
      {isMocking !== "enabled" || ready ? (
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
    </>
  );
}
