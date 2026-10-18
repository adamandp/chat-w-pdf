"use client";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
export interface MenuAction {
  label: string;
  icon?: ReactNode;
  description?: string;
  onClick: () => void;
  selected?: boolean;
}
export interface ActionMenuProps {
  label: ReactNode;
  actions: MenuAction[];
  title?: string;
  side?: "top" | "bottom";
  iconOnly?: boolean;
}
export function ActionMenu({
  label,
  actions,
  title,
  side = "bottom",
  iconOnly = false,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={iconOnly ? "ghost" : "outline"}
            size={iconOnly ? "icon" : "default"}
          />
        }
        aria-label={iconOnly ? "More actions" : undefined}
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side}>
        {title && <strong className="menu-title">{title}</strong>}
        {actions.length ? (
          actions.map((a) => (
            <DropdownMenuItem
              key={a.label}
              onClick={a.onClick}
              className={a.selected ? "selected" : ""}
            >
              {a.icon}
              <span>
                <strong>{a.label}</strong>
                {a.description && <small>{a.description}</small>}
              </span>
              {a.selected && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-3">No documents attached yet.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
