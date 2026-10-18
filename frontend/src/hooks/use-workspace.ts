import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
export function useWorkspace(sessionId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries();
  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.sessions(),
  });
  const documents = useQuery({
    queryKey: ["documents"],
    queryFn: () => api.documents(),
  });
  const deletedSessions = useQuery({
    queryKey: ["sessions", "deleted"],
    queryFn: () => api.sessions(true),
  });
  const deletedDocuments = useQuery({
    queryKey: ["documents", "deleted"],
    queryFn: () => api.documents(true),
  });
  const messages = useQuery({
    queryKey: ["chats", sessionId],
    queryFn: () => api.chats(sessionId),
    enabled: !!sessionId,
  });
  const sessionDocuments = useQuery({
    queryKey: ["session-documents", sessionId],
    queryFn: () => api.sessionDocuments(sessionId),
    enabled: !!sessionId,
  });
  const send = useMutation({ mutationFn: api.send, onSuccess: refresh });
  const edit = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      api.edit(id, message),
    onSuccess: refresh,
  });
  const rename = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.rename(id, title),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: ({
      kind,
      id,
      permanent,
    }: {
      kind: "sessions" | "documents";
      id: string;
      permanent?: boolean;
    }) => api.remove(kind, id, permanent),
    onSuccess: refresh,
  });
  const restore = useMutation({
    mutationFn: ({
      kind,
      id,
    }: {
      kind: "sessions" | "documents";
      id: string;
    }) => api.restore(kind, id),
    onSuccess: refresh,
  });
  const feedback = useMutation({ mutationFn: api.feedback });
  return {
    sessions,
    documents,
    deletedSessions,
    deletedDocuments,
    messages,
    sessionDocuments,
    send,
    edit,
    rename,
    remove,
    restore,
    feedback,
  };
}
export type Workspace = ReturnType<typeof useWorkspace>;
