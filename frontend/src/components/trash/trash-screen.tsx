"use client";
import { useState } from "react";
import { Pagination } from "@/components/shared/pagination";
import { usePagedItems } from "@/services/common/pagination.query";
import type { Session } from "@/features/session/session.interface";
import type { PdfDocument } from "@/features/document/document.interface";
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
        <History kind="sessions" workspace={w} onDelete={onDelete} />
        <History kind="documents" workspace={w} onDelete={onDelete} />
      </div>
    </section>
  );
}

function History({
  kind,
  workspace: w,
  onDelete,
}: TrashScreenProps & { kind: "sessions" | "documents" }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const query = usePagedItems<Session | PdfDocument>(
    kind,
    page,
    "",
    "Last modified",
    true,
    pageSize,
  );
  const items = (query.data?.data ?? []).map((x) => ({
    id: x.id,
    name: "title" in x ? x.title : x.name,
    detail:
      "created" in x
        ? `Deleted ${x.created}`
        : `${x.pages} pages • Deleted recently`,
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
            Deleted {kind === "sessions" ? "chats" : "documents"} are stored
            here
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
      <Pagination
        label={`${kind} history pagination`}
        paging={query.data?.paging}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </section>
  );
}
