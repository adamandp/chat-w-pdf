"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useWorkspaceSession } from "@/providers/workspace-provider";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  FileText,
  Search,
  MessageSquare,
  Trash2,
  Plus,
  UserRound,
  Settings,
  Menu,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ActionMenu } from "@/components/shared/menu";
import { ChatScreen } from "@/components/chat/chat-screen";
import { DocumentScreen } from "@/components/documents/document-screen";
import { TrashScreen } from "@/components/trash/trash-screen";
import { useWorkspace } from "@/hooks/use-workspace";
import type { PdfDocument } from "@/features/document/document.interface";
const PdfPreview = dynamic(
  () => import("@/components/chat/pdf-preview").then((m) => m.PdfPreview),
  { ssr: false, loading: () => <div className="state">Opening preview…</div> },
);
export function WorkspaceApp() {
  const pathname = usePathname();
  const router = useRouter();
  const screen =
    pathname === "/documents"
      ? "Documents"
      : pathname === "/trash"
        ? "Trash"
        : "Chats";
  const [recentSearch, setRecentSearch] = useState("");
  const [sessionId, setSessionId] = useWorkspaceSession();
  const [drawer, setDrawer] = useState(false);
  const [preview, setPreview] = useState<PdfDocument>();
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState("");
  const [rename, setRename] = useState<{ id: string; title: string }>();
  const [deleting, setDeleting] = useState<{
    kind: "sessions" | "documents";
    id: string;
    name: string;
  }>();
  const [settings, setSettings] = useState(false);
  const [allChats, setAllChats] = useState(false);
  
  const w = useWorkspace(sessionId);
  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 4000);
  }
  function navigate(next: string) {
    router.push(
      next === "Documents" ? "/documents" : next === "Trash" ? "/trash" : "/",
    );
    setDrawer(false);
    setPreview(undefined);
  }
  function showSession(id: string) {
    setSessionId(id);
    navigate("Chats");
  }
  function showPreview(doc: PdfDocument) {
    setPreview(doc);
    setExpanded(false);
  }
  const sidebar = (
    <>
      <div className="brand">
        <span className="brand-icon">
          <FileText />
          <FileText />
        </span>
        <h2>
          Chat
          <br />
          with PDF
        </h2>
      </div>
      <Button
        className="new-chat"
        variant="destructive"
        onClick={() => {
          setSessionId("");
          navigate("Chats");
        }}
      >
        <Plus />
        New Chat
      </Button>
      <nav aria-label="Main navigation">
        {[
          { label: "Chats", icon: MessageSquare },
          { label: "Documents", icon: FileText },
          { label: "Trash", icon: Trash2 },
        ].map(({ label, icon: Icon }) => (
          <Button
            key={label}
            variant="ghost"
            className={screen === label ? "nav-active" : ""}
            onClick={() => navigate(label)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </nav>
      <section className="recent-section" aria-label="Recent conversations">
        <div className="recent-heading">
          <strong>Recent Chats</strong>
        </div>
        <label className="recent-search">
          <Search aria-hidden="true" />
          <Input
            aria-label="Search recent chats"
            placeholder="Search recent chats…"
            value={recentSearch}
            onChange={(e) => setRecentSearch(e.target.value)}
          />
        </label>
        <div className={`recent-chats ${allChats ? "expanded" : ""}`}>
          {w.sessions.isPending && <p>Loading chats…</p>}
          {w.sessions.isError && (
            <Button onClick={() => w.sessions.refetch()}>Retry chats</Button>
          )}
          {w.sessions.data
            ?.filter((s) =>
              s.title.toLowerCase().includes(recentSearch.toLowerCase()),
            )
            .slice(0, allChats ? undefined : 4)
            .map((s) => (
              <div
                className={`recent-chat ${s.id === sessionId && screen === "Chats" ? "active" : ""}`}
                key={s.id}
              >
                <button onClick={() => showSession(s.id)}>
                  <MessageSquare />
                  <span>
                    <strong>{s.title}</strong>
                    <small>{s.created}</small>
                  </span>
                </button>
                <ActionMenu
                  iconOnly
                  label={<MoreHorizontal />}
                  actions={[
                    {
                      label: "Rename",
                      icon: <Pencil />,
                      onClick: () => setRename({ id: s.id, title: s.title }),
                    },
                    {
                      label: "Move to Trash",
                      icon: <Trash2 />,
                      onClick: () =>
                        w.remove.mutate(
                          { kind: "sessions", id: s.id },
                          {
                            onSuccess: () => {
                              if (sessionId === s.id) setSessionId("");
                            },
                            onError: () => notify("Could not delete the chat."),
                          },
                        ),
                    },
                  ]}
                />
              </div>
            ))}
        </div>
        <div className="recent-footer">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllChats(!allChats)}
          >
            {allChats ? "See Less" : "See All"}
            <ArrowRight />
          </Button>
        </div>
      </section>
      <div className="account">
        <span className="avatar blue">
          <UserRound />
        </span>
        <strong>Guest User</strong>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Workspace settings"
          onClick={() => setSettings(true)}
        >
          <Settings />
        </Button>
      </div>
    </>
  );
  return (
    <div className="workspace">
      <aside className="sidebar panel">{sidebar}</aside>
      <div className="mobile-bar">
        <Button
          variant="outline"
          size="icon"
          aria-label="Open navigation"
          onClick={() => setDrawer(true)}
        >
          <Menu />
        </Button>
        <strong>Chat with PDF</strong>
        <span className="avatar blue">
          <UserRound />
        </span>
      </div>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="mobile-sidebar">
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
      <main
        className={`main-workspace ${preview ? "with-preview" : ""} ${expanded ? "preview-expanded" : ""}`}
      >
        <ResizablePanelGroup className="preview-group" orientation="horizontal">
          {preview && expanded && (
            <>
              {
                <ResizablePanel
                  id="pdf"
                  className="preview-panel"
                  minSize={expanded ? "60%" : "20%"}
                  maxSize={expanded ? "80%" : "40%"}
                  defaultSize={expanded ? "70%" : "30%"}
                >
                  <PdfPreview
                    key={preview.id}
                    document={preview}
                    expanded={expanded}
                    onExpand={() => setExpanded(!expanded)}
                    onClose={() => setPreview(undefined)}
                  />
                </ResizablePanel>
              }
            </>
          )}
          {preview && expanded && <ResizableHandle className="resize-handle" />}
          <ResizablePanel
            key="chat"
            id="chat"
            className="primary-screen"
            minSize={preview && expanded ? "20%" : "60%"}
            maxSize={preview && expanded ? "40%" : "100%"}
            defaultSize={preview && expanded ? "30%" : "70%"}
          >
            {screen === "Chats" ? (
              <ChatScreen
                workspace={w}
                sessionId={sessionId}
                onSession={setSessionId}
                onPreview={showPreview}
                notify={notify}
              />
            ) : screen === "Documents" ? (
              <DocumentScreen workspace={w} onPreview={showPreview} />
            ) : (
              <TrashScreen
                workspace={w}
                onDelete={(kind, id, name) => setDeleting({ kind, id, name })}
              />
            )}
          </ResizablePanel>
          {preview && !expanded && (
            <ResizableHandle className="resize-handle" />
          )}
          {preview && !expanded && (
            <>
              {
                <ResizablePanel
                  id="pdf"
                  className="preview-panel"
                  minSize={expanded ? "60%" : "20%"}
                  maxSize={expanded ? "80%" : "40%"}
                  defaultSize={expanded ? "70%" : "30%"}
                >
                  <PdfPreview
                    key={preview.id}
                    document={preview}
                    expanded={expanded}
                    onExpand={() => setExpanded(!expanded)}
                    onClose={() => setPreview(undefined)}
                  />
                </ResizablePanel>
              }
            </>
          )}
        </ResizablePanelGroup>
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X />
          </Button>
        </div>
      )}
      <Dialog
        open={!!rename}
        onOpenChange={(open) => {
          if (!open) setRename(undefined);
        }}
      >
        <DialogContent>
          <DialogTitle>Rename chat</DialogTitle>
          <DialogDescription>
            Give this conversation a helpful name.
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (rename)
                w.rename.mutate(rename, {
                  onSuccess: () => setRename(undefined),
                  onError: () => notify("Could not rename the chat."),
                });
            }}
          >
            <Input
              aria-label="Chat title"
              value={rename?.title ?? ""}
              onChange={(e) =>
                rename && setRename({ ...rename, title: e.target.value })
              }
            />
            <Button
              className="mt-4"
              disabled={!rename?.title.trim() || w.rename.isPending}
              type="submit"
            >
              Save name
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined);
        }}
      >
        <DialogContent>
          <DialogTitle>Permanently delete?</DialogTitle>
          <DialogDescription>
            “{deleting?.name}” will be permanently removed. This cannot be
            undone.
          </DialogDescription>
          <div className="row-actions">
            <Button variant="outline" onClick={() => setDeleting(undefined)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={w.remove.isPending}
              onClick={() => {
                if (deleting)
                  w.remove.mutate(
                    { ...deleting, permanent: true },
                    {
                      onSuccess: () => {
                        setDeleting(undefined);
                        notify("Item permanently deleted.");
                      },
                      onError: () => notify("Could not delete the item."),
                    },
                  );
              }}
            >
              Delete permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent>
          <DialogTitle>Your workspace</DialogTitle>
          <DialogDescription>
            You are using the Guest demo workspace. Data is held in memory and
            resets when you reload. PDF files are read from public/pdfs. Answers
            are simulated for UI testing.
          </DialogDescription>
          <Button onClick={() => setSettings(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
