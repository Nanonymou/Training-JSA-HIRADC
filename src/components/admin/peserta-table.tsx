import {
  PESERTA_RECORDS,
  type PesertaRecord,
  type QuizStatus,
  type UploadState,
} from "@/lib/admin/peserta";
import { cn } from "@/lib/utils";

const QUIZ_STYLE: Record<QuizStatus, string> = {
  Lulus: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "Belum Lulus": "bg-destructive/15 text-destructive",
  "Belum Ikut": "bg-muted text-muted-foreground",
};

const UPLOAD_STYLE: Record<UploadState, string> = {
  Terkirim: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Belum: "bg-muted text-muted-foreground",
};

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

function QuizCell({ peserta }: { peserta: PesertaRecord }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Badge className={QUIZ_STYLE[peserta.quizStatus]}>
        {peserta.quizStatus}
      </Badge>
      {peserta.quizScore !== null && (
        <span className="text-muted-foreground text-xs tabular-nums">
          {peserta.quizScore}
        </span>
      )}
    </span>
  );
}

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/**
 * The Data Peserta table — responsive.
 *
 * On phones each peserta is a stacked card (the columns would be unreadable
 * squeezed side by side); from `sm` up it's a proper table with a tinted, sticky
 * header and row hover. Both read from the same rows. Runs on mock data.
 */
export function PesertaTable({
  rows = PESERTA_RECORDS,
}: {
  rows?: PesertaRecord[];
}) {
  if (rows.length === 0) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-xl border px-4 py-12 text-center text-sm">
        Tidak ada peserta yang cocok.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {rows.map((peserta) => (
          <li
            key={peserta.id}
            className="bg-card border-border flex flex-col gap-2 rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{peserta.nama}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {peserta.jabatan} · {peserta.email}
                </p>
              </div>
              <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-0.5 text-xs font-medium">
                {peserta.lokasi}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <QuizCell peserta={peserta} />
              <Badge className={UPLOAD_STYLE[peserta.uploadStatus]}>
                {peserta.uploadStatus}
              </Badge>
              <span className="text-muted-foreground ml-auto text-xs">
                {formatTanggal(peserta.waktuHadir)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="border-border bg-card hidden overflow-hidden rounded-xl border sm:block">
        <div className="max-h-[70dvh] overflow-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead className="bg-card sticky top-0 z-10">
              <tr className="border-border text-muted-foreground border-b text-left text-xs">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Lokasi</th>
                <th className="px-4 py-3 font-medium">Status Quiz</th>
                <th className="px-4 py-3 font-medium">Upload</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((peserta) => (
                <tr
                  key={peserta.id}
                  className="border-border/60 hover:bg-muted/40 border-b transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{peserta.nama}</p>
                    <p className="text-muted-foreground text-xs">
                      {peserta.jabatan} · {peserta.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">{peserta.lokasi}</td>
                  <td className="px-4 py-3">
                    <QuizCell peserta={peserta} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={UPLOAD_STYLE[peserta.uploadStatus]}>
                      {peserta.uploadStatus}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {formatTanggal(peserta.waktuHadir)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
