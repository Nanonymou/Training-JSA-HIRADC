# Training JSA & HIRADC

Portal pelatihan interaktif **Penyusunan dan Pengisian JSA & HIRADC** untuk Tim
QHSE **PT Tiga Persada Benua – Catering and Associated Service**. Materi dari
dokumen JSA & HIRADC disajikan sebagai website pembelajaran interaktif (card,
accordion, timeline, callout) — bukan sekadar dokumen statis.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** (`motion`) untuk animasi
- **lucide-react** untuk ikon
- Komponen UI bergaya shadcn/ui (`button`, `progress`)

## Menjalankan secara lokal

```bash
npm install
npm run dev
# buka http://localhost:3000
```

- `/` — landing page training.
- `/materi` — halaman Materi Pelatihan.

## Fitur halaman Materi (fase ini)

- Layout dengan **sidebar bab** dan area konten.
- **Navigasi interaktif**: klik bab untuk scroll-to, dengan **scroll-spy**
  yang menyorot bab aktif saat menggulir.
- Konten disajikan sebagai **card, accordion, timeline, dan callout** dengan
  animasi Framer Motion (menghormati `prefers-reduced-motion`).
- **Progress belajar per bab** di sidebar, tersimpan di `localStorage`.
- **Simpan & pulihkan posisi baca terakhir**.
- Responsif (desktop, tablet, mobile), fokus keyboard & screen-reader.

## Struktur

```
src/
  app/
    layout.tsx          # root layout
    page.tsx            # landing
    materi/page.tsx     # halaman Materi
    globals.css         # token tema (light/dark)
  components/
    materi/             # shell, sidebar, article, blocks (card/accordion/timeline/callout)
    ui/                 # button, progress
  hooks/                # use-scroll-spy, use-materi-progress
  lib/
    materi/             # data bab (chapters), last-read
    utils.ts            # cn()
```

Materi saat ini memakai data seed di `src/lib/materi/chapters.ts`. Fase backend
berikutnya akan menyajikan struktur bab/konten dari database dengan bentuk data
yang sama.
