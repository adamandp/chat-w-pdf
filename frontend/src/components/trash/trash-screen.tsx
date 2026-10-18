"use client";
import { MessageSquare, FileText, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/shared/status";
import type { Workspace } from "@/hooks/use-workspace";
export interface TrashScreenProps {
  workspace: Workspace;
  onDelete: (kind: "sessions" | "documents", id: string, name: string) => void;
}
export function TrashScreen({ workspace: w, onDelete }: TrashScreenProps) {
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <h1>Trash</h1>
          <p>Recently deleted items</p>
        </div>
      </header>
      <div className="screen-content trash-content">
        {(["sessions", "documents"] as const).map((kind) => {
          const query =
            kind === "sessions" ? w.deletedSessions : w.deletedDocuments;
          const items =
            kind === "sessions"
              ? (w.deletedSessions.data ?? []).map((x) => ({
                  id: x.id,
                  name: x.title,
                  detail: `Deleted ${x.created}`,
                }))
              : (w.deletedDocuments.data ?? []).map((x) => ({
                  id: x.id,
                  name: x.name,
                  detail: `${x.pages} pages • Deleted recently`,
                }));
          const Icon = kind === "sessions" ? MessageSquare : FileText;
          return (
            <section className="history panel" key={kind}>
              <div className="history-heading">
                <span className="avatar pink">
                  <Icon />
                </span>
                <div>
                  <h2>{kind === "sessions" ? "Chat" : "Documents"} History</h2>
                  <p>
                    Deleted {kind === "sessions" ? "chats" : "documents"} are
                    stored here
                  </p>
                </div>
              </div>
              <Status
                loading={query.isPending}
                error={query.isError}
                empty={!query.isPending && !items.length}
                onRetry={() => query.refetch()}
              >
                Your {kind === "sessions" ? "chat" : "document"} trash is empty.
              </Status>
              {items.map((item, i) => (
                <div className="trash-row" key={item.id}>
                  <span
                    className={`avatar ${["yellow", "blue", "mint", "purple"][i % 4]}`}
                  >
                    <Icon />
                  </span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <div className="row-actions">
                    <Button
                      variant="outline"
                      aria-label="Restore"
                      disabled={w.restore.isPending}
                      onClick={() => w.restore.mutate({ kind, id: item.id })}
                    >
                      <RotateCcw />
                      <span>Restore</span>
                    </Button>
                    <Button
                      variant="destructive"
                      aria-label="Delete"
                      onClick={() => onDelete(kind, item.id, item.name)}
                    >
                      <Trash2 />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
