"use client";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FileText,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Plus,
  Download,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PdfDocument } from "@/types/api";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
export interface PdfPreviewProps {
  document: PdfDocument;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
}
export function PdfPreview({
  document: d,
  expanded,
  onExpand,
  onClose,
}: PdfPreviewProps) {
  const [page, setPage] = useState(d.page);
  const [pages, setPages] = useState(d.pages);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const url = `/pdfs/${encodeURIComponent(d.filename)}`;
  const changePage = (value: number) =>
    setPage(Math.min(pages, Math.max(1, value || 1)));
  return (
    <aside
      className={`pdf-preview panel ${expanded ? "expanded" : ""}`}
      aria-label="PDF preview"
    >
      <header className="pdf-heading">
        <FileText />
        <div>
          <h2>{d.name}</h2>
          <p>
            Page {page} of {pages}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label={expanded ? "Collapse preview" : "Expand preview"}
          onClick={onExpand}
        >
          {expanded ? <Minimize2 /> : <Maximize2 />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close preview"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>
      <div className="pdf-toolbar">
        <Input
          type="number"
          aria-label="PDF page"
          min={1}
          max={pages}
          value={page}
          onChange={(e) => changePage(Number(e.target.value))}
        />
        <span>/ {pages}</span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
        >
          <Minus />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
        >
          <Plus />
        </Button>
        <span>{Math.round(zoom * 100)}%</span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Search in PDF"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search />
        </Button>
        <a href={url} download aria-label="Download PDF">
          <Download />
        </a>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Print PDF"
          disabled={!loaded}
          onClick={() => {
            const win = window.open(url, "_blank");
            win?.addEventListener("load", () => win.print());
          }}
        >
          <Printer />
        </Button>
      </div>
      {showSearch && (
        <Input
          aria-label="Find text in PDF"
          placeholder="Highlight text on this page…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <div className="pdf-body">
        <Document
          suspense={false}
          file={url}
          onLoadSuccess={({ numPages }) => {
            setPages(numPages);
            setPage((p) => Math.min(p, numPages));
            setLoaded(true);
          }}
          loading={<div className="state">Loading PDF…</div>}
          error={
            <div className="pdf-fallback">
              <FileText size={56} />
              <h3>Ready for your PDF</h3>
              <p>
                Add <strong>{d.filename}</strong> to{" "}
                <code>frontend/public/pdfs/</code> to preview this document.
              </p>
              <p>
                Uploaded files use the same filename mapping in this mock
                workspace.
              </p>
            </div>
          }
        >
          <Page
            suspense={false}
            pageNumber={page}
            width={expanded ? 650 : 350}
            scale={zoom}
            customTextRenderer={({ str }) => {
              const escaped = str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
              if (!search) return escaped;
              const needle = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              return escaped.replace(
                new RegExp(needle, "gi"),
                (match) => `<mark>${match}</mark>`,
              );
            }}
          />
        </Document>
      </div>
      <footer className="related-pages">
        <strong>Related Pages</strong>
        <div>
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          {Array.from(
            { length: Math.min(5, pages) },
            (_, i) => Math.max(1, Math.min(pages - 4, page - 2)) + i,
          ).map((n) => (
            <Button
              key={n}
              variant={n === page ? "default" : "outline"}
              onClick={() => changePage(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            disabled={page >= pages}
            onClick={() => changePage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </footer>
    </aside>
  );
}
