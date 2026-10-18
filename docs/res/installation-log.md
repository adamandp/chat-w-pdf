# Dependency and installation log

Semua command berikut benar-benar dijalankan dari `frontend/`. Backend tidak digunakan. Network/dependency install dijalankan dengan izin eskalasi ketika sandbox membatasi tempdir/network.

## Command instalasi, berurutan

```sh
bun add @tanstack/react-query@5 axios msw react-pdf
# Percobaan sandbox gagal EPERM tempdir, lalu command identik dijalankan lagi dengan izin:
bun add @tanstack/react-query@5 axios msw react-pdf
bunx shadcn@latest add dropdown-menu dialog sheet input textarea checkbox --yes
bunx msw init public --save
bun add msw@2
bun add -d @playwright/test
bunx msw init public --save
bunx playwright install chromium
bun add -d prettier
```

Versi efektif terpasang: TanStack Query 5.104.4, Axios 1.20.0, MSW 2.15.0, React-PDF 11.0.0, Playwright 1.64.1, Prettier 3.9.10. `bun.lock` mengunci dependency transitif. MSW awalnya ter-resolve ke v3; dipilih v2 karena API bootstrap `onUnhandledRequest` yang dipakai integrasi ini. Worker MSW diregenerasi setelah pemilihan v2.

Button shadcn sudah ada dan dipertahankan. CLI memasang Dropdown Menu, Dialog, Sheet, Input, Textarea, dan Checkbox. Basis komponen dan theme dimodifikasi bersama sesuai referensi, bukan membuat primitive UI dari awal. Dokumentasi resmi shadcn yang dibaca: https://ui.shadcn.com/docs/components.

PDF worker awal disalin dengan command:

```sh
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

`postinstall` sekarang menjalankan `node scripts/prepare-pdf-worker.mjs` untuk menyinkronkan worker pada instalasi berikutnya. Tidak ada dependency backend yang diinstall/diubah.

Formatter dijalankan melalui `bunx prettier --write` pada source, test, config, dan script frontend. Pemeriksaan final: `bun run typecheck`, `bun run lint`, `bun run build`, `bun run test`. Detail cakupan dan batasan ada di [implementation.md](implementation.md).
