let startup: Promise<unknown> | undefined;
export function initMocks() {
  return (startup ??=
    typeof window === "undefined"
      ? import("./server").then(({ server }) =>
          server.listen({ onUnhandledRequest: "bypass" }),
        )
      : import("./browser").then(({ worker }) =>
          worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: { url: "/mockServiceWorker.js" },
          }),
        ));
}
