"use client";
import { useState } from "react";
import {
  CalendarDays,
  FileText,
  Grid2X2,
  List,
  MoreVertical,
  Search,
  Trash2,
  ArrowDownUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionMenu } from "@/components/shared/menu";
import { Status } from "@/components/shared/status";
import type { Workspace } from "@/hooks/use-workspace";
import type { PdfDocument } from "@/types/api";
export interface DocumentScreenProps {
  workspace: Workspace;
  onPreview: (doc: PdfDocument) => void;
}
export function DocumentScreen({
  workspace: w,
  onPreview,
}: DocumentScreenProps) {
  const [grid, setGrid] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Last modified");
  const docs = [...(w.documents.data ?? [])]
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "Name"
        ? a.name.localeCompare(b.name)
        : sort === "Page count"
          ? b.pages - a.pages
          : b.date.localeCompare(a.date),
    );
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <h1>Documents</h1>
          <p>{w.documents.data?.length ?? 0} documents • Updated today</p>
        </div>
        <div className="view-toggle">
          <Button
            aria-label="Grid View"
            variant={grid ? "secondary" : "outline"}
            onClick={() => setGrid(true)}
          >
            <Grid2X2 /> <span>Grid View</span>
          </Button>
          <Button
            aria-label="List View"
            variant={!grid ? "secondary" : "outline"}
            onClick={() => setGrid(false)}
          >
            <List /> <span>List View</span>
          </Button>
        </div>
      </header>
      <div className="screen-content">
        <div className="toolbar">
          <label className="search">
            <Search />
            <Input
              aria-label="Search documents"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <ActionMenu
            label={
              <>
                <ArrowDownUp />
                {sort}
              </>
            }
            actions={["Last modified", "Name", "Page count"].map((label) => ({
              label,
              onClick: () => setSort(label),
              selected: sort === label,
            }))}
          />
        </div>
        <Status
          loading={w.documents.isPending}
          error={w.documents.isError}
          empty={!w.documents.isPending && !docs.length}
          onRetry={() => w.documents.refetch()}
        >
          No documents match your search.
        </Status>
        <div className={grid ? "document-grid" : "document-list"}>
          {docs.map((d) => (
            <article key={d.id} className="document-card">
              <button
                className={`pdf-icon ${d.color}`}
                onClick={() => onPreview(d)}
                aria-label={`Preview ${d.name}`}
              >
                <FileText />
                <b>PDF</b>
              </button>
              <button className="document-title" onClick={() => onPreview(d)}>
                <h2>{d.name}</h2>
                <p>{d.description}</p>
              </button>
              <span className={`badge ${d.analyzed ? "analyzed" : ""}`}>
                {d.analyzed ? "Analyzed" : "Not analyzed"}
              </span>
              <span className="doc-meta">
                <FileText />
                {d.pages} pages
              </span>
              <span className="doc-meta">
                <CalendarDays />
                {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <div className="document-menu">
                <ActionMenu
                  iconOnly
                  label={<MoreVertical />}
                  actions={[
                    {
                      label: "Preview",
                      icon: <Eye />,
                      onClick: () => onPreview(d),
                    },
                    {
                      label: "Move to Trash",
                      icon: <Trash2 />,
                      onClick: () =>
                        w.remove.mutate({ kind: "documents", id: d.id }),
                    },
                  ]}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
