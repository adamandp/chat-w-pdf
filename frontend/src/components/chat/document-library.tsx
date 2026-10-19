"use client";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Status } from "@/components/shared/status";
import type { PdfDocument } from "@/features/document/document.interface";
export function DocumentLibrary({
  library,
  setLibrary,
  search,
  setSearch,
  selected,
  setSelected,
  allDocs,
}: {
  library: boolean;
  setLibrary: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  selected: string[];
  setSelected: (v: string[]) => void;
  allDocs: PdfDocument[];
}) {
  return (
    <Dialog open={library} onOpenChange={setLibrary}>
      <DialogContent className="library-dialog">
        <DialogTitle>Choose from Library</DialogTitle>
        <DialogDescription>
          Select documents to include with your next question.
        </DialogDescription>
        <Input
          aria-label="Search library"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="library-list">
          {allDocs
            .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
            .map((d) => (
              <label key={d.id} className="library-row">
                <span className={`avatar ${d.color}`}>
                  <FileText />
                </span>
                <span>
                  <strong>{d.name}</strong>
                  <small>
                    {d.date} • {d.size}
                  </small>
                </span>
                <Checkbox
                  checked={selected.includes(d.id)}
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked
                        ? [...selected, d.id]
                        : selected.filter((id) => id !== d.id),
                    )
                  }
                />
              </label>
            ))}
          <Status
            empty={
              !allDocs.filter((d) =>
                d.name.toLowerCase().includes(search.toLowerCase()),
              ).length
            }
          >
            No matching documents.
          </Status>
        </div>
        <Button onClick={() => setLibrary(false)}>
          Use {selected.length} selected document
          {selected.length === 1 ? "" : "s"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
