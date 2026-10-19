"use client";
import { Pagination } from "@/components/shared/pagination";
import { usePagedItems } from "@/services/common/pagination.query";
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
import type { PdfDocument } from "@/features/document/document.interface";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const query = usePagedItems<PdfDocument>(
    "documents",
    page,
    search,
    sort,
    false,
    pageSize,
  );
  const docs = query.data?.data ?? [];
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <h1>Documents</h1>
          <p>{query.data?.paging?.totalItems ?? 0} documents • Updated today</p>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
              onClick: () => {
                setSort(label);
                setPage(1);
              },
              selected: sort === label,
            }))}
          />
        </div>
        <Status
          loading={query.isPending}
          error={query.isError}
          empty={!query.isPending && !docs.length}
          onRetry={() => query.refetch()}
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
        <Pagination
          label="Documents pagination"
          paging={query.data?.paging}
          onPage={setPage}
          onPageSize={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </section>
  );
}
