"use client";
import { useState } from "react";
import {
  Bot,
  UserRound,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import type { Workspace } from "@/hooks/use-workspace";
import type { PdfDocument } from "@/features/document/document.interface";
import type { Message } from "@/features/chat/chat.interface";
export function ChatMessages({
  workspace: w,
  currentMessages,
  allDocs,
  onPreview,
  notify,
}: {
  workspace: Workspace;
  currentMessages: Message[];
  allDocs: PdfDocument[];
  onPreview: (doc: PdfDocument) => void;
  notify: (message: string) => void;
}) {
  const [editing, setEditing] = useState<string>();
  const [edited, setEdited] = useState("");
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
    <>
      {" "}
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
                      variant="outline"
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
                          onSuccess: () => notify("Thanks for your feedback."),
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
                          onSuccess: () => notify("Thanks for your feedback."),
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
                        .catch(() => notify("Clipboard access is unavailable."))
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
    </>
  );
}
