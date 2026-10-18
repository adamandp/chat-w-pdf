"use client";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  UserRound,
  FileText,
  ChevronDown,
  Paperclip,
  Send,
  Upload,
  FolderOpen,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ActionMenu } from "@/components/shared/menu";
import { Status } from "@/components/shared/status";
import type { Workspace } from "@/hooks/use-workspace";
import type { PdfDocument } from "@/types/api";
export interface ChatScreenProps {
  workspace: Workspace;
  sessionId: string;
  onSession: (id: string) => void;
  onPreview: (doc: PdfDocument) => void;
  notify: (message: string) => void;
}
export function ChatScreen({
  workspace: w,
  sessionId,
  onSession,
  onPreview,
  notify,
}: ChatScreenProps) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("Document Only");
  const [file, setFile] = useState<File>();
  const [selected, setSelected] = useState<string[]>([]);
  const [library, setLibrary] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string>();
  const [edited, setEdited] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const session = w.sessions.data?.find((s) => s.id === sessionId);
  const docs = w.sessionDocuments.data ?? [];
  const allDocs = w.documents.data ?? [];
  const currentMessages = sessionId ? (w.messages.data ?? []) : [];
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [currentMessages.length]);
  async function send() {
    if (!message.trim() || w.send.isPending) return;
    try {
      const result = await w.send.mutateAsync({
        sessionId,
        message,
        mode,
        documentIds: selected.length
          ? selected
          : docs.slice(0, 3).map((d) => d.id),
        file,
      });
      onSession(result.session.id);
      setMessage("");
      setFile(undefined);
      setSelected([]);
    } catch {
      notify("Could not send your message. Your draft is saved; try again.");
    }
  }
  function citationText(text: string, sourceIds: string[]) {
    return text.split(/(\[\d\])/g).map((part, i) =>
      /^\[\d\]$/.test(part) ? (
        <button
          key={i}
          className="citation"
          onClick={() => {
            const doc = allDocs.find(
              (d) => d.id === sourceIds[Number(part[1]) - 1],
            );
            if (doc) onPreview(doc);
          }}
        >
          {part}
        </button>
      ) : (
        part
      ),
    );
  }
  return (
    <section className="chat-screen">
      <header className="page-header">
        <div>
          <h1>{session?.title ?? "New Chat"}</h1>
          <p>
            {docs.length} documents •{" "}
            {session
              ? `Created ${session.created}`
              : "A fresh start for your next question"}
          </p>
        </div>
        <ActionMenu
          label={
            <>
              <FileText />
              Documents
              <ChevronDown />
            </>
          }
          title="Choose a document"
          actions={docs.map((d) => ({
            label: d.name,
            description: `Page ${d.page} of ${d.pages}`,
            icon: <FileText className={`file-color ${d.color}`} />,
            onClick: () => onPreview(d),
          }))}
        />
      </header>
      <div className="messages">
        <Status
          loading={!!sessionId && w.messages.isPending}
          error={w.messages.isError}
          onRetry={() => w.messages.refetch()}
        />
        {!currentMessages.length && !w.messages.isFetching && (
          <div className="chat-empty">
            <span className="avatar pink">
              <Bot />
            </span>
            <h2>What would you like to discover?</h2>
            <p>
              Attach a PDF or choose one from your library, then ask a question.
            </p>
            <Button variant="outline" onClick={() => setLibrary(true)}>
              <FolderOpen />
              Choose a document
            </Button>
          </div>
        )}
        {currentMessages.map((m) => (
          <div key={m.id} className={`message-row ${m.role}`}>
            <span className={`avatar ${m.role === "user" ? "blue" : "pink"}`}>
              {m.role === "user" ? <UserRound /> : <Bot />}
            </span>
            <div className="message-stack">
              <article className="message-bubble">
                {editing === m.id ? (
                  <>
                    <Textarea
                      aria-label="Edit message"
                      value={edited}
                      onChange={(e) => setEdited(e.target.value)}
                    />
                    <div className="row-actions">
                      <Button
                        disabled={w.edit.isPending || !edited.trim()}
                        onClick={() =>
                          w.edit.mutate(
                            { id: m.id, message: edited },
                            {
                              onSuccess: () => setEditing(undefined),
                              onError: () =>
                                notify("Could not update the message."),
                            },
                          )
                        }
                      >
                        <Check />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditing(undefined)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : m.role === "assistant" ? (
                  <>
                    <p>{m.content.split("\n\n")[0]}</p>
                    {m.content.includes("|") && (
                      <ol>
                        {m.content
                          .split("\n\n")
                          .slice(1)
                          .map((part, i) => (
                            <li key={i}>
                              <strong>{part.split("|")[0]}</strong>
                              <p>
                                {citationText(
                                  part.split("|")[1] ?? "",
                                  m.sources,
                                )}
                              </p>
                            </li>
                          ))}
                      </ol>
                    )}
                    {m.sources.length > 0 && (
                      <div className="sources">
                        <strong>Sources:</strong>
                        <div>
                          {m.sources.map((id) => {
                            const d = allDocs.find((d) => d.id === id);
                            return d ? (
                              <button
                                key={id}
                                className={`source ${d.color}`}
                                onClick={() => onPreview(d)}
                              >
                                <FileText />
                                <span>
                                  <b>{d.name}</b>
                                  <small>Page {d.page}</small>
                                </span>
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p>{m.content}</p>
                )}
                <time>{m.time}</time>
              </article>
              <div className="message-actions">
                {m.role === "assistant" ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Helpful answer"
                      disabled={w.feedback.isPending}
                      onClick={() =>
                        w.feedback.mutate(
                          { messageId: m.id, rating: "up" },
                          {
                            onSuccess: () =>
                              notify("Thanks for your feedback."),
                            onError: () => notify("Could not save feedback."),
                          },
                        )
                      }
                    >
                      <ThumbsUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Unhelpful answer"
                      disabled={w.feedback.isPending}
                      onClick={() =>
                        w.feedback.mutate(
                          { messageId: m.id, rating: "down" },
                          {
                            onSuccess: () =>
                              notify("Thanks for your feedback."),
                            onError: () => notify("Could not save feedback."),
                          },
                        )
                      }
                    >
                      <ThumbsDown />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Copy answer"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(m.content.replaceAll("|", ": "))
                          .then(() => notify("Answer copied."))
                          .catch(() =>
                            notify("Clipboard access is unavailable."),
                          )
                      }
                    >
                      <Copy />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit message"
                    onClick={() => {
                      setEditing(m.id);
                      setEdited(m.content);
                    }}
                  >
                    <Pencil />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {w.send.isPending && (
          <p role="status" className="thinking">
            <Bot />
            Reading your question…
          </p>
        )}
        <div ref={bottom} />
      </div>
      <form
        className="composer panel"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        {(file || selected.length > 0) && (
          <div className="attachments">
            {file && (
              <span>
                <FileText />
                {file.name}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setFile(undefined)}
                  aria-label="Remove upload"
                >
                  <X />
                </Button>
              </span>
            )}
            {selected.map((id) => (
              <span key={id}>
                {allDocs.find((d) => d.id === id)?.name}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Remove document"
                  onClick={() => setSelected(selected.filter((x) => x !== id))}
                >
                  <X />
                </Button>
              </span>
            ))}
          </div>
        )}
        <div className="composer-main">
          <ActionMenu
            side="top"
            iconOnly
            label={<Paperclip />}
            actions={[
              {
                label: "Upload New PDF",
                description: "Upload from your device",
                icon: <Upload />,
                onClick: () => upload.current?.click(),
              },
              {
                label: "Choose from Library",
                description: "Use existing documents",
                icon: <FolderOpen />,
                onClick: () => setLibrary(true),
              },
            ]}
          />
          <Textarea
            aria-label="Message"
            placeholder="Ask a question about your documents..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="composer-actions">
            <ActionMenu
              side="top"
              label={
                <>
                  <FileText />
                  {mode}
                  <ChevronDown />
                </>
              }
              title="Answer Mode"
              actions={[
                {
                  label: "Document Only",
                  description: "Answers based on the selected PDF documents.",
                  icon: <FileText />,
                  selected: mode === "Document Only",
                  onClick: () => setMode("Document Only"),
                },
                {
                  label: "General Knowledge",
                  description:
                    "Can use general knowledge with different sources.",
                  icon: <Bot />,
                  selected: mode === "General Knowledge",
                  onClick: () => setMode("General Knowledge"),
                },
              ]}
            />
            <Button
              type="submit"
              variant="secondary"
              className="send-button"
              aria-label="Send message"
              disabled={!message.trim() || w.send.isPending}
            >
              <Send />
            </Button>
          </div>
        </div>
        <input
          hidden
          type="file"
          accept="application/pdf,.pdf"
          ref={upload}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.type !== "application/pdf")
                notify("Please choose a PDF file.");
              else if (f.size > 20 * 1024 * 1024)
                notify("Please choose a PDF smaller than 20 MB.");
              else setFile(f);
            }
            e.target.value = "";
          }}
        />
      </form>
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
              .filter((d) =>
                d.name.toLowerCase().includes(search.toLowerCase()),
              )
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
    </section>
  );
}
