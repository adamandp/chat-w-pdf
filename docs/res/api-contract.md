# Mock API contract

Base URL Axios: `/api`. Semua JSON response langsung berupa objek/array, tanpa envelope. Error: `{ "message": "Item not found" }` dengan 404, validasi 400; mutation DELETE sukses 204 tanpa body. In-memory fixtures reset saat reload. IDs contoh di bawah menggunakan fixture; IDs hasil creation berupa UUID.

## Types dan contoh response

```json
{
  "session": {"id":"session-1","title":"Q3 Financial Summary","created":"2 hours ago","deleted":false},
  "document": {"id":"doc-1","name":"Annual Report 2023.pdf","filename":"Annual Report 2023.pdf","description":"Company Financial Report","pages":56,"page":12,"date":"2024-03-15","size":"2.4 MB","color":"pink","analyzed":true,"deleted":false,"sessionIds":["session-1","session-2","session-3","session-4"]},
  "message": {"id":"session-1-user","role":"user","content":"What are the key financial highlights?","sources":[],"time":"10:24 AM"}
}
```

`Session`, `PdfDocument`, `Message`, `SendChat`, `SendResponse`, `Feedback` diekspor di `src/types/api.ts`. `sources` adalah array ID dokumen. `filename` dipetakan ke `/pdfs/<URL-encoded filename>`. Message role adalah `user | assistant`.

## Seluruh endpoint dalam scope

Path pada tabel relatif ke `/api`. `Session`, `PdfDocument`, dan `Message` pada kolom response merujuk ke contoh JSON di atas.

| Method | Path | Payload / params | Contoh response |
| --- | --- | --- | --- |
| POST | `/feedback` | JSON `{ "messageId":"session-1-answer", "rating":"up" }`; rating `up`/`down` | 201 `{ "id":"uuid", "messageId":"session-1-answer", "rating":"up" }` |
| POST | `/chats` | Multipart: `message` wajib, `sessionId` string (kosong membuat session), `mode` = `Document Only`/`General Knowledge`, `documentIds` = string JSON array, `document` opsional file PDF | 201 `{ "session":Session, "messages":[Message(user),Message(assistant)] }` |
| POST | `/chats/:id/edit` | JSON `{ "message":"Updated question" }`; hanya message user | 200 Message dengan content baru |
| GET | `/sessions` | `deleted=false` (default) | 200 `[Session]` aktif |
| GET | `/sessions/:id/chats` | ID session aktif | 200 `[Message(user),Message(assistant)]` |
| GET | `/sessions?deleted=true` | `deleted=true` | 200 `[{ "id":"deleted-session", "title":"Previous financial review", "created":"2 days ago", "deleted":true }]` |
| PATCH | `/sessions/:id` | JSON `{ "title":"Updated session" }` | 200 Session dengan title baru |
| DELETE | `/sessions/:id?permanent=false` | soft delete (default); `permanent=false` | 204; session berpindah ke deleted list |
| DELETE | `/sessions/:id?permanent=true` | hard delete; `permanent=true` eksplisit | 204; session dihapus dari collection |
| POST | `/sessions/:id/restore` | tanpa body | 200 Session dengan `deleted:false` |
| GET | `/documents` | `deleted=false` (default) | 200 `[PdfDocument]` aktif |
| GET | `/sessions/:id/documents` | ID session; berdasarkan `sessionIds` | 200 `[PdfDocument]` aktif dalam session |
| GET | `/documents?deleted=true` | `deleted=true` | 200 `[PdfDocument]` terhapus (fixture `deleted-document`, `Archived Research.pdf`) |
| DELETE | `/documents/:id?permanent=false` | soft delete (default); `permanent=false` | 204; dokumen berpindah ke deleted list |
| DELETE | `/documents/:id?permanent=true` | hard delete; `permanent=true` eksplisit | 204; dokumen dihapus dari collection |
| POST | `/documents/:id/restore` | tanpa body | 200 PdfDocument dengan `deleted:false` |

Soft dan hard delete dibedakan secara eksplisit lewat parameter `permanent`. Service Axios selalu mengirim boolean tersebut. Session/document yang direstore mempertahankan ID. Soft delete dokumen menghilangkannya dari sumber aktif; soft delete session tidak menghapus dokumen bersama.

Tidak ada endpoint tambahan. Pembuatan session dan metadata upload memakai POST `/chats` agar sesuai multipart send chat. Metadata `documentIds` dan `mode` dibutuhkan untuk pilihan library dan Answer Mode di UI; bukan fitur backend baru.

## Mencoba request

Contoh service/hook yang digunakan UI:

```ts
const workspace = useWorkspace("session-1");
// workspace.sessions / documents / sessionDocuments / messages adalah queries
workspace.send.mutate({
  sessionId: "session-1",
  message: "Summarize these reports",
  mode: "Document Only",
  documentIds: ["doc-1", "doc-2", "doc-3"],
  // file: selectedPdfFile,
});
workspace.remove.mutate({ kind: "documents", id: "doc-1", permanent: false });
workspace.restore.mutate({ kind: "documents", id: "doc-1" });
```

Axios tidak menetapkan Content-Type multipart manual supaya browser membentuk boundary yang benar. Tidak ada request UI langsung ke handlers. Semua mutation yang mengubah collection melakukan invalidation TanStack Query.

## Loading / empty / error / success

GET collection memiliki delay 250 ms; send chat 700 ms untuk state loading. Cari nama yang tidak ada untuk empty documents, atau hapus/restore semua item Trash untuk empty history. Kirim `/error` untuk 500 terkontrol: draft tetap tersedia dan toast menampilkan retry guidance. Message kosong ditolak 400. Title kosong ditolak 400. Feedback terhadap message yang tidak valid ditolak 400. Upload UI menerima PDF hingga 20 MB. General Knowledge menghasilkan jawaban simulasi tanpa source; Document Only tanpa dokumen meminta pengguna memilih/melampirkan PDF.
