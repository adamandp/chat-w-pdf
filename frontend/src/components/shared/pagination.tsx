import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Paging } from "@/features/common/common.interface";
export function Pagination({
  paging,
  onPage,
  onPageSize,
  label,
}: {
  paging?: Paging;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  label: string;
}) {
  if (!paging) return null;
  return (
    <nav className="pagination" aria-label={label}>
      <span className="pagination-summary">
        {paging.totalItems ? (paging.currentPage - 1) * paging.pageSize + 1 : 0}
        –{Math.min(paging.currentPage * paging.pageSize, paging.totalItems)} of{" "}
        {paging.totalItems} items
      </span>
      <div className="pagination-controls">
        <label className="page-size">
          Rows per page
          <select
            aria-label={`${label} rows per page`}
            value={paging.pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
          >
            {[3, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <span className="page-count" aria-live="polite">
          Page {paging.currentPage} of {paging.totalPages}
        </span>
        <div className="page-buttons">
          {[
            {
              name: "First page",
              page: 1,
              Icon: ChevronsLeft,
              disabled: paging.currentPage <= 1,
            },
            {
              name: "Previous",
              page: paging.currentPage - 1,
              Icon: ChevronLeft,
              disabled: paging.currentPage <= 1,
            },
            {
              name: "Next",
              page: paging.currentPage + 1,
              Icon: ChevronRight,
              disabled: paging.currentPage >= paging.totalPages,
            },
            {
              name: "Last page",
              page: paging.totalPages,
              Icon: ChevronsRight,
              disabled: paging.currentPage >= paging.totalPages,
            },
          ].map(({ name, page, Icon, disabled }) => (
            <Button
              key={name}
              variant="outline"
              size="icon"
              aria-label={name}
              disabled={disabled}
              onClick={() => onPage(page)}
            >
              <Icon />
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
