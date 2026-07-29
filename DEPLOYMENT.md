# Deployment — Training JSA & HIRADC

Panduan men-deploy LMS ini ke **Vercel** dengan **Postgres** produksi, agar
aplikasi memakai data nyata (bukan data seed/dummy).

> **Kenapa penting:** setiap repository memakai pola _seed-fallback_. Tanpa
> `POSTGRES_URL`, aplikasi tetap jalan tetapi melayani data contoh dan tidak
> menyimpan apa pun. Begitu `POSTGRES_URL` di-set dan migrasi dijalankan, semua
> data (soal, training, peserta, review) tersimpan permanen di Postgres.

---

## Ringkasan urutan

1. Set environment variables di Vercel → **redeploy**
2. Jalankan migrasi ke Postgres produksi (`npm run db:migrate`)
3. Login ke `/admin/login` dan verifikasi

---

## Step 1 — Environment Variables

Buka **Vercel Dashboard → project → Settings → Environment Variables** dan
tambahkan untuk environment **Production** (dan Preview bila perlu).

### A. Database — WAJIB

Tanpa ini, seluruh data hanya seed/dummy.

**Termudah — Vercel Postgres:** Storage → Create Database → Postgres → Connect ke
project. `POSTGRES_URL` terisi otomatis.

**Atau DB eksternal** (Neon / Supabase / RDS) — tambah manual:

```
POSTGRES_URL = postgresql://user:password@host:5432/database?sslmode=require
```

> Kode juga menerima `DATABASE_URL` sebagai alternatif nama variabel.

### B. Admin auth — WAJIB

Tanpa ini, login memakai default dev `admin@tpb.co.id` / `admin123` yang **tidak
aman**.

```
ADMIN_SESSION_SECRET = <string acak panjang>
ADMIN_EMAIL          = admin@perusahaan.co.id
ADMIN_PASSWORD       = <password kuat>
```

Generate secret:

```bash
openssl rand -hex 32
```

`ADMIN_PASSWORD` di-hash (scrypt) saat boot. Opsional yang lebih aman: set
`ADMIN_PASSWORD_HASH` berformat `saltHex:hashHex` sebagai ganti `ADMIN_PASSWORD`,
agar password tidak pernah tersimpan sebagai env plain.

### C. Upload berkas latihan — opsional

Tanpa ini, upload memakai URL dev dan **tidak tersimpan**. Storage → Create →
Blob → Connect (mengisi `BLOB_READ_WRITE_TOKEN` otomatis).

```
BLOB_READ_WRITE_TOKEN = <dari Vercel Blob>
```

### D. Email notifikasi — opsional

Tanpa `RESEND_API_KEY`, pengiriman email **disimulasikan** (status `Terkirim`,
ditandai `dev`) sehingga alur review tetap berjalan. Set untuk mengirim email
sungguhan lewat [Resend](https://resend.com).

```
RESEND_API_KEY = re_xxxxxxxx
EMAIL_FROM     = no-reply@domain-terverifikasi.com
```

Setelah menambah/mengubah env, **redeploy**: Deployments → ⋯ → Redeploy.

### Tabel variabel

| Variabel                | Wajib? | Jika kosong                                    |
| ----------------------- | :----: | ---------------------------------------------- |
| `POSTGRES_URL`          |   ✅   | jatuh ke data seed, tidak persist              |
| `ADMIN_SESSION_SECRET`  |   ✅   | pakai secret dev bawaan — tidak aman           |
| `ADMIN_EMAIL`           |   ✅   | default `admin@tpb.co.id`                      |
| `ADMIN_PASSWORD`        |   ✅¹  | default `admin123` — tidak aman                |
| `BLOB_READ_WRITE_TOKEN` |   ⬜   | upload latihan tidak tersimpan (URL dev)       |
| `RESEND_API_KEY`        |   ⬜   | email hanya disimulasikan                      |
| `EMAIL_FROM`            |   ⬜   | pakai alamat pengirim placeholder              |

¹ atau `ADMIN_PASSWORD_HASH` sebagai gantinya.

---

## Step 2 — Migrasi ke Postgres produksi

Vercel **tidak** menjalankan migrasi otomatis. Jalankan sekali dari komputer,
menunjuk ke database produksi.

```bash
# 1. Clone & install
git clone https://github.com/Nanonymou/Training-JSA-HIRADC.git
cd Training-JSA-HIRADC
npm install

# 2. Ambil connection string produksi dari Vercel:
#    Storage → database → .env.local → salin nilai POSTGRES_URL

# 3. Set sementara di shell (JANGAN commit)
export POSTGRES_URL="postgresql://user:password@host:5432/database?sslmode=require"

# 4. Terapkan semua migrasi (0000–0008)
npm run db:migrate
```

`db:migrate` menjalankan `drizzle-kit migrate`, membaca `db/migrations/` dan
menerapkan tiap file SQL berurutan.

**Verifikasi** — tabel berikut harus ada:

```bash
psql "$POSTGRES_URL" -c "\dt"
# questions, question_options, peserta, quiz_attempts,
# uploads, trainings, materi_versions, materi_chapters
```

> **Alternatif (dev/staging saja):** `npm run db:push` menyinkronkan schema
> langsung tanpa file migrasi. Untuk produksi gunakan `db:migrate` agar ada
> jejak versi.

### Perubahan schema di kemudian hari

```bash
npm run db:generate   # buat file migrasi baru dari src/lib/db/schema.ts
git add db/migrations && git commit -m "..."
npm run db:migrate    # terapkan ke produksi
```

---

## Step 3 — Verifikasi

1. Buka `https://<project>.vercel.app/admin/login`
2. Masuk dengan `ADMIN_EMAIL` + `ADMIN_PASSWORD`
3. Buat satu soal / training, muat ulang halaman — data tetap ada (tersimpan di
   Postgres, bukan seed)

---

## Catatan teknis

- **Runtime:** semua route handler default ke Node.js runtime, kompatibel dengan
  `pg` (node-postgres), `scrypt`, dan `mammoth`. `proxy.ts` (middleware/edge)
  hanya memakai Web Crypto sehingga aman di edge.
- **Isolasi per-training:** konten difilter berdasarkan `training_id`
  (lihat `src/lib/db` dan `src/lib/training/scope.ts`). Data seed hanya melayani
  training default `jsa-hiradc`.
