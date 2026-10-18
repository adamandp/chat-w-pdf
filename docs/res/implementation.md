# Chat with PDF — Implementation

Implementasi mengikuti `docs/prompt/001-init.md` dan delapan mockup. Semua perubahan aplikasi berada di `frontend/`; dokumentasi di root `docs/res/`. Perubahan backend yang sudah ada sebelum pekerjaan ini tidak disentuh.

## Fitur

- Shared shadcn Button, Dropdown Menu, Dialog, Sheet, Input, Textarea, Checkbox dengan theme kuning/biru/pink, border hitam dan shadow offset mengikuti gambar pertama.
- Sidebar Chats/Documents/Trash, recent chats, New Chat, rename dan soft delete session, daftar semua chat, info Guest workspace. Tanpa Document Library di sidebar.
- Chat: pesan user di kanan, jawaban assistant, sumber/citation yang membuka preview, edit pesan, copy jawaban, feedback, attachment upload PDF dan library multi-select, Document Only/General Knowledge. Dropdown memakai portal overlay sehingga tidak menggeser bubble.
- Documents: pencarian nama, sorting last modified/name/page count, list/grid, preview, soft delete.
- Trash: riwayat chat/dokumen, restore, konfirmasi hard delete permanen.
- Preview React-PDF: panel samping, expanded, input halaman, previous/next, related page navigation, zoom 50–200%, highlight pencarian pada halaman aktif, download, print melalui viewer browser, close, loading dan fallback file hilang.
- Desktop dua panel; tablet/mobile menggunakan preview overlay. Sidebar menjadi Sheet di mobile. Area konten scroll sendiri dan composer tetap tersedia.
- Seluruh request API UI melalui `hooks/use-workspace.ts` → `services/api.ts` (Axios) → MSW. TanStack Query v5 mengelola server state, mutation, dan invalidation.

## Menjalankan

Semua command aplikasi dari `frontend/`:

```sh
bun install
bun run dev
# http://localhost:3000

bun run typecheck
bun run lint
bun run build
bunx playwright install chromium
bun run test
```

Playwright menyalakan dev server bila belum tersedia. MSW dinyalakan otomatis oleh `AppProvider` sebelum children dirender, termasuk production preview demo. Service worker memerlukan localhost atau HTTPS. Request non-API seperti PDF diteruskan ke server. State mock berada di memori worker dan reset ketika halaman direload. Tidak ada autentikasi, backend atau AI produksi.

`instant = false` pada layout/page mengikuti dokumentasi Next.js 16 yang terpasang karena workspace menunggu inisialisasi worker browser. PDF viewer memakai `suspense={false}` agar file hilang ditangani fallback, sesuai API React-PDF 11.

Untuk integrasi backend: ganti `http.baseURL`, nonaktifkan bootstrap MSW di provider, lalu pertahankan kontrak service/types dan hooks. Jangan memanggil fixtures atau handlers dari komponen.

## Struktur penting

```text
frontend/src/app/                     layout dan page yang merender master
frontend/src/components/workspace-app.tsx
frontend/src/components/{chat,documents,trash,shared,ui}/
frontend/src/hooks/use-workspace.ts   query/mutation bersama
frontend/src/services/{api,endpoints}.ts
frontend/src/providers/app-provider.tsx
frontend/src/types/api.ts
frontend/src/mocks/{fixtures,handlers,browser}.ts
frontend/src/styles/globals.css       tokens dan shared/component responsive styling
frontend/public/mockServiceWorker.js
frontend/public/pdf.worker.min.mjs
frontend/public/pdfs/.gitkeep
frontend/scripts/prepare-pdf-worker.mjs
frontend/tests/workspace.spec.ts
```

PDF worker lokal disalin dari versi `pdfjs-dist` yang terpasang saat `postinstall`, agar versinya cocok dengan React-PDF tanpa CDN. `bunx msw init public --save` dapat dijalankan ulang saat MSW diupgrade.

## Memasang PDF

Folder `frontend/public/pdfs/` dikembalikan kosong kecuali `.gitkeep`. Taruh file dengan nama persis berikut (case dan spasi diperhatikan):

| Nama file | Halaman awal contoh |
| --- | ---: |
| Annual Report 2023.pdf | 12 |
| Annual Report 2022.pdf | 8 |
| Financial Analysis.pdf | 15 |
| Market Research.pdf | 4 |
| Product Strategy.pdf | 1 |
| Competitive Analysis.pdf | 1 |

Buka Documents → klik nama atau ikon PDF, atau klik sumber di chat. Tidak perlu perubahan source. Jumlah halaman asli dibaca dari PDF, dan halaman awal otomatis dibatasi ke jumlah halaman nyata. Untuk production, taruh file sebelum build/redeploy. Upload multipart hanya menyimulasikan metadata; untuk preview upload, letakkan file dengan nama upload yang sama di folder tersebut. File upload tidak ditulis ke disk oleh mock API.

## Validasi dan batasan

- TypeScript dan ESLint: lolos tanpa error/warning source.
- Production build Next.js: lolos; `/` diprerender statis.
- Playwright: enam skenario, termasuk chat/edit/feedback, overlay tidak menggeser bounding box bubble, dokumen list/grid/search, fallback dan expanded preview, restore, seluruh kontrak API, PDF asli dari filename upload beserta canvas berisi konten dan zoom, mode jawaban/library, tablet, serta konfirmasi hard delete.
- Desktop 1536×1024, mobile 390×844, tablet 820×1180. Tes mobile/tablet memeriksa tidak ada horizontal page overflow. Screenshot QA diperiksa secara visual.
- Percobaan build pertama gagal karena pembatasan port proses Turbopack pada sandbox. Build lolos setelah menjalankan dengan izin lokal dan memisahkan cache gagal ke `/tmp/chat-w-pdf-next-cache-20261019`.
- Fixture hanya enam dokumen aktif dan satu dokumen terhapus; header memakai jumlah aktual. Jawaban AI dan metadata analisis adalah simulasi. Edit memperbarui pesan user tanpa meregenerasi jawaban AI. Feedback diterima endpoint mock tanpa penyimpanan produksi.
- Search PDF menyorot teks pada halaman aktif; bukan pencarian lintas seluruh dokumen. Related Pages berupa navigasi nomor halaman, bukan thumbnail gambar. Print membuka PDF di viewer browser; dialog cetak bergantung browser.
- Tampilan mengikuti karakter dan layout mockup, bukan salinan piksel identik.

Lihat [kontrak API](api-contract.md) dan [log instalasi](installation-log.md).
